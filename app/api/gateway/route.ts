import { NextRequest, NextResponse } from 'next/server';

/**
 * Gateway Sync Endpoint
 * Fetches all metrics from OpenClaw Gateway:
 * - Sessions (agents/tasks)
 * - Projects
 * - Notes
 * - Cron jobs
 */

interface GatewayResponse {
  sessions?: any[];
  projects?: any[];
  notes?: any[];
  cronjobs?: any[];
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
    const token = process.env.OPENCLAW_GATEWAY_TOKEN;

    if (!gatewayUrl || !token) {
      console.warn('Gateway credentials missing');
      return NextResponse.json({
        status: 'not_configured',
        message: 'OpenClaw Gateway credentials not set',
        sessions: [],
        projects: [],
        notes: [],
        cronjobs: [],
      });
    }

    // Convert WebSocket URL to HTTP
    let httpUrl = gatewayUrl;
    if (httpUrl.startsWith('wss://')) {
      httpUrl = httpUrl.replace('wss://', 'https://');
    } else if (httpUrl.startsWith('ws://')) {
      httpUrl = httpUrl.replace('ws://', 'http://');
    }
    httpUrl = httpUrl.replace(/\/$/, '');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    console.log('Fetching from gateway:', httpUrl);

    // Try to fetch sessions/tasks
    let sessions = [];
    let projects = [];
    let notes = [];
    let cronjobs = [];

    try {
      const sessionsRes = await fetch(`${httpUrl}/api/sessions`, {
        headers,
        cache: 'no-store',
      });
      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        sessions = data.sessions || data.items || [];
      }
    } catch (e) {
      console.error('Failed to fetch sessions:', e);
    }

    try {
      const projectsRes = await fetch(`${httpUrl}/api/projects`, {
        headers,
        cache: 'no-store',
      });
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        projects = data.projects || data.items || [];
      }
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    }

    try {
      const notesRes = await fetch(`${httpUrl}/api/notes`, {
        headers,
        cache: 'no-store',
      });
      if (notesRes.ok) {
        const data = await notesRes.json();
        notes = data.notes || data.items || [];
      }
    } catch (e) {
      console.error('Failed to fetch notes:', e);
    }

    try {
      const cronRes = await fetch(`${httpUrl}/api/cron`, {
        headers,
        cache: 'no-store',
      });
      if (cronRes.ok) {
        const data = await cronRes.json();
        cronjobs = data.cronjobs || data.jobs || [];
      }
    } catch (e) {
      console.error('Failed to fetch cronjobs:', e);
    }

    return NextResponse.json({
      status: 'success',
      gateway: httpUrl,
      authenticated: true,
      sessions: sessions.length > 0 ? sessions : [],
      projects: projects.length > 0 ? projects : [],
      notes: notes.length > 0 ? notes : [],
      cronjobs: cronjobs.length > 0 ? cronjobs : [],
      timestamp: new Date().toISOString(),
      message: `Synced ${sessions.length} sessions, ${projects.length} projects, ${notes.length} notes, ${cronjobs.length} cron jobs`,
    });
  } catch (error) {
    console.error('Gateway sync error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to sync from OpenClaw Gateway',
      error: String(error),
      sessions: [],
      projects: [],
      notes: [],
      cronjobs: [],
    });
  }
}
