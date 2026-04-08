import { Agent } from '@/lib/types';
import { Badge } from './ui/Badge';
import { formatDate } from '@/lib/utils';
import { Activity } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const statusVariant =
    agent.status === 'active'
      ? 'success'
      : agent.status === 'idle'
        ? 'warning'
        : 'secondary';

  return (
    <div className="bg-[#141829] rounded-lg border border-[#374151] p-6 hover:border-[#4b5563] transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">{agent.name}</h3>
          <p className="text-sm text-gray-400">Agent</p>
        </div>
        <Badge variant={statusVariant}>{agent.status}</Badge>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Tasks Completed</span>
          <span className="font-semibold text-white">{agent.performance.tasksCompleted}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Avg Speed</span>
          <span className="font-semibold text-white">{agent.performance.averageSpeed}h</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Uptime</span>
          <span className="font-semibold text-white">{agent.performance.uptime}%</span>
        </div>
        {agent.currentTask && (
          <div className="pt-2 border-t border-[#374151]">
            <p className="text-xs text-gray-500 mb-1">Currently working on</p>
            <div className="flex items-center gap-1 text-gray-300">
              <Activity size={14} />
              <span className="text-xs truncate">Task {agent.currentTask.substring(0, 8)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
