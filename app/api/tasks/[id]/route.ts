import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const body = await request.json();
    const tasks = await storage.getTasks();
    const taskIndex = tasks.findIndex((t) => t.id === params.id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await storage.saveTasks(tasks);
    return NextResponse.json(tasks[taskIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const tasks = await storage.getTasks();
    const filtered = tasks.filter((t) => t.id !== params.id);
    await storage.saveTasks(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 400 });
  }
}
