'use client';

import { useEffect } from 'react';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { useDashboardStore } from '@/lib/store';

export default function ActivityPage() {
  const { activityLog } = useDashboardStore();

  useEffect(() => {
    // In a real app, this would fetch from the API
    // For now, we'll load from the store state
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Log</h1>
          <p className="text-gray-600">Track all system events and changes</p>
        </div>

        {/* Timeline */}
        {activityLog.length > 0 ? (
          <ActivityTimeline activities={activityLog} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
