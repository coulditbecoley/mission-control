'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Zap, CheckCircle, Activity } from 'lucide-react';

interface GatewayData {
  sessions: any[];
  projects: any[];
  tasks: any[];
  agents: any[];
}

export default function Overview() {
  const [data, setData] = useState<GatewayData>({
    sessions: [],
    projects: [],
    tasks: [],
    agents: [],
  });
  const [loading, setLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
    fetchBTCPrice();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch('/api/gateway');
      const gatewayData = await res.json();
      setData({
        sessions: gatewayData.sessions || [],
        projects: gatewayData.projects || [],
        tasks: gatewayData.tasks || [],
        agents: gatewayData.agents || [],
      });
    } catch (error) {
      console.error('Failed to fetch gateway data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBTCPrice() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const result = await res.json();
      setBtcPrice(result.bitcoin?.usd || null);
    } catch (error) {
      console.error('Failed to fetch BTC price:', error);
    }
  }

  const completedTasks = data.tasks.filter((t: any) => t.status === 'done').length;
  const activeTasks = data.tasks.filter((t: any) => t.status === 'in-progress').length;
  const activeAgents = data.agents.filter((a: any) => a.status === 'active').length;

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Overview</h1>
          <p className="text-gray-400">Real-time summary of your work and assets</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* BTC Price */}
          <div className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-400" size={20} />
              </div>
              <span className="text-sm text-gray-400">Bitcoin Price</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {btcPrice ? `$${btcPrice.toLocaleString()}` : 'Loading...'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Current market price (CoinGecko)</p>
          </div>

          {/* Tasks */}
          <div className="p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-400" size={20} />
              </div>
              <span className="text-sm text-gray-400">Tasks</span>
            </div>
            <p className="text-3xl font-bold text-white">{data.tasks.length}</p>
            <div className="text-xs text-gray-500 mt-2">
              {completedTasks} done · {activeTasks} in progress
            </div>
          </div>

          {/* Projects */}
          <div className="p-6 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Activity className="text-yellow-400" size={20} />
              </div>
              <span className="text-sm text-gray-400">Projects</span>
            </div>
            <p className="text-3xl font-bold text-white">{data.projects.length}</p>
            <p className="text-xs text-gray-500 mt-2">Active management</p>
          </div>

          {/* Agents */}
          <div className="p-6 bg-gradient-to-br from-red-900/30 to-pink-900/30 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Zap className="text-red-400" size={20} />
              </div>
              <span className="text-sm text-gray-400">Agents</span>
            </div>
            <p className="text-3xl font-bold text-white">{activeAgents}</p>
            <p className="text-xs text-gray-500 mt-2">Active out of {data.agents.length}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Jump to Section</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Tasks', icon: '✓', href: '/tasks', count: data.tasks.length },
              { name: 'Projects', icon: '📁', href: '/projects', count: data.projects.length },
              { name: 'Agents', icon: '⚡', href: '/agents', count: activeAgents },
              { name: 'Calendar', icon: '📅', href: '/calendar' },
              { name: 'Docs', icon: '📄', href: '/docs' },
              { name: 'Activity', icon: '🔔', href: '/activity' },
            ].map((section) => (
              <a
                key={section.name}
                href={section.href}
                className="p-4 bg-[#141829] border border-[#374151] rounded-lg hover:border-blue-500 transition-colors group"
              >
                <div className="text-2xl mb-2">{section.icon}</div>
                <h3 className="text-sm font-semibold text-gray-300 group-hover:text-white">
                  {section.name}
                </h3>
                {section.count !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">{section.count}</p>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#141829] border border-[#374151] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">OpenClaw Gateway</p>
              <p className="text-lg font-semibold text-green-400">Connected</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Dashboard</p>
              <p className="text-lg font-semibold text-green-400">Operational</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Data Sync</p>
              <p className="text-lg font-semibold text-green-400">Real-time</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Last Update</p>
              <p className="text-lg font-semibold text-gray-300">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
