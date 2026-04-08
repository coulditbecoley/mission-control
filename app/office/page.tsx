'use client';

import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  status: 'working' | 'break' | 'talking';
  activity: string;
}

const DESK_POSITIONS = [
  { x: 60, y: 100 },
  { x: 180, y: 100 },
  { x: 300, y: 100 },
  { x: 420, y: 100 },
  { x: 540, y: 100 },
  { x: 660, y: 100 },
  { x: 780, y: 100 },
  { x: 900, y: 100 },
];

const BREAK_ROOM_POSITIONS = [
  { x: 150, y: 280, activity: '☕' },
  { x: 350, y: 280, activity: '📰' },
  { x: 550, y: 280, activity: '💬' },
];

const initialAgents: Agent[] = [
  { id: '1', name: 'Odin', targetX: 60, targetY: 100, currentX: 60, currentY: 100, status: 'working', activity: '💻' },
  { id: '2', name: 'Loki', targetX: 180, targetY: 100, currentX: 180, currentY: 100, status: 'working', activity: '💻' },
  { id: '3', name: 'Thor', targetX: 300, targetY: 100, currentX: 300, currentY: 100, status: 'working', activity: '💻' },
  { id: '4', name: 'Freya', targetX: 420, targetY: 100, currentX: 420, currentY: 100, status: 'working', activity: '💻' },
  { id: '5', name: 'Heimdall', targetX: 540, targetY: 100, currentX: 540, currentY: 100, status: 'working', activity: '💻' },
  { id: '6', name: 'Sif', targetX: 660, targetY: 100, currentX: 660, currentY: 100, status: 'working', activity: '💻' },
  { id: '7', name: 'Vidar', targetX: 780, targetY: 100, currentX: 780, currentY: 100, status: 'working', activity: '💻' },
  { id: '8', name: 'Modi', targetX: 900, targetY: 100, currentX: 900, currentY: 100, status: 'working', activity: '💻' },
];

// 8-bit character components - each unique
const OdinSprite = () => (
  <div className="w-8 h-10 relative">
    {/* Head - brown hair */}
    <div className="absolute w-6 h-3 bg-yellow-700 top-0 left-1"></div>
    {/* Face - skin tone */}
    <div className="absolute w-4 h-3 bg-yellow-100 top-3 left-2"></div>
    {/* Eyes - white */}
    <div className="absolute w-1 h-1 bg-white top-4 left-2"></div>
    <div className="absolute w-1 h-1 bg-white top-4 left-4"></div>
    {/* Body - blue tunic */}
    <div className="absolute w-6 h-4 bg-blue-600 top-6 left-1"></div>
    {/* Legs - brown */}
    <div className="absolute w-2 h-2 bg-yellow-800 top-10 left-1"></div>
    <div className="absolute w-2 h-2 bg-yellow-800 top-10 left-4"></div>
  </div>
);

const LokiSprite = () => (
  <div className="w-8 h-10 relative">
    {/* Head - green hair */}
    <div className="absolute w-6 h-3 bg-green-700 top-0 left-1"></div>
    {/* Face */}
    <div className="absolute w-4 h-3 bg-yellow-100 top-3 left-2"></div>
    {/* Eyes - red */}
    <div className="absolute w-1 h-1 bg-red-500 top-4 left-2"></div>
    <div className="absolute w-1 h-1 bg-red-500 top-4 left-4"></div>
    {/* Body - purple tunic */}
    <div className="absolute w-6 h-4 bg-purple-600 top-6 left-1"></div>
    {/* Legs */}
    <div className="absolute w-2 h-2 bg-gray-700 top-10 left-1"></div>
    <div className="absolute w-2 h-2 bg-gray-700 top-10 left-4"></div>
  </div>
);

const ThorSprite = () => (
  <div className="w-8 h-10 relative">
    {/* Head - blonde hair */}
    <div className="absolute w-6 h-3 bg-yellow-400 top-0 left-1"></div>
    {/* Face */}
    <div className="absolute w-4 h-3 bg-yellow-100 top-3 left-2"></div>
    {/* Eyes - blue */}
    <div className="absolute w-1 h-1 bg-blue-400 top-4 left-2"></div>
    <div className="absolute w-1 h-1 bg-blue-400 top-4 left-4"></div>
    {/* Body - red tunic */}
    <div className="absolute w-6 h-4 bg-red-600 top-6 left-1"></div>
    {/* Legs */}
    <div className="absolute w-2 h-2 bg-red-900 top-10 left-1"></div>
    <div className="absolute w-2 h-2 bg-red-900 top-10 left-4"></div>
  </div>
);

