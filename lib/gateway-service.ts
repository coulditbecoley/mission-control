/**
 * OpenClaw Gateway Service
 * 
 * Fetches data from OpenClaw Gateway with automatic fallback to demo data
 * Handles WebSocket communication and caching
 */

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'wss://openclaw-ke4f.srv1566532.hstgr.cloud';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

interface SessionData {
  id: string;
  name: string;
  type: 'agent' | 'user';
  status: 'active' | 'idle' | 'offline';
  lastActive?: string;
}

interface ProjectData {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress?: number;
  description?: string;
}

interface TaskData {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

// Demo data for fallback
const DEMO_SESSIONS: SessionData[] = [
  {
    id: 'session-1',
    name: 'OpenClaw Gateway',
    type: 'agent',
    status: 'active',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'session-2',
    name: 'Trading Agent',
    type: 'agent',
    status: 'idle',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
  },
];

const DEMO_PROJECTS: ProjectData[] = [
  {
    id: 'proj-1',
    name: 'Mission Control Dashboard',
    status: 'active',
    progress: 85,
    description: 'OpenClaw management dashboard',
  },
  {
    id: 'proj-2',
    name: 'Trading Bot Integration',
    status: 'planning',
    progress: 20,
    description: 'Integrate with Phemex',
  },
];

const DEMO_TASKS: TaskData[] = [
  {
    id: 'task-1',
    title: 'Deploy Dashboard',
    status: 'done',
    priority: 'high',
    description: 'Deploy to VPS',
  },
  {
    id: 'task-2',
    title: 'Fix Gateway Connection',
    status: 'in-progress',
    priority: 'high',
    description: 'Implement WebSocket connection',
  },
];

class GatewayService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry: number = 30000; // 30 seconds

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheExpiry;
  }

  async getSessions(): Promise<SessionData[]> {
    const cacheKey = 'sessions';

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const data = await this.fetchFromGateway('sessions.list');
      const sessions = Array.isArray(data) ? data : data?.sessions || [];
      this.cache.set(cacheKey, { data: sessions, timestamp: Date.now() });
      return sessions;
    } catch (error) {
      console.warn('[Gateway] Failed to fetch sessions, using demo data:', error);
      return DEMO_SESSIONS;
    }
  }

  async getProjects(): Promise<ProjectData[]> {
    const cacheKey = 'projects';

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const data = await this.fetchFromGateway('projects.list');
      const projects = Array.isArray(data) ? data : data?.projects || [];
      this.cache.set(cacheKey, { data: projects, timestamp: Date.now() });
      return projects;
    } catch (error) {
      console.warn('[Gateway] Failed to fetch projects, using demo data:', error);
      return DEMO_PROJECTS;
    }
  }

  async getTasks(): Promise<TaskData[]> {
    const cacheKey = 'tasks';

    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const data = await this.fetchFromGateway('tasks.list');
      const tasks = Array.isArray(data) ? data : data?.tasks || [];
      this.cache.set(cacheKey, { data: tasks, timestamp: Date.now() });
      return tasks;
    } catch (error) {
      console.warn('[Gateway] Failed to fetch tasks, using demo data:', error);
      return DEMO_TASKS;
    }
  }

  private async fetchFromGateway(command: string): Promise<any> {
    if (!GATEWAY_URL || !GATEWAY_TOKEN) {
      throw new Error('Gateway not configured');
    }

    // Convert WebSocket URL to HTTP for REST queries
    let httpUrl = GATEWAY_URL;
    if (httpUrl.startsWith('wss://')) {
      httpUrl = httpUrl.replace('wss://', 'https://');
    } else if (httpUrl.startsWith('ws://')) {
      httpUrl = httpUrl.replace('ws://', 'http://');
    }

    const url = new URL(httpUrl);
    url.searchParams.append('command', command);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Gateway returned ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[Gateway] Fetch failed for ${command}:`, error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
let service: GatewayService | null = null;

export function getGatewayService(): GatewayService {
  if (!service) {
    service = new GatewayService();
  }
  return service;
}

export async function fetchGatewaySessions(): Promise<SessionData[]> {
  return getGatewayService().getSessions();
}

export async function fetchGatewayProjects(): Promise<ProjectData[]> {
  return getGatewayService().getProjects();
}

export async function fetchGatewayTasks(): Promise<TaskData[]> {
  return getGatewayService().getTasks();
}
