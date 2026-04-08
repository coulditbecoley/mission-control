'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function PortfolioPage() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Mock P&L data
  const pnlData = {
    day: { pnl: 1250, percent: 2.3, change: 'up' },
    week: { pnl: 5840, percent: 10.7, change: 'up' },
    month: { pnl: 18500, percent: 28.4, change: 'up' },
    year: { pnl: 125000, percent: 180.5, change: 'up' },
  };

  const current = pnlData[timeframe];
  const portfolioTotal = 125000;
  const positions = [
    { symbol: 'BTC', name: 'Bitcoin', amount: 2.5, value: 110000, pnl: 25000, percent: 29.4 },
    { symbol: 'ETH', name: 'Ethereum', amount: 25.0, value: 50000, pnl: 8000, percent: 19.0 },
    { symbol: 'SOL', name: 'Solana', amount: 500.0, value: 35000, pnl: -2000, percent: -5.4 },
  ];

  // Mock chart data
  const chartPoints = [
    { date: '1 mo ago', value: 106500 },
    { date: '3 weeks', value: 110000 },
    { date: '2 weeks', value: 115000 },
    { date: '1 week', value: 118500 },
    { date: 'Today', value: 125000 },
  ];

  const minValue = Math.min(...chartPoints.map(p => p.value));
  const maxValue = Math.max(...chartPoints.map(p => p.value));
  const range = maxValue - minValue;

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Portfolio</h1>
          </div>
          <p className="text-gray-400">Track your positions and P&L</p>
        </div>

        {/* P&L Section */}
        <div className="bg-[#141829] border border-[#374151] rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Profit & Loss</h2>
            <div className="flex gap-2">
              {(['day', 'week', 'month', 'year'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-green-600 text-white'
                      : 'bg-[#1a1f3a] text-gray-300 border border-[#374151] hover:border-[#4b5563]'
                  }`}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* P&L Stats */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total P&L</p>
              <p className={`text-5xl font-bold ${current.change === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                ${current.pnl.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Return %</p>
              <p className={`text-5xl font-bold ${current.change === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                +{current.percent}%
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-[#0a0e27] rounded-lg p-6 mb-6">
            <div className="h-40 flex items-end justify-around gap-2">
              {chartPoints.map((point, idx) => {
                const height = ((point.value - minValue) / range) * 160;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                      style={{ height: `${height}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 text-center">{point.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Portfolio Total */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Portfolio Total</p>
            <p className="text-3xl font-bold text-white">${portfolioTotal.toLocaleString()}</p>
          </div>
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Total Invested</p>
            <p className="text-3xl font-bold text-white">${(portfolioTotal - current.pnl).toLocaleString()}</p>
          </div>
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Positions</p>
            <p className="text-3xl font-bold text-white">{positions.length}</p>
          </div>
        </div>

        {/* Current Positions */}
        <div className="bg-[#141829] border border-[#374151] rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#374151]">
            <h2 className="text-xl font-bold text-white">Current Positions</h2>
          </div>
          <div className="divide-y divide-[#374151]">
            {positions.map((pos) => (
              <div key={pos.symbol} className="p-6 flex items-center justify-between hover:bg-[#1a1f3a] transition-colors">
                <div>
                  <p className="text-white font-semibold">{pos.name}</p>
                  <p className="text-gray-400 text-sm">{pos.amount.toLocaleString()} {pos.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">${pos.value.toLocaleString()}</p>
                  <p className={`text-sm ${pos.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toLocaleString()} ({pos.percent}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assets in Portfolio */}
        <div className="mt-8 bg-[#141829] border border-[#374151] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Portfolio Allocation</h2>
          <div className="space-y-4">
            {positions.map((pos) => {
              const percent = (pos.value / portfolioTotal) * 100;
              return (
                <div key={pos.symbol}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-300">{pos.name}</p>
                    <p className="text-white font-semibold">{percent.toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-[#0a0e27] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
