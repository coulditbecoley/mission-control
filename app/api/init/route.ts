import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { generateId } from '@/lib/utils';

const DEFAULT_PROJECTS = [
  {
    id: generateId(),
    name: 'Dashboard Refactor',
    description: 'Modernize the OpenClaw dashboard UI',
    status: 'active',
    progress: 65,
    owner: 'Odin',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    color: 'blue',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Agent Framework Upgrade',
    description: 'Update agent communication protocol',
    status: 'planning',
    progress: 20,
    owner: 'Odin',
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    color: 'purple',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_TASKS = [
  {
    id: generateId(),
    title: 'Design system documentation',
    description: 'Create comprehensive design system docs',
    status: 'done',
    priority: 'high',
    projectId: DEFAULT_PROJECTS[0].id,
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['design', 'documentation'],
  },
  {
    id: generateId(),
    title: 'Implement dark mode',
    description: 'Add dark mode toggle and persistence',
    status: 'in-progress',
    priority: 'medium',
    projectId: DEFAULT_PROJECTS[0].id,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['ui', 'frontend'],
  },
  {
    id: generateId(),
    title: 'Write API integration tests',
    description: 'Create tests for new endpoints',
    status: 'in-progress',
    priority: 'high',
    projectId: DEFAULT_PROJECTS[0].id,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['testing', 'api'],
  },
  {
    id: generateId(),
    title: 'Review protocol specifications',
    description: 'Review and approve new protocol specs',
    status: 'todo',
    priority: 'high',
    projectId: DEFAULT_PROJECTS[1].id,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['planning', 'protocol'],
  },
];

const DEFAULT_AGENTS = [
  {
    id: 'agent-001',
    name: 'Odin',
    status: 'active',
    lastSeen: new Date().toISOString(),
    currentTask: DEFAULT_TASKS[1].id,
    performance: {
      tasksCompleted: 342,
      averageSpeed: 4.2,
      uptime: 99.8,
    },
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'agent-002',
    name: 'Valkyrie',
    status: 'active',
    lastSeen: new Date().toISOString(),
    currentTask: DEFAULT_TASKS[2].id,
    performance: {
      tasksCompleted: 156,
      averageSpeed: 3.8,
      uptime: 99.2,
    },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'agent-003',
    name: 'Thor',
    status: 'idle',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    performance: {
      tasksCompleted: 98,
      averageSpeed: 3.5,
      uptime: 95.6,
    },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_ACTIVITY = [
  {
    id: generateId(),
    type: 'task_completed',
    title: 'Completed task',
    description: 'Design system documentation',
    actor: 'Odin',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: generateId(),
    type: 'task_created',
    title: 'New task created',
    description: 'Review protocol specifications',
    actor: 'Odin',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: generateId(),
    type: 'project_created',
    title: 'New project',
    description: 'Agent Framework Upgrade',
    actor: 'Odin',
    timestamp: new Date().toISOString(),
  },
];

export async function POST() {
  try {
    await storage.saveProjects(DEFAULT_PROJECTS as any);
    await storage.saveTasks(DEFAULT_TASKS as any);
    await storage.saveAgents(DEFAULT_AGENTS as any);
    await storage.saveActivityLog(DEFAULT_ACTIVITY as any);

    return NextResponse.json({
      success: true,
      message: 'Data initialized',
      projects: DEFAULT_PROJECTS.length,
      tasks: DEFAULT_TASKS.length,
      agents: DEFAULT_AGENTS.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to initialize data' }, { status: 500 });
  }
}
