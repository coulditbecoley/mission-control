'use client';

import { useEffect, useState } from 'react';
import { FolderOpen, GitBranch, Calendar, RefreshCw } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress?: number;
  startDate?: string;
  endDate?: string;
  source?: 'local' | 'gateway';
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'local' | 'gateway'>('local');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);

      // Try gateway first
      const gatewayRes = await fetch('/api/gateway');
      if (gatewayRes.ok) {
        const gatewayData = await gatewayRes.json();

        if (gatewayData.projects && gatewayData.projects.length > 0) {
          const gatewayProjects = gatewayData.projects.map((p: any, i: number) => ({
            id: p.id || `project-${i}`,
            name: p.name || p.title || `Project ${i + 1}`,
            description: p.description || '',
            status: mapProjectStatus(p.status || 'active'),
            progress: p.progress || 0,
            startDate: p.startDate,
            endDate: p.endDate,
            source: 'gateway',
          }));

          setProjects(gatewayProjects);
          setSource('gateway');
          setLoading(false);
          return;
        }
      }

      // Fallback to local API
      const localRes = await fetch('/api/projects');
      if (localRes.ok) {
        const localData = await localRes.json();
        setProjects(localData);
        setSource('local');
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }

  function mapProjectStatus(status: string): 'planning' | 'active' | 'completed' | 'on-hold' {
    const s = String(status || '').toLowerCase();
    if (s.includes('complete') || s.includes('done')) return 'completed';
    if (s.includes('hold') || s.includes('pause')) return 'on-hold';
    if (s.includes('plan')) return 'planning';
    return 'active';
  }

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

  const statusColors = {
    planning: 'bg-blue-900/20 text-blue-400',
    active: 'bg-green-900/20 text-green-400',
    completed: 'bg-purple-900/20 text-purple-400',
    'on-hold': 'bg-yellow-900/20 text-yellow-400',
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FolderOpen className="text-blue-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Projects</h1>
          </div>
          <p className="text-gray-400">
            {source === 'gateway' ? '🔗 Synced from OpenClaw Gateway' : '📊 Project management'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Total Projects</p>
            <p className="text-3xl font-bold text-white">{projects.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Active</p>
            <p className="text-3xl font-bold text-green-400">
              {projects.filter((p) => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-purple-400">
              {projects.filter((p) => p.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Avg Progress</p>
            <p className="text-3xl font-bold text-blue-400">
              {projects.length > 0
                ? Math.round(
                    projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length
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
            projects.map((project) => (
              <div key={project.id} className="bg-white/10 rounded-lg border border-white/20 p-6 hover:border-white/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-400 mt-1">{project.description}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>

                {/* Progress */}
                {project.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">Progress</span>
                      <span className="text-xs font-medium text-white">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} />
                  {project.startDate && <span>{new Date(project.startDate).toLocaleDateString()}</span>}
                  {project.endDate && <span>→ {new Date(project.endDate).toLocaleDateString()}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-8">
          <button
            onClick={fetchProjects}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh Projects
          </button>
        </div>
      </div>
    </div>
  );
}
