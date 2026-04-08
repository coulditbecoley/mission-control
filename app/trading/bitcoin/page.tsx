'use client';

import { Bitcoin } from 'lucide-react';

export default function BitcoinPage() {
  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bitcoin className="text-orange-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Bitcoin</h1>
          </div>
          <p className="text-gray-400">BTC/USD • Coinbase</p>
        </div>

        {/* Live Chart Section */}
        <div className="bg-[#141829] border border-[#374151] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Live BTC/USD Chart</h2>
          <iframe
            src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=COINBASE:BTCUSD&interval=D&hide_top_toolbar=0&hide_legend=1&theme=dark"
            style={{
              width: '100%',
              height: '600px',
              border: 'none',
              borderRadius: '8px',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>

        {/* Daily Brief */}
        <div className="bg-[#141829] border border-[#374151] rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#374151]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Daily Brief</h2>
              <span className="text-xs text-gray-500">Updated daily at 8:00 AM EST</span>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {/* Placeholder for daily brief content */}
              <div className="bg-[#0a0e27] rounded-lg p-6 border border-[#374151]">
                <h3 className="text-lg font-semibold text-white mb-3">Market Overview</h3>
                <p className="text-gray-400 leading-relaxed">
                  Bitcoin trading analysis and outlook will update daily at 8:00 AM EST. 
                  This section tracks price action, key support/resistance levels, macro trends, and trading signals.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0a0e27] rounded-lg p-4 border border-[#374151]">
                  <p className="text-gray-400 text-sm mb-2">Key Support</p>
                  <p className="text-2xl font-bold text-white">$42,500</p>
                </div>
                <div className="bg-[#0a0e27] rounded-lg p-4 border border-[#374151]">
                  <p className="text-gray-400 text-sm mb-2">Key Resistance</p>
                  <p className="text-2xl font-bold text-white">$48,200</p>
                </div>
              </div>

              <div className="bg-[#0a0e27] rounded-lg p-6 border border-[#374151]">
                <h3 className="text-lg font-semibold text-white mb-3">Technical Analysis</h3>
                <div className="space-y-3 text-gray-400">
                  <p>📊 RSI: Neutral zone (45-55)</p>
                  <p>📈 MACD: Bullish crossover</p>
                  <p>📉 Moving Averages: Golden cross forming</p>
                  <p>🎯 Volume: Above 30-day average</p>
                </div>
              </div>

              <div className="bg-[#0a0e27] rounded-lg p-6 border border-[#374151]">
                <h3 className="text-lg font-semibold text-white mb-3">Macro Context</h3>
                <p className="text-gray-400 leading-relaxed">
                  Fed policy, inflation data, and institutional flows are key drivers. 
                  Watch for major economic announcements and on-chain metrics for confluence signals.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cron Schedule Notice */}
        <div className="mt-8 bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            💡 Daily Brief updates automatically every day at 8:00 AM EST via scheduled cron job
          </p>
        </div>
      </div>
    </div>
  );
}
