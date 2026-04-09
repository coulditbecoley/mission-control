'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Circle, AlertCircle, Plus, RefreshCw, X } from 'lucide-react';
import type { TaskData } from '@/lib/gateway-service';

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    status: 'todo' as const,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch('/api/gateway');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Task title is required');
      return;
    }

    const newTask: TaskData = {
      id: `task-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
    };

    setTasks([newTask, ...tasks]);
    
    // Save to local storage
    try {
      const existingTasks = JSON.parse(localStorage.getItem('dashboard-tasks') || '[]');
      localStorage.setItem('dashboard-tasks', JSON.stringify([newTask, ...existingTasks]));
    } catch (error) {
      console.error('Failed to save task:', error);
    }

    setFormData({ title: '', description: '', priority: 'medium', status: 'todo' });
    setShowModal(false);
  }

  async function handleDeleteTask(id: string) {
    setTasks(tasks.filter(t => t.id !== id));
    try {
      const existingTasks = JSON.parse(localStorage.getItem('dashboard-tasks') || '[]');
      const updated = existingTasks.filter((t: any) => t.id !== id);
      localStorage.setItem('dashboard-tasks', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }

  async function handleStatusChange(id: string, newStatus: 'todo' | 'in-progress' | 'done') {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      const existingTasks = JSON.parse(localStorage.getItem('dashboard-tasks') || '[]');
      const updated = existingTasks.map((t: any) => t.id === id ? { ...t, status: newStatus } : t);
      localStorage.setItem('dashboard-tasks', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const statusCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const statusColors = {
    todo: 'bg-gray-900/20 text-gray-400',
    'in-progress': 'bg-blue-900/20 text-blue-400',
    done: 'bg-green-900/20 text-green-400',
  };

  const priorityColors = {
    low: 'text-gray-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Loading tasks...</p>
          <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white">Tasks</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchTasks}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 font-semibold"
              >
                <Plus size={18} />
                Add Task
              </button>
            </div>
          </div>
          <p className="text-gray-400">Manage your tasks across all projects</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Total Tasks</p>
            <p className="text-3xl font-bold text-white">{tasks.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">To Do</p>
            <p className="text-3xl font-bold text-gray-400">{statusCounts.todo}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-400">{statusCounts['in-progress']}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Done</p>
            <p className="text-3xl font-bold text-green-400">{statusCounts.done}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10">
          {(['all', 'todo', 'in-progress', 'done'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                filter === f
                  ? 'text-white border-b-2 border-blue-500 -mb-px'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No tasks found</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/10 rounded-lg border border-white/20 p-4 hover:border-white/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => {
                      const nextStatus = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in-progress' : 'done';
                      handleStatusChange(task.id, nextStatus);
                    }}
                    className="mt-1 flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    {task.status === 'done' ? (
                      <CheckCircle className="text-green-400" size={20} />
                    ) : task.status === 'in-progress' ? (
                      <AlertCircle className="text-blue-400" size={20} />
                    ) : (
                      <Circle className="text-gray-400" size={20} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3
                        className={`text-lg font-semibold ${
                          task.status === 'done' ? 'text-gray-500 line-through' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded ${statusColors[task.status]}`}>
                          {task.status === 'in-progress' ? 'In Progress' : task.status}
                        </span>
                        <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="ml-2 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141829] border border-white/20 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Add New Task</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
