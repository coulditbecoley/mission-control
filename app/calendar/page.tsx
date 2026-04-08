'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  cronExpression: string;
  nextRun: string;
  lastRun: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  frequency: string;
}

const MOCK_TASKS: ScheduledTask[] = [
  {
    id: '1',
    name: 'Daily Backup',
    description: 'Backup critical data to secure storage',
    cronExpression: '0 2 * * *',
    nextRun: new Date(Date.now() + 15 * 60000).toISOString(),
    lastRun: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
    status: 'scheduled',
    frequency: 'Daily at 2:00 AM',
  },
  {
    id: '2',
    name: 'Health Check',
    description: 'Monitor system and agent health',
    cronExpression: '*/5 * * * *',
    nextRun: new Date(Date.now() + 3 * 60000).toISOString(),
    lastRun: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'scheduled',
    frequency: 'Every 5 minutes',
  },
  {
    id: '3',
    name: 'Weekly Report',
    description: 'Generate weekly performance report',
    cronExpression: '0 9 ? * MON',
    nextRun: new Date(Date.now() + 2 * 24 * 60 * 60000).toISOString(),
    lastRun: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(),
    status: 'scheduled',
    frequency: 'Every Monday at 9:00 AM',
  },
  {
    id: '4',
    name: 'Cache Refresh',
    description: 'Clear and refresh application cache',
    cronExpression: '0 */6 * * *',
    nextRun: new Date(Date.now() + 45 * 60000).toISOString(),
    lastRun: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
    status: 'completed',
    frequency: 'Every 6 hours',
  },
];

export default function CalendarPage() {
  const [tasks, setTasks] = useState<ScheduledTask[]>(MOCK_TASKS);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'running' | 'completed' | 'failed'>('all');

  const filteredTasks = tasks.filter(
    (task) => filter === 'all' || task.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-900/30 text-blue-300 border border-blue-800/50';
      case 'running':
        return 'bg-yellow-900/30 text-yellow-300 border border-yellow-800/50';
      case 'completed':
        return 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/50';
      case 'failed':
        return 'bg-red-900/30 text-red-300 border border-red-800/50';
      default:
        return 'bg-gray-900/30 text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock size={16} />;
      case 'running':
        return <AlertCircle size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'failed':
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const timeUntilNext = (nextRun: string) => {
    const now = new Date();
    const next = new Date(nextRun);
    const diff = next.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `in ${hours}h ${minutes % 60}m`;
    }
    return `in ${minutes}m`;
  };

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-blue-400" size={28} />
            <h1 className="text-3xl font-bold text-white">Calendar</h1>
          </div>
          <p className="text-gray-400">Scheduled tasks and cron jobs</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'scheduled', 'running', 'completed', 'failed'].map(
            (status) => (
              <button
                key={status}
                onClick={() =>
                  setFilter(status as 'all' | 'scheduled' | 'running' | 'completed' | 'failed')
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1a1f3a] text-gray-300 border border-[#374151] hover:border-[#4b5563]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No scheduled tasks found</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#141829] rounded-lg border border-[#374151] p-6 hover:border-[#4b5563] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {task.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {getStatusIcon(task.status)}
                        {task.status.charAt(0).toUpperCase() +
                          task.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{task.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Frequency</p>
                    <p className="text-gray-300">{task.frequency}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Next Run</p>
                    <p className="text-gray-300 flex items-center gap-1">
                      <Clock size={14} className="text-blue-400" />
                      {timeUntilNext(task.nextRun)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(task.nextRun)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Last Run</p>
                    <p className="text-gray-300">{formatTime(task.lastRun)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <code className="text-xs bg-[#0a0e27] text-green-400 px-3 py-1 rounded border border-[#374151]">
                    {task.cronExpression}
                  </code>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary">
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost">
                      Run Now
                    </Button>
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
