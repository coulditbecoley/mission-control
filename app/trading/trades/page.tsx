'use client';

import { useState } from 'react';
import { TrendingUp, Plus } from 'lucide-react';

interface Trade {
  id: string;
  date: string;
  asset: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  status: 'win' | 'loss';
  portfolioTotal: number;
  notes: string;
}

const mockTrades: Trade[] = [
  {
    id: '1',
    date: '2026-04-08',
    asset: 'BTC',
    type: 'long',
    entryPrice: 42500,
    exitPrice: 45200,
    quantity: 1.5,
    pnl: 4050,
    pnlPercent: 6.4,
    status: 'win',
    portfolioTotal: 125000,
    notes: 'Golden cross + RSI divergence. Strong entry.',
  },
  {
    id: '2',
    date: '2026-04-07',
    asset: 'ETH',
    type: 'long',
    entryPrice: 2300,
    exitPrice: 2450,
    quantity: 15,
    pnl: 2250,
    pnlPercent: 6.5,
    status: 'win',
    portfolioTotal: 120950,
    notes: 'Break above 2300 resistance. Good risk/reward.',
  },
  {
    id: '3',
    date: '2026-04-06',
    asset: 'SOL',
    type: 'short',
    entryPrice: 110,
    exitPrice: 105,
    quantity: 200,
    pnl: 1000,
    pnlPercent: 4.5,
    status: 'win',
    portfolioTotal: 118700,
    notes: 'Bearish divergence on 4h. Shorted at resistance.',
  },
  {
    id: '4',
    date: '2026-04-05',
    asset: 'BTC',
    type: 'long',
    entryPrice: 44000,
    exitPrice: 42800,
    quantity: 0.5,
    pnl: -600,
    pnlPercent: -2.7,
    status: 'loss',
    portfolioTotal: 117700,
    notes: 'Stopped out. Fed announcement caused sharp move.',
  },
];

export default function TradesPage() {
  const [trades] = useState<Trade[]>(mockTrades);

  // Calculate portfolio value from trades
  const portfolioHistory = trades.map(t => ({ date: t.date, value: t.portfolioTotal }));
  const minValue = Math.min(...portfolioHistory.map(p => p.value));
  const maxValue = Math.max(...portfolioHistory.map(p => p.value));
  const range = maxValue - minValue;

  const totalWins = trades.filter(t => t.status === 'win').length;
  const totalLosses = trades.filter(t => t.status === 'loss').length;
  const winRate = totalWins / trades.length * 100;
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-green-400" size={32} />
              <h1 className="text-4xl font-bold text-white">Trade Journal</h1>
            </div>
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus size={18} />
              New Trade
            </button>
          </div>
          <p className="text-gray-400">Track and analyze your trades</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Total P&L</p>
            <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalPnL.toLocaleString()}
            </p>
          </div>
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Win Rate</p>
            <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">{totalWins}W / {totalLosses}L</p>
          </div>
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Total Trades</p>
            <p className="text-2xl font-bold text-white">{trades.length}</p>
          </div>
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Current Portfolio</p>
            <p className="text-2xl font-bold text-white">$125,000</p>
          </div>
        </div>

        {/* Portfolio Growth Chart */}
        <div className="bg-[#141829] border border-[#374151] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Portfolio Growth</h2>
          <div className="bg-[#0a0e27] rounded-lg p-6">
            <div className="h-40 flex items-end justify-between gap-3">
              {portfolioHistory.map((point, idx) => {
                const height = ((point.value - minValue) / range) * 160 || 160;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                      style={{ height: `${height}px`, minHeight: '4px' }}
                    ></div>
                    <span className="text-xs text-gray-500 text-center whitespace-nowrap">{point.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Trades List */}
        <div className="bg-[#141829] border border-[#374151] rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#374151]">
            <h2 className="text-xl font-bold text-white">Recent Trades</h2>
          </div>

          <div className="divide-y divide-[#374151]">
            {trades.map((trade) => (
              <div key={trade.id} className="p-6 hover:bg-[#1a1f3a] transition-colors">
                <div className="grid grid-cols-7 gap-4 mb-3">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Date</p>
                    <p className="text-white font-semibold">{trade.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Asset</p>
                    <p className="text-white font-semibold">{trade.asset}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Type</p>
                    <p className={`font-semibold ${trade.type === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.type.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Entry → Exit</p>
                    <p className="text-white font-semibold">${trade.entryPrice} → ${trade.exitPrice}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Qty</p>
                    <p className="text-white font-semibold">{trade.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">P&L</p>
                    <p className={`font-semibold ${trade.status === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.status === 'win' ? '+' : ''}{trade.pnl.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Status</p>
                    <p className={`font-semibold ${trade.status === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.status === 'win' ? '✓ Win' : '✗ Loss'} ({trade.pnlPercent}%)
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Notes</p>
                  <p className="text-gray-300 text-sm">{trade.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
