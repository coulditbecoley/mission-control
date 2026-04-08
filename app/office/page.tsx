'use client';

import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  status: 'working' | 'idle' | 'talking';
  x: number;
  y: number;
  idleActivity: 'coffee' | 'newspaper' | 'both';
  taskName?: string;
}

const AGENT_NAMES = ['Odin', 'Loki', 'Thor', 'Freya', 'Heimdall', 'Sif', 'Vidar', 'Modi'];

const DESK_POSITIONS = [
  { x: 100, y: 150 },
  { x: 300, y: 150 },
  { x: 500, y: 150 },
  { x: 700, y: 150 },
];

const BREAK_ROOM_POSITIONS = [
  { x: 150, y: 450 },
  { x: 400, y: 450 },
  { x: 650, y: 450 },
  { x: 900, y: 450 },
];

export default function OfficePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [time, setTime] = useState(0);

  // Initialize agents
  useEffect(() => {
    const initialAgents: Agent[] = AGENT_NAMES.map((name, idx) => ({
      id: `agent-${idx}`,
      name,
      status: Math.random() > 0.6 ? 'working' : 'idle',
      x: Math.random() > 0.5 
        ? DESK_POSITIONS[idx % DESK_POSITIONS.length].x 
        : BREAK_ROOM_POSITIONS[idx % BREAK_ROOM_POSITIONS.length].x,
      y: Math.random() > 0.5 
        ? DESK_POSITIONS[idx % DESK_POSITIONS.length].y 
        : BREAK_ROOM_POSITIONS[idx % BREAK_ROOM_POSITIONS.length].y,
      idleActivity: ['coffee', 'newspaper', 'both'][Math.floor(Math.random() * 3)] as 'coffee' | 'newspaper' | 'both',
      taskName: `Task ${Math.floor(Math.random() * 10)}`,
    }));
    setAgents(initialAgents);
  }, []);

  // Animate agents
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 1);

      setAgents((prevAgents) =>
        prevAgents.map((agent) => {
          // 10% chance to change status every second
          let newStatus = agent.status;
          if (Math.random() < 0.1) {
            newStatus = Math.random() > 0.5 ? 'working' : 'idle';
          }

          // Smoothly move towards desk or break room
          let targetX = agent.x;
          let targetY = agent.y;

          if (newStatus === 'working') {
            const desk = DESK_POSITIONS[Math.floor(Math.random() * DESK_POSITIONS.length)];
            targetX = desk.x + (Math.sin(agent.id.charCodeAt(6) + time * 0.02) * 10);
            targetY = desk.y;
          } else {
            const breakPos = BREAK_ROOM_POSITIONS[Math.floor(Math.random() * BREAK_ROOM_POSITIONS.length)];
            targetX = breakPos.x + (Math.sin(agent.id.charCodeAt(6) + time * 0.01) * 20);
            targetY = breakPos.y + (Math.cos(agent.id.charCodeAt(7) + time * 0.015) * 15);
          }

          // Smooth movement towards target
          const dx = targetX - agent.x;
          const dy = targetY - agent.y;
          const speed = 1.5;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const newX = distance > speed 
            ? agent.x + (dx / distance) * speed 
            : targetX;
          const newY = distance > speed 
            ? agent.y + (dy / distance) * speed 
            : targetY;

          return {
            ...agent,
            status: newStatus,
            x: newX,
            y: newY,
            idleActivity: ['coffee', 'newspaper', 'both'][Math.floor(Math.random() * 3)] as 'coffee' | 'newspaper' | 'both',
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [time]);

  const PixelAgent = ({ agent }: { agent: Agent }) => {
    const initials = agent.name.slice(0, 2).toUpperCase();
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-red-500',
      'bg-cyan-500',
      'bg-orange-500',
    ];
    const colorIdx = AGENT_NAMES.indexOf(agent.name);
    const color = colors[colorIdx % colors.length];

    return (
      <div
        className="absolute transition-all"
        style={{
          left: `${agent.x}px`,
          top: `${agent.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* 16-bit style character */}
        <div className="flex flex-col items-center">
          <div className={`${color} w-8 h-8 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white`}>
            {initials}
          </div>
          {/* Activity indicator */}
          <div className="mt-1 text-xs text-center">
            {agent.status === 'working' ? (
              <div className="bg-green-900/40 text-green-300 px-1 rounded text-xs">💻</div>
            ) : agent.idleActivity === 'coffee' ? (
              <div className="bg-yellow-900/40 text-yellow-300 px-1 rounded text-xs">☕</div>
            ) : agent.idleActivity === 'newspaper' ? (
              <div className="bg-blue-900/40 text-blue-300 px-1 rounded text-xs">📰</div>
            ) : (
              <div className="bg-purple-900/40 text-purple-300 px-1 rounded text-xs">☕📰</div>
            )}
          </div>
          <div className="text-xs text-white mt-1 font-semibold">{agent.name}</div>
        </div>
      </div>
    );
  };

  const Desk = ({ x, y }: { x: number; y: number }) => (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="w-20 h-12 bg-amber-900 border-2 border-amber-700 rounded flex items-center justify-center">
        <div className="w-4 h-6 bg-blue-900 border border-blue-700 rounded-sm">
          <div className="w-3 h-2 bg-blue-400 m-0.5 rounded-xs"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-hidden bg-[#0a0e27]">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#374151]">
          <div className="flex items-center gap-3">
            <Building2 className="text-blue-400" size={28} />
            <h1 className="text-3xl font-bold text-white">Office</h1>
          </div>
          <p className="text-gray-400 mt-2">Agents at work and in the break room</p>
        </div>

        {/* Office Canvas */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#0f1318] to-[#141829]">
          {/* Grid pattern background */}
          <div className="absolute inset-0 opacity-5">
            <div
              style={{
                backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
                backgroundSize: '50px 50px',
              }}
              className="w-full h-full"
            />
          </div>

          {/* Office sections */}
          <div className="absolute inset-0">
            {/* Desks area */}
            <div className="absolute top-20 left-20 right-20 h-40 border-2 border-dashed border-gray-700 rounded p-4">
              <div className="text-xs text-gray-600 mb-2">Work Stations</div>
              {DESK_POSITIONS.map((pos, idx) => (
                <Desk key={`desk-${idx}`} x={pos.x} y={pos.y} />
              ))}
            </div>

            {/* Break room area */}
            <div className="absolute bottom-20 left-20 right-20 h-40 border-2 border-dashed border-gray-700 rounded p-4">
              <div className="text-xs text-gray-600 mb-2">Break Room</div>
              <div className="flex gap-4 ml-4">
                <div className="text-3xl">☕ Coffee Bar</div>
                <div className="text-3xl">📰 Reading Area</div>
              </div>
            </div>
          </div>

          {/* Animated agents */}
          {agents.map((agent) => (
            <PixelAgent key={agent.id} agent={agent} />
          ))}

          {/* Stats overlay */}
          <div className="absolute top-4 right-4 bg-[#141829] border border-[#374151] rounded p-4 text-sm text-gray-300">
            <div className="space-y-1">
              <div>👥 Agents: {agents.length}</div>
              <div>💻 Working: {agents.filter((a) => a.status === 'working').length}</div>
              <div>☕ On Break: {agents.filter((a) => a.status === 'idle').length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
