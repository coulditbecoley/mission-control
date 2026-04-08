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
  { x: 100, y: 180 },
  { x: 280, y: 180 },
  { x: 460, y: 180 },
  { x: 640, y: 180 },
  { x: 820, y: 180 },
  { x: 1000, y: 180 },
  { x: 1180, y: 180 },
  { x: 1360, y: 180 },
];

const BREAK_ROOM_POSITIONS = [
  { x: 300, y: 420, activity: '☕' },
  { x: 700, y: 420, activity: '📰' },
  { x: 1100, y: 420, activity: '💬' },
];

const initialAgents: Agent[] = [
  { id: '1', name: 'Odin', targetX: 100, targetY: 180, currentX: 100, currentY: 180, status: 'working', activity: '💻' },
  { id: '2', name: 'Loki', targetX: 280, targetY: 180, currentX: 280, currentY: 180, status: 'working', activity: '💻' },
  { id: '3', name: 'Thor', targetX: 460, targetY: 180, currentX: 460, currentY: 180, status: 'working', activity: '💻' },
  { id: '4', name: 'Freya', targetX: 640, targetY: 180, currentX: 640, currentY: 180, status: 'working', activity: '💻' },
  { id: '5', name: 'Heimdall', targetX: 820, targetY: 180, currentX: 820, currentY: 180, status: 'working', activity: '💻' },
  { id: '6', name: 'Sif', targetX: 1000, targetY: 180, currentX: 1000, currentY: 180, status: 'working', activity: '💻' },
  { id: '7', name: 'Vidar', targetX: 1180, targetY: 180, currentX: 1180, currentY: 180, status: 'working', activity: '💻' },
  { id: '8', name: 'Modi', targetX: 1360, targetY: 180, currentX: 1360, currentY: 180, status: 'working', activity: '💻' },
];

// Detailed 8-bit pixel art characters
const OdinSprite = () => (
  <div className="w-10 h-14 relative pixel-art">
    {/* Head - brown with beard */}
    <div className="absolute w-6 h-4 bg-yellow-700 top-0 left-2 border border-yellow-800"></div>
    {/* Face highlight */}
    <div className="absolute w-4 h-2 bg-yellow-100 top-1 left-3"></div>
    {/* Eyes - blue */}
    <div className="absolute w-1 h-1 bg-blue-600 top-2 left-3"></div>
    <div className="absolute w-1 h-1 bg-blue-600 top-2 left-5"></div>
    {/* Beard */}
    <div className="absolute w-2 h-1 bg-yellow-800 top-3 left-3"></div>
    {/* Body - blue armor */}
    <div className="absolute w-6 h-5 bg-blue-600 top-5 left-2 border-l-2 border-r-2 border-blue-800"></div>
    {/* Arms */}
    <div className="absolute w-2 h-3 bg-yellow-100 top-6 left-1"></div>
    <div className="absolute w-2 h-3 bg-yellow-100 top-6 left-7"></div>
    {/* Legs - brown */}
    <div className="absolute w-2 h-3 bg-yellow-900 top-10 left-2"></div>
    <div className="absolute w-2 h-3 bg-yellow-900 top-10 left-6"></div>
  </div>
);

const LokiSprite = () => (
  <div className="w-10 h-14 relative pixel-art">
    {/* Head - green spiky hair */}
    <div className="absolute w-6 h-4 bg-green-700 top-0 left-2 border border-green-800"></div>
    {/* Spikes */}
    <div className="absolute w-1 h-1 bg-green-600 top-0 left-3"></div>
    <div className="absolute w-1 h-1 bg-green-600 top-0 left-5"></div>
    {/* Face */}
    <div className="absolute w-4 h-2 bg-yellow-100 top-2 left-3"></div>
    {/* Eyes - red evil */}
    <div className="absolute w-1 h-1 bg-red-600 top-2 left-3"></div>
    <div className="absolute w-1 h-1 bg-red-600 top-2 left-5"></div>
    {/* Mouth - evil grin */}
    <div className="absolute w-2 h-0.5 bg-red-700 top-4 left-3"></div>
    {/* Body - purple robes */}
    <div className="absolute w-6 h-5 bg-purple-600 top-5 left-2 border-l-2 border-r-2 border-purple-800"></div>
    {/* Arms */}
    <div className="absolute w-2 h-3 bg-yellow-100 top-6 left-1"></div>
    <div className="absolute w-2 h-3 bg-yellow-100 top-6 left-7"></div>
    {/* Legs */}
    <div className="absolute w-2 h-3 bg-purple-900 top-10 left-2"></div>
    <div className="absolute w-2 h-3 bg-purple-900 top-10 left-6"></div>
  </div>
);

