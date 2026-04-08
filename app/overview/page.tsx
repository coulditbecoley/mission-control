'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Zap } from 'lucide-react';

interface OverviewData {
  portfolioGrowth: number;
  bitcoinChange24h: number;
  taskCompletion: number;
  agentActivity: number;
  taskProgress: number;
  projectProgress: number;
}

export default function Overview() {
  const [data, setData] = useState<OverviewData>({
    portfolioGrowth: 24,
    bitcoinChange24h: 1.2,
    taskCompletion: 71,
    agentActivity: 63,
    taskProgress: 73,
    projectProgress: 58,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => setLoading(false), 500);
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    color,
  }: {
    icon: any;
    label: string;
    value: string;
    change: string;
    color: string;
  }) => (
    <div className="bg-white dark:bg-white/10 rounded-lg p-6 border border-white/20">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4 ${color}`}>
        <Icon size={24} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-green-600 dark:text-green-400 mt-2">{change}</p>
    </div>
  );

  const ProgressBar = ({ progress, label }: { progress: number; label: string }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{label}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-yellow-400" size={24} />
            <h1 className="text-4xl font-bold text-white">Overview</h1>
          </div>
          <p className="text-gray-400">
            Real-time dashboard summary • {new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </p>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={BarChart3}
            label="Portfolio Growth"
            value="+24%"
            change="📈 +24% today"
            color="bg-blue-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Bitcoin Change"
            change="📊 +1.2% 24h"
            value="+1.2%"
            color="bg-yellow-500"
          />
          <StatCard
            icon={CheckCircle2}
            label="Task Completion"
            value="71%"
            change="✓ 71% done"
            color="bg-green-500"
          />
          <StatCard
            icon={Zap}
            label="Agent Activity"
            value="63%"
            change="⚡ 63% active"
            color="bg-purple-500"
          />
        </div>

        {/* Progress Section */}
        <div className="bg-white dark:bg-white/10 rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Progress</h2>
          <ProgressBar progress={data.taskProgress} label="Tasks Completed" />
          <ProgressBar progress={data.projectProgress} label="Projects Active" />
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-white/10 rounded-lg p-8 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-blue-400" size={20} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Stats</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Portfolio Value</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">$142,500</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">+2.4% this month</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Bitcoin Price</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">$42,850</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">+1.2% 24h</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Trades</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">24</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Win rate: 75%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">17/24</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">71% complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
