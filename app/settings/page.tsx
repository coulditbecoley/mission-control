'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Settings {
  phemex: {
    apiKey: string;
    apiSecret: string;
    enabled: boolean;
    lastSync?: string;
  };
  dashboard: {
    theme: 'dark' | 'light';
    refreshInterval: number;
    notifications: boolean;
  };
  trading: {
    defaultCurrency: string;
    showPnlPercent: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingPhemex, setTestingPhemex] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<Settings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        setSettings(data.settings);
        setFormData(data.settings);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handlePhemexChange = (field: 'apiKey' | 'apiSecret', value: string) => {
    if (formData) {
      setFormData({
        ...formData,
        phemex: {
          ...formData.phemex,
          [field]: value,
        },
      });
    }
  };

  const handleSavePhemex = async () => {
    if (!formData) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-phemex',
          settings: { phemex: formData.phemex },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setMessage({ type: 'success', text: 'Phemex settings saved!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestPhemex = async () => {
    if (!formData?.phemex.apiKey || !formData?.phemex.apiSecret) {
      setTestResult({ success: false, message: 'API Key and Secret are required' });
      return;
    }

    setTestingPhemex(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-phemex',
          settings: { phemex: formData.phemex },
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({ success: false, message: 'Test connection failed' });
    } finally {
      setTestingPhemex(false);
    }
  };

  const handleSaveDashboard = async () => {
    if (!formData) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-dashboard',
          settings: { dashboard: formData.dashboard },
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Dashboard settings saved!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Error saving settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  if (!settings || !formData) {
    return (
      <div className="flex-1 overflow-auto bg-[#0a0e27] flex items-center justify-center">
        <p className="text-gray-400">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#0a0e27]">
      <div className="p-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="text-blue-400" size={32} />
            <h1 className="text-4xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-gray-400">Configure your Asgard Dashboard</p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-900/20 border-green-800/50 text-green-300'
                : 'bg-red-900/20 border-red-800/50 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Phemex Settings */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Phemex Exchange API</h2>

          <div className="bg-[#141829] rounded-lg border border-[#374151] p-6 space-y-4">
            {/* API Key */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">API Key</label>
              <input
                type="password"
                value={formData.phemex.apiKey}
                onChange={(e) => handlePhemexChange('apiKey', e.target.value)}
                placeholder="Enter your Phemex API Key"
                className="w-full bg-[#1a1f3a] border border-[#374151] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.phemex.apiKey && (
                <p className="text-xs text-gray-500 mt-1">
                  Starts with: {formData.phemex.apiKey.substring(0, 8)}...
                </p>
              )}
            </div>

            {/* API Secret */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">API Secret</label>
              <input
                type="password"
                value={formData.phemex.apiSecret}
                onChange={(e) => handlePhemexChange('apiSecret', e.target.value)}
                placeholder="Enter your Phemex API Secret"
                className="w-full bg-[#1a1f3a] border border-[#374151] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.phemex.apiSecret && (
                <p className="text-xs text-gray-500 mt-1">
                  ✓ Secret is set and encrypted
                </p>
              )}
            </div>

            {/* Enable/Disable */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="phemex-enabled"
                checked={formData.phemex.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phemex: { ...formData.phemex, enabled: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-blue-500"
              />
              <label htmlFor="phemex-enabled" className="text-sm text-gray-300">
                Enable Phemex auto-sync (every 30 minutes)
              </label>
            </div>

            {formData.phemex.lastSync && (
              <p className="text-xs text-gray-500">
                Last synced: {new Date(formData.phemex.lastSync).toLocaleString()}
              </p>
            )}

            {/* Test Result */}
            {testResult && (
              <div
                className={`p-3 rounded-lg border ${
                  testResult.success
                    ? 'bg-green-900/20 border-green-800/50 text-green-300'
                    : 'bg-red-900/20 border-red-800/50 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {testResult.success ? <Check size={16} /> : <X size={16} />}
                  {testResult.message}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[#374151]">
              <Button
                onClick={handleTestPhemex}
                disabled={testingPhemex || !formData.phemex.apiKey || !formData.phemex.apiSecret}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
              >
                {testingPhemex ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button
                onClick={handleSavePhemex}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>

            <div className="text-xs text-gray-500 bg-[#0a0e27] p-3 rounded">
              <p className="font-semibold mb-1">How to get API credentials:</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Log into your Phemex account</li>
                <li>Go to Account → API Management</li>
                <li>Create a new API key with Read permissions</li>
                <li>Copy and paste the key and secret above</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Dashboard Settings */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Dashboard Settings</h2>

          <div className="bg-[#141829] rounded-lg border border-[#374151] p-6 space-y-4">
            {/* Refresh Interval */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Refresh Interval (minutes)</label>
              <input
                type="number"
                min="5"
                max="120"
                value={formData.dashboard.refreshInterval}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dashboard: {
                      ...formData.dashboard,
                      refreshInterval: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full bg-[#1a1f3a] border border-[#374151] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                How often to refresh data from the dashboard
              </p>
            </div>

            {/* Notifications */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifications"
                checked={formData.dashboard.notifications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dashboard: {
                      ...formData.dashboard,
                      notifications: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-blue-500"
              />
              <label htmlFor="notifications" className="text-sm text-gray-300">
                Enable notifications
              </label>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t border-[#374151]">
              <Button
                onClick={handleSaveDashboard}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </section>

        {/* Trading Settings */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Trading Settings</h2>

          <div className="bg-[#141829] rounded-lg border border-[#374151] p-6 space-y-4">
            {/* Default Currency */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Default Currency</label>
              <select
                value={formData.trading.defaultCurrency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trading: {
                      ...formData.trading,
                      defaultCurrency: e.target.value,
                    },
                  })
                }
                className="w-full bg-[#1a1f3a] border border-[#374151] text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>

            {/* Show P&L Percent */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pnl-percent"
                checked={formData.trading.showPnlPercent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trading: {
                      ...formData.trading,
                      showPnlPercent: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-blue-500"
              />
              <label htmlFor="pnl-percent" className="text-sm text-gray-300">
                Show P&L as percentage
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
