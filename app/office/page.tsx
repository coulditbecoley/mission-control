'use client';

import { Building2 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  status: 'working' | 'break';
  activity: string;
}

const AGENTS: Agent[] = [
  { id: '1', name: 'Odin', x: 80, y: 120, color: 'bg-blue-500', status: 'working', activity: '💻' },
  { id: '2', name: 'Loki', x: 200, y: 180, color: 'bg-purple-500', status: 'working', activity: '💻' },
  { id: '3', name: 'Thor', x: 320, y: 140, color: 'bg-red-500', status: 'working', activity: '💻' },
  { id: '4', name: 'Freya', x: 440, y: 200, color: 'bg-pink-500', status: 'working', activity: '💻' },
  { id: '5', name: 'Heimdall', x: 560, y: 160, color: 'bg-green-500', status: 'working', activity: '💻' },
  { id: '6', name: 'Sif', x: 680, y: 220, color: 'bg-yellow-500', status: 'working', activity: '💻' },
  { id: '7', name: 'Vidar', x: 800, y: 180, color: 'bg-cyan-500', status: 'working', activity: '💻' },
  { id: '8', name: 'Modi', x: 920, y: 240, color: 'bg-orange-500', status: 'working', activity: '💻' },
];

// Pixel art style desk
const PixelDesk = () => (
  <div className="relative">
    {/* Desk surface */}
    <div className="flex">
      {/* Left leg */}
      <div className="w-2 h-6 bg-amber-900"></div>
      {/* Desk top */}
      <div className="w-12 h-3 bg-amber-800 border-t border-amber-700"></div>
      {/* Right leg */}
      <div className="w-2 h-6 bg-amber-900"></div>
    </div>
  </div>
);

// Pixel art style character
const PixelCharacter = ({ agent }: { agent: Agent }) => (
  <div className="relative">
    {/* Head */}
    <div className={`${agent.color} w-4 h-4 rounded-sm border border-gray-900`}></div>
    {/* Body */}
    <div className={`${agent.color} w-4 h-4 rounded-sm border border-gray-900 mt-0.5`}></div>
    {/* Arms */}
    <div className="flex gap-1 mt-0.5">
      <div className={`${agent.color} w-2 h-2 rounded-sm border border-gray-900`}></div>
      <div className={`${agent.color} w-2 h-2 rounded-sm border border-gray-900`}></div>
    </div>
  </div>
);

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
          <p className="text-gray-400">16-bit Norse Office — Isometric View</p>
        </div>

        {/* Legend */}
        <div className="px-8 py-3 bg-[#0f1318] border-b border-[#374151]">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Odin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">Loki</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-300">Thor</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span className="text-gray-300">Freya</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Heimdall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300">Sif</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <span className="text-gray-300">Vidar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-300">Modi</span>
            </div>
            <div className="ml-auto flex items-center gap-3 text-gray-400">
              <span>💼 Working: {workingCount}</span>
              <span>☕ Break: {breakCount}</span>
            </div>
          </div>
        </div>

        {/* Isometric Office Canvas */}
        <div className="flex-1 p-8 bg-gradient-to-b from-[#0a0e27] via-[#0f1318] to-[#141829] relative overflow-hidden">
          {/* Grid background */}
          <svg className="absolute inset-0 opacity-10" width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#444" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Office areas */}
          <div className="relative w-full h-full min-h-96">
            {/* Work Area Label */}
            <div className="absolute top-4 left-8 text-xs font-bold text-gray-500 uppercase">Work Stations</div>

            {/* Agents at desks - positioned isometrically */}
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${agent.x}px`,
                  top: `${agent.y}px`,
                }}
              >
                {/* Desk */}
                <div className="w-16 h-10 bg-gradient-to-b from-amber-800 to-amber-900 border-2 border-amber-700 rounded-sm shadow-lg flex items-end justify-center pb-1">
                  {/* Monitor */}
                  <div className="w-3 h-2.5 bg-blue-900 border border-blue-600 rounded-xs">
                    <div className="w-2 h-1.5 bg-blue-400 m-0.5 rounded-xs"></div>
                  </div>
                </div>

                {/* Character sprite */}
                <div className={`${agent.color} w-5 h-6 rounded-sm border border-gray-900 flex items-center justify-center text-xs font-bold text-white mt-1 shadow-md`}>
                  {agent.name.slice(0, 1)}
                </div>

                {/* Name label */}
                <div className="text-xs font-semibold text-gray-200 mt-1 whitespace-nowrap">
                  {agent.name}
                </div>

                {/* Status indicator */}
                <div className="text-xs mt-0.5">
                  {agent.status === 'working' ? '🔴' : '⚪'}
                </div>
              </div>
            ))}

            {/* Break Room Area */}
            <div className="absolute bottom-12 right-16 w-56 bg-[#141829]/50 border-2 border-[#374151] rounded-lg p-4">
              <div className="text-xs font-bold text-gray-400 mb-3">BREAK ROOM</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#1a1f3a] border border-[#374151] rounded p-2 text-center">
                  <div className="text-lg">☕</div>
                  <div className="text-xs text-gray-400 mt-1">Coffee</div>
                </div>
                <div className="bg-[#1a1f3a] border border-[#374151] rounded p-2 text-center">
                  <div className="text-lg">📰</div>
                  <div className="text-xs text-gray-400 mt-1">Reading</div>
                </div>
                <div className="bg-[#1a1f3a] border border-[#374151] rounded p-2 text-center">
                  <div className="text-lg">💬</div>
                  <div className="text-xs text-gray-400 mt-1">Lounge</div>
                </div>
              </div>
            </div>

            {/* Kitchen Area */}
            <div className="absolute top-32 right-12 w-32 bg-[#141829]/50 border-2 border-[#374151] rounded-lg p-3">
              <div className="text-xs font-bold text-gray-400 mb-2">KITCHEN</div>
              <div className="space-y-1 text-lg text-center">
                <div>🍳</div>
              </div>
            </div>

            {/* Conference Room */}
            <div className="absolute top-12 left-1/4 w-40 bg-[#141829]/50 border-2 border-[#374151] rounded-lg p-3">
              <div className="text-xs font-bold text-gray-400 mb-2">CONFERENCE</div>
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="w-4 h-3 bg-blue-900 border border-blue-600"></div>
                <div className="w-4 h-3 bg-blue-900 border border-blue-600"></div>
                <div className="w-4 h-3 bg-blue-900 border border-blue-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
