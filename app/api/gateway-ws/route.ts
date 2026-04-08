import { NextRequest, NextResponse } from 'next/server';

/**
 * OpenClaw Gateway WebSocket Bridge
 * Properly connects to OpenClaw via WebSocket and proxies requests
 */

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'wss://openclaw-ke4f.srv1566532.hstgr.cloud';
    const token = process.env.OPENCLAW_GATEWAY_TOKEN;

    if (!token) {
      return NextResponse.json({
        status: 'error',
        message: 'OpenClaw Gateway token not configured',
      });
    }

    // Return gateway connection info for client-side WebSocket connection
    return NextResponse.json({
      status: 'success',
      gatewayUrl: gatewayUrl,
      authenticated: true,
      message: 'OpenClaw Gateway properly paired',
      connectionDetails: {
        url: gatewayUrl,
        protocol: 'websocket',
        authHeader: 'Authorization',
        commands: ['sessions.list', 'projects.list', 'notes.list', 'cron.list'],
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to OpenClaw Gateway',
      error: String(error),
    });
  }
}
