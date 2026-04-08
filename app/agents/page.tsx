'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  tasksCompleted: number;
  averageSpeed: number;
  uptime: number;
  currentTask?: string;
  lastActive: string;
}

interface ApiResponse {
  agents: Agent[];
  source: 'gateway' | 'demo';
  gatewayStatus?: string;
  message?: string;
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'gateway' | 'demo'>('demo');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');
      const data: ApiResponse = await response.json();

      setAgents(data.agents || []);
      setSource(data.source || 'demo');

      if (data.message) {
        setError(data.message);
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setError('Failed to load agents');
    } finally {
      setLoading(false);
    }
  }

  const activeCount = agents.filter((a) => a.status === 'active').length;
  const idleCount = agents.filter((a) => a.status === 'idle').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Loading agents...</p>
          <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Agents</h1>
          </div>
          <p className="text-gray-400">
            {source === 'gateway' ? '🔗 Connected to OpenClaw Gateway' : '📊 Demo data (gateway not configured)'}
          </p>
          {error && <p className="text-xs text-yellow-400 mt-2">{error}</p>}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Total Agents</p>
            <p className="text-3xl font-bold text-white">{agents.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Active</p>
            <p className="text-3xl font-bold text-green-400">{activeCount}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Idle</p>
            <p className="text-3xl font-bold text-yellow-400">{idleCount}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Tasks Completed</p>
            <p className="text-3xl font-bold text-white">{totalTasks.toLocaleString()}</p>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white/10 rounded-lg border border-white/20 p-6 hover:border-white/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                  <div
                    className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium border ${
                      agent.status === 'active'
                        ? 'bg-green-900/20 border-green-800/50'
                        : agent.status === 'idle'
                          ? 'bg-yellow-900/20 border-yellow-800/50'
                          : 'bg-red-900/20 border-red-800/50'
                    }`}
                  >
                    <span
                      className={
                        agent.status === 'active'
                          ? 'text-green-400'
                          : agent.status === 'idle'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }
                    >
                      ● {agent.status}
                    </span>
                  </div>
                </div>
              </div>

              {agent.currentTask && (
                <div className="mb-4 p-3 bg-[#0a0e27] rounded border border-white/20">
                  <p className="text-xs text-gray-500 mb-1">Currently</p>
                  <p className="text-sm text-gray-300">{agent.currentTask}</p>
                </div>
              )}

              <div className="space-y-3 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tasks Completed</span>
                  <span className="font-semibold text-white">{agent.tasksCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg Speed</span>
                  <span className="font-semibold text-white">{agent.averageSpeed.toFixed(1)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Uptime</span>
                  <span className="font-semibold text-white">{agent.uptime.toFixed(1)}%</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="w-full bg-[#0a0e27] rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${agent.uptime}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Last active:{' '}
                {(() => {
                  const date = new Date(agent.lastActive);
                  const now = new Date();
                  const diff = now.getTime() - date.getTime();
                  const minutes = Math.floor(diff / 60000);
                  const hours = Math.floor(diff / 3600000);

                  if (minutes < 1) return 'just now';
                  if (minutes < 60) return `${minutes}m ago`;
                  if (hours < 24) return `${hours}h ago`;
                  return date.toLocaleDateString();
                })()}
              </p>
            </div>
          ))}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No agents available</p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8">
          <button
            onClick={fetchAgents}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors text-sm"
          >
            Refresh Agents
          </button>
        </div>
      </div>
    </div>
  );
}