const FreyaSprite = () => (
  <div className="w-8 h-10 relative">
    {/* Head - golden hair */}
    <div className="absolute w-6 h-3 bg-yellow-300 top-0 left-1"></div>
    {/* Face */}
    <div className="absolute w-4 h-3 bg-pink-100 top-3 left-2"></div>
    {/* Eyes - green */}
    <div className="absolute w-1 h-1 bg-green-400 top-4 left-2"></div>
    <div className="absolute w-1 h-1 bg-green-400 top-4 left-4"></div>
    {/* Body - pink tunic */}
    <div className="absolute w-6 h-4 bg-pink-500 top-6 left-1"></div>
    {/* Legs */}
    <div className="absolute w-2 h-2 bg-pink-800 top-10 left-1"></div>
    <div className="absolute w-2 h-2 bg-pink-800 top-10 left-4"></div>
  </div>
);

const HeimdallSprite = () => (
  <div className="w-8 h-10 relative">
    {/* Head - white hair */}
    <div className="absolute w-6 h-3 bg-gray-100 top-0 left-1"></div>
    {/* Face */}
    <div className="absolute w-4 h-3 bg-yellow-100 top-3 left-2"></div>
    {/* Eyes - gold */}
    <div className="absolute w-1 h-1 bg-yellow-400 top-4 left-2"></div>
    <div className="absolute w-1 h-1 bg-yellow-400 top-4 left-4"></div>
    {/* Body - green tunic */}
    <div className="absolute w-6 h-4 bg-green-600 top-6 left-1"></div>
    {/* Legs */}
    <div className="absolute w-2 h-2 bg-green-900 top-10 left-1"></div>
    <div className="absolute w-2 h-2 bg-green-900 top-10 left-4"></div>
  </div>
);

const SifSprite = () => (
  <div className="w-8 h-10 relative">
    {/* Head - silver/white hair */}
    <div className="absolute w-6 h-3 bg-gray-200 top-0 left-1"></div>
    {/* Face */}
    <div className="absolute w-4 h-3 bg-pink-100 top-3 left-2"></div>
    {/* Eyes - purple */}
    <div className="absolute w-1 h-1 bg-purple-400 top-4 left-2"></div>
    <div className="absolute w-1 h-1 bg-purple-400 top-4 left-4"></div>
    {/* Body - teal tunic */}
    <div className="absolute w-6 h-4 bg-cyan-600 top-6 left-1"></div>
    {/* Legs */}
    <div className="absolute w-2 h-2 bg-cyan-800 top-10 left-1"></div>
    <div className="absolute w-2 h-2 bg-cyan-800 top-10 left-4"></div>
  </div>
);

const VidarSprite = () => (
  <div className="w-8 h-10 relative">
    {/* Head - dark hair */}
    <div className="absolute w-6 h-3 bg-gray-800 top-0 left-1"></div>
    {/* Face */}
    <div className="absolute w-4 h-3 bg-yellow-100 top-3 left-2"></div>
    {/* Eyes - brown */}
    <div className="absolute w-1 h-1 bg-yellow-800 top-4 left-2"></div>
    <div className="absolute w-1 h-1 bg-yellow-800 top-4 left-4"></div>
    {/* Body - orange tunic */}
    <div className="absolute w-6 h-4 bg-orange-500 top-6 left-1"></div>
    {/* Legs */}
    <div className="absolute w-2 h-2 bg-orange-800 top-10 left-1"></div>
    <div className="absolute w-2 h-2 bg-orange-800 top-10 left-4"></div>
  </div>
);

const ModiSprite = () => (
  <div className="w-8 h-10 relative">
    {/* Head - black hair */}
    <div className="absolute w-6 h-3 bg-gray-900 top-0 left-1"></div>
    {/* Face */}
    <div className="absolute w-4 h-3 bg-yellow-100 top-3 left-2"></div>
    {/* Eyes - teal */}
    <div className="absolute w-1 h-1 bg-cyan-400 top-4 left-2"></div>
    <div className="absolute w-1 h-1 bg-cyan-400 top-4 left-4"></div>
    {/* Body - maroon tunic */}
    <div className="absolute w-6 h-4 bg-red-900 top-6 left-1"></div>
    {/* Legs */}
    <div className="absolute w-2 h-2 bg-gray-900 top-10 left-1"></div>
    <div className="absolute w-2 h-2 bg-gray-900 top-10 left-4"></div>
  </div>
);