const ThorSprite = () => (
  <div className="w-10 h-14 relative pixel-art">
    {/* Head - blonde spiky */}
    <div className="absolute w-6 h-4 bg-yellow-400 top-0 left-2 border border-yellow-500"></div>
    {/* Spikes */}
    <div className="absolute w-1 h-2 bg-yellow-300 top-0 left-3"></div>
    <div className="absolute w-1 h-2 bg-yellow-300 top-0 left-5"></div>
    {/* Face */}
    <div className="absolute w-4 h-2 bg-yellow-100 top-2 left-3"></div>
    {/* Eyes - blue fierce */}
    <div className="absolute w-1 h-1 bg-blue-500 top-2 left-3"></div>
    <div className="absolute w-1 h-1 bg-blue-500 top-2 left-5"></div>
    {/* Beard stubble */}
    <div className="absolute w-3 h-1 bg-yellow-600 top-4 left-3"></div>
    {/* Body - red armor */}
    <div className="absolute w-6 h-5 bg-red-600 top-5 left-2 border-l-2 border-r-2 border-red-800"></div>
    {/* Arms - muscular */}
    <div className="absolute w-3 h-3 bg-yellow-100 top-6 left-0"></div>
    <div className="absolute w-3 h-3 bg-yellow-100 top-6 left-7"></div>
    {/* Legs */}
    <div className="absolute w-2 h-3 bg-red-900 top-10 left-2"></div>
    <div className="absolute w-2 h-3 bg-red-900 top-10 left-6"></div>
  </div>
);

const FreyaSprite = () => (
  <div className="w-10 h-14 relative pixel-art">
    {/* Head - golden hair with crown */}
    <div className="absolute w-6 h-4 bg-yellow-300 top-0 left-2 border border-yellow-400"></div>
    {/* Crown */}
    <div className="absolute w-1 h-1 bg-yellow-500 top-0 left-3"></div>
    <div className="absolute w-1 h-1 bg-yellow-500 top-0 left-5"></div>
    {/* Face */}
    <div className="absolute w-4 h-2 bg-pink-100 top-2 left-3"></div>
    {/* Eyes - green */}
    <div className="absolute w-1 h-1 bg-green-500 top-2 left-3"></div>
    <div className="absolute w-1 h-1 bg-green-500 top-2 left-5"></div>
    {/* Smile */}
    <div className="absolute w-2 h-0.5 bg-pink-400 top-4 left-3"></div>
    {/* Body - golden dress */}
    <div className="absolute w-6 h-5 bg-yellow-500 top-5 left-2 border-l-2 border-r-2 border-yellow-600"></div>
    {/* Arms */}
    <div className="absolute w-2 h-3 bg-pink-100 top-6 left-1"></div>
    <div className="absolute w-2 h-3 bg-pink-100 top-6 left-7"></div>
    {/* Legs */}
    <div className="absolute w-2 h-3 bg-yellow-700 top-10 left-2"></div>
    <div className="absolute w-2 h-3 bg-yellow-700 top-10 left-6"></div>
  </div>
);

