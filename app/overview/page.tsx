'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Zap } from 'lucide-react';

interface OverviewData {
  portfolioValue: number;
  portfolioGrowth: number;
  bitcoinPrice: number;
  bitcoinChange24h: number;
  totalDeposits: number;
  totalTrades: number;
  winRate: number;
  taskProgress: number;
}

export default function Overview() {
  const [data, setData] = useState<OverviewData>({
    portfolioValue: 0,
    portfolioGrowth: 0,
    bitcoinPrice: 0,
    bitcoinChange24h: 0,
    totalDeposits: 0,
    totalTrades: 0,
    winRate: 0,
    taskProgress: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      
      // Fetch Bitcoin price from CoinGecko
      const btcResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
      );
      const btcData = btcResponse.ok ? await btcResponse.json() : null;
      const bitcoinPrice = btcData?.bitcoin?.usd || 42850;
      const bitcoinChange24h = btcData?.bitcoin?.usd_24h_change || 1.2;

      // Fetch user's journal data (deposits + trades)
      const journalResponse = await fetch('/api/trading/trades');
      const journalData = journalResponse.ok ? await journalResponse.json() : { deposits: [], trades: [] };

      // Calculate portfolio metrics
      const totalDeposits = journalData.deposits?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0;
      const totalTrades = journalData.trades?.length || 0;
      const winTrades = journalData.trades?.filter((t: any) => t.pnl >= 0).length || 0;
      const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;

      const totalPnL = journalData.trades?.reduce((sum: number, t: any) => sum + t.pnl, 0) || 0;
      const portfolioValue = totalDeposits + totalPnL;
      const portfolioGrowth = totalDeposits > 0 ? ((totalPnL / totalDeposits) * 100) : 0;

      // Fetch task progress
      const tasksResponse = await fetch('/api/tasks');
      const tasksData = tasksResponse.ok ? await tasksResponse.json() : [];
      const completedTasks = tasksData.filter((t: any) => t.status === 'completed').length;
      const taskProgress = tasksData.length > 0 ? (completedTasks / tasksData.length) * 100 : 0;

      setData({
        portfolioValue: Math.round(portfolioValue),
        portfolioGrowth: parseFloat(portfolioGrowth.toFixed(2)),
        bitcoinPrice: Math.round(bitcoinPrice),
        bitcoinChange24h: parseFloat(bitcoinChange24h.toFixed(2)),
        totalDeposits: Math.round(totalDeposits),
        totalTrades,
        winRate: parseFloat(winRate.toFixed(1)),
        taskProgress: Math.round(taskProgress),
      });

      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setError('Unable to load some data');
      // Keep previous values on error
    } finally {
      setLoading(false);
    }
  }

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
      <p className={`text-xs mt-2 ${change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {change}
      </p>
    </div>
  );

  const ProgressBar = ({ progress, label }: { progress: number; label: string }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{label}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Loading dashboard...</p>
          <div className="w-8 h-8 border-2 border-gray-600 border-t-accent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

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
            Real-time dashboard • {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={BarChart3}
            label="Portfolio Value"
            value={`$${data.portfolioValue.toLocaleString()}`}
            change={`${data.portfolioGrowth >= 0 ? '+' : ''}${data.portfolioGrowth.toFixed(2)}% return`}
            color="bg-blue-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Bitcoin Price"
            value={`$${data.bitcoinPrice.toLocaleString()}`}
            change={`${data.bitcoinChange24h >= 0 ? '+' : ''}${data.bitcoinChange24h.toFixed(2)}% 24h`}
            color="bg-yellow-500"
          />
          <StatCard
            icon={CheckCircle2}
            label="Task Progress"
            value={`${Math.round(data.taskProgress)}%`}
            change={`On track`}
            color="bg-green-500"
          />
          <StatCard
            icon={Zap}
            label="Win Rate"
            value={`${data.winRate.toFixed(1)}%`}
            change={`${data.totalTrades} trades`}
            color="bg-purple-500"
          />
        </div>

        {/* Progress Section */}
        <div className="bg-white dark:bg-white/10 rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Progress</h2>
          <ProgressBar progress={data.taskProgress} label="Tasks Completed" />
          <ProgressBar progress={data.portfolioGrowth > 0 ? Math.min(data.portfolioGrowth, 100) : 0} label="Portfolio Growth" />
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-white/10 rounded-lg p-8 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-blue-400" size={20} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Stats</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Deposits</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">${data.totalDeposits.toLocaleString()}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Capital invested</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Balance</p>
              <p className={`text-3xl font-bold ${data.portfolioValue >= data.totalDeposits ? 'text-green-400' : 'text-red-400'}`}>
                ${data.portfolioValue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {data.portfolioValue >= data.totalDeposits ? 'Profit' : 'Loss'}: ${Math.abs(data.portfolioValue - data.totalDeposits).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Trades</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalTrades}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Win rate: {data.winRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Bitcoin Price</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">${data.bitcoinPrice.toLocaleString()}</p>
              <p className={`text-xs mt-1 ${data.bitcoinChange24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {data.bitcoinChange24h >= 0 ? '↑' : '↓'} {Math.abs(data.bitcoinChange24h).toFixed(2)}% 24h
              </p>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6">
          <button
            onClick={fetchDashboardData}
            className="text-sm px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