const spriteMap: { [key: string]: React.ComponentType } = {
  '1': OdinSprite,
  '2': LokiSprite,
  '3': ThorSprite,
  '4': FreyaSprite,
  '5': HeimdallSprite,
  '6': SifSprite,
  '7': VidarSprite,
  '8': ModiSprite,
};

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
              newAgent.targetX = otherAgent.currentX + 15;
              newAgent.targetY = otherAgent.currentY + 15;
              newAgent.status = 'talking';
              newAgent.activity = '💬';
            }
          }

          // Smooth movement towards target
          const dx = newAgent.targetX - newAgent.currentX;
          const dy = newAgent.targetY - newAgent.currentY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const speed = 1;

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
    <div className="flex-1 overflow-hidden bg-[#0a0e27] flex flex-col">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-[#374151] flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="text-blue-400" size={24} />
            <h1 className="text-2xl font-bold text-white">Office</h1>
          </div>
          <p className="text-xs text-gray-400">8-bit Norse Office — Animated workspace</p>
        </div>

        {/* Legend */}
        <div className="px-6 py-2 bg-[#0f1318] border-b border-[#374151] flex-shrink-0 overflow-x-auto">
          <div className="flex items-center gap-4 text-xs whitespace-nowrap">
            <span className="text-gray-400">👥 Agents:</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Odin</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">Loki</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-300">Thor</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span className="text-gray-300">Freya</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Heimdall</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300">Sif</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <span className="text-gray-300">Vidar</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-300">Modi</span>
            </div>
            <div className="ml-auto flex items-center gap-3 text-gray-400">
              <span>💼 {workingCount}</span>
              <span>☕ {breakCount}</span>
              <span>💬 {talkingCount}</span>
            </div>
          </div>
        </div>

        {/* Office Canvas */}
        <div className="flex-1 p-6 bg-gradient-to-b from-[#0a0e27] to-[#0f1318] relative overflow-hidden">
          <div className="relative w-full h-full">
            {/* Work Stations */}
            <div className="text-xs font-bold text-gray-600 mb-2">WORK STATIONS</div>

            {/* Desks in a single row */}
            {DESK_POSITIONS.map((desk, idx) => (
              <div
                key={`desk-${idx}`}
                className="absolute"
                style={{ left: `${desk.x}px`, top: `${desk.y}px` }}
              >
                <div className="w-12 h-8 bg-gradient-to-b from-amber-800 to-amber-900 border-2 border-amber-700 rounded-sm shadow-lg flex items-end justify-center pb-1">
                  <div className="w-2 h-2 bg-blue-900 border border-blue-600 rounded-xs">
                    <div className="w-1 h-1 bg-blue-400 m-0.5 rounded-xs"></div>
                  </div>
                </div>
              </div>
            ))}

            {/* Animated Agents */}
            {agents.map((agent) => {
              const Sprite = spriteMap[agent.id];
              return (
                <div
                  key={agent.id}
                  className="absolute transition-all duration-75 ease-out"
                  style={{
                    left: `${agent.currentX}px`,
                    top: `${agent.currentY + 50}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    {/* 8-bit Sprite */}
                    <Sprite />

                    {/* Activity emoji */}
                    <div className="text-xs leading-none">{agent.activity}</div>

                    {/* Status dot */}
                    <div className={`w-1 h-1 rounded-full ${
                      agent.status === 'working' ? 'bg-red-500' :
                      agent.status === 'break' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                  </div>
                </div>
              );
            })}

            {/* Break Room */}
            <div className="absolute bottom-4 left-6 w-48 bg-[#141829]/60 border-2 border-[#374151] rounded-lg p-3">
              <div className="text-xs font-bold text-gray-500 mb-2">BREAK ROOM</div>
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-[#1a1f3a] border border-[#374151] rounded p-1 text-center">
                  <div className="text-sm">☕</div>
                </div>
                <div className="bg-[#1a1f3a] border border-[#374151] rounded p-1 text-center">
                  <div className="text-sm">📰</div>
                </div>
                <div className="bg-[#1a1f3a] border border-[#374151] rounded p-1 text-center">
                  <div className="text-sm">💬</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
