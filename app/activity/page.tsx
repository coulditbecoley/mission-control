'use client';

import { useEffect, useState } from 'react';
import { Activity, RefreshCw, Zap, FileText, Users } from 'lucide-react';
import type { ActivityLog } from '@/lib/gateway-service';

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  async function fetchActivity() {
    try {
      setLoading(true);
      const res = await fetch('/api/gateway');
      const data = await res.json();
      setActivities((data.activity || []).sort((a: ActivityLog, b: ActivityLog) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }));
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setLoading(false);
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('Deploy')) return <Zap className="text-blue-400" size={18} />;
    if (action.includes('Create')) return <FileText className="text-green-400" size={18} />;
    if (action.includes('User') || action.includes('Login')) return <Users className="text-purple-400" size={18} />;
    return <Activity className="text-gray-400" size={18} />;
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Loading activity...</p>
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
              <Activity className="text-blue-400" size={32} />
              <h1 className="text-4xl font-bold text-white">Activity</h1>
            </div>
            <button
              onClick={fetchActivity}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
          <p className="text-gray-400">Recent actions and system events</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Total Activities</p>
            <p className="text-3xl font-bold text-white">{activities.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Last 24 Hours</p>
            <p className="text-3xl font-bold text-blue-400">
              {activities.filter(a => {
                const date = new Date(a.timestamp);
                return new Date().getTime() - date.getTime() < 86400000;
              }).length}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Actors</p>
            <p className="text-3xl font-bold text-green-400">
              {new Set(activities.map(a => a.actor)).size}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Status</p>
            <p className="text-3xl font-bold text-green-400">Active</p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="relative space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No activity found</p>
            </div>
          ) : (
            activities.map((activity, idx) => (
              <div
                key={activity.id}
                className="relative flex gap-4"
              >
                {/* Timeline line */}
                {idx < activities.length - 1 && (
                  <div className="absolute left-7 top-12 bottom-0 w-px bg-white/10" />
                )}

                {/* Icon */}
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-lg bg-white/10 border border-white/20 relative z-10">
                  {getActionIcon(activity.action)}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="bg-white/10 rounded-lg border border-white/20 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">{activity.action}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                      <span className="px-2 py-1 bg-white/5 rounded">
                        {activity.actor}
                      </span>
                      <span>
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {activity.details && (
                      <p className="text-sm text-gray-400 pt-2 border-t border-white/10">
                        {activity.details}
                      </p>
                    )}
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
