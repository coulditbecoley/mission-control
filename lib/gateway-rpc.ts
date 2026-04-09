/**
 * OpenClaw Gateway WebSocket RPC Client
 * Proper implementation of the gateway protocol
 */

import { createConnection } from 'net';
import { promisify } from 'util';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'wss://openclaw-ke4f.srv1566532.hstgr.cloud';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

interface RpcRequest {
  type: 'req';
  id: string;
  method: string;
  params?: any;
}

interface RpcResponse {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: any;
  error?: {
    message: string;
    code?: string;
  };
}

interface ConnectChallenge {
  type: 'event';
  event: 'connect.challenge';
  payload: {
    nonce: string;
    ts: number;
  };
}

class GatewayRpcClient {
  private ws: any = null;
  private requestId = 0;
  private pendingRequests = new Map<string, { resolve: any; reject: any; timeout: NodeJS.Timeout }>();
  private connected = false;
  private connectionPromise: Promise<void> | null = null;

  async connect(): Promise<void> {
    if (this.connected) return;
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = this._connect();
    return this.connectionPromise;
  }

  private async _connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Dynamic import of ws module
        const WebSocket = require('ws');
        
        const connectUrl = GATEWAY_URL.replace('wss://', 'wss://').replace('ws://', 'ws://');
        console.log('[RPC] Connecting to gateway:', connectUrl);
        
        this.ws = new WebSocket(connectUrl, {
          rejectUnauthorized: false, // For self-signed certs
          handshakeTimeout: 10000,
        });

        this.ws.on('open', () => {
          console.log('[RPC] WebSocket connected, waiting for challenge...');
        });

        this.ws.on('message', (data: string) => {
          try {
            const msg = JSON.parse(data);
            this._handleMessage(msg);

            // Handle connect challenge
            if (msg.type === 'event' && msg.event === 'connect.challenge') {
              const nonce = msg.payload.nonce;
              const connectReq: RpcRequest = {
                type: 'req',
                id: 'connect-' + Date.now(),
                method: 'connect',
                params: {
                  minProtocol: 3,
                  maxProtocol: 3,
                  client: {
                    id: 'mission-control-dashboard',
                    version: '1.0.0',
                    platform: 'web',
                    mode: 'operator',
                  },
                  role: 'operator',
                  scopes: ['operator.read'],
                  auth: { token: GATEWAY_TOKEN },
                  device: {
                    id: 'dashboard-' + Date.now(),
                    nonce: nonce,
                  },
                },
              };

              console.log('[RPC] Sending connect request...');
              this.ws.send(JSON.stringify(connectReq));
            }

            // Handle connect response
            if (
              msg.type === 'res' &&
              msg.id.startsWith('connect-') &&
              msg.ok
            ) {
              console.log('[RPC] Connected successfully!');
              this.connected = true;
              resolve();
            }

            if (msg.type === 'res' && msg.id.startsWith('connect-') && !msg.ok) {
              reject(new Error('Connect failed: ' + msg.error?.message));
            }
          } catch (error) {
            console.error('[RPC] Message parse error:', error);
          }
        });

        this.ws.on('error', (error: Error) => {
          console.error('[RPC] WebSocket error:', error.message);
          reject(error);
        });

        this.ws.on('close', () => {
          console.log('[RPC] WebSocket closed');
          this.connected = false;
        });

        // Connection timeout
        setTimeout(() => {
          if (!this.connected) {
            reject(new Error('Gateway connection timeout'));
          }
        }, 15000);
      } catch (error) {
        console.error('[RPC] Connection error:', error);
        reject(error);
      }
    });
  }

  private _handleMessage(msg: any): void {
    if (msg.type === 'res' && msg.id) {
      const pending = this.pendingRequests.get(msg.id);
      if (pending) {
        this.pendingRequests.delete(msg.id);
        clearTimeout(pending.timeout);

        if (msg.ok) {
          pending.resolve(msg.payload);
        } else {
          pending.reject(new Error(msg.error?.message || 'RPC error'));
        }
      }
    }
  }

  async call(method: string, params?: any): Promise<any> {
    await this.connect();

    return new Promise((resolve, reject) => {
      const requestId = 'req-' + (++this.requestId) + '-' + Date.now();
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`RPC timeout for method: ${method}`));
      }, 10000);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      const request: RpcRequest = {
        type: 'req',
        id: requestId,
        method,
        params,
      };

      try {
        this.ws.send(JSON.stringify(request));
      } catch (error) {
        this.pendingRequests.delete(requestId);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async getSessions(): Promise<any> {
    return this.call('sessions.list');
  }

  async getProjects(): Promise<any> {
    return this.call('projects.list');
  }

  async getTasks(): Promise<any> {
    return this.call('tasks.list');
  }

  async getAgents(): Promise<any> {
    return this.call('agents.list');
  }

  async getUsageStatus(): Promise<any> {
    return this.call('usage.status');
  }

  async close(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.connected = false;
    }
  }
}

// Singleton instance
let client: GatewayRpcClient | null = null;

export function getGatewayRpcClient(): GatewayRpcClient {
  if (!client) {
    client = new GatewayRpcClient();
  }
  return client;
}

export async function callGateway(method: string, params?: any): Promise<any> {
  return getGatewayRpcClient().call(method, params);
}
