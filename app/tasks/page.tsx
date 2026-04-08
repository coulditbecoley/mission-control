'use client';

import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { TaskItem } from '@/components/TaskItem';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useDashboardStore } from '@/lib/store';
import { Task } from '@/lib/types';
import { Plus } from 'lucide-react';

const statusOptions: Task['status'][] = ['todo', 'in-progress', 'done', 'blocked'];
const priorityOptions: Task['priority'][] = ['low', 'medium', 'high', 'urgent'];

export default function TasksPage() {
  const { tasks, setTasks, searchQuery, updateMetrics } = useDashboardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<Task['status'] | 'all'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    status: 'todo' as Task['status'],
  });

  useEffect(() => {
    fetch('/api/tasks')
      .then((r) => r.json())
      .then((data) => {
        setTasks(data);
        updateMetrics();
      });
  }, [setTasks, updateMetrics]);

  const filteredTasks = tasks.filter((task) => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCreateTask = async () => {
    if (!formData.title.trim()) return;

    const newTask = {
      ...formData,
      projectId: 'default',
      tags: [],
    };

    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask),
    });

    const createdTask = await response.json();
    setTasks([...tasks, createdTask]);
    updateMetrics();

    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
    });
    setIsModalOpen(false);
  };

  const handleDeleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(tasks.filter((t) => t.id !== id));
    updateMetrics();
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, status }),
    });

    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
    updateMetrics();
  };

  const tasksByStatus = statusOptions.map((status) => ({
    status,
    count: tasks.filter((t) => t.status === status).length,
  }));

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
            <p className="text-gray-600">Manage and track all your tasks</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={18} />
            New Task
          </Button>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-sm">
          <SearchBar />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </Button>
          {tasksByStatus.map(({ status, count }) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status} ({count})
            </Button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No tasks found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateTask();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              placeholder="Task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {priorityOptions.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" onClick={handleCreateTask} className="flex-1">
              Create Task
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
