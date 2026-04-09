'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Circle, AlertCircle, Plus, RefreshCw } from 'lucide-react';
import type { TaskData } from '@/lib/gateway-service';

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');

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
            <button
              onClick={fetchTasks}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
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
                  {task.status === 'done' ? (
                    <CheckCircle className="text-green-400 mt-1 flex-shrink-0" size={20} />
                  ) : task.status === 'in-progress' ? (
                    <AlertCircle className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                  ) : (
                    <Circle className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                  )}

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
    </div>
  );
}
