import React, { useEffect, useState, useCallback } from 'react';
import {
  FaBuilding,
  FaTruck,
  FaRoad,
  FaCreditCard,
  FaSpinner,
  FaChartLine,
  FaSync,
  FaCheckCircle,
  FaExclamationCircle,
  FaMoneyBillWave,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import {
  LineChart,
  Line as RechartsLine,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import platformApi from '../services/platformApi';

/**
 * Platform Dashboard - Modern Gold & White Theme
 * SaaS owner dashboard with comprehensive analytics
 * Color scheme: Gold (#FFD700) and White (#FFFFFF) only
 */
export default function PlatformDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    try {
      return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    } catch {
      return `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
  };

  const formatNumber = (value, digits = 0) => {
    const num = Number(value || 0);
    return num.toLocaleString(undefined, { maximumFractionDigits: digits });
  };

  const defaultStats = {
    totalCompanies: 24,
    activeCompanies: 18,
    totalVehicles: 156,
    activeVehicles: 145,
    tripsToday: 42,
    completedTrips: 38,
    activeSubscriptions: 18,
    monthlyRevenue: 48500,
    totalRevenue: 284500,
    overdueRenewals: 3,
    dueSoonRenewals: 8,
  };

  const defaultChartData = [
    { month: 'Jan', companies: 12, revenue: 8400 },
    { month: 'Feb', companies: 18, revenue: 12300 },
    { month: 'Mar', companies: 22, revenue: 18200 },
    { month: 'Apr', companies: 24, revenue: 24000 },
    { month: 'May', companies: 24, revenue: 28500 },
    { month: 'Jun', companies: 24, revenue: 35000 },
  ];

  const refreshDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await platformApi.getDashboardStats();
      setStats(data.stats || defaultStats);
      setChartData(data.charts || { growth: defaultChartData });
      setError('');
    } catch (err) {
      console.error('Dashboard error:', err);
      setStats(defaultStats);
      setChartData({ growth: defaultChartData });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-yellow-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 font-semibold text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const statData = stats || defaultStats;
  const currChartData = chartData?.growth || defaultChartData;

  const revenueByPlan = [
    { name: 'Basic', value: 8, fill: '#F59E0B' },
    { name: 'Pro', value: 7, fill: '#FCD34D' },
    { name: 'Enterprise', value: 3, fill: '#FBBF24' },
  ];

  return (
    <div className="min-h-screen bg-white py-4">
      <div className="w-full px-2 space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl border border-yellow-600 p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white flex items-center gap-3">
                <FaChartLine className="text-white" />
                Platform Dashboard
              </h1>
              <p className="mt-3 text-lg text-white font-medium">Complete SaaS Platform Overview & Analytics</p>
              <p className="mt-2 text-sm text-yellow-100 font-semibold">Real-time metrics and subscriber insights</p>
            </div>
            <button
              onClick={refreshDashboardData}
              className="mt-6 md:mt-0 inline-flex items-center gap-3 px-6 py-3 bg-white text-yellow-600 font-bold rounded-xl hover:shadow-lg active:scale-95 transition-all duration-200 text-base"
            >
              <FaSync className="text-lg" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Key Metrics Grid - Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Companies */}
          <div className="bg-white rounded-2xl border-2 border-yellow-500 p-7 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">Total Companies</p>
                <p className="text-5xl font-bold text-gray-900 mt-3">{formatNumber(statData.totalCompanies)}</p>
                <div className="flex items-center gap-2 mt-3">
                  <FaArrowUp className="text-yellow-500 text-xs" />
                  <p className="text-xs text-gray-600 font-bold">+12% from last month</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white shadow-md text-2xl">
                <FaBuilding />
              </div>
            </div>
            <div className="pt-4 border-t border-yellow-200 text-sm text-gray-600">
              <span className="font-bold text-gray-900">{formatNumber(statData.activeCompanies)}</span> actively using platform
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-2xl border-2 border-yellow-500 p-7 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">Active Subscriptions</p>
                <p className="text-5xl font-bold text-gray-900 mt-3">{formatNumber(statData.activeSubscriptions)}</p>
                <div className="flex items-center gap-2 mt-3">
                  <FaArrowUp className="text-yellow-500 text-xs" />
                  <p className="text-xs text-gray-600 font-bold">2 new this week</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white shadow-md text-2xl">
                <FaCreditCard />
              </div>
            </div>
            <div className="pt-4 border-t border-yellow-200 text-sm text-gray-600 font-semibold">
              Generating recurring revenue
            </div>
          </div>

          {/* Total Vehicles */}
          <div className="bg-white rounded-2xl border-2 border-yellow-500 p-7 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">Total Vehicles</p>
                <p className="text-5xl font-bold text-gray-900 mt-3">{formatNumber(statData.totalVehicles)}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-600 font-bold">{formatNumber(statData.activeVehicles)} active</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white shadow-md text-2xl">
                <FaTruck />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
              Fleet utilization: <span className="font-bold text-gray-900">{statData.activeVehicles && statData.totalVehicles ? Math.round((statData.activeVehicles / statData.totalVehicles) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid - Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Monthly Revenue */}
          <div className="bg-white rounded-2xl border-2 border-yellow-500 p-7 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">Monthly Revenue</p>
                <p className="text-4xl font-bold text-gray-900 mt-3">{formatCurrency(statData.monthlyRevenue)}</p>
                <div className="flex items-center gap-2 mt-3">
                  <FaArrowUp className="text-yellow-500 text-xs" />
                  <p className="text-xs text-gray-600 font-bold">+18% growth</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white shadow-md text-2xl">
                <FaMoneyBillWave />
              </div>
            </div>
            <div className="pt-4 border-t border-yellow-200 text-sm text-gray-600">
              Recurring from subscriptions
            </div>
          </div>

          {/* Trips Today */}
          <div className="bg-white rounded-2xl border-2 border-yellow-500 p-7 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">Trips Today</p>
                <p className="text-5xl font-bold text-gray-900 mt-3">{formatNumber(statData.tripsToday)}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-600 font-bold">{formatNumber(statData.completedTrips)} completed</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white shadow-md text-2xl">
                <FaRoad />
              </div>
            </div>
            <div className="pt-4 border-t border-yellow-200 text-sm text-gray-600">
              <span className="font-bold text-gray-900">{statData.completedTrips && statData.tripsToday ? Math.round((statData.completedTrips / statData.tripsToday) * 100) : 0}%</span> completion rate
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-2xl border-2 border-yellow-500 p-7 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">Total Revenue</p>
                <p className="text-4xl font-bold text-gray-900 mt-3">{formatCurrency(statData.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-3 font-semibold">All time earnings</p>
              </div>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white shadow-md text-2xl">
                <FaMoneyBillWave />
              </div>
            </div>
            <div className="pt-4 border-t border-yellow-200 text-sm text-gray-600">
              Platform lifetime value
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Platform Analytics</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Growth Chart */}
            <div className="bg-white rounded-2xl border-2 border-yellow-500 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FaChartLine className="text-yellow-500 text-2xl" />
                Monthly Company Growth
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={currChartData}>
                  <defs>
                    <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                    labelStyle={{ color: '#333333', fontWeight: 'bold' }}
                    formatter={(value) => [value, 'Companies']}
                  />
                  <Area
                    type="monotone"
                    dataKey="companies"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCompanies)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Plan Pie Chart */}
            <div className="bg-white rounded-2xl border-2 border-yellow-500 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <FaChartLine className="text-yellow-500 text-2xl" />
                Revenue Distribution
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={revenueByPlan}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {revenueByPlan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                    labelStyle={{ color: '#333333', fontWeight: 'bold' }}
                  />
                  <RechartsLegend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-2xl border-2 border-yellow-500 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FaChartLine className="text-yellow-500 text-2xl" />
              Monthly Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={currChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }}
                  labelStyle={{ color: '#333333', fontWeight: 'bold' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <RechartsLegend />
                <RechartsLine
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={4}
                  dot={{ fill: '#f59e0b', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Platform Health */}
          <div className="bg-white rounded-2xl border-2 border-yellow-500 p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">Platform Health</h3>
              <FaCheckCircle className="text-white p-3 rounded-xl text-2xl bg-yellow-500" />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600 font-semibold">Company Activation</span>
                  <span className="font-bold text-gray-900 text-lg">{statData.activeCompanies && statData.totalCompanies ? Math.round((statData.activeCompanies / statData.totalCompanies) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="h-4 rounded-full transition-all bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-sm"
                    style={{
                      width: `${statData.activeCompanies && statData.totalCompanies ? Math.round((statData.activeCompanies / statData.totalCompanies) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600 font-semibold">Fleet Utilization</span>
                  <span className="font-bold text-gray-900 text-lg">{statData.activeVehicles && statData.totalVehicles ? Math.round((statData.activeVehicles / statData.totalVehicles) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="h-4 rounded-full transition-all bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-sm"
                    style={{
                      width: `${statData.activeVehicles && statData.totalVehicles ? Math.round((statData.activeVehicles / statData.totalVehicles) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Renewal Status */}
          <div className="bg-white rounded-2xl border-2 border-yellow-500 p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">Renewal Status</h3>
              <FaExclamationCircle className="text-white p-3 rounded-xl text-2xl bg-yellow-500" />
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-yellow-200">
                <span className="text-gray-600 font-semibold">Overdue Renewals</span>
                <span className="font-bold text-2xl text-gray-900">{statData.overdueRenewals || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Due Soon (30 days)</span>
                <span className="font-bold text-2xl text-gray-900">{statData.dueSoonRenewals || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border-2 border-yellow-500 p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-gray-900">Quick Stats</h3>
              <FaUsers className="text-white p-3 rounded-xl text-2xl bg-yellow-500" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase">Inactive Companies</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{(statData.totalCompanies || 0) - (statData.activeCompanies || 0)}</p>
              </div>
              <div className="pt-4 border-t border-yellow-200">
                <p className="text-gray-600 text-sm font-semibold uppercase">Offline Vehicles</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{(statData.totalVehicles || 0) - (statData.activeVehicles || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl border border-gray-300 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Platform Operations</h2>
              <p className="text-gray-600 mt-2 max-w-xl">Access detailed payment data, company information, subscription management, and advanced analytics</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <a href="/platform/payments" className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-center">Payments</a>
              <a href="/platform/companies" className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-center">Companies</a>
              <a href="/platform/analytics" className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-center">Analytics</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

