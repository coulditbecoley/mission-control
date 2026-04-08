'use client';

import { useEffect, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { MetricCard } from '@/components/MetricCard';
import { ProjectCard } from '@/components/ProjectCard';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { useDashboardStore } from '@/lib/store';
import { Project, ActivityLog } from '@/lib/types';
import { CheckCircle, AlertCircle, Zap, FolderOpen } from 'lucide-react';

export default function Dashboard() {
  const { metrics, projects, activityLog, updateMetrics } = useDashboardStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize data on first load
    fetch('/api/init', { method: 'POST' }).then(() => {
      // Load data
      Promise.all([
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/projects').then((r) => r.json()),
        fetch('/api/agents').then((r) => r.json()),
      ]).then(([tasks, projects, agents]) => {
        useDashboardStore.setState({ tasks, projects, agents });
        updateMetrics();
        setLoading(false);
      });
    });
  }, [updateMetrics]);

  const recentActivity = activityLog.slice(0, 5);
  const activeProjects = projects.filter((p) => p.status === 'active');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0e27]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0a0e27] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, Odin. Here's what's happening today.</p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-sm">
          <SearchBar />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            label="Total Tasks"
            value={metrics.totalTasks}
            icon="📋"
            trend={{ value: 12, direction: 'up' }}
          />
          <MetricCard
            label="Completed"
            value={metrics.completedTasks}
            icon={<CheckCircle size={32} />}
            trend={{ value: 8, direction: 'up' }}
          />
          <MetricCard
            label="In Progress"
            value={metrics.activeTasks}
            icon={<AlertCircle size={32} />}
            trend={{ value: 3, direction: 'down' }}
          />
          <MetricCard
            label="Active Agents"
            value={metrics.activeAgents}
            icon={<Zap size={32} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Projects */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h2>
              <div className="grid grid-cols-1 gap-4">
                {activeProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              {activeProjects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="mx-auto mb-2 opacity-30" size={32} />
                  <p>No active projects</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              {recentActivity.length > 0 ? (
                <ActivityTimeline activities={recentActivity} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