const HeimdallSprite = () => (
  <div className="w-10 h-14 relative pixel-art">
    {/* Head - white hair */}
    <div className="absolute w-6 h-4 bg-gray-200 top-0 left-2 border border-gray-300"></div>
    {/* Face */}
    <div className="absolute w-4 h-2 bg-yellow-100 top-2 left-3"></div>
    {/* Eyes - gold */}
    <div className="absolute w-1 h-1 bg-yellow-500 top-2 left-3"></div>
    <div className="absolute w-1 h-1 bg-yellow-500 top-2 left-5"></div>
    {/* Stern mouth */}
    <div className="absolute w-2 h-0.5 bg-gray-500 top-4 left-3"></div>
    {/* Body - green armor */}
    <div className="absolute w-6 h-5 bg-green-600 top-5 left-2 border-l-2 border-r-2 border-green-800"></div>
    {/* Arms */}
    <div className="absolute w-2 h-3 bg-yellow-100 top-6 left-1"></div>
    <div className="absolute w-2 h-3 bg-yellow-100 top-6 left-7"></div>
    {/* Legs */}
    <div className="absolute w-2 h-3 bg-green-900 top-10 left-2"></div>
    <div className="absolute w-2 h-3 bg-green-900 top-10 left-6"></div>
  </div>
);

const SifSprite = () => (
  <div className="w-10 h-14 relative pixel-art">
    {/* Head - silver hair long */}
    <div className="absolute w-6 h-4 bg-gray-300 top-0 left-2 border border-gray-400"></div>
    {/* Long hair accent */}
    <div className="absolute w-1 h-2 bg-gray-300 top-3 left-1"></div>
    <div className="absolute w-1 h-2 bg-gray-300 top-3 left-8"></div>
    {/* Face */}
    <div className="absolute w-4 h-2 bg-pink-100 top-2 left-3"></div>
    {/* Eyes - purple */}
    <div className="absolute w-1 h-1 bg-purple-500 top-2 left-3"></div>
    <div className="absolute w-1 h-1 bg-purple-500 top-2 left-5"></div>
    {/* Body - cyan dress */}
    <div className="absolute w-6 h-5 bg-cyan-600 top-5 left-2 border-l-2 border-r-2 border-cyan-800"></div>
    {/* Arms */}
    <div className="absolute w-2 h-3 bg-pink-100 top-6 left-1"></div>
    <div className="absolute w-2 h-3 bg-pink-100 top-6 left-7"></div>
    {/* Legs */}
    <div className="absolute w-2 h-3 bg-cyan-800 top-10 left-2"></div>
    <div className="absolute w-2 h-3 bg-cyan-800 top-10 left-6"></div>
  </div>
);

const VidarSprite = () => (
  <div className="w-10 h-14 relative pixel-art">
    {/* Head - dark hair */}
    <div className="absolute w-6 h-4 bg-gray-800 top-0 left-2 border border-gray-900"></div>
    {/* Face */}
    <div className="absolute w-4 h-2 bg-yellow-100 top-2 left-3"></div>
    {/* Eyes - brown serious */}
    <div className="absolute w-1 h-1 bg-yellow-800 top-2 left-3"></div>
    <div className="absolute w-1 h-1 bg-yellow-800 top-2 left-5"></div>
    {/* Scar */}
    <div className="absolute w-2 h-0.5 bg-red-600 top-3 left-4"></div>
    {/* Body - orange tunic */}
    <div className="absolute w-6 h-5 bg-orange-600 top-5 left-2 border-l-2 border-r-2 border-orange-800"></div>
    {/* Arms */}
    <div className="absolute w-2 h-3 bg-yellow-100 top-6 left-1"></div>
    <div className="absolute w-2 h-3 bg-yellow-100 top-6 left-7"></div>
    {/* Legs */}
    <div className="absolute w-2 h-3 bg-orange-900 top-10 left-2"></div>
    <div className="absolute w-2 h-3 bg-orange-900 top-10 left-6"></div>
  </div>
);

