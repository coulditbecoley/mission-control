import { NextRequest, NextResponse } from 'next/server';
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

const DEFAULT_TASKS: Task[] = [];

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();

    if (!params.id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const tasks = await readDataFile<Task[]>('tasks.json', DEFAULT_TASKS);
    const taskIndex = tasks.findIndex((t) => t.id === params.id);

    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...body,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    await writeDataFile('tasks.json', tasks);
    return NextResponse.json(tasks[taskIndex]);
  } catch (error) {
    console.error('[Tasks PUT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update task', details: String(error) },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;

    if (!params.id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const tasks = await readDataFile<Task[]>('tasks.json', DEFAULT_TASKS);
    const filtered = tasks.filter((t) => t.id !== params.id);

    if (filtered.length === tasks.length) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    await writeDataFile('tasks.json', filtered);
    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('[Tasks DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task', details: String(error) },
      { status: 400 }
    );
  }
}
