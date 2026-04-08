'use client';

import { useState, useEffect } from 'react';
import { Activity as ActivityIcon } from 'lucide-react';

interface Activity {
  id: string;
  type: 'task' | 'project' | 'agent' | 'system' | 'trade';
  action: string;
  description: string;
  user: string;
  timestamp: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const response = await fetch('/api/activity?limit=100');
        const data = await response.json();
        setActivities(data.activity || []);
      } catch (error) {
        console.error('Failed to load activity:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '✓';
      case 'project':
        return '📁';
      case 'agent':
        return '⚡';
      case 'trade':
        return '💰';
      case 'system':
        return '⚙️';
      default:
        return '•';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'text-blue-400';
      case 'project':
        return 'text-green-400';
      case 'agent':
        return 'text-yellow-400';
      case 'trade':
        return 'text-orange-400';
      case 'system':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <p className="text-gray-400">Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ActivityIcon className="text-blue-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Activity Log</h1>
          </div>
          <p className="text-gray-400">Real-time updates from your workspace</p>
        </div>

        {/* Activity Timeline */}
        {activities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No activity yet.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-[#141829] rounded-lg border border-[#374151] p-4 hover:border-[#4b5563] transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`text-2xl mt-1 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold">
                          {activity.description}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          <span className="font-medium">{activity.user}</span>
                          {' '}
                          <span className="text-gray-500">
                            {activity.action}
                          </span>
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>

                    {/* Type Badge */}
                    <div className="mt-2">
                      <span className={`text-xs px-2 py-1 rounded bg-[#1a1f3a] border ${getActivityColor(activity.type)} border-opacity-30`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
