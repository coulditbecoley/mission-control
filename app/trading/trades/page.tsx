'use client';

import { useState } from 'react';
import { TrendingUp, Plus, X, Trash2, DollarSign } from 'lucide-react';

interface Deposit {
  id: string;
  date: string;
  amount: number;
  notes: string;
}

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

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';
type EntryType = 'trade' | 'deposit';

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

const buildChartData = (deposits: Deposit[], trades: Trade[], timeframe: Timeframe) => {
  let balance = 0;
  const data: Array<{ date: string; balance: number; change: number }> = [];

  // Combine and sort all entries by date
  const allEntries = [
    ...deposits.map((d) => ({ ...d, type: 'deposit' as const })),
    ...trades.map((t) => ({ ...t, type: 'trade' as const })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Group by timeframe
  const grouped: { [key: string]: typeof allEntries } = {};

  allEntries.forEach((entry) => {
    let key = entry.date;

    if (timeframe === 'weekly') {
      const date = new Date(entry.date);
      const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
      key = startOfWeek.toISOString().split('T')[0];
    } else if (timeframe === 'monthly') {
      key = entry.date.substring(0, 7);
    } else if (timeframe === 'yearly') {
      key = entry.date.substring(0, 4);
    }

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(entry);
  });

  // Calculate cumulative balance
  Object.keys(grouped)
    .sort()
    .forEach((key) => {
      let periodChange = 0;
      grouped[key].forEach((entry) => {
        if (entry.type === 'deposit') {
          periodChange += entry.amount;
        } else {
          periodChange += entry.pnl;
        }
      });
      balance += periodChange;
      data.push({
        date: key,
        balance: Math.round(balance),
        change: periodChange,
      });
    });

  return {
    data,
    startBalance: 0,
    totalBalance: balance,
    totalDeposits: deposits.reduce((sum, d) => sum + d.amount, 0),
    totalPnL: trades.reduce((sum, t) => sum + t.pnl, 0),
  };
};

export default function JournalPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
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

  const [timeframe, setTimeframe] = useState<Timeframe>('daily');
  const [activeTab, setActiveTab] = useState<EntryType>('trade');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<EntryType>('trade');

  const [tradeForm, setTradeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    asset: 'BTC',
    type: 'long' as 'long' | 'short',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    notes: '',
  });

  const [depositForm, setDepositForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    notes: '',
  });

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();

    const entryPrice = parseFloat(tradeForm.entryPrice);
    const exitPrice = parseFloat(tradeForm.exitPrice);
    const quantity = parseFloat(tradeForm.quantity);

    if (!entryPrice || !exitPrice || !quantity) return;

    const { pnl, pnlPercent } = calculatePnL(tradeForm.type, entryPrice, exitPrice, quantity);

    const newTrade: Trade = {
      id: generateId(),
      date: tradeForm.date,
      asset: tradeForm.asset,
      type: tradeForm.type,
      entryPrice,
      exitPrice,
      quantity,
      pnl,
      pnlPercent,
      status: pnl >= 0 ? 'win' : 'loss',
      notes: tradeForm.notes,
    };

    setTrades([newTrade, ...trades]);
    setShowModal(false);
    setTradeForm({
      date: new Date().toISOString().split('T')[0],
      asset: 'BTC',
      type: 'long',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      notes: '',
    });
  };

  const handleAddDeposit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(depositForm.amount);
    if (!amount || amount <= 0) return;

    const newDeposit: Deposit = {
      id: generateId(),
      date: depositForm.date,
      amount,
      notes: depositForm.notes,
    };

    setDeposits([newDeposit, ...deposits]);
    setShowModal(false);
    setDepositForm({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      notes: '',
    });
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(trades.filter((t) => t.id !== id));
  };

  const handleDeleteDeposit = (id: string) => {
    setDeposits(deposits.filter((d) => d.id !== id));
  };

  const totalWins = trades.filter((t) => t.status === 'win').length;
  const totalLosses = trades.filter((t) => t.status === 'loss').length;
  const winRate = trades.length > 0 ? (totalWins / trades.length) * 100 : 0;
  const totalTradePnL = trades.reduce((sum, t) => sum + t.pnl, 0);

  const chartData = buildChartData(deposits, trades, timeframe);

  const maxBalance = Math.max(...chartData.data.map((d) => d.balance), 0);
  const minBalance = Math.min(...chartData.data.map((d) => d.balance), 0);
  const range = maxBalance - minBalance || 1;

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
              onClick={() => {
                setModalType('trade');
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} />
              New Trade
            </button>
          </div>
          <p className="text-gray-400">Manual trade journal - track deposits and analyze your trades</p>
        </div>

        {/* P&L Chart Section */}
        <div className="bg-[#141829] border border-[#374151] rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Portfolio Growth</h2>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    timeframe === tf
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#0a0e27] text-gray-400 hover:text-white'
                  }`}
                >
                  {tf.charAt(0).toUpperCase() + tf.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="mb-6">
            <svg width="100%" height="200" className="mb-4">
              {chartData.data.length > 0 ? (
                <>
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((y) => (
                    <line
                      key={`grid-${y}`}
                      x1="0"
                      y1={200 - 200 * y}
                      x2="100%"
                      y2={200 - 200 * y}
                      stroke="#374151"
                      strokeDasharray="5,5"
                      opacity="0.5"
                    />
                  ))}

                  {/* Line chart */}
                  <polyline
                    points={chartData.data
                      .map((d, i) => {
                        const x = (i / (chartData.data.length - 1)) * 100;
                        const normalizedBalance = (d.balance - minBalance) / range;
                        const y = 200 - normalizedBalance * 200;
                        return `${x}%,${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />

                  {/* Data points */}
                  {chartData.data.map((d, i) => {
                    const x = (i / (chartData.data.length - 1)) * 100;
                    const normalizedBalance = (d.balance - minBalance) / range;
                    const y = 200 - normalizedBalance * 200;
                    return (
                      <circle
                        key={`point-${i}`}
                        cx={`${x}%`}
                        cy={y}
                        r="4"
                        fill={d.change >= 0 ? '#10b981' : '#ef4444'}
                        opacity="0.8"
                      />
                    );
                  })}
                </>
              ) : (
                <text x="50%" y="100" textAnchor="middle" fill="#6b7280" fontSize="14">
                  No entries yet
                </text>
              )}
            </svg>

            {/* Chart Labels */}
            <div className="grid grid-cols-4 gap-4 text-xs text-gray-400">
              <div>
                <p className="text-gray-500 mb-1">Total Deposits</p>
                <p className="text-white font-semibold">${chartData.totalDeposits.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total P&L</p>
                <p className={`font-semibold ${chartData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {chartData.totalPnL >= 0 ? '+' : ''}${chartData.totalPnL.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Current Balance</p>
                <p className="text-white font-semibold">${chartData.totalBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Return %</p>
                <p className={`font-semibold ${chartData.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {chartData.totalDeposits > 0
                    ? ((chartData.totalPnL / chartData.totalDeposits) * 100).toFixed(2)
                    : '0'}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Total P&L</p>
            <p className={`text-2xl font-bold ${totalTradePnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${totalTradePnL.toLocaleString()}
            </p>
          </div>
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Win Rate</p>
            <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalWins}W / {totalLosses}L
            </p>
          </div>
          <div className="bg-[#141829] border border-[#374151] rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">Total Trades</p>
            <p className="text-2xl font-bold text-white">{trades.length}</p>
          </div>
        </div>

        {/* Entries Tabs & List */}
        <div className="bg-[#141829] border border-[#374151] rounded-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#374151]">
            <button
              onClick={() => setActiveTab('trade')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'trade'
                  ? 'bg-[#1a1f3a] text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Trades ({trades.length})
            </button>
            <button
              onClick={() => setActiveTab('deposit')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'deposit'
                  ? 'bg-[#1a1f3a] text-white border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Deposits ({deposits.length})
            </button>
          </div>

          {/* Trades Tab */}
          {activeTab === 'trade' && (
            <div className="divide-y divide-[#374151]">
              {trades.length === 0 ? (
                <div className="p-6 text-center text-gray-400">No trades yet</div>
              ) : (
                trades.map((trade) => (
                  <div key={trade.id} className="p-6 hover:bg-[#1a1f3a] transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="grid grid-cols-7 gap-4 flex-1">
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
                          <p
                            className={`font-semibold ${trade.type === 'long' ? 'text-green-400' : 'text-red-400'}`}
                          >
                            {trade.type.toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Entry → Exit</p>
                          <p className="text-white font-semibold">
                            ${trade.entryPrice} → ${trade.exitPrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Qty</p>
                          <p className="text-white font-semibold">{trade.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">P&L</p>
                          <p
                            className={`font-semibold ${trade.status === 'win' ? 'text-green-400' : 'text-red-400'}`}
                          >
                            {trade.status === 'win' ? '+' : ''}{trade.pnl.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Status</p>
                          <p
                            className={`font-semibold ${trade.status === 'win' ? 'text-green-400' : 'text-red-400'}`}
                          >
                            {trade.status === 'win' ? '✓ Win' : '✗ Loss'} ({trade.pnlPercent}%)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTrade(trade.id)}
                        className="ml-4 p-2 text-gray-500 hover:text-red-400 hover:bg-[#0a0e27] rounded transition-colors flex-shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Notes</p>
                      <p className="text-gray-300 text-sm">{trade.notes}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Deposits Tab */}
          {activeTab === 'deposit' && (
            <div className="divide-y divide-[#374151]">
              {deposits.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  No deposits yet. Add your initial deposit to get started.
                </div>
              ) : (
                deposits.map((deposit) => (
                  <div key={deposit.id} className="p-6 hover:bg-[#1a1f3a] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Date</p>
                            <p className="text-white font-semibold">{deposit.date}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Amount</p>
                            <p className="text-green-400 font-semibold text-lg">
                              +${deposit.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Type</p>
                            <p className="text-white font-semibold">Deposit</p>
                          </div>
                        </div>
                        {deposit.notes && (
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Notes</p>
                            <p className="text-gray-300 text-sm">{deposit.notes}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteDeposit(deposit.id)}
                        className="ml-4 p-2 text-gray-500 hover:text-red-400 hover:bg-[#0a0e27] rounded transition-colors flex-shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Add Entry Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#141829] border border-[#374151] rounded-lg p-8 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  {modalType === 'deposit' ? (
                    <>
                      <DollarSign size={24} className="text-green-400" />
                      <h2 className="text-2xl font-bold text-white">Add Deposit</h2>
                    </>
                  ) : (
                    <>
                      <TrendingUp size={24} className="text-blue-400" />
                      <h2 className="text-2xl font-bold text-white">New Trade</h2>
                    </>
                  )}
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {/* Deposit Form */}
              {modalType === 'deposit' && (
                <form onSubmit={handleAddDeposit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={depositForm.date}
                      onChange={(e) => setDepositForm({ ...depositForm, date: e.target.value })}
                      className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                      className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Notes</label>
                    <textarea
                      value={depositForm.notes}
                      onChange={(e) => setDepositForm({ ...depositForm, notes: e.target.value })}
                      className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm resize-none"
                      rows={3}
                      placeholder="e.g., Initial capital"
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
                      Add Deposit
                    </button>
                  </div>
                </form>
              )}

              {/* Trade Form */}
              {modalType === 'trade' && (
                <form onSubmit={handleAddTrade} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Date</label>
                      <input
                        type="date"
                        value={tradeForm.date}
                        onChange={(e) => setTradeForm({ ...tradeForm, date: e.target.value })}
                        className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Asset</label>
                      <input
                        type="text"
                        value={tradeForm.asset}
                        onChange={(e) => setTradeForm({ ...tradeForm, asset: e.target.value.toUpperCase() })}
                        className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                        placeholder="BTC"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Type</label>
                      <select
                        value={tradeForm.type}
                        onChange={(e) => setTradeForm({ ...tradeForm, type: e.target.value as 'long' | 'short' })}
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
                        value={tradeForm.quantity}
                        onChange={(e) => setTradeForm({ ...tradeForm, quantity: e.target.value })}
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
                        value={tradeForm.entryPrice}
                        onChange={(e) => setTradeForm({ ...tradeForm, entryPrice: e.target.value })}
                        className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                        placeholder="42500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Exit Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={tradeForm.exitPrice}
                        onChange={(e) => setTradeForm({ ...tradeForm, exitPrice: e.target.value })}
                        className="w-full bg-[#0a0e27] border border-[#374151] rounded px-3 py-2 text-white text-sm"
                        placeholder="45200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Notes</label>
                    <textarea
                      value={tradeForm.notes}
                      onChange={(e) => setTradeForm({ ...tradeForm, notes: e.target.value })}
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors font-semibold"
                    >
                      Add Trade
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Add Deposit Button (Quick Access) */}
        <div className="mt-8">
          <button
            onClick={() => {
              setModalType('deposit');
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <DollarSign size={20} />
            Add Initial Deposit
          </button>
        </div>
      </div>
    </div>
  );
}
