import { NextRequest, NextResponse } from 'next/server';
import {
  getGatewayService,
  fetchGatewaySessions,
  fetchGatewayProjects,
  fetchGatewayTasks,
  fetchGatewayAgents,
  fetchGatewayEvents,
  fetchGatewayDocs,
  fetchGatewayActivity,
  fetchAIUsage,
} from '@/lib/gateway-service';

/**
 * OpenClaw Gateway API Endpoint
 * 
 * Fetches real data from OpenClaw Gateway for all dashboard tabs:
 * - Sessions
 * - Projects
 * - Tasks
 * - Agents
 * - Calendar Events
 * - Documents
 * - Activity Logs
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
        agents: [],
        events: [],
        docs: [],
        activity: [],
      });
    }

    // Fetch all data in parallel
    const [sessions, projects, tasks, agents, events, docs, activity, aiUsage] = await Promise.all([
      fetchGatewaySessions(),
      fetchGatewayProjects(),
      fetchGatewayTasks(),
      fetchGatewayAgents(),
      fetchGatewayEvents(),
      fetchGatewayDocs(),
      fetchGatewayActivity(),
      fetchAIUsage(),
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
      agents,
      events,
      docs,
      activity,
      aiUsage,

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
        'agents.list - Get list of all agents',
        'calendar.list - Get list of calendar events',
        'docs.list - Get list of documents',
        'activity.list - Get activity log',
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
      agents: [],
      events: [],
      docs: [],
      activity: [],
    });
  }
}
