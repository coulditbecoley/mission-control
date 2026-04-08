'use client';

import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

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

const AGENTS_DATA: Agent[] = [
  {
    id: '1',
    name: 'Odin',
    status: 'active',
    tasksCompleted: 342,
    averageSpeed: 2.3,
    uptime: 99.8,
    currentTask: 'Monitoring dashboard health',
    lastActive: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Loki',
    status: 'active',
    tasksCompleted: 287,
    averageSpeed: 2.1,
    uptime: 99.5,
    currentTask: 'Processing market data',
    lastActive: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Thor',
    status: 'active',
    tasksCompleted: 215,
    averageSpeed: 1.8,
    uptime: 99.2,
    currentTask: 'Syncing trades',
    lastActive: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Freya',
    status: 'idle',
    tasksCompleted: 198,
    averageSpeed: 2.5,
    uptime: 98.9,
    lastActive: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: '5',
    name: 'Heimdall',
    status: 'active',
    tasksCompleted: 421,
    averageSpeed: 2.0,
    uptime: 99.9,
    currentTask: 'Monitoring gateway',
    lastActive: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Sif',
    status: 'active',
    tasksCompleted: 156,
    averageSpeed: 2.2,
    uptime: 99.1,
    currentTask: 'Analyzing positions',
    lastActive: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Vidar',
    status: 'idle',
    tasksCompleted: 89,
    averageSpeed: 1.9,
    uptime: 97.5,
    lastActive: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: '8',
    name: 'Modi',
    status: 'active',
    tasksCompleted: 267,
    averageSpeed: 2.4,
    uptime: 99.4,
    currentTask: 'Running background checks',
    lastActive: new Date().toISOString(),
  },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS_DATA);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'idle':
        return 'text-yellow-400';
      case 'offline':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900/20 border-green-800/50';
      case 'idle':
        return 'bg-yellow-900/20 border-yellow-800/50';
      case 'offline':
        return 'bg-red-900/20 border-red-800/50';
      default:
        return 'bg-gray-900/20 border-gray-800/50';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleDateString();
  };

  const activeCount = agents.filter(a => a.status === 'active').length;
  const idleCount = agents.filter(a => a.status === 'idle').length;
  const offlineCount = agents.filter(a => a.status === 'offline').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-blue-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Agents</h1>
          </div>
          <p className="text-gray-400">Asgard agent network</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Agents</p>
            <p className="text-3xl font-bold text-white">{agents.length}</p>
          </div>
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Active</p>
            <p className="text-3xl font-bold text-green-400">{activeCount}</p>
          </div>
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Idle</p>
            <p className="text-3xl font-bold text-yellow-400">{idleCount}</p>
          </div>
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Tasks Completed</p>
            <p className="text-3xl font-bold text-white">{totalTasks.toLocaleString()}</p>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-[#141829] rounded-lg border border-[#374151] p-6 hover:border-[#4b5563] transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                  <div className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium border ${getStatusBg(agent.status)}`}>
                    <span className={getStatusColor(agent.status)}>
                      ● {agent.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Task */}
              {agent.currentTask && (
                <div className="mb-4 p-3 bg-[#0a0e27] rounded border border-[#374151]">
                  <p className="text-xs text-gray-500 mb-1">Currently</p>
                  <p className="text-sm text-gray-300">{agent.currentTask}</p>
                </div>
              )}

              {/* Stats */}
              <div className="space-y-3 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tasks Completed</span>
                  <span className="font-semibold text-white">{agent.tasksCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg Speed</span>
                  <span className="font-semibold text-white">{agent.averageSpeed}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Uptime</span>
                  <span className="font-semibold text-white">{agent.uptime}%</span>
                </div>
              </div>

              {/* Uptime Bar */}
              <div className="mb-3">
                <div className="w-full bg-[#0a0e27] rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-1.5 rounded-full"
                    style={{ width: `${agent.uptime}%` }}
                  ></div>
                </div>
              </div>

              {/* Last Active */}
              <p className="text-xs text-gray-500">
                Last active: {formatTime(agent.lastActive)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
