import { NextResponse } from 'next/server';
import { readDataFile, writeDataFile } from '@/lib/paths';

interface Activity {
  id: string;
  type: 'task' | 'project' | 'agent' | 'system' | 'trade';
  action: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

const DEFAULT_ACTIVITY: Activity[] = [
  {
    id: '1',
    type: 'task',
    action: 'created',
    description: 'Set up Phemex API integration',
    user: 'Odin',
    timestamp: '2026-04-08T12:33:00Z',
    metadata: { taskId: '2', title: 'Set up Phemex API integration' },
  },
  {
    id: '2',
    type: 'project',
    action: 'updated',
    description: 'Trading Integration progress to 60%',
    user: 'Thor',
    timestamp: '2026-04-08T12:30:00Z',
    metadata: { projectId: '2', progress: 60 },
  },
  {
    id: '3',
    type: 'task',
    action: 'completed',
    description: 'Deploy Asgard Dashboard',
    user: 'Loki',
    timestamp: '2026-04-08T12:15:00Z',
    metadata: { taskId: '1', status: 'done' },
  },
  {
    id: '4',
    type: 'trade',
    action: 'logged',
    description: 'BTC long position +$4,050 P&L',
    user: 'Freya',
    timestamp: '2026-04-08T10:30:00Z',
    metadata: { asset: 'BTC', pnl: 4050 },
  },
  {
    id: '5',
    type: 'agent',
    action: 'activated',
    description: 'Agent Heimdall started monitoring positions',
    user: 'System',
    timestamp: '2026-04-08T09:00:00Z',
    metadata: { agent: 'Heimdall' },
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    const type = searchParams.get('type');

    let activity = await readDataFile<Activity[]>('activity.json', DEFAULT_ACTIVITY);

    if (type) {
      const validTypes = ['task', 'project', 'agent', 'system', 'trade'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
      activity = activity.filter(a => a.type === type);
    }

    // Sort by timestamp descending
    activity = activity.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const limitNum = Math.min(parseInt(limit, 10), 500); // Cap at 500
    activity = activity.slice(0, limitNum);

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('[Activity GET] Error:', error);
    return NextResponse.json({ activity: DEFAULT_ACTIVITY });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, event } = body;

    if (!action || !event) {
      return NextResponse.json(
        { error: 'Missing action or event in request body' },
        { status: 400 }
      );
    }

    if (action !== 'log') {
      return NextResponse.json(
        { error: 'Only "log" action is supported' },
        { status: 400 }
      );
    }

    // Validate event structure
    if (!event.type || !event.action || !event.description || !event.user) {
      return NextResponse.json(
        { error: 'Event must have: type, action, description, user' },
        { status: 400 }
      );
    }

    const validTypes = ['task', 'project', 'agent', 'system', 'trade'];
    if (!validTypes.includes(event.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    let activity = await readDataFile<Activity[]>('activity.json', DEFAULT_ACTIVITY);

    const newActivity: Activity = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    activity.unshift(newActivity);

    // Keep only last 1000 entries
    activity = activity.slice(0, 1000);

    await writeDataFile('activity.json', activity);
    return NextResponse.json({ activity });
  } catch (error) {
    console.error('[Activity POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to log activity', details: String(error) },
      { status: 500 }
    );
  }
}
