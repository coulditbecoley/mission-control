import { NextResponse } from 'next/server';
import { readDataFile, writeDataFile } from '@/lib/paths';

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

export async function GET() {
  try {
    const tasks = await readDataFile<Task[]>('tasks.json', DEFAULT_TASKS);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('[Tasks GET] Error:', error);
    return NextResponse.json({ tasks: DEFAULT_TASKS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, task } = body;

    if (!action || !task) {
      return NextResponse.json(
        { error: 'Missing action or task in request body' },
        { status: 400 }
      );
    }

    let tasks = await readDataFile<Task[]>('tasks.json', DEFAULT_TASKS);

    if (action === 'create') {
      if (!task.title || !task.title.trim()) {
        return NextResponse.json(
          { error: 'Task title is required' },
          { status: 400 }
        );
      }

      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      tasks.unshift(newTask);
    } else if (action === 'update') {
      if (!task.id) {
        return NextResponse.json(
          { error: 'Task ID is required for update' },
          { status: 400 }
        );
      }

      const idx = tasks.findIndex(t => t.id === task.id);
      if (idx < 0) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      tasks[idx] = {
        ...tasks[idx],
        ...task,
        updatedAt: new Date().toISOString().split('T')[0],
      };
    } else if (action === 'delete') {
      if (!task.id) {
        return NextResponse.json(
          { error: 'Task ID is required for delete' },
          { status: 400 }
        );
      }

      tasks = tasks.filter(t => t.id !== task.id);
    } else {
      return NextResponse.json(
        { error: 'Unknown action. Use: create, update, or delete' },
        { status: 400 }
      );
    }

    await writeDataFile('tasks.json', tasks);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('[Tasks POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update tasks', details: String(error) },
      { status: 500 }
    );
  }
}
