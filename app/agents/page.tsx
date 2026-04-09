'use client';

import { useEffect, useState } from 'react';
import { Zap, Clock, RefreshCw } from 'lucide-react';
import type { AgentData } from '@/lib/gateway-service';

export default function Agents() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    try {
      setLoading(true);
      const res = await fetch('/api/gateway');
      const data = await res.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  }

  const activeCount = agents.filter(a => a.status === 'active').length;
  const idleCount = agents.filter(a => a.status === 'idle').length;
  const offlineCount = agents.filter(a => a.status === 'offline').length;

  const statusColors = {
    active: 'bg-green-900/20 text-green-400',
    idle: 'bg-yellow-900/20 text-yellow-400',
    offline: 'bg-gray-900/20 text-gray-400',
  };

  const statusDot = {
    active: 'bg-green-500',
    idle: 'bg-yellow-500',
    offline: 'bg-gray-500',
  };

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
      <div className="p-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="text-blue-400" size={32} />
              <h1 className="text-4xl font-bold text-white">Agents</h1>
            </div>
            <button
              onClick={fetchAgents}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
          <p className="text-gray-400">Monitor and manage OpenClaw agents</p>
        </div>

        {/* Stats */}
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
            <p className="text-gray-400 text-sm mb-1">Offline</p>
            <p className="text-3xl font-bold text-gray-400">{offlineCount}</p>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-400">No agents found</p>
            </div>
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white/10 rounded-lg border border-white/20 p-6 hover:border-white/40 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${statusDot[agent.status]}`} />
                    <div>
                      <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{agent.type}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${statusColors[agent.status]}`}>
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </span>
                </div>

                {/* Tasks */}
                <div className="mb-4 p-3 bg-white/5 rounded border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Active Tasks</p>
                  <p className="text-xl font-bold text-blue-400">{agent.tasks || 0}</p>
                </div>

                {/* Last Active */}
                {agent.lastActive && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={14} />
                    <span>
                      Last active:{' '}
                      {new Date(agent.lastActive).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
