'use client';

import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  color: string;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  status: 'working' | 'break' | 'talking';
  activity: string;
}

const DESK_POSITIONS = [
  { x: 80, y: 120, name: 'Desk 1' },
  { x: 200, y: 180, name: 'Desk 2' },
  { x: 320, y: 140, name: 'Desk 3' },
  { x: 440, y: 200, name: 'Desk 4' },
  { x: 560, y: 160, name: 'Desk 5' },
  { x: 680, y: 220, name: 'Desk 6' },
  { x: 800, y: 180, name: 'Desk 7' },
  { x: 920, y: 240, name: 'Desk 8' },
];

const BREAK_ROOM_POSITIONS = [
  { x: 200, y: 400, activity: '☕' },
  { x: 300, y: 420, activity: '📰' },
  { x: 400, y: 410, activity: '💬' },
];

const initialAgents: Agent[] = [
  { id: '1', name: 'Odin', color: 'bg-blue-500', targetX: 80, targetY: 120, currentX: 80, currentY: 120, status: 'working', activity: '💻' },
  { id: '2', name: 'Loki', color: 'bg-purple-500', targetX: 200, targetY: 180, currentX: 200, currentY: 180, status: 'working', activity: '💻' },
  { id: '3', name: 'Thor', color: 'bg-red-500', targetX: 320, targetY: 140, currentX: 320, currentY: 140, status: 'working', activity: '💻' },
  { id: '4', name: 'Freya', color: 'bg-pink-500', targetX: 440, targetY: 200, currentX: 440, currentY: 200, status: 'working', activity: '💻' },
  { id: '5', name: 'Heimdall', color: 'bg-green-500', targetX: 560, targetY: 160, currentX: 560, currentY: 160, status: 'working', activity: '💻' },
  { id: '6', name: 'Sif', color: 'bg-yellow-500', targetX: 680, targetY: 220, currentX: 680, currentY: 220, status: 'working', activity: '💻' },
  { id: '7', name: 'Vidar', color: 'bg-cyan-500', targetX: 800, targetY: 180, currentX: 800, currentY: 180, status: 'working', activity: '💻' },
  { id: '8', name: 'Modi', color: 'bg-orange-500', targetX: 920, targetY: 240, currentX: 920, currentY: 240, status: 'working', activity: '💻' },
];

export default function OfficePage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [time, setTime] = useState(0);

  // Animate agents
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1);

      setAgents(prevAgents =>
        prevAgents.map((agent, idx) => {
          let newAgent = { ...agent };

          // Every 5 seconds, agents randomly decide what to do
          if (time % 100 === idx % 8) {
            const action = Math.random();

            if (action < 0.6) {
              // 60% chance: go back to own desk
              newAgent.targetX = DESK_POSITIONS[idx].x;
              newAgent.targetY = DESK_POSITIONS[idx].y;
              newAgent.status = 'working';
              newAgent.activity = '💻';
            } else if (action < 0.85) {
              // 25% chance: go to break room
              const breakPos = BREAK_ROOM_POSITIONS[Math.floor(Math.random() * BREAK_ROOM_POSITIONS.length)];
              newAgent.targetX = breakPos.x;
              newAgent.targetY = breakPos.y;
              newAgent.status = 'break';
              newAgent.activity = breakPos.activity;
            } else {
              // 15% chance: go talk to another agent
              const otherAgent = prevAgents[Math.floor(Math.random() * prevAgents.length)];
              newAgent.targetX = otherAgent.currentX + 20;
              newAgent.targetY = otherAgent.currentY + 20;
              newAgent.status = 'talking';
              newAgent.activity = '💬';
            }
          }

          // Smooth movement towards target
          const dx = newAgent.targetX - newAgent.currentX;
          const dy = newAgent.targetY - newAgent.currentY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const speed = 1.2;

          if (distance > speed) {
            newAgent.currentX += (dx / distance) * speed;
            newAgent.currentY += (dy / distance) * speed;
          } else {
            newAgent.currentX = newAgent.targetX;
            newAgent.currentY = newAgent.targetY;
          }

          return newAgent;
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [time]);

  const workingCount = agents.filter(a => a.status === 'working').length;
  const breakCount = agents.filter(a => a.status === 'break').length;
  const talkingCount = agents.filter(a => a.status === 'talking').length;

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#374151]">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="text-blue-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Office</h1>
          </div>
          <p className="text-gray-400">Animated 16-bit Norse Office — Watch agents move around</p>
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
            <div className="ml-auto flex items-center gap-4 text-gray-400">
              <span>💼 Working: {workingCount}</span>
              <span>☕ Break: {breakCount}</span>
              <span>💬 Talking: {talkingCount}</span>
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
          <div className="relative w-full h-full min-h-screen">
            {/* Work Area Label */}
            <div className="absolute top-4 left-8 text-xs font-bold text-gray-500 uppercase">Work Stations</div>

            {/* Desks */}
            {DESK_POSITIONS.map((desk, idx) => (
              <div
                key={`desk-${idx}`}
                className="absolute"
                style={{ left: `${desk.x}px`, top: `${desk.y}px` }}
              >
                <div className="w-16 h-10 bg-gradient-to-b from-amber-800 to-amber-900 border-2 border-amber-700 rounded-sm shadow-lg flex items-end justify-center pb-1">
                  <div className="w-3 h-2.5 bg-blue-900 border border-blue-600 rounded-xs">
                    <div className="w-2 h-1.5 bg-blue-400 m-0.5 rounded-xs"></div>
                  </div>
                </div>
              </div>
            ))}

            {/* Animated Agents */}
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="absolute transition-all duration-75 ease-out"
                style={{
                  left: `${agent.currentX}px`,
                  top: `${agent.currentY}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="flex flex-col items-center">
                  {/* Character sprite */}
                  <div className={`${agent.color} w-5 h-6 rounded-sm border border-gray-900 flex items-center justify-center text-xs font-bold text-white shadow-md`}>
                    {agent.name.slice(0, 1)}
                  </div>

                  {/* Activity indicator */}
                  <div className="text-xs mt-0.5">{agent.activity}</div>

                  {/* Name label */}
                  <div className="text-xs font-semibold text-gray-200 mt-0.5 whitespace-nowrap">
                    {agent.name}
                  </div>

                  {/* Status dot */}
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    agent.status === 'working' ? 'bg-red-500' :
                    agent.status === 'break' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
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
