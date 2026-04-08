'use client';

import { Building2 } from 'lucide-react';

export default function OfficePage() {
  const agents = [
    { name: 'Odin', color: 'bg-blue-500' },
    { name: 'Loki', color: 'bg-purple-500' },
    { name: 'Thor', color: 'bg-red-500' },
    { name: 'Freya', color: 'bg-pink-500' },
    { name: 'Heimdall', color: 'bg-green-500' },
    { name: 'Sif', color: 'bg-yellow-500' },
    { name: 'Vidar', color: 'bg-cyan-500' },
    { name: 'Modi', color: 'bg-orange-500' },
  ];

  return (
    <div className="flex-1 overflow-hidden bg-[#0a0e27]">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#374151]">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="text-blue-400" size={28} />
            <h1 className="text-3xl font-bold text-white">Office</h1>
          </div>
          <p className="text-gray-400">Agents at work and in the break room</p>
        </div>

        {/* Office Canvas */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#0f1318] to-[#141829]">
          {/* Agents Grid */}
          <div className="p-8 grid grid-cols-4 gap-8">
            {agents.map((agent) => (
              <div key={agent.name} className="flex flex-col items-center">
                {/* Desk */}
                <div className="w-24 h-16 bg-amber-900 border-2 border-amber-700 rounded mb-4 flex items-center justify-center">
                  <div className="w-4 h-6 bg-blue-900 border border-blue-700 rounded">
                    <div className="w-3 h-2 bg-blue-400 m-0.5 rounded"></div>
                  </div>
                </div>

                {/* Agent */}
                <div className={`${agent.color} w-12 h-12 rounded-full flex items-center justify-center border-2 border-gray-800 font-bold text-white mb-2`}>
                  {agent.name.slice(0, 2)}
                </div>

                {/* Activity */}
                <div className="text-lg">☕</div>

                {/* Name */}
                <div className="text-sm font-semibold text-white mt-2">{agent.name}</div>

                {/* Status */}
                <div className="text-xs text-gray-400 mt-1">💼 Working</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="absolute top-4 right-4 bg-[#141829] border border-[#374151] rounded-lg p-4 text-sm text-gray-300">
            <div className="font-semibold text-white mb-2">Office</div>
            <div>👥 Agents: {agents.length}</div>
            <div>💼 Working: {agents.length}</div>
            <div>☕ Break: 0</div>
          </div>
        </div>
      </div>
    </div>
  );
}
