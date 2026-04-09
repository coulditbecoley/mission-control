/**
 * OpenClaw Gateway Service
 * 
 * Uses WebSocket RPC client to fetch real data from OpenClaw Gateway
 * Handles all data types: sessions, projects, tasks, agents, events, docs, activity
 */

import { callGateway } from './gateway-rpc';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'wss://openclaw-ke4f.srv1566532.hstgr.cloud';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

export interface SessionData {
  id: string;
  name: string;
  type: 'agent' | 'user';
  status: 'active' | 'idle' | 'offline';
  lastActive?: string;
}

export interface ProjectData {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress?: number;
  description?: string;
}

export interface TaskData {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export interface AgentData {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  type: 'agent' | 'worker';
  tasks?: number;
  lastActive?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  type: 'meeting' | 'deadline' | 'reminder';
}

export interface Document {
  id: string;
  title: string;
  type: string;
  lastModified: string;
  path?: string;
  tags?: string[];
}

export interface ActivityLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface AIProviderUsage {
  id: string;
  provider: string;
  costUsed: number;
  costLimit?: number;
  tokens: string; // e.g., "303.6M"
  tokensRaw?: number;
  messages: number;
  percentage?: number;
  status: 'active' | 'warning' | 'critical';
  lastUpdated: string;
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

const DEMO_AGENTS: AgentData[] = [
  {
    id: 'agent-1',
    name: 'Trading Bot',
    status: 'active',
    type: 'agent',
    tasks: 3,
    lastActive: new Date().toISOString(),
  },
  {
    id: 'agent-2',
    name: 'Data Collector',
    status: 'idle',
    type: 'agent',
    tasks: 1,
    lastActive: new Date(Date.now() - 3600000).toISOString(),
  },
];

const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'MARS Project Due',
    date: '2026-04-09',
    time: '09:00',
    type: 'deadline',
    description: 'Finish MARS project integration',
  },
  {
    id: 'event-2',
    title: 'Team Standup',
    date: '2026-04-09',
    time: '14:00',
    type: 'meeting',
    description: 'Daily team sync',
  },
];

const DEMO_DOCS: Document[] = [
  {
    id: 'doc-1',
    title: 'Mission Control Setup Guide',
    type: 'markdown',
    lastModified: new Date(Date.now() - 86400000).toISOString(),
    tags: ['setup', 'documentation'],
  },
  {
    id: 'doc-2',
    title: 'Gateway Integration',
    type: 'markdown',
    lastModified: new Date().toISOString(),
    tags: ['gateway', 'integration'],
  },
];

const DEMO_ACTIVITY: ActivityLog[] = [
  {
    id: 'act-1',
    action: 'Deployed Dashboard',
    actor: 'Odin',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    details: 'Deployed version 1.0',
  },
  {
    id: 'act-2',
    action: 'Connected Gateway',
    actor: 'System',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    details: 'OpenClaw Gateway connected',
  },
];

// Using real data from providers.top - no demo fallback
const DEMO_AI_USAGE: AIProviderUsage[] = [];

// Helper function to parse token strings like "303.6M" to numbers
function parseTokensToNumber(tokenStr: string | number): number {
  if (!tokenStr) return 0;
  const str = String(tokenStr).toUpperCase();
  const num = parseFloat(str);
  if (str.includes('M')) return num * 1_000_000;
  if (str.includes('K')) return num * 1_000;
  return num;
}

