'use client';

import { useState } from 'react';
import { TrendingUp, Plus, X } from 'lucide-react';

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
  notes: string;
}

const calculatePnL = (type: string, entryPrice: number, exitPrice: number, quantity: number) => {
  const priceDiff = exitPrice - entryPrice;
  const pnl = type === 'long' ? priceDiff * quantity : -priceDiff * quantity;
  const pnlPercent = (priceDiff / entryPrice) * 100;
  return { pnl: Math.round(pnl), pnlPercent: parseFloat(pnlPercent.toFixed(2)) };
};

const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([
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
      notes: 'Break above 2300 resistance. Good risk/reward.',
    },
  ]);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    asset: 'BTC',
    type: 'long' as 'long' | 'short',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    notes: '',
  });

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = parseFloat(formData.exitPrice);
    const quantity = parseFloat(formData.quantity);
    
    if (!entryPrice || !exitPrice || !quantity) return;
    
    const { pnl, pnlPercent } = calculatePnL(formData.type, entryPrice, exitPrice, quantity);
    
    const newTrade: Trade = {
      id: generateId(),
      date: formData.date,
      asset: formData.asset,
      type: formData.type,
      entryPrice,
      exitPrice,
      quantity,
      pnl,
      pnlPercent,
      status: pnl >= 0 ? 'win' : 'loss',
      notes: formData.notes,
    };
    
    setTrades([newTrade, ...trades]);
    setShowModal(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      asset: 'BTC',
      type: 'long',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      notes: '',
    });
  };

  const totalWins = trades.filter(t => t.status === 'win').length;
  const totalLosses = trades.filter(t => t.status === 'loss').length;
  const winRate = trades.length > 0 ? (totalWins / trades.length * 100) : 0;
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-green-400" size={32} />
              <h1 className="text-4xl font-bold text-white">Journal</h1>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} />
              New Trade
            </button>
          </div>
          <p className="text-gray-400">Manual trade journal - track and analyze your trades</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
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

        {/* New Trade Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#141829] border border-[#374151] rounded-lg p-8 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">New Trade</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddTrade} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Asset</label>
                    <input
                      type="text"
                      value={formData.asset}
                      onChange={(e) => setFormData({ ...formData, asset: e.target.value.toUpperCase() })}
                      className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                      placeholder="BTC"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'long' | 'short' })}
                      className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                    >
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      step="0.00001"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                      placeholder="1.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Entry Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.entryPrice}
                      onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                      className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                      placeholder="42500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Exit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.exitPrice}
                      onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                      className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                      placeholder="45200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm resize-none"
                    rows={3}
                    placeholder="Trade notes..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors font-semibold"
                  >
                    Add Trade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
