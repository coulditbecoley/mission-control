import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Docker healthcheck and monitoring
 * Returns status: "ok" when app is healthy
 * Used by docker-compose healthcheck
 */
export async function GET() {
  try {
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'wss://openclaw-ke4f.srv1566532.hstgr.cloud';
    const token = process.env.OPENCLAW_GATEWAY_TOKEN;

    // This endpoint doesn't test actual gateway connectivity
    // Just verifies the app itself is responding
    
    return NextResponse.json({
      status: 'ok',
      healthy: true,
      message: 'Mission Control API is healthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        gatewayUrl: gatewayUrl ? '✓ configured' : '✗ not configured',
        gatewayToken: token ? '✓ configured' : '✗ not configured',
      },
    });
  } catch (error) {
    console.error('[Status] Error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        healthy: false,
        message: 'Mission Control API is unavailable',
        details: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