// Helper function to determine provider status based on cost
function getProviderStatus(cost: number): 'active' | 'warning' | 'critical' {
  if (cost > 75) return 'critical';
  if (cost > 50) return 'warning';
  return 'active';
}

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

  async getAgents(): Promise<AgentData[]> {
    const cacheKey = 'agents';
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const data = await this.fetchFromGateway('agents.list');
      const agents = Array.isArray(data) ? data : data?.agents || [];
      this.cache.set(cacheKey, { data: agents, timestamp: Date.now() });
      return agents;
    } catch (error) {
      console.warn('[Gateway] Failed to fetch agents, using demo data:', error);
      return DEMO_AGENTS;
    }
  }

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    const cacheKey = 'events';
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const data = await this.fetchFromGateway('calendar.list');
      const events = Array.isArray(data) ? data : data?.events || [];
      this.cache.set(cacheKey, { data: events, timestamp: Date.now() });
      return events;
    } catch (error) {
      console.warn('[Gateway] Failed to fetch calendar events, using demo data:', error);
      return DEMO_EVENTS;
    }
  }

  async getDocs(): Promise<Document[]> {
    const cacheKey = 'docs';
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const data = await this.fetchFromGateway('docs.list');
      const docs = Array.isArray(data) ? data : data?.docs || [];
      this.cache.set(cacheKey, { data: docs, timestamp: Date.now() });
      return docs;
    } catch (error) {
      console.warn('[Gateway] Failed to fetch docs, using demo data:', error);
      return DEMO_DOCS;
    }
  }

  async getActivity(): Promise<ActivityLog[]> {
    const cacheKey = 'activity';
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const data = await this.fetchFromGateway('activity.list');
      const activity = Array.isArray(data) ? data : data?.activity || [];
      this.cache.set(cacheKey, { data: activity, timestamp: Date.now() });
      return activity;
    } catch (error) {
      console.warn('[Gateway] Failed to fetch activity, using demo data:', error);
      return DEMO_ACTIVITY;
    }
  }

  async getAIUsage(): Promise<AIProviderUsage[]> {
    const cacheKey = 'ai-usage';
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const data = await this.fetchFromGateway('providers.top');
      // Parse real provider data from gateway response
      let usage: AIProviderUsage[] = [];
      
      if (Array.isArray(data)) {
        usage = data.map((provider: any, idx: number) => ({
          id: `provider-${idx}`,
          provider: provider.name || provider.provider || 'Unknown',
          costUsed: parseFloat(provider.cost) || parseFloat(provider.costUsed) || 0,
          costLimit: 100,
          tokens: provider.tokens || '0',
          tokensRaw: parseTokensToNumber(provider.tokens),
          messages: parseInt(provider.messages) || parseInt(provider.calls) || 0,
          status: getProviderStatus(parseFloat(provider.cost) || 0),
          lastUpdated: new Date().toISOString(),
        }));
      } else if (data?.providers) {
        usage = data.providers.map((provider: any, idx: number) => ({
          id: `provider-${idx}`,
          provider: provider.name || provider.provider || 'Unknown',
          costUsed: parseFloat(provider.cost) || parseFloat(provider.costUsed) || 0,
          costLimit: 100,
          tokens: provider.tokens || '0',
          tokensRaw: parseTokensToNumber(provider.tokens),
          messages: parseInt(provider.messages) || parseInt(provider.calls) || 0,
          status: getProviderStatus(parseFloat(provider.cost) || 0),
          lastUpdated: new Date().toISOString(),
        }));
      }
      
      this.cache.set(cacheKey, { data: usage, timestamp: Date.now() });
      return usage;
    } catch (error) {
      console.error('[Gateway] Failed to fetch AI providers:', error);
      throw error; // Don't fallback - require real data
    }
  }

  private async fetchFromGateway(command: string): Promise<any> {
    if (!GATEWAY_URL || !GATEWAY_TOKEN) {
      throw new Error('Gateway not configured');
    }

    // Use WebSocket RPC client instead of HTTP
    try {
      const data = await callGateway(command);
      return data;
    } catch (error) {
      console.error(`[Gateway] RPC failed for ${command}:`, error);
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

// Export helper functions
export async function fetchGatewaySessions(): Promise<SessionData[]> {
  return getGatewayService().getSessions();
}

export async function fetchGatewayProjects(): Promise<ProjectData[]> {
  return getGatewayService().getProjects();
}

export async function fetchGatewayTasks(): Promise<TaskData[]> {
  return getGatewayService().getTasks();
}

export async function fetchGatewayAgents(): Promise<AgentData[]> {
  return getGatewayService().getAgents();
}

export async function fetchGatewayEvents(): Promise<CalendarEvent[]> {
  return getGatewayService().getCalendarEvents();
}

export async function fetchGatewayDocs(): Promise<Document[]> {
  return getGatewayService().getDocs();
}

export async function fetchGatewayActivity(): Promise<ActivityLog[]> {
  return getGatewayService().getActivity();
}

export async function fetchAIUsage(): Promise<AIProviderUsage[]> {
  return getGatewayService().getAIUsage();
}
