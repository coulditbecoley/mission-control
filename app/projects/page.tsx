'use client';

import { useEffect, useState } from 'react';
import { FolderOpen, Calendar, RefreshCw } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Safe date formatter
  const safeFormatDate = (dateString: any): string | null => {
    try {
      if (!dateString || typeof dateString !== 'string') return null;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  // Safe progress validator
  const safeProgress = (progress: any): number => {
    try {
      const num = typeof progress === 'number' ? progress : parseFloat(progress);
      if (isNaN(num)) return 0;
      return Math.max(0, Math.min(100, num));
    } catch {
      return 0;
    }
  };

  // Safe project data processor
  const processProjectData = (rawData: any): Project | null => {
    try {
      if (!rawData || typeof rawData !== 'object') return null;

      const id = String(rawData.id || rawData.key || Math.random());
      const name = String(rawData.name || rawData.title || 'Unnamed Project').trim();
      if (!name) return null;

      return {
        id,
        name,
        description: String(rawData.description || '').trim() || undefined,
        status: mapProjectStatus(rawData.status),
        progress: safeProgress(rawData.progress),
        startDate: rawData.startDate,
        endDate: rawData.endDate,
        source: rawData.source,
      };
    } catch {
      return null;
    }
  };

  async function fetchProjects() {
    try {
      setLoading(true);
      setError(null);

      // Try gateway first
      try {
        const gatewayRes = await fetch('/api/gateway', { signal: AbortSignal.timeout(5000) });
        if (gatewayRes.ok) {
          const gatewayData = await gatewayRes.json();

          if (Array.isArray(gatewayData?.projects) && gatewayData.projects.length > 0) {
            const processedProjects = gatewayData.projects
              .map((p: any) => processProjectData({ ...p, source: 'gateway' }))
              .filter((p: Project | null): p is Project => p !== null);

            if (processedProjects.length > 0) {
              setProjects(processedProjects);
              setSource('gateway');
              setLoading(false);
              return;
            }
          }
        }
      } catch (gatewayError) {
        console.warn('Gateway fetch failed:', gatewayError);
      }

      // Fallback to local API
      try {
        const localRes = await fetch('/api/projects', { signal: AbortSignal.timeout(5000) });
        if (localRes.ok) {
          const localData = await localRes.json();

          if (Array.isArray(localData)) {
            const processedProjects = localData
              .map((p: any) => processProjectData({ ...p, source: 'local' }))
              .filter((p: Project | null): p is Project => p !== null);

            setProjects(processedProjects);
            setSource('local');
          }
        }
      } catch (localError) {
        console.warn('Local fetch failed:', localError);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  function mapProjectStatus(status: any): 'planning' | 'active' | 'completed' | 'on-hold' {
    try {
      const s = String(status || '').toLowerCase().trim();
      if (!s) return 'active';
      if (s.includes('complete') || s.includes('done')) return 'completed';
      if (s.includes('hold') || s.includes('pause')) return 'on-hold';
      if (s.includes('plan')) return 'planning';
      return 'active';
    } catch {
      return 'active';
    }
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

  const statusColors: Record<string, string> = {
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

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
                    projects.reduce((sum, p) => sum + (safeProgress(p?.progress) || 0), 0) /
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
              const progress = safeProgress(project.progress);
              const startDate = safeFormatDate(project.startDate);
              const endDate = safeFormatDate(project.endDate);
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
                    <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ml-2 ${statusColor}`}>
                      {project.status || 'active'}
                    </span>
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

                  {/* Dates */}
                  {(startDate || endDate) && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Calendar size={14} />
                      {startDate && <span>{startDate}</span>}
                      {startDate && endDate && <span>→</span>}
                      {endDate && <span>{endDate}</span>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-8">
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh Projects
          </button>
        </div>
      </div>
    </div>
  );
}
