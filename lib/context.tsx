'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Task, Project, Agent, ActivityLog, KnowledgeItem, DashboardMetrics } from './types';

interface DashboardContextType {
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

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    activeAgents: 0,
    projectsInProgress: 0,
  });

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [...prev, project]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const setAgentsList = useCallback((newAgents: Agent[]) => {
    setAgents(newAgents);
  }, []);

  const updateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const addActivityLog = useCallback((log: ActivityLog) => {
    setActivityLog((prev) => [log, ...prev].slice(0, 100));
  }, []);

  const addKnowledgeItem = useCallback((item: KnowledgeItem) => {
    setKnowledge((prev) => [...prev, item]);
  }, []);

  const updateMetrics = useCallback(() => {
    setMetrics({
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'done').length,
      activeTasks: tasks.filter((t) => t.status === 'in-progress').length,
      activeAgents: agents.filter((a) => a.status === 'active').length,
      projectsInProgress: projects.filter((p) => p.status === 'active').length,
    });
  }, [tasks, agents, projects]);

  const value: DashboardContextType = {
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    projects,
    setProjects,
    addProject,
    updateProject,
    agents,
    setAgents: setAgentsList,
    updateAgent,
    activityLog,
    setActivityLog,
    addActivityLog,
    knowledge,
    setKnowledge,
    addKnowledgeItem,
    metrics,
    updateMetrics,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
