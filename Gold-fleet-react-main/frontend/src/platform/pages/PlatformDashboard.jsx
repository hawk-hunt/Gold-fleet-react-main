import React, { useEffect, useState } from 'react';
import { FaBuilding, FaTruck, FaRoad, FaCreditCard, FaSpinner, FaChartLine } from 'react-icons/fa';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import platformApi from '../services/platformApi';

/**
 * Platform Dashboard
 * SaaS owner dashboard with key metrics
 * Uses /main style with dynamic cards and charts
 */
export default function PlatformDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await platformApi.getDashboardStats();
        setStats(data.stats);
        setChartData(data.charts);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading Platform Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
        {error}
      </div>
    );
  }

  const defaultStats = {
    totalCompanies: 24,
    activeCompanies: 18,
    totalVehicles: 156,
    tripsToday: 42,
    activeSubscriptions: 18,
    monthlyRevenue: '$48,500',
  };

  const statData = stats || defaultStats;

  const defaultChartData = [
    { month: 'Jan', companies: 12, revenue: 8400 },
    { month: 'Feb', companies: 18, revenue: 12300 },
    { month: 'Mar', companies: 22, revenue: 18200 },
    { month: 'Apr', companies: 24, revenue: 24000 },
    { month: 'May', companies: 24, revenue: 28500 },
    { month: 'Jun', companies: 24, revenue: 35000 },
  ];

  const currChartData = chartData?.growth || defaultChartData;

  const revenueData = [
    { name: 'Basic', value: 30, fill: '#eab308' },
    { name: 'Pro', value: 45, fill: '#ca8a04' },
    { name: 'Enterprise', value: 25, fill: '#a16207' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaChartLine className="text-yellow-500" />
          Platform Dashboard
        </h1>
        <p className="text-slate-400 mt-2">SaaS Overview & Key Metrics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Companies */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-yellow-500/20 rounded-lg p-6 hover:border-yellow-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Total Companies</p>
              <p className="text-4xl font-bold text-white">{statData.totalCompanies}</p>
              <p className="text-xs text-green-400 mt-2">+12% from last month</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 text-xl">
              <FaBuilding />
            </div>
          </div>
        </div>

        {/* Active Companies */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-blue-500/20 rounded-lg p-6 hover:border-blue-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Active Companies</p>
              <p className="text-4xl font-bold text-white">{statData.activeCompanies}</p>
              <p className="text-xs text-emerald-400 mt-2">75% activation rate</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 text-xl">
              <FaBuilding />
            </div>
          </div>
        </div>

        {/* Total Vehicles */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-green-500/20 rounded-lg p-6 hover:border-green-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Total Vehicles</p>
              <p className="text-4xl font-bold text-white">{statData.totalVehicles}</p>
              <p className="text-xs text-emerald-400 mt-2">+8 vehicles this week</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 text-xl">
              <FaTruck />
            </div>
          </div>
        </div>

        {/* Trips Today */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Trips Today</p>
              <p className="text-4xl font-bold text-white">{statData.tripsToday}</p>
              <p className="text-xs text-emerald-400 mt-2">+5 from yesterday</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 text-xl">
              <FaRoad />
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Active Subscriptions</p>
              <p className="text-4xl font-bold text-white">{statData.activeSubscriptions}</p>
              <p className="text-xs text-emerald-400 mt-2">2 new this week</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 text-xl">
              <FaCreditCard />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-amber-500/20 rounded-lg p-6 hover:border-amber-500/40 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Monthly Revenue</p>
              <p className="text-4xl font-bold text-white">{statData.monthlyRevenue}</p>
              <p className="text-xs text-emerald-400 mt-2">+18% growth</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 text-xl">
              <FaChartLine />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Company Growth */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Company Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={currChartData}>
              <defs>
                <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
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
                formatter={(value) => [value, 'Companies']}
              />
              <Area
                type="monotone"
                dataKey="companies"
                stroke="#eab308"
                fillOpacity={1}
                fill="url(#colorCompanies)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Distribution */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Plan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {revenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(226, 232, 240, 0.1)',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={currChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.1)" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(226, 232, 240, 0.1)',
                borderRadius: '8px',
              }}
              formatter={(value) => [`$${value}`, 'Revenue']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#eab308"
              strokeWidth={2}
              dot={{ fill: '#fbbf24', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
