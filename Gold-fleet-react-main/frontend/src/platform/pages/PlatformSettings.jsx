import React, { useState, useEffect } from 'react';
import { FaCog, FaSpinner, FaSave } from 'react-icons/fa';
import platformApi from '../services/platformApi';

/**
 * Platform Settings
 * Platform owner configuration and settings
 */
export default function PlatformSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await platformApi.getSettings();
        setSettings(data.settings || defaultSettings);
      } catch (err) {
        setError(err.message);
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const defaultSettings = {
    platformName: 'Gold Fleet SaaS',
    supportEmail: 'support@goldfleet.com',
    maxCompanies: 100,
    maxVehiclesPerCompany: 500,
    enableTrials: true,
    defaultTrialDays: 14,
    maintenanceMode: false,
    notificationEmail: 'admin@goldfleet.com',
  };

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await platformApi.updateSettings(settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaCog className="text-yellow-500" />
          Platform Settings
        </h1>
        <p className="text-slate-400 mt-2">Configure your SaaS platform</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {/* Settings Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">General Settings</h3>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Platform Name</label>
            <input
              type="text"
              value={settings?.platformName || ''}
              onChange={(e) => handleInputChange('platformName', e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Support Email</label>
            <input
              type="email"
              value={settings?.supportEmail || ''}
              onChange={(e) => handleInputChange('supportEmail', e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Notification Email</label>
            <input
              type="email"
              value={settings?.notificationEmail || ''}
              onChange={(e) => handleInputChange('notificationEmail', e.target.value)}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
        </div>

        {/* Platform Limits */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Platform Limits</h3>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Companies</label>
            <input
              type="number"
              value={settings?.maxCompanies || 0}
              onChange={(e) => handleInputChange('maxCompanies', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Vehicles Per Company</label>
            <input
              type="number"
              value={settings?.maxVehiclesPerCompany || 0}
              onChange={(e) => handleInputChange('maxVehiclesPerCompany', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
        </div>

        {/* Trial Settings */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Trial Settings</h3>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings?.enableTrials || false}
              onChange={(e) => handleInputChange('enableTrials', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600/50 text-yellow-500 focus:ring-yellow-500"
            />
            <label className="text-slate-300">Enable Trial Accounts</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Default Trial Duration (days)</label>
            <input
              type="number"
              value={settings?.defaultTrialDays || 0}
              onChange={(e) => handleInputChange('defaultTrialDays', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">System Settings</h3>

          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <input
              type="checkbox"
              checked={settings?.maintenanceMode || false}
              onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
              className="w-4 h-4 rounded border-red-500/50 text-red-500 focus:ring-red-500"
            />
            <label className="text-red-400 font-medium">Enable Maintenance Mode</label>
          </div>

          <p className="text-xs text-slate-400">
            When enabled, only platform owners can access the system. All tenant access will be blocked.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <button className="px-6 py-2 bg-slate-700/50 text-slate-300 font-semibold rounded-lg hover:bg-slate-600/50 transition-all">
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all disabled:opacity-50"
        >
          <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
