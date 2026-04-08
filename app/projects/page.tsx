'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  progress: number;
  color: string;
  dueDate: string;
  team: string[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as const,
    progress: 0,
    color: 'bg-blue-500',
    dueDate: '',
    team: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    const newProject: Project = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      status: formData.status,
      progress: formData.progress,
      color: formData.color,
      dueDate: formData.dueDate,
      team: formData.team.split(',').map(t => t.trim()).filter(t => t),
    };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', project: newProject }),
      });

      const data = await response.json();
      setProjects(data.projects);
      setFormData({
        name: '',
        description: '',
        status: 'active',
        progress: 0,
        color: 'bg-blue-500',
        dueDate: '',
        team: '',
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', project: { id } }),
      });

      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'completed':
        return 'text-emerald-400';
      case 'paused':
        return 'text-yellow-400';
      case 'planning':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <p className="text-gray-400">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="text-blue-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Projects</h1>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={20} />
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No projects yet. Create one to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#141829] rounded-lg border border-[#374151] p-6 hover:border-[#4b5563] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-1 text-gray-500 hover:text-red-400 hover:bg-[#1a1f3a] rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs font-semibold text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-[#0a0e27] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status and Team */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-semibold ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  {project.dueDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Due Date</span>
                      <span className="text-gray-300">{project.dueDate}</span>
                    </div>
                  )}
                  {project.team.length > 0 && (
                    <div>
                      <span className="text-gray-400 block mb-2">Team</span>
                      <div className="flex flex-wrap gap-2">
                        {project.team.map((member) => (
                          <span
                            key={member}
                            className="text-xs bg-[#1a1f3a] text-gray-300 px-2 py-1 rounded"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Project Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#1a1f3a] border border-[#374151] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Project name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#1a1f3a] border border-[#374151] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              placeholder="Project description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-[#1a1f3a] border border-[#374151] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full bg-[#1a1f3a] border border-[#374151] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full bg-[#1a1f3a] border border-[#374151] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Team Members (comma-separated)</label>
            <input
              type="text"
              value={formData.team}
              onChange={(e) => setFormData({ ...formData, team: e.target.value })}
              className="w-full bg-[#1a1f3a] border border-[#374151] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Odin, Loki, Thor"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
