'use client';

import { Building2 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  status: 'working' | 'break';
  activity: string;
}

const AGENTS: Agent[] = [
  { id: '1', name: 'Odin', shortName: 'Od', color: 'bg-blue-500', bgColor: 'bg-blue-600', status: 'working', activity: '💻' },
  { id: '2', name: 'Loki', shortName: 'Lo', color: 'bg-purple-500', bgColor: 'bg-purple-600', status: 'working', activity: '💻' },
  { id: '3', name: 'Thor', shortName: 'Th', color: 'bg-red-500', bgColor: 'bg-red-600', status: 'working', activity: '💻' },
  { id: '4', name: 'Freya', shortName: 'Fr', color: 'bg-pink-500', bgColor: 'bg-pink-600', status: 'working', activity: '💻' },
  { id: '5', name: 'Heimdall', shortName: 'He', color: 'bg-green-500', bgColor: 'bg-green-600', status: 'working', activity: '💻' },
  { id: '6', name: 'Sif', shortName: 'Si', color: 'bg-yellow-500', bgColor: 'bg-yellow-600', status: 'working', activity: '💻' },
  { id: '7', name: 'Vidar', shortName: 'Vi', color: 'bg-cyan-500', bgColor: 'bg-cyan-600', status: 'working', activity: '💻' },
  { id: '8', name: 'Modi', shortName: 'Mo', color: 'bg-orange-500', bgColor: 'bg-orange-600', status: 'working', activity: '💻' },
];

export default function OfficePage() {
  const workingCount = AGENTS.filter(a => a.status === 'working').length;
  const breakCount = AGENTS.filter(a => a.status === 'break').length;

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#374151]">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="text-blue-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Office</h1>
          </div>
          <p className="text-gray-400">Agents at work and in the break room</p>
        </div>

        {/* Legend/Stats Bar */}
        <div className="px-6 py-4 bg-[#0f1318] border-b border-[#374151] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Agents: {AGENTS.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Working: {workingCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
              <span className="text-sm text-gray-300">Break: {breakCount}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">Updated live</div>
        </div>

        {/* Office Grid */}
        <div className="flex-1 p-8 bg-gradient-to-b from-[#0a0e27] to-[#0f1318]">
          <div className="grid grid-cols-4 gap-12 max-w-7xl">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="flex flex-col items-center">
                {/* Desk with monitor */}
                <div className="relative mb-6">
                  {/* Desk */}
                  <div className="w-28 h-20 bg-amber-900 border-4 border-amber-700 rounded-lg shadow-lg flex items-end justify-center pb-2">
                    {/* Monitor */}
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-4 bg-blue-900 border-2 border-blue-600 rounded-sm shadow-md">
                        <div className="w-5 h-3 bg-gradient-to-b from-blue-400 to-blue-500 m-0.5 rounded-xs"></div>
                      </div>
                      <div className="w-8 h-0.5 bg-gray-600"></div>
                    </div>
                  </div>

                  {/* Working indicator */}
                  {agent.status === 'working' && (
                    <div className="absolute -top-2 right-2 w-3 h-3 bg-red-500 rounded-full border border-red-300 animate-pulse"></div>
                  )}
                </div>

                {/* Agent 16-bit character */}
                <div className={`${agent.color} w-14 h-14 rounded-full border-3 border-gray-800 flex items-center justify-center text-lg font-bold text-white shadow-lg mb-2`}>
                  {agent.shortName}
                </div>

                {/* Activity */}
                <div className="text-2xl mb-1">{agent.activity}</div>

                {/* Name */}
                <h3 className="text-sm font-semibold text-white text-center">{agent.name}</h3>

                {/* Status badge */}
                <div className={`mt-2 px-2 py-1 rounded text-xs font-medium ${
                  agent.status === 'working'
                    ? 'bg-red-900/50 text-red-300 border border-red-700/50'
                    : 'bg-gray-900/50 text-gray-300 border border-gray-700/50'
                }`}>
                  {agent.status === 'working' ? '🔴 Working' : '⚪ Break'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Break Room Section */}
        <div className="mt-12 px-8 py-6 border-t-2 border-[#374151]">
          <h2 className="text-xl font-bold text-white mb-4">Break Room</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#141829] border border-[#374151] rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">☕</div>
              <p className="text-gray-300 text-sm">Coffee Bar</p>
            </div>
            <div className="bg-[#141829] border border-[#374151] rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">📰</div>
              <p className="text-gray-300 text-sm">Reading Area</p>
            </div>
            <div className="bg-[#141829] border border-[#374151] rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-gray-300 text-sm">Lounge</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
