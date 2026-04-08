import { promises as fs } from 'fs';
import path from 'path';

const PROJECTS_FILE = '/docker/mission_control/projects-data.json';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  progress: number;
  color: string;
  dueDate: string;
  team: string[];
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Asgard Dashboard',
    description: 'Mission Control - OpenClaw management dashboard',
    status: 'active',
    progress: 85,
    color: 'bg-blue-500',
    dueDate: '2026-04-30',
    team: ['Odin', 'Loki'],
    createdAt: '2026-03-15',
    updatedAt: '2026-04-08',
  },
  {
    id: '2',
    name: 'Trading Integration',
    description: 'Phemex API + portfolio tracking',
    status: 'active',
    progress: 60,
    color: 'bg-green-500',
    dueDate: '2026-04-20',
    team: ['Thor'],
    createdAt: '2026-04-01',
    updatedAt: '2026-04-08',
  },
  {
    id: '3',
    name: 'Market Research Bot',
    description: 'Automated Bitcoin analysis',
    status: 'planning',
    progress: 20,
    color: 'bg-yellow-500',
    dueDate: '2026-05-15',
    team: ['Freya', 'Heimdall'],
    createdAt: '2026-04-05',
    updatedAt: '2026-04-08',
  },
];

async function readProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return DEFAULT_PROJECTS;
  }
}

async function writeProjects(projects: Project[]): Promise<void> {
  const dir = path.dirname(PROJECTS_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  } catch (error) {
    console.error('Failed to write projects:', error);
  }
}

export async function GET() {
  const projects = await readProjects();
  return Response.json({ projects });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, project } = body;

    let projects = await readProjects();

    if (action === 'create') {
      const newProject: Project = {
        ...project,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      projects.unshift(newProject);
    } else if (action === 'update') {
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx >= 0) {
        projects[idx] = {
          ...project,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
    } else if (action === 'delete') {
      projects = projects.filter(p => p.id !== project.id);
    }

    await writeProjects(projects);
    return Response.json({ projects });
  } catch (error) {
    console.error('Project API error:', error);
    return Response.json({ error: 'Failed to update projects' }, { status: 500 });
  }
}
