import { ActivityLog } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { CheckCircle, Plus, FolderPlus, AlertCircle, LogIn, LogOut } from 'lucide-react';

interface ActivityTimelineProps {
  activities: ActivityLog[];
}

function getActivityIcon(type: ActivityLog['type']) {
  const icons = {
    task_created: <Plus size={16} className="text-blue-500" />,
    task_updated: <CheckCircle size={16} className="text-gray-500" />,
    task_completed: <CheckCircle size={16} className="text-green-500" />,
    agent_connected: <LogIn size={16} className="text-green-500" />,
    agent_disconnected: <LogOut size={16} className="text-gray-500" />,
    project_created: <FolderPlus size={16} className="text-purple-500" />,
    project_updated: <AlertCircle size={16} className="text-gray-500" />,
  };
  return icons[type];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-gray-100 p-2">
              {getActivityIcon(activity.type)}
            </div>
            {index < activities.length - 1 && (
              <div className="w-0.5 h-12 bg-gray-200 my-2"></div>
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDateTime(activity.timestamp)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">by {activity.actor}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
