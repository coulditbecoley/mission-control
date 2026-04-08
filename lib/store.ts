import { create } from 'zustand';
import { Task, Project, Agent, ActivityLog, KnowledgeItem, DashboardMetrics } from './types';

// Simple UUID v4 generator (no crypto dependency)
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface DashboardStore {
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Projects
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;

  // Agents
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, agent: Partial<Agent>) => void;

  // Activity Log
  activityLog: ActivityLog[];
  setActivityLog: (log: ActivityLog[]) => void;
  addActivityLog: (log: ActivityLog) => void;

  // Knowledge Base
  knowledge: KnowledgeItem[];
  setKnowledge: (knowledge: KnowledgeItem[]) => void;
  addKnowledgeItem: (item: KnowledgeItem) => void;

  // Metrics
  metrics: DashboardMetrics;
  updateMetrics: () => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, { ...task, id: task.id || generateId() }] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  projects: [],
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, { ...project, id: project.id || generateId() }] })),
  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  agents: [],
  setAgents: (agents) => set({ agents }),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),

  activityLog: [],
  setActivityLog: (log) => set({ activityLog: log }),
  addActivityLog: (log) =>
    set((state) => ({
      activityLog: [log, ...state.activityLog].slice(0, 100),
    })),

  knowledge: [],
  setKnowledge: (knowledge) => set({ knowledge }),
  addKnowledgeItem: (item) =>
    set((state) => ({
      knowledge: [...state.knowledge, item],
    })),

  metrics: {
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    activeAgents: 0,
    projectsInProgress: 0,
  },
  updateMetrics: () => {
    const state = get();
    set({
      metrics: {
        totalTasks: state.tasks.length,
        completedTasks: state.tasks.filter((t) => t.status === 'done').length,
        activeTasks: state.tasks.filter((t) => t.status === 'in-progress').length,
        activeAgents: state.agents.filter((a) => a.status === 'active').length,
        projectsInProgress: state.projects.filter((p) => p.status === 'active').length,
      },
    });
  },

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedFilter: 'all',
  setSelectedFilter: (filter) => set({ selectedFilter: filter }),
}));
