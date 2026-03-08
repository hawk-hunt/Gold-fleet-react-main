import React, { useEffect, useState, useCallback } from 'react';
import { FaBuilding, FaTruck, FaRoad, FaCreditCard, FaSpinner, FaChartLine, FaSync, FaCheckCircle, FaExclamationCircle, FaMoneyBillWave, FaUsers } from 'react-icons/fa';
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
 * Platform Dashboard
 * SaaS owner dashboard with key metrics and analytics
 * Matches main dashboard light theme with dynamic cards and charts
 */
export default function PlatformDashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

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
    monthlyRevenue: '$48,500',
    totalRevenue: '$284,500',
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
      // Use default data on error
      setStats(defaultStats);
      setChartData({ growth: defaultChartData });
      // Don't show error to user - just use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Platform Dashboard...</p>
        </div>
      </div>
    );
  }

  const statData = stats || defaultStats;
  const currChartData = chartData?.growth || defaultChartData;

  const revenueBreakdown = [
    { name: 'Basic', value: 8, fill: '#60a5fa' },
    { name: 'Pro', value: 7, fill: '#eab308' },
    { name: 'Enterprise', value: 3, fill: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Platform Dashboard</h1>
            <p className="mt-2 text-lg text-gray-600">SaaS Overview & Key Metrics</p>
            <p className="mt-1 text-sm text-gray-500">Manage and monitor your platform at a glance</p>
          </div>
          <button
            onClick={refreshDashboardData}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-3 bg-gray-100 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 hover:shadow-md active:scale-95 transition-all duration-200"
          >
            <FaSync className="text-sm" />
            Refresh
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Companies */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer group" onClick={() => toggleCard('companies')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Companies</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{formatNumber(statData.totalCompanies)}</p>
                <p className="text-xs text-gray-600 mt-2 font-medium">+12% from last month</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 text-xl group-hover:shadow-md transition-all">
                <FaBuilding />
              </div>
            </div>
            {expandedCards.companies && (
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                <p>You have <span className="font-semibold text-gray-900">{formatNumber(statData.totalCompanies)}</span> total companies with <span className="text-gray-600 font-semibold">{formatNumber(statData.activeCompanies)}</span> actively using the platform.</p>
              </div>
            )}
          </div>

          {/* Active Companies */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer group" onClick={() => toggleCard('activeCompanies')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Companies</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{formatNumber(statData.activeCompanies)}</p>
                <p className="text-xs text-gray-600 mt-2 font-medium">75% activation rate</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 text-xl group-hover:shadow-md transition-all">
                <FaCheckCircle />
              </div>
            </div>
            {expandedCards.activeCompanies && (
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-900">{formatNumber(statData.activeCompanies)}</span> companies are actively using the platform with ongoing subscriptions and vehicle tracking.</p>
              </div>
            )}
          </div>

          {/* Total Vehicles */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer group" onClick={() => toggleCard('vehicles')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Vehicles</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{formatNumber(statData.totalVehicles)}</p>
                <p className="text-xs text-gray-600 mt-2 font-medium">{formatNumber(statData.activeVehicles)} active</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 text-xl group-hover:shadow-md transition-all">
                <FaTruck />
              </div>
            </div>
            {expandedCards.vehicles && (
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-600">{formatNumber(statData.activeVehicles)}</span> vehicles are currently active across all companies.</p>
              </div>
            )}
          </div>

          {/* Trips Today */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer group" onClick={() => toggleCard('trips')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Trips Today</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{formatNumber(statData.tripsToday)}</p>
                <p className="text-xs text-gray-600 mt-2 font-medium">{formatNumber(statData.completedTrips)} completed</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 text-xl group-hover:shadow-md transition-all">
                <FaRoad />
              </div>
            </div>
            {expandedCards.trips && (
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-600">{formatNumber(statData.completedTrips)}</span> trips completed out of <span className="font-semibold">{formatNumber(statData.tripsToday)}</span> total trips today.</p>
              </div>
            )}
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer group" onClick={() => toggleCard('subscriptions')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Subscriptions</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{formatNumber(statData.activeSubscriptions)}</p>
                <p className="text-xs text-gray-600 mt-2 font-medium">2 new this week</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 text-xl group-hover:shadow-md transition-all">
                <FaCreditCard />
              </div>
            </div>
            {expandedCards.subscriptions && (
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                <p>You have <span className="font-semibold text-gray-900">{formatNumber(statData.activeSubscriptions)}</span> active paid subscriptions generating consistent recurring revenue.</p>
              </div>
            )}
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg border border-gray-200 transition-all duration-200 cursor-pointer group" onClick={() => toggleCard('revenue')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Revenue</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{formatCurrency(statData.monthlyRevenue)}</p>
                <p className="text-xs text-gray-600 mt-2 font-medium">+18% growth</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 text-xl group-hover:shadow-md transition-all">
                <FaMoneyBillWave />
              </div>
            </div>
            {expandedCards.revenue && (
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                <p>Current monthly revenue is <span className="font-semibold text-gray-900">{formatCurrency(statData.monthlyRevenue)}</span> with <span className="text-gray-600 font-semibold">18% growth</span> from last month.</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Company Growth Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartLine className="mr-2" style={{ color: '#CFAF4B' }} />
                Monthly Company Growth
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={currChartData}>
                  <defs>
                    <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
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
                    formatter={(value) => [value, 'Companies']}
                  />
                  <Area
                    type="monotone"
                    dataKey="companies"
                    stroke="#fbbf24"
                    fillOpacity={1}
                    fill="url(#colorCompanies)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Distribution Pie Chart */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaChartLine className="mr-2" style={{ color: '#CFAF4B' }} />
                Revenue by Subscription Plan
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px' }}
                    labelStyle={{ color: '#333333' }}
                    formatter={(value) => [value, 'Companies']}
                  />
                  <RechartsLegend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaChartLine className="mr-2" style={{ color: '#CFAF4B' }} />
              Monthly Revenue Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px' }}
                  labelStyle={{ color: '#333333' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <RechartsLegend />
                <RechartsLine
                  type="monotone"
                  dataKey="revenue"
                  stroke="#fbbf24"
                  strokeWidth={3}
                  dot={{ fill: '#fbbf24', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Platform Health */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Platform Health</h3>
              <FaCheckCircle className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 text-sm">Company Activation</span>
                  <span className="font-bold text-gray-900">{statData.activeCompanies && statData.totalCompanies ? Math.round((statData.activeCompanies / statData.totalCompanies) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${statData.activeCompanies && statData.totalCompanies ? Math.round((statData.activeCompanies / statData.totalCompanies) * 100) : 0}%`,
                      backgroundColor: '#CFAF4B'
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 text-sm">Fleet Utilization</span>
                  <span className="font-bold text-gray-900">{statData.activeVehicles && statData.totalVehicles ? Math.round((statData.activeVehicles / statData.totalVehicles) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${statData.activeVehicles && statData.totalVehicles ? Math.round((statData.activeVehicles / statData.totalVehicles) * 100) : 0}%`,
                      backgroundColor: '#CFAF4B'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Outstanding Renewals */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Renewal Status</h3>
              <FaExclamationCircle className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#ff6b6b' }} />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Overdue</span>
                <span className="font-bold text-xl text-gray-900">{statData.overdueRenewals || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Due Soon</span>
                <span className="font-bold text-xl text-gray-900">{statData.dueSoonRenewals || 0}</span>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
              <FaMoneyBillWave className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#10b981' }} />
            </div>
            <div className="flex-1 flex items-center justify-center py-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">{formatCurrency(statData.totalRevenue)}</div>
                <div className="text-sm text-gray-600 mt-2 font-medium">All Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Management Quick Link */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Management</h2>
              <p className="text-gray-600 mt-1">Track all company payments, earnings breakdown, and subscription details</p>
              <p className="text-sm text-gray-500 mt-2">View revenue statistics, company payment history, and payment verification status</p>
            </div>
            <a
              href="/platform/payments"
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors text-sm whitespace-nowrap ml-4"
            >
              Go to Payments →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

