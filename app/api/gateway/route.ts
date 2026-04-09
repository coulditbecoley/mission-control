import { NextRequest, NextResponse } from 'next/server';
import { getGatewayService } from '@/lib/gateway-service';

/**
 * OpenClaw Gateway API Endpoint
 * 
 * Fetches real data from OpenClaw Gateway with automatic fallback to demo data
 */

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
    const token = process.env.OPENCLAW_GATEWAY_TOKEN;

    if (!gatewayUrl || !token) {
      return NextResponse.json({
        status: 'not_configured',
        paired: false,
        message: 'OpenClaw Gateway credentials not set',
        sessions: [],
        projects: [],
        tasks: [],
      });
    }

    // Fetch real data from gateway
    const service = getGatewayService();
    const [sessions, projects, tasks] = await Promise.all([
      service.getSessions(),
      service.getProjects(),
      service.getTasks(),
    ]);

    return NextResponse.json({
      status: 'paired',
      paired: true,
      gatewayUrl: gatewayUrl,
      protocol: 'WebSocket (wss)',
      authenticated: true,
      message: '✅ OpenClaw Gateway properly paired and authenticated',
      
      // Real data from gateway
      sessions,
      projects,
      tasks,

      connectionDetails: {
        url: gatewayUrl,
        port: '443 (secure WebSocket)',
        authentication: 'Bearer token in Authorization header',
        authToken: token ? 'configured' : 'missing',
      },

      availableCommands: [
        'sessions.list - Get list of all sessions/agents',
        'projects.list - Get list of all projects',
        'tasks.list - Get list of all tasks',
      ],

      gatewayStatus: 'Connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Gateway error:', error);
    return NextResponse.json({
      status: 'error',
      paired: false,
      message: 'Failed to fetch from OpenClaw Gateway',
      error: String(error),
      sessions: [],
      projects: [],
      tasks: [],
    });
  }
}
