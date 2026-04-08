import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { Task } from '@/lib/types';
import { generateId } from '@/lib/utils';

export async function GET() {
  const tasks = await storage.getTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tasks = await storage.getTasks();
    const newTask: Task = {
      id: generateId(),
      title: body.title,
      description: body.description || '',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      projectId: body.projectId,
      assigneeId: body.assigneeId,
      dueDate: body.dueDate,
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    await storage.saveTasks(tasks);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 400 });
  }
}
