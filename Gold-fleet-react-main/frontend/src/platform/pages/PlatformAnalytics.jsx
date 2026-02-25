import React, { useEffect, useState } from 'react';
import { FaChartLine, FaSpinner } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import platformApi from '../services/platformApi';

/**
 * Platform Analytics
 * SaaS metrics and analytics
 */
export default function PlatformAnalytics() {
  const [companyGrowth, setCompanyGrowth] = useState(null);
  const [tripsPerCompany, setTripsPerCompany] = useState(null);
  const [vehicleUsage, setVehicleUsage] = useState(null);
  const [subscriptionRevenue, setSubscriptionRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
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
    };

    fetchAnalytics();
  }, []);

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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaChartLine className="text-yellow-500" />
          Platform Analytics
        </h1>
        <p className="text-slate-400 mt-2">Detailed SaaS Business Metrics</p>
      </div>

      {error && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
          Using demo data. {error}
        </div>
      )}

      {/* Company Growth Chart */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Company Growth Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={companyGrowth}>
            <defs>
              <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(226, 232, 240, 0.1)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="registered" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRegistered)" />
            <Area type="monotone" dataKey="active" stroke="#eab308" fillOpacity={1} fill="url(#colorActive)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trips Per Company */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Companies by Trips</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tripsPerCompany}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="company" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(226, 232, 240, 0.1)',
                borderRadius: '8px',
              }}
              formatter={(value) => [`${value} trips`, 'Trips']}
            />
            <Bar dataKey="trips" fill="#eab308" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Vehicle Usage */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Vehicle Type Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vehicleUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="vehicle" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(226, 232, 240, 0.1)',
              }}
              formatter={(value) => [`${value}%`, 'Usage']}
            />
            <Bar dataKey="usage" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue by Plan */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revenue by Subscription Plan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={subscriptionRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(226, 232, 240, 0.1)',
              }}
              formatter={(value) => `$${value}`}
            />
            <Legend />
            <Line type="monotone" dataKey="basic" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="pro" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="enterprise" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