const ModiSprite = () => (
  <div className="w-10 h-14 relative pixel-art">
    {/* Head - black hair */}
    <div className="absolute w-6 h-4 bg-gray-950 top-0 left-2 border border-black"></div>
    {/* Face */}
    <div className="absolute w-4 h-2 bg-yellow-100 top-2 left-3"></div>
    {/* Eyes - teal intense */}
    <div className="absolute w-1 h-1 bg-cyan-400 top-2 left-3"></div>
    <div className="absolute w-1 h-1 bg-cyan-400 top-2 left-5"></div>
    {/* Fierce brow */}
    <div className="absolute w-3 h-0.5 bg-gray-700 top-1 left-3"></div>
    {/* Body - maroon armor */}
    <div className="absolute w-6 h-5 bg-red-900 top-5 left-2 border-l-2 border-r-2 border-red-950"></div>
    {/* Arms - muscular */}
    <div className="absolute w-2 h-3 bg-yellow-100 top-6 left-1"></div>
    <div className="absolute w-2 h-3 bg-yellow-100 top-6 left-7"></div>
    {/* Legs */}
    <div className="absolute w-2 h-3 bg-gray-950 top-10 left-2"></div>
    <div className="absolute w-2 h-3 bg-gray-950 top-10 left-6"></div>
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

// Desk with monitor and PC tower
const Desk = () => (
  <div className="relative w-16 h-14">
    {/* Desk surface */}
    <div className="absolute bottom-0 w-16 h-6 bg-amber-900 border-4 border-amber-800 rounded-sm shadow-lg"></div>
    {/* Left desk leg */}
    <div className="absolute bottom-0 left-1 w-1.5 h-8 bg-amber-950"></div>
    {/* Right desk leg */}
    <div className="absolute bottom-0 right-1 w-1.5 h-8 bg-amber-950"></div>
    
    {/* PC Tower - left side */}
    <div className="absolute bottom-6 left-0 w-3 h-5 bg-gray-700 border border-gray-600 rounded-sm">
      <div className="absolute top-1 left-0.5 w-2 h-0.5 bg-green-500"></div>
      <div className="absolute top-3 left-0.5 w-2 h-0.5 bg-orange-500"></div>
    </div>
    
    {/* Monitor - center */}
    <div className="absolute bottom-6 left-3.5 w-5 h-4 border-4 border-gray-600 bg-blue-950 rounded-sm">
      {/* Screen */}
      <div className="w-4 h-3 bg-gradient-to-b from-blue-900 to-blue-800 m-0.5 rounded-xs"></div>
      {/* Scan lines */}
      <div className="absolute w-4 h-0.5 bg-blue-600 opacity-20 top-1 left-0.5"></div>
      <div className="absolute w-4 h-0.5 bg-blue-600 opacity-20 top-2 left-0.5"></div>
    </div>
    
    {/* Monitor stand */}
    <div className="absolute bottom-6 left-3.5 w-0.5 h-1 bg-gray-600"></div>
  </div>
);

export default function OfficePage() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1);

      setAgents(prevAgents =>
        prevAgents.map((agent, idx) => {
          let newAgent = { ...agent };

          if (time % 100 === idx % 8) {
            const action = Math.random();
            if (action < 0.6) {
              newAgent.targetX = DESK_POSITIONS[idx].x;
              newAgent.targetY = DESK_POSITIONS[idx].y;
              newAgent.status = 'working';
              newAgent.activity = '💻';
            } else if (action < 0.85) {
              const breakPos = BREAK_ROOM_POSITIONS[Math.floor(Math.random() * BREAK_ROOM_POSITIONS.length)];
              newAgent.targetX = breakPos.x;
              newAgent.targetY = breakPos.y;
              newAgent.status = 'break';
              newAgent.activity = breakPos.activity;
            } else {
              const otherAgent = prevAgents[Math.floor(Math.random() * prevAgents.length)];
              newAgent.targetX = otherAgent.currentX + 15;
              newAgent.targetY = otherAgent.currentY + 15;
              newAgent.status = 'talking';
              newAgent.activity = '💬';
            }
          }

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
          <p className="text-xs text-gray-400">1980s style 8-bit workspace</p>
        </div>

        {/* Legend */}
        <div className="px-6 py-2 bg-[#0f1318] border-b border-[#374151] flex-shrink-0 overflow-x-auto">
          <div className="flex items-center gap-4 text-xs whitespace-nowrap">
            <div className="flex items-center gap-3 text-gray-400">
              <span>💼 {workingCount}</span>
              <span>☕ {breakCount}</span>
              <span>💬 {talkingCount}</span>
            </div>
          </div>
        </div>

        {/* Office Canvas with herringbone wood floor */}
        <div className="flex-1 p-8 bg-auto overflow-auto" style={{
          backgroundImage: `
            linear-gradient(90deg, #2a2a2a 0%, #2a2a2a 2%, #3a3a3a 2%, #3a3a3a 4%, #2a2a2a 4%, #2a2a2a 6%, #3a3a3a 6%, #3a3a3a 8%, #2a2a2a 8%, #2a2a2a 10%, #4a4a4a 10%, #4a4a4a 12%, #3a3a3a 12%, #3a3a3a 14%, #4a4a4a 14%, #4a4a4a 16%, #3a3a3a 16%, #3a3a3a 18%, #2a2a2a 18%, #2a2a2a 20%),
            linear-gradient(90deg, #4a4a4a 0%, #4a4a4a 2%, #3a3a3a 2%, #3a3a3a 4%, #4a4a4a 4%, #4a4a4a 6%, #3a3a3a 6%, #3a3a3a 8%, #4a4a4a 8%, #4a4a4a 10%, #2a2a2a 10%, #2a2a2a 12%, #3a3a3a 12%, #3a3a3a 14%, #2a2a2a 14%, #2a2a2a 16%, #3a3a3a 16%, #3a3a3a 18%, #4a4a4a 18%, #4a4a4a 20%)
          `,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
          backgroundColor: '#323232'
        }}>
          <div className="relative w-full min-w-max" style={{ minHeight: '600px' }}>
            {/* Work Stations Label */}
            <div className="text-xs font-bold text-gray-300 mb-8">WORK STATIONS</div>

            {/* Desks */}
            {DESK_POSITIONS.map((desk, idx) => (
              <div
                key={`desk-${idx}`}
                className="absolute"
                style={{ left: `${desk.x}px`, top: `${desk.y}px` }}
              >
                <Desk />
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
                  <div className="flex flex-col items-center gap-1">
                    {/* Activity emoji - ABOVE character */}
                    <div className="text-xl leading-none h-6 flex items-center justify-center">{agent.activity}</div>

                    {/* Status dot */}
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      agent.status === 'working' ? 'bg-red-500' :
                      agent.status === 'break' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>

                    {/* 8-bit Sprite */}
                    <Sprite />

                    {/* Name label below */}
                    <div className="text-xs font-semibold text-gray-200 whitespace-nowrap">
                      {agent.name}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Break Room */}
            <div className="absolute bottom-12 left-12 w-56 bg-[#141829]/70 border-4 border-[#4b5563] rounded-lg p-4 shadow-lg">
              <div className="text-xs font-bold text-gray-300 mb-3 uppercase">Break Room</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#1a1f3a] border-2 border-[#374151] rounded p-2 text-center">
                  <div className="text-2xl">☕</div>
                  <div className="text-xs text-gray-400 mt-1">Coffee</div>
                </div>
                <div className="bg-[#1a1f3a] border-2 border-[#374151] rounded p-2 text-center">
                  <div className="text-2xl">📰</div>
                  <div className="text-xs text-gray-400 mt-1">Reading</div>
                </div>
                <div className="bg-[#1a1f3a] border-2 border-[#374151] rounded p-2 text-center">
                  <div className="text-2xl">💬</div>
                  <div className="text-xs text-gray-400 mt-1">Lounge</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
