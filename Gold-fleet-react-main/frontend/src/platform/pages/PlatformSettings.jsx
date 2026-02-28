import React, { useState, useEffect, useCallback } from 'react';
import { FaCog, FaSave, FaSync } from 'react-icons/fa';
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

  const fetchSettings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaCog className="text-yellow-600" />
            Platform Settings
          </h1>
          <p className="text-gray-600 mt-2">Configure your SaaS platform</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
        >
          <FaSync className="text-sm" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      {/* Settings Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
            <input
              type="text"
              value={settings?.platformName || ''}
              onChange={(e) => handleInputChange('platformName', e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
            <input
              type="email"
              value={settings?.supportEmail || ''}
              onChange={(e) => handleInputChange('supportEmail', e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notification Email</label>
            <input
              type="email"
              value={settings?.notificationEmail || ''}
              onChange={(e) => handleInputChange('notificationEmail', e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
            />
          </div>
        </div>

        {/* Platform Limits */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900">Platform Limits</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Companies</label>
            <input
              type="number"
              value={settings?.maxCompanies || 0}
              onChange={(e) => handleInputChange('maxCompanies', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Vehicles Per Company</label>
            <input
              type="number"
              value={settings?.maxVehiclesPerCompany || 0}
              onChange={(e) => handleInputChange('maxVehiclesPerCompany', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
            />
          </div>
        </div>

        {/* Trial Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900">Trial Settings</h3>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings?.enableTrials || false}
              onChange={(e) => handleInputChange('enableTrials', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
            />
            <label className="text-gray-700">Enable Trial Accounts</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Trial Duration (days)</label>
            <input
              type="number"
              value={settings?.defaultTrialDays || 0}
              onChange={(e) => handleInputChange('defaultTrialDays', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
            />
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>

          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <input
              type="checkbox"
              checked={settings?.maintenanceMode || false}
              onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
              className="w-4 h-4 rounded border-red-300 text-red-600 focus:ring-red-500"
            />
            <label className="text-red-700 font-medium">Enable Maintenance Mode</label>
          </div>

          <p className="text-xs text-gray-600">
            When enabled, only platform owners can access the system. All tenant access will be blocked.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
      </div>
    </div>
  );
}
