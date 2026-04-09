/**
 * OpenClaw Gateway WebSocket RPC Client
 * Using the websocket library for better compatibility
 */

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

class GatewayRpcClient {
  private client: any = null;
  private connection: any = null;
  private requestId = 0;
  private pendingRequests = new Map<string, { resolve: any; reject: any; timeout: NodeJS.Timeout }>();
  private connected = false;
  private connectionPromise: Promise<void> | null = null;

  async connect(): Promise<void> {
    if (this.connected && this.connection) return;
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = this._connect();
    return this.connectionPromise;
  }

  private async _connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const WebSocketClient = require('websocket').client;
        
        const connectUrl = GATEWAY_URL.replace('wss://', 'https://').replace('ws://', 'http://');
        console.log('[RPC] Creating WebSocket client, URL:', GATEWAY_URL);
        
        this.client = new WebSocketClient();

        this.client.on('connectFailed', (error: any) => {
          console.error('[RPC] Connect failed:', error.toString());
          reject(error);
        });

        this.client.on('connect', (connection: any) => {
          console.log('[RPC] WebSocket connection established');
          this.connection = connection;

          connection.on('error', (error: any) => {
            console.error('[RPC] Connection error:', error.toString());
          });

          connection.on('close', () => {
            console.log('[RPC] Connection closed');
            this.connected = false;
            this.connection = null;
          });

          connection.on('message', (msg: any) => {
            try {
              let data: any;
              if (msg.type === 'utf8') {
                data = JSON.parse(msg.utf8Data);
              } else if (msg.type === 'binary') {
                data = JSON.parse(msg.binaryData.toString());
              } else {
                return;
              }

              console.log('[RPC] Received:', data.type, data.event || data.method);
              this._handleMessage(data);

              // Handle connect challenge
              if (data.type === 'event' && data.event === 'connect.challenge') {
                const nonce = data.payload.nonce;
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

                console.log('[RPC] Sending connect request');
                connection.sendUTF(JSON.stringify(connectReq));
              }

              // Handle connect response
              if (data.type === 'res' && data.id?.startsWith?.('connect-')) {
                if (data.ok) {
                  console.log('[RPC] Connected successfully');
                  this.connected = true;
                  resolve();
                } else {
                  console.error('[RPC] Connect failed:', data.error);
                  reject(new Error('Connect failed: ' + data.error?.message));
                }
              }
            } catch (error) {
              console.error('[RPC] Message error:', error);
            }
          });
        });

        console.log('[RPC] Attempting WebSocket connection...');
        this.client.connect(GATEWAY_URL, null);

        // Timeout
        setTimeout(() => {
          if (!this.connected) {
            reject(new Error('Gateway connection timeout'));
          }
        }, 15000);
      } catch (error) {
        console.error('[RPC] Setup error:', error);
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

    if (!this.connection) {
      throw new Error('Gateway not connected');
    }

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
        this.connection.sendUTF(JSON.stringify(request));
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

  async close(): Promise<void> {
    if (this.connection) {
      this.connection.close();
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
