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
  const { metrics, projects, activityLog, updateMetrics, tasks, agents } = useDashboardStore();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<any>({});

  useEffect(() => {
    // Initialize data on first load
    const initDashboard = async () => {
      try {
        await fetch('/api/init', { method: 'POST' });
        
        // Load core data
        const tasksRes = await fetch('/api/tasks');
        const projectsRes = await fetch('/api/projects');
        const agentsRes = await fetch('/api/agents');
        
        const tasksData = tasksRes.ok ? await tasksRes.json() : [];
        const projectsData = projectsRes.ok ? await projectsRes.json() : [];
        const agentsData = agentsRes.ok ? await agentsRes.json() : [];
        
        useDashboardStore.setState({
          tasks: tasksData,
          projects: projectsData,
          agents: agentsData,
        });
        
        updateMetrics();
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initDashboard();
  }, [updateMetrics]);

  const recentActivity = activityLog.slice(0, 5);
  const activeProjects = projects.filter((p) => p.status === 'active');
  const completedTasks = tasks?.filter((t: any) => t.status === 'completed').length || 0;
  const openTasks = tasks?.filter((t: any) => t.status !== 'completed').length || 0;

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
          <h1 className="text-4xl font-bold text-white mb-2">Overview</h1>
          <p className="text-gray-400">Summary of all your work across Asgard.</p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-sm">
          <SearchBar />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard
            label="Open Tasks"
            value={openTasks}
            icon="📋"
            trend={{ value: completedTasks, direction: 'up' }}
          />
          <MetricCard
            label="Completed"
            value={completedTasks}
            icon={<CheckCircle size={32} />}
          />
          <MetricCard
            label="Active Projects"
            value={activeProjects.length}
            icon={<FolderOpen size={32} />}
          />
          <MetricCard
            label="Active Agents"
            value={agents?.length || 0}
            icon={<Zap size={32} />}
          />
          <MetricCard
            label="Upcoming Events"
            value={summaryData.upcomingEvents || 0}
            icon="📅"
          />
        </div>

        {/* Quick Access Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Tasks Summary */}
          <a href="/tasks" className="p-6 bg-[#141829] border border-[#374151] rounded-lg hover:border-blue-500 transition-colors">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Tasks</h3>
            <p className="text-2xl font-bold text-white">{openTasks}</p>
            <p className="text-xs text-gray-500 mt-1">Waiting on you</p>
          </a>

          {/* Knowledge Summary */}
          <a href="/knowledge" className="p-6 bg-[#141829] border border-[#374151] rounded-lg hover:border-blue-500 transition-colors">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Knowledge</h3>
            <p className="text-2xl font-bold text-white">{summaryData.knowledge || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Documents stored</p>
          </a>

          {/* Docs Summary */}
          <a href="/docs" className="p-6 bg-[#141829] border border-[#374151] rounded-lg hover:border-blue-500 transition-colors">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Documentation</h3>
            <p className="text-2xl font-bold text-white">{summaryData.docs || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Published docs</p>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Projects */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-100">Active Projects</h2>
                <a href="/projects" className="text-sm text-blue-400 hover:text-blue-300">View all →</a>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {activeProjects.slice(0, 3).map((project) => (
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-100">Recent Activity</h2>
                <a href="/activity" className="text-sm text-blue-400 hover:text-blue-300">View all →</a>
              </div>
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
