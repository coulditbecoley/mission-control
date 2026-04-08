'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, CheckCircle2, AlertCircle, Zap, FolderOpen, Calendar, FileText, Activity } from 'lucide-react';
import { useDashboardStore } from '@/lib/store';

interface PortfolioSummary {
  totalValue: number;
  change24h: number;
  changePercent: number;
}

interface BitcoinPrice {
  price: number;
  change24h: number;
  changePercent: number;
}

export default function Overview() {
  const { tasks = [], projects = [], agents = [] } = useDashboardStore();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [bitcoin, setBitcoin] = useState<BitcoinPrice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch portfolio data
        const portfolioRes = await fetch('/api/trading/portfolio').catch(() => null);
        if (portfolioRes?.ok) {
          const data = await portfolioRes.json();
          setPortfolio(data);
        }

        // Fetch Bitcoin price from CoinGecko (free API)
        const btcRes = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
        ).catch(() => null);
        if (btcRes?.ok) {
          const data = await btcRes.json();
          const btcData = data.bitcoin;
          setBitcoin({
            price: btcData.usd,
            change24h: btcData.usd_24h_change,
            changePercent: btcData.usd_24h_change,
          });
        }
      } catch (err) {
        console.error('Failed to fetch overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate metrics
  const completedTasks = (tasks || []).filter((t: any) => t.status === 'done').length;
  const totalTasks = (tasks || []).length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeProjects = (projects || []).filter((p: any) => p.status === 'active').length;
  const totalProjects = (projects || []).length;
  const projectProgress = totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0;

  const summaryItems = [
    { label: 'Tasks', href: '/tasks', icon: CheckCircle2, count: totalTasks, active: completedTasks, progress: taskProgress },
    { label: 'Projects', href: '/projects', icon: FolderOpen, count: totalProjects, active: activeProjects, progress: projectProgress },
    { label: 'Agents', href: '/agents', icon: Zap, count: (agents || []).length },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Docs', href: '/docs', icon: FileText },
    { label: 'Activity', href: '/activity', icon: Activity },
  ];

  return (
    <div className="p-8 bg-[#0a0e27] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Overview</h1>
          <p className="text-gray-400">Real-time summary of your work and trading</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Portfolio */}
          {portfolio && (
            <div className="p-6 bg-[#141829] border border-[#374151] rounded-lg">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Portfolio Value</h3>
              <p className="text-3xl font-bold text-white mb-2">
                ${portfolio.totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className={`text-sm ${portfolio.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {portfolio.changePercent >= 0 ? '+' : ''}{portfolio.changePercent.toFixed(2)}% (24h)
              </p>
            </div>
          )}

          {/* Bitcoin Price */}
          {bitcoin && (
            <div className="p-6 bg-[#141829] border border-[#374151] rounded-lg">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Bitcoin Price</h3>
              <p className="text-3xl font-bold text-white mb-2">
                ${bitcoin.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className={`text-sm ${bitcoin.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {bitcoin.changePercent >= 0 ? '+' : ''}{bitcoin.changePercent.toFixed(2)}% (24h)
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="p-6 bg-[#141829] border border-[#374151] rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Open Tasks</span>
                <span className="text-white font-semibold">{totalTasks - completedTasks}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Active Projects</span>
                <span className="text-white font-semibold">{activeProjects}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Active Agents</span>
                <span className="text-white font-semibold">{(agents || []).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Sections */}
        {taskProgress > 0 && (
          <div className="mb-8 p-6 bg-[#141829] border border-[#374151] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Task Progress</h3>
              <span className="text-xs text-gray-500">{completedTasks}/{totalTasks}</span>
            </div>
            <div className="w-full bg-[#0a0e27] rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{taskProgress}% Complete</p>
          </div>
        )}

        {projectProgress > 0 && (
          <div className="mb-8 p-6 bg-[#141829] border border-[#374151] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Project Progress</h3>
              <span className="text-xs text-gray-500">{activeProjects}/{totalProjects}</span>
            </div>
            <div className="w-full bg-[#0a0e27] rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${projectProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{projectProgress}% Active</p>
          </div>
        )}

        {/* Tab Summary Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Jump to Section</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {summaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="p-4 bg-[#141829] border border-[#374151] rounded-lg hover:border-blue-500 transition-colors group"
                >
                  <Icon className="w-6 h-6 text-gray-400 group-hover:text-blue-400 mb-2" />
                  <h3 className="text-sm font-semibold text-gray-300 group-hover:text-white">{item.label}</h3>
                  {item.count !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">
                      {item.active !== undefined ? `${item.active}/${item.count}` : item.count}
                    </p>
                  )}
                  {item.progress !== undefined && (
                    <div className="mt-2 w-full bg-[#0a0e27] rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
