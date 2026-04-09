'use client';

import { useEffect, useState } from 'react';
import { Gauge, RefreshCw, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import type { AIProviderUsage } from '@/lib/gateway-service';

export default function Usage() {
  const [usage, setUsage] = useState<AIProviderUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(fetchUsage, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  async function fetchUsage() {
    try {
      setLoading(true);
      const res = await fetch('/api/gateway');
      const data = await res.json();
      setUsage(data.aiUsage || []);
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalCostUsed = usage.reduce((sum, u) => sum + u.costUsed, 0);
  const totalCostLimit = usage.reduce((sum, u) => sum + u.costLimit, 0);
  const totalPercentage = totalCostLimit > 0 ? (totalCostUsed / totalCostLimit) * 100 : 0;
  const criticalProviders = usage.filter(u => u.status === 'critical').length;
  const warningProviders = usage.filter(u => u.status === 'warning').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900/20 border-green-500/30';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/30';
      case 'critical':
        return 'bg-red-900/20 border-red-500/30';
      default:
        return 'bg-gray-900/20 border-gray-500/30';
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'from-red-500 to-red-600';
    if (percentage >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  if (loading && usage.length === 0) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">Loading AI provider usage...</p>
          <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Gauge className="text-blue-400" size={32} />
              <h1 className="text-4xl font-bold text-white">AI Provider Usage</h1>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-gray-400 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4"
                />
                Auto-refresh (10s)
              </label>
              <button
                onClick={fetchUsage}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-gray-400 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
          <p className="text-gray-400">Real-time tracking of AI provider costs and token usage</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Total Cost Used</p>
            <p className="text-3xl font-bold text-blue-400">${totalCostUsed.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">of ${totalCostLimit.toFixed(2)} limit</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Usage Rate</p>
            <p className="text-3xl font-bold text-white">{totalPercentage.toFixed(1)}%</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getProgressBarColor(totalPercentage)}`}
                style={{ width: `${Math.min(100, totalPercentage)}%` }}
              />
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Providers</p>
            <p className="text-3xl font-bold text-white">{usage.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active providers</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Alerts</p>
            <div className="flex items-center gap-2">
              {criticalProviders > 0 && (
                <span className="text-lg font-bold text-red-400">{criticalProviders} 🔴</span>
              )}
              {warningProviders > 0 && (
                <span className="text-lg font-bold text-yellow-400">{warningProviders} 🟡</span>
              )}
              {criticalProviders === 0 && warningProviders === 0 && (
                <span className="text-lg font-bold text-green-400">All Good ✓</span>
              )}
            </div>
          </div>
        </div>

        {/* Providers Grid */}
        <div className="space-y-4">
          {usage.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No AI provider usage data available</p>
            </div>
          ) : (
            usage.map((provider) => {
              const costPercentage = (provider.costUsed / provider.costLimit) * 100;
              const tokenPercentage = (provider.tokensUsed / provider.tokenLimit) * 100;

              return (
                <div
                  key={provider.id}
                  className={`rounded-lg border p-6 transition-all ${getStatusBg(provider.status)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{provider.provider}</h3>
                        <span className="text-sm text-gray-400 bg-white/5 px-2 py-1 rounded">
                          {provider.model}
                        </span>
                        <div
                          className={`flex items-center gap-1 ${getStatusColor(provider.status)}`}
                        >
                          {provider.status === 'active' ? (
                            <CheckCircle size={16} />
                          ) : (
                            <AlertCircle size={16} />
                          )}
                          <span className="text-xs font-medium capitalize">{provider.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        ${provider.costUsed.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        of ${provider.costLimit.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Cost Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">Cost Usage</span>
                      <span className="text-xs font-medium text-white">
                        {costPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getProgressBarColor(
                          costPercentage
                        )}`}
                        style={{ width: `${Math.min(100, costPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Token Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400">Token Usage</span>
                      <span className="text-xs font-medium text-white">
                        {(provider.tokensUsed / 1000).toFixed(0)}K / {(provider.tokenLimit / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getProgressBarColor(
                          tokenPercentage
                        )}`}
                        style={{ width: `${Math.min(100, tokenPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Last updated:{' '}
                      {new Date(provider.lastUpdated).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    {provider.percentage > 0 && (
                      <div className="flex items-center gap-1 text-blue-400">
                        <TrendingUp size={12} />
                        {provider.percentage.toFixed(1)}% used
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
