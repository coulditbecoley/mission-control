import { promises as fs } from 'fs';
import path from 'path';

const TASKS_FILE = '/docker/mission_control/tasks-data.json';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Deploy Asgard Dashboard',
    description: 'Deploy Mission Control to Hostinger VPS',
    status: 'done',
    priority: 'high',
    dueDate: '2026-04-08',
    tags: ['deployment', 'dashboard'],
    createdAt: '2026-04-01',
    updatedAt: '2026-04-08',
  },
  {
    id: '2',
    title: 'Set up Phemex API integration',
    description: 'Auto-sync positions and trades from Phemex',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2026-04-10',
    tags: ['trading', 'api', 'phemex'],
    createdAt: '2026-04-05',
    updatedAt: '2026-04-08',
  },
  {
    id: '3',
    title: 'Add real-time Bitcoin chart',
    description: 'Integrate TradingView charts for BTC/USD',
    status: 'done',
    priority: 'medium',
    dueDate: '2026-04-07',
    tags: ['trading', 'bitcoin'],
    createdAt: '2026-04-04',
    updatedAt: '2026-04-07',
  },
];

async function readTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return DEFAULT_TASKS;
  }
}

async function writeTasks(tasks: Task[]): Promise<void> {
  const dir = path.dirname(TASKS_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Failed to write tasks:', error);
  }
}

export async function GET() {
  const tasks = await readTasks();
  return Response.json({ tasks });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, task } = body;

    let tasks = await readTasks();

    if (action === 'create') {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      tasks.unshift(newTask);
    } else if (action === 'update') {
      const idx = tasks.findIndex(t => t.id === task.id);
      if (idx >= 0) {
        tasks[idx] = {
          ...task,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
    } else if (action === 'delete') {
      tasks = tasks.filter(t => t.id !== task.id);
    }

    await writeTasks(tasks);
    return Response.json({ tasks });
  } catch (error) {
    console.error('Task API error:', error);
    return Response.json({ error: 'Failed to update tasks' }, { status: 500 });
  }
}
