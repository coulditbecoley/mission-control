import fs from 'fs/promises';
import path from 'path';
import { Task, Project, Agent, ActivityLog, KnowledgeItem } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

const DEFAULTS = {
  tasks: 'tasks.json',
  projects: 'projects.json',
  agents: 'agents.json',
  activity: 'activity.json',
  knowledge: 'knowledge.json',
};

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

async function readFile<T>(filename: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return defaultValue;
  }
}

async function writeFile<T>(filename: string, data: T): Promise<void> {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to write ${filename}:`, error);
  }
}

export const storage = {
  async getTasks(): Promise<Task[]> {
    return readFile(DEFAULTS.tasks, []);
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    return writeFile(DEFAULTS.tasks, tasks);
  },

  async getProjects(): Promise<Project[]> {
    return readFile(DEFAULTS.projects, []);
  },

  async saveProjects(projects: Project[]): Promise<void> {
    return writeFile(DEFAULTS.projects, projects);
  },

  async getAgents(): Promise<Agent[]> {
    return readFile(DEFAULTS.agents, []);
  },

  async saveAgents(agents: Agent[]): Promise<void> {
    return writeFile(DEFAULTS.agents, agents);
  },

  async getActivityLog(): Promise<ActivityLog[]> {
    return readFile(DEFAULTS.activity, []);
  },

  async saveActivityLog(logs: ActivityLog[]): Promise<void> {
    return writeFile(DEFAULTS.activity, logs);
  },

  async getKnowledge(): Promise<KnowledgeItem[]> {
    return readFile(DEFAULTS.knowledge, []);
  },

  async saveKnowledge(items: KnowledgeItem[]): Promise<void> {
    return writeFile(DEFAULTS.knowledge, items);
  },
};
