'use client';

import { useEffect } from 'react';
import { AgentCard } from '@/components/AgentCard';
import { useDashboardStore } from '@/lib/store';
import { Zap } from 'lucide-react';

export default function AgentsPage() {
  const { agents, setAgents } = useDashboardStore();

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.json())
      .then((data) => setAgents(data));
  }, [setAgents]);

  const activeAgents = agents.filter((a) => a.status === 'active');
  const idleAgents = agents.filter((a) => a.status === 'idle');
  const offlineAgents = agents.filter((a) => a.status === 'offline');

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agents</h1>
          <p className="text-gray-600">Monitor and manage all agents</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Agents</p>
                <p className="text-3xl font-bold mt-1">{agents.length}</p>
              </div>
              <Zap className="text-green-500 opacity-30" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{activeAgents.length}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-30" style={{ width: '32px', height: '32px' }}></div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Idle</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{idleAgents.length}</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-30" style={{ width: '32px', height: '32px' }}></div>
            </div>
          </div>
        </div>

        {/* Active Agents */}
        {activeAgents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Agents ({activeAgents.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>
        )}

        {/* Idle Agents */}
        {idleAgents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Idle Agents ({idleAgents.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {idleAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>
        )}

        {/* Offline Agents */}
        {offlineAgents.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Offline Agents ({offlineAgents.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offlineAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </section>
        )}

        {agents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No agents connected</p>
          </div>
        )}
      </div>
    </div>
  );
}
