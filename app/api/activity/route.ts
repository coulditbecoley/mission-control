import { promises as fs } from 'fs';
import path from 'path';

const ACTIVITY_FILE = '/docker/mission_control/activity-data.json';

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

async function readActivity(): Promise<Activity[]> {
  try {
    const data = await fs.readFile(ACTIVITY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return DEFAULT_ACTIVITY;
  }
}

async function writeActivity(activity: Activity[]): Promise<void> {
  const dir = path.dirname(ACTIVITY_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(ACTIVITY_FILE, JSON.stringify(activity, null, 2));
  } catch (error) {
    console.error('Failed to write activity:', error);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '50';
  const type = searchParams.get('type');

  let activity = await readActivity();

  if (type) {
    activity = activity.filter(a => a.type === type);
  }

  // Sort by timestamp descending
  activity = activity.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  activity = activity.slice(0, parseInt(limit));

  return Response.json({ activity });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, event } = body;

    let activity = await readActivity();

    if (action === 'log') {
      const newActivity: Activity = {
        ...event,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      activity.unshift(newActivity);
    }

    await writeActivity(activity);
    return Response.json({ activity });
  } catch (error) {
    console.error('Activity API error:', error);
    return Response.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}
