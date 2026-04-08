'use client';

import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useDashboardStore } from '@/lib/store';
import { Project } from '@/lib/types';
import { Plus } from 'lucide-react';

const colors = ['red', 'blue', 'green', 'purple', 'yellow', 'pink', 'indigo', 'cyan'];
const statuses: Project['status'][] = ['planning', 'active', 'paused', 'completed'];

export default function ProjectsPage() {
  const { projects, setProjects, searchQuery, updateMetrics } = useDashboardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<Project['status'] | 'all'>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner: 'Odin',
    color: 'blue' as typeof colors[0],
    status: 'planning' as Project['status'],
  });

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        setProjects(data);
        updateMetrics();
      });
  }, [setProjects, updateMetrics]);

  const filteredProjects = projects.filter((project) => {
    if (filter !== 'all' && project.status !== filter) return false;
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCreateProject = async () => {
    if (!formData.name.trim()) return;

    const newProject = {
      ...formData,
      progress: 0,
    };

    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
    });

    const createdProject = await response.json();
    setProjects([...projects, createdProject]);
    updateMetrics();

    setFormData({
      name: '',
      description: '',
      owner: 'Odin',
      color: 'blue',
      status: 'planning',
    });
    setIsModalOpen(false);
  };

  const projectsByStatus = statuses.map((status) => ({
    status,
    count: projects.filter((p) => p.status === status).length,
  }));

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
            <p className="text-gray-600">View and manage all projects</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus size={18} />
            New Project
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
            All ({projects.length})
          </Button>
          {projectsByStatus.map(({ status, count }) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
            </Button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>No projects found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateProject();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Project name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              placeholder="Project description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value as typeof colors[0] })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" onClick={handleCreateProject} className="flex-1">
              Create Project
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
