'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Trash2, Plus, RefreshCw } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  source?: 'local' | 'gateway';
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'local' | 'gateway'>('local');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);

      // Try gateway first
      const gatewayRes = await fetch('/api/gateway');
      if (gatewayRes.ok) {
        const gatewayData = await gatewayRes.json();

        if (gatewayData.sessions && gatewayData.sessions.length > 0) {
          const gatewayTasks = gatewayData.sessions
            .filter((s: any) => s.type === 'task' || s.state === 'task')
            .map((s: any, i: number) => ({
              id: s.id || `task-${i}`,
              title: s.label || s.name || `Task ${i + 1}`,
              description: s.description || '',
              status: mapSessionStatus(s.state || 'pending'),
              priority: s.priority || 'medium',
              dueDate: s.dueDate,
              source: 'gateway',
            }));

          if (gatewayTasks.length > 0) {
            setTasks(gatewayTasks);
            setSource('gateway');
            setLoading(false);
            return;
          }
        }
      }

      // Fallback to local API
      const localRes = await fetch('/api/tasks');
      if (localRes.ok) {
        const localData = await localRes.json();
        setTasks(localData);
        setSource('local');
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  function mapSessionStatus(state: string): 'pending' | 'in-progress' | 'completed' {
    const s = String(state || '').toLowerCase();
    if (s.includes('complete') || s.includes('done')) return 'completed';
    if (s.includes('progress') || s.includes('active')) return 'in-progress';
    return 'pending';
  }

  function addTask() {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: 'pending',
      priority: 'medium',
      source: 'local',
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');

    // Save to localStorage
    localStorage.setItem('tasks', JSON.stringify([newTask, ...tasks]));
  }

  function toggleTask(id: string) {
    setTasks(
      tasks.map((t) => ({
        ...t,
        status: t.status === 'completed' ? 'pending' : 'completed',
      }))
    );
  }

  function deleteTask(id: string) {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    localStorage.setItem('tasks', JSON.stringify(updated));
  }

  const pending = tasks.filter((t) => t.status === 'pending').length;
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;

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
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="text-green-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Tasks</h1>
          </div>
          <p className="text-gray-400">
            {source === 'gateway' ? '🔗 Synced from OpenClaw Gateway' : '📝 Local task management'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{pending}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">In Progress</p>
            <p className="text-3xl font-bold text-blue-400">{inProgress}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-400">{completed}</p>
          </div>
        </div>

        {/* Add Task */}
        {source === 'local' && (
          <div className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTask}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} /> Add
              </button>
              <button
                onClick={fetchTasks}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No tasks yet</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white/10 rounded-lg p-4 border border-white/20 hover:border-white/40 transition-all flex items-center gap-4"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 size={24} className="text-green-400" />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium ${
                      task.status === 'completed'
                        ? 'text-gray-500 line-through'
                        : 'text-white'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                  )}
                </div>

                {task.priority && (
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'high'
                        ? 'bg-red-900/20 text-red-400'
                        : task.priority === 'medium'
                          ? 'bg-yellow-900/20 text-yellow-400'
                          : 'bg-blue-900/20 text-blue-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                )}

                {task.source === 'local' && (
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
