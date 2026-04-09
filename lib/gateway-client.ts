/**
 * OpenClaw Gateway WebSocket Client
 * Proper RPC-based communication with the gateway
 */

const GATEWAY_WSS_URL = process.env.OPENCLAW_GATEWAY_URL || 'wss://openclaw-ke4f.srv1566532.hstgr.cloud';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

interface GatewayRequest {
  type: 'req';
  id: string;
  method: string;
  params?: any;
}

interface GatewayResponse {
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

// For simplicity, use a singleton connection pattern
let wsConnection: WebSocket | null = null;
let requestCounter = 0;
const pendingRequests = new Map<string, { resolve: any; reject: any; timeout: any }>();

async function connectGateway(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }

    try {
      wsConnection = new WebSocket(GATEWAY_WSS_URL);

      wsConnection.onopen = () => {
        console.log('[Gateway] WebSocket connected');
      };

      wsConnection.onmessage = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'event' && msg.event === 'connect.challenge') {
            // Send connect request with challenge
            const connectReq: GatewayRequest = {
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
                  mode: 'operator'
                },
                role: 'operator',
                scopes: ['operator.read'],
                auth: { token: GATEWAY_TOKEN },
                device: {
                  id: 'dashboard-' + Date.now(),
                  nonce: msg.payload.nonce
                }
              }
            };
            wsConnection!.send(JSON.stringify(connectReq));
            resolve();
            return;
          }

          if (msg.type === 'res') {
            const pending = pendingRequests.get(msg.id);
            if (pending) {
              pendingRequests.delete(msg.id);
              clearTimeout(pending.timeout);
              if (msg.ok) {
                pending.resolve(msg.payload);
              } else {
                pending.reject(new Error(msg.error?.message || 'Gateway error'));
              }
            }
          }
        } catch (error) {
          console.error('[Gateway] Message parse error:', error);
        }
      };

      wsConnection.onerror = (error: Event) => {
        console.error('[Gateway] WebSocket error:', error);
        reject(error);
      };

      wsConnection.onclose = () => {
        console.log('[Gateway] WebSocket closed');
        wsConnection = null;
      };

      // Timeout for connection
      setTimeout(() => {
        if (wsConnection?.readyState !== WebSocket.OPEN) {
          reject(new Error('Gateway connection timeout'));
        }
      }, 10000);
    } catch (error) {
      reject(error);
    }
  });
}

async function callGateway(method: string, params?: any): Promise<any> {
  // In a server context, we can't use WebSocket directly
  // We need to use server-sent events or polling instead
  // For now, return null to indicate server-side limitation
  console.warn('[Gateway] WebSocket not available in server context, use HTTP fallback');
  return null;
}

export { connectGateway, callGateway };
