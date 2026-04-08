import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { Project } from '@/lib/types';
import { generateId } from '@/lib/utils';

export async function GET() {
  const projects = await storage.getProjects();
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const projects = await storage.getProjects();
    const newProject: Project = {
      id: generateId(),
      name: body.name,
      description: body.description || '',
      status: body.status || 'planning',
      progress: body.progress || 0,
      owner: body.owner,
      startDate: body.startDate || new Date().toISOString(),
      dueDate: body.dueDate,
      color: body.color || 'blue',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.push(newProject);
    await storage.saveProjects(projects);
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 400 });
  }
}
