import React, { useEffect, useState, useCallback } from 'react';
import { FaChartLine, FaSpinner, FaSync } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import platformApi from '../services/platformApi';

/**
 * Platform Analytics
 * SaaS metrics and analytics with light theme
 */
export default function PlatformAnalytics() {
  const [companyGrowth, setCompanyGrowth] = useState(null);
  const [tripsPerCompany, setTripsPerCompany] = useState(null);
  const [vehicleUsage, setVehicleUsage] = useState(null);
  const [subscriptionRevenue, setSubscriptionRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const growth = await platformApi.getCompanyGrowth();
      const trips = await platformApi.getTripsPerCompany();
      const vehicles = await platformApi.getVehicleUsage();
      const revenue = await platformApi.getSubscriptionRevenue();

      setCompanyGrowth(growth.data || defaultCompanyGrowth);
      setTripsPerCompany(trips.data || defaultTripsPerCompany);
      setVehicleUsage(vehicles.data || defaultVehicleUsage);
      setSubscriptionRevenue(revenue.data || defaultRevenue);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
      // Set default data on error
      setCompanyGrowth(defaultCompanyGrowth);
      setTripsPerCompany(defaultTripsPerCompany);
      setVehicleUsage(defaultVehicleUsage);
      setSubscriptionRevenue(defaultRevenue);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const defaultCompanyGrowth = [
    { month: 'Jan', registered: 12, active: 10 },
    { month: 'Feb', registered: 18, active: 14 },
    { month: 'Mar', registered: 22, active: 18 },
    { month: 'Apr', registered: 24, active: 20 },
    { month: 'May', registered: 24, active: 22 },
    { month: 'Jun', registered: 24, active: 24 },
  ];

  const defaultTripsPerCompany = [
    { company: 'ABC Logistics', trips: 145 },
    { company: 'Fast Delivery', trips: 128 },
    { company: 'Quick Transport', trips: 102 },
    { company: 'Modern Fleets', trips: 95 },
    { company: 'Peak Movers', trips: 87 },
  ];

  const defaultVehicleUsage = [
    { vehicle: 'Truck', usage: 65 },
    { vehicle: 'Van', usage: 45 },
    { vehicle: 'Car', usage: 35 },
    { vehicle: 'Motorcycle', usage: 25 },
  ];

  const defaultRevenue = [
    { month: 'Jan', basic: 8400, pro: 12000, enterprise: 15000 },
    { month: 'Feb', basic: 9200, pro: 14000, enterprise: 16000 },
    { month: 'Mar', basic: 10500, pro: 16000, enterprise: 18000 },
    { month: 'Apr', basic: 12000, pro: 18000, enterprise: 20000 },
    { month: 'May', basic: 13500, pro: 19000, enterprise: 22000 },
    { month: 'Jun', basic: 15000, pro: 20000, enterprise: 24000 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
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
            <FaChartLine className="text-yellow-600" />
            Platform Analytics
          </h1>
          <p className="text-gray-600 mt-2">Detailed SaaS Business Metrics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
        >
          <FaSync className="text-sm" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          Using demo data. {error}
        </div>
      )}

      {/* Company Growth Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaChartLine className="text-yellow-600" />
          Company Growth Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={companyGrowth}>
            <defs>
              <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#999" />
            <YAxis stroke="#999" />
            <RechartsTooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px' }}
              labelStyle={{ color: '#333333' }}
            />
            <RechartsLegend />
            <Area type="monotone" dataKey="registered" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRegistered)" />
            <Area type="monotone" dataKey="active" stroke="#fbbf24" fillOpacity={1} fill="url(#colorActive)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trips Per Company */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaChartLine className="text-yellow-600" />
          Top Companies by Trips
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tripsPerCompany}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="company" stroke="#999" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#999" />
            <RechartsTooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px' }}
              labelStyle={{ color: '#333333' }}
              formatter={(value) => [`${value} trips`, 'Trips']}
            />
            <Bar dataKey="trips" fill="#fbbf24" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Vehicle Usage */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaChartLine className="text-yellow-600" />
          Vehicle Type Usage
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vehicleUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="vehicle" stroke="#999" />
            <YAxis stroke="#999" />
            <RechartsTooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px' }}
              labelStyle={{ color: '#333333' }}
              formatter={(value) => [`${value}%`, 'Usage']}
            />
            <Bar dataKey="usage" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Plan */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaChartLine className="text-yellow-600" />
          Revenue by Subscription Plan
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={subscriptionRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#999" />
            <YAxis stroke="#999" />
            <RechartsTooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px' }}
              labelStyle={{ color: '#333333' }}
              formatter={(value) => `$${value}`}
            />
            <RechartsLegend />
            <Line type="monotone" dataKey="basic" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="pro" stroke="#fbbf24" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="enterprise" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
}
