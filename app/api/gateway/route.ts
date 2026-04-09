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
 * 
 * Always returns status: 'ok' even if Gateway fails (uses fallback demo data)
 */

export async function GET(request: NextRequest) {
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
  const token = process.env.OPENCLAW_GATEWAY_TOKEN;

  let sessions: any = [];
  let projects: any = [];
  let tasks: any = [];
  let agents: any = [];
  let events: any = [];
  let docs: any = [];
  let activity: any = [];
  let aiUsage: any = [];

  const hasCredentials = !!gatewayUrl && !!token;
  let gatewayConnected = false;
  let gatewayError = '';

  // Try to fetch real data if configured
  if (hasCredentials) {
    try {
      // Fetch all data in parallel
      const results = await Promise.allSettled([
        fetchGatewaySessions(),
        fetchGatewayProjects(),
        fetchGatewayTasks(),
        fetchGatewayAgents(),
        fetchGatewayEvents(),
        fetchGatewayDocs(),
        fetchGatewayActivity(),
        fetchAIUsage(),
      ]);

      sessions = results[0].status === 'fulfilled' ? results[0].value : [];
      projects = results[1].status === 'fulfilled' ? results[1].value : [];
      tasks = results[2].status === 'fulfilled' ? results[2].value : [];
      agents = results[3].status === 'fulfilled' ? results[3].value : [];
      events = results[4].status === 'fulfilled' ? results[4].value : [];
      docs = results[5].status === 'fulfilled' ? results[5].value : [];
      activity = results[6].status === 'fulfilled' ? results[6].value : [];
      aiUsage = results[7].status === 'fulfilled' ? results[7].value : [];

      // Consider connected if we got at least some data
      gatewayConnected = !!(sessions.length || projects.length || tasks.length);

      if (!gatewayConnected) {
        gatewayError = 'Gateway returned empty responses';
      }
    } catch (error) {
      gatewayError = String(error);
      console.error('[API] Error fetching gateway data:', error);
    }
  }

  // Always return status: 'ok' - frontend should use fallback data
  return NextResponse.json({
    status: 'ok',
    paired: hasCredentials && gatewayConnected,
    gatewayUrl: gatewayUrl || 'not_configured',
    protocol: 'WebSocket (wss)',
    authenticated: hasCredentials,
    message: hasCredentials && gatewayConnected
      ? '✅ OpenClaw Gateway properly paired and authenticated'
      : hasCredentials
        ? '⚠️ Using fallback data (Gateway unreachable)'
        : 'ℹ️ Using demo data (Gateway not configured)',
    
    // Real or demo/fallback data
    sessions,
    projects,
    tasks,
    agents,
    events,
    docs,
    activity,
    aiUsage,

    // Debug info for monitoring
    debug: {
      hasCredentials,
      gatewayConnected,
      gatewayError: gatewayError || null,
      fallbackMode: !gatewayConnected,
    },

    connectionDetails: {
      url: gatewayUrl || 'not configured',
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
      'providers.top - Get top AI providers usage',
    ],

    gatewayStatus: hasCredentials ? (gatewayConnected ? 'Connected' : 'Unreachable') : 'NotConfigured',
    timestamp: new Date().toISOString(),
  });
}
