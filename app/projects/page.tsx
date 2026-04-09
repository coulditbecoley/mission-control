'use client';

import { useEffect, useState } from 'react';
import { FolderOpen, Calendar, RefreshCw, Plus, X } from 'lucide-react';
import type { ProjectData } from '@/lib/gateway-service';

export default function Projects() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as const,
    progress: 0,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const res = await fetch('/api/gateway');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Project name is required');
      return;
    }

    const newProject: ProjectData = {
      id: `proj-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      status: formData.status,
      progress: formData.progress,
    };

    setProjects([newProject, ...projects]);

    // Save to local storage
    try {
      const existingProjects = JSON.parse(localStorage.getItem('dashboard-projects') || '[]');
      localStorage.setItem('dashboard-projects', JSON.stringify([newProject, ...existingProjects]));
    } catch (error) {
      console.error('Failed to save project:', error);
    }

    setFormData({ name: '', description: '', status: 'planning', progress: 0 });
    setShowModal(false);
  }

  async function handleDeleteProject(id: string) {
    setProjects(projects.filter(p => p.id !== id));
    try {
      const existingProjects = JSON.parse(localStorage.getItem('dashboard-projects') || '[]');
      const updated = existingProjects.filter((p: any) => p.id !== id);
      localStorage.setItem('dashboard-projects', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  const statusColors: Record<string, string> = {
    planning: 'bg-blue-900/20 text-blue-400',
    active: 'bg-green-900/20 text-green-400',
    completed: 'bg-purple-900/20 text-purple-400',
    'on-hold': 'bg-yellow-900/20 text-yellow-400',
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Loading projects...</p>
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
            <div className="flex items-center gap-3">
              <FolderOpen className="text-blue-400" size={32} />
              <h1 className="text-4xl font-bold text-white">Projects</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchProjects}
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
                Add Project
              </button>
            </div>
          </div>
          <p className="text-gray-400">Manage and track your projects</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Total Projects</p>
            <p className="text-3xl font-bold text-white">{projects.length || 0}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Active</p>
            <p className="text-3xl font-bold text-green-400">
              {projects.filter((p) => p?.status === 'active').length || 0}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-purple-400">
              {projects.filter((p) => p?.status === 'completed').length || 0}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Avg Progress</p>
            <p className="text-3xl font-bold text-blue-400">
              {projects.length > 0
                ? Math.round(
                    projects.reduce((sum, p) => sum + (Math.max(0, Math.min(100, p?.progress || 0)) || 0), 0) /
                      projects.length
                  )
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-400">No projects found</p>
            </div>
          ) : (
            projects.map((project) => {
              if (!project?.id || !project?.name) return null;
              const progress = Math.max(0, Math.min(100, project.progress || 0));
              const statusColor = statusColors[project.status || 'active'] || statusColors.active;

              return (
                <div
                  key={project.id}
                  className="bg-white/10 rounded-lg border border-white/20 p-6 hover:border-white/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${statusColor}`}>
                        {project.status || 'active'}
                      </span>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  {progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs font-medium text-white">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#141829] border border-white/20 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Add New Project</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
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
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Add Project
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
