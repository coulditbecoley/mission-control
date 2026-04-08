export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  progress: number;
  owner: string;
  startDate: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  color: string;
}

export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  lastSeen: string;
  currentTask?: string;
  performance: {
    tasksCompleted: number;
    averageSpeed: number;
    uptime: number;
  };
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'agent_connected' | 'agent_disconnected' | 'project_created' | 'project_updated';
  title: string;
  description?: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  activeAgents: number;
  projectsInProgress: number;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
