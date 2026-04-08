'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  status: 'info' | 'success' | 'error' | 'warning';
}

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadLogs();
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error('Failed to load logs', e);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-900/20 border-l-4 border-green-500 text-green-300';
      case 'error':
        return 'bg-red-900/20 border-l-4 border-red-500 text-red-300';
      case 'warning':
        return 'bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-300';
      default:
        return 'bg-blue-900/20 border-l-4 border-blue-500 text-blue-300';
    }
  };

  const downloadLogs = () => {
    const content = logs.map((l) => `${l.timestamp} ${l.message}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-logs-${new Date().toISOString()}.txt`;
    a.click();
  };

  return (
    <div className="p-8 bg-[#0a0e27] min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Deployment Logs</h1>
          <p className="text-gray-400">Real-time deployment history and status</p>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={downloadLogs}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-[#141829] border border-[#374151] rounded-lg cursor-pointer hover:bg-[#1a1f3a]">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Auto-refresh (30s)</span>
          </label>
        </div>

        {/* Logs */}
        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-[#141829] border border-[#374151] rounded-lg">
              <p className="text-gray-500">No deployment logs yet</p>
            </div>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg font-mono text-sm ${getStatusColor(log.status)}`}
              >
                <div className="flex justify-between items-start">
                  <span>{log.message}</span>
                  <span className="text-xs opacity-70 whitespace-nowrap ml-4">{log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-[#141829] border border-[#374151] rounded-lg text-center">
            <p className="text-gray-400 text-sm">Total Entries</p>
            <p className="text-2xl font-bold text-white mt-2">{logs.length}</p>
          </div>
          <div className="p-4 bg-[#141829] border border-[#374151] rounded-lg text-center">
            <p className="text-gray-400 text-sm">Successful</p>
            <p className="text-2xl font-bold text-green-400 mt-2">
              {logs.filter((l) => l.message.includes('✓')).length}
            </p>
          </div>
          <div className="p-4 bg-[#141829] border border-[#374151] rounded-lg text-center">
            <p className="text-gray-400 text-sm">Failed</p>
            <p className="text-2xl font-bold text-red-400 mt-2">
              {logs.filter((l) => l.message.includes('✗')).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
