'use client';

import { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  status: 'working' | 'idle';
  x: number;
  y: number;
  activity: string;
}

const AGENT_NAMES = ['Odin', 'Loki', 'Thor', 'Freya', 'Heimdall', 'Sif', 'Vidar', 'Modi'];
const COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-green-500', 'bg-red-500', 'bg-cyan-500', 'bg-orange-500'];
const ACTIVITIES = ['☕', '📰', '💻', '📞', '🖥️'];

export default function OfficePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [mounted, setMounted] = useState(false);

  // Initialize agents
  useEffect(() => {
    const initialAgents: Agent[] = AGENT_NAMES.map((name, idx) => ({
      id: `agent-${idx}`,
      name,
      status: Math.random() > 0.5 ? 'working' : 'idle',
      x: Math.random() * 800 + 100,
      y: Math.random() * 400 + 150,
      activity: ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)],
    }));
    setAgents(initialAgents);
    setMounted(true);
  }, []);

  // Animate agents
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          // Random walk
          const angle = Math.random() * Math.PI * 2;
          const speed = 2;
          let newX = agent.x + Math.cos(angle) * speed;
          let newY = agent.y + Math.sin(angle) * speed;

          // Keep in bounds
          newX = Math.max(50, Math.min(1150, newX));
          newY = Math.max(100, Math.min(550, newY));

          // Occasional status/activity change
          const newAgent = { ...agent, x: newX, y: newY };
          if (Math.random() < 0.05) {
            newAgent.status = Math.random() > 0.5 ? 'working' : 'idle';
            newAgent.activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
          }
          return newAgent;
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) return null;

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
          {/* Grid background */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div
              style={{
                backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
                backgroundSize: '50px 50px',
              }}
              className="w-full h-full"
            />
          </div>

          {/* Work Area Label */}
          <div className="absolute top-12 left-8 text-xs text-gray-600 font-semibold">WORK STATIONS</div>

          {/* Break Room Label */}
          <div className="absolute bottom-16 left-8 text-xs text-gray-600 font-semibold">BREAK ROOM</div>

          {/* Agents */}
          {agents.map((agent, idx) => (
            <div
              key={agent.id}
              className="absolute transition-all duration-500 ease-out"
              style={{
                left: `${agent.x}px`,
                top: `${agent.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="flex flex-col items-center">
                {/* Agent Avatar */}
                <div className={`${COLORS[idx % COLORS.length]} w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-800 font-bold text-white text-sm shadow-lg`}>
                  {agent.name.slice(0, 2)}
                </div>

                {/* Activity Indicator */}
                <div className="text-lg mt-1">{agent.activity}</div>

                {/* Status Badge */}
                <div className={`text-xs mt-1 px-2 py-0.5 rounded ${
                  agent.status === 'working'
                    ? 'bg-green-900/60 text-green-300'
                    : 'bg-blue-900/60 text-blue-300'
                }`}>
                  {agent.status === 'working' ? '💼' : '😌'}
                </div>

                {/* Name */}
                <div className="text-xs font-semibold text-white mt-1 whitespace-nowrap">
                  {agent.name}
                </div>
              </div>
            </div>
          ))}

          {/* Stats Panel */}
          <div className="absolute top-4 right-4 bg-[#141829] border border-[#374151] rounded-lg p-4 text-sm text-gray-300 space-y-2">
            <div className="font-semibold text-white mb-3">Office Status</div>
            <div>👥 Total Agents: {agents.length}</div>
            <div>💼 Working: {agents.filter((a) => a.status === 'working').length}</div>
            <div>☕ On Break: {agents.filter((a) => a.status === 'idle').length}</div>
            <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-[#374151]">
              Agents move around randomly and switch between work/break every 30 seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
