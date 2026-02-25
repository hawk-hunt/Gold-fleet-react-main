import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { FaCar, FaUser, FaRoad, FaGasPump, FaTools, FaMapMarkerAlt, FaMoneyBillWave, FaChartLine, FaCheckCircle, FaExclamationCircle, FaPlus, FaSync } from 'react-icons/fa';
import StatCard from '../components/StatCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  LineChart,
  Line as RechartsLine,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PolarRadiusAxis,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  BarChart,
  Cell,
} from 'recharts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);


export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || user?.company_name || 'Fleet Manager';
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  
  // Analytics Data States
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [serviceComplianceData, setServiceComplianceData] = useState(null);
  const [timeToResolveData, setTimeToResolveData] = useState([]);
  const [priorityTrendsData, setPriorityTrendsData] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const toggleCard = (cardName) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardName]: !prev[cardName]
    }));
  };

  // ============= ANALYTICS HELPER FUNCTIONS =============
  const processMaintenanceData = useCallback((logs) => {
    if (!logs || logs.length === 0) {
      setServiceComplianceData({ dueServices: 0, completedServices: 0 });
      setTimeToResolveData([]);
      setPriorityTrendsData([]);
      return;
    }

    // Calculate Service Compliance
    const dueServices = logs.filter(log => log.status !== 'completed').length;
    const completedServices = logs.filter(log => log.status === 'completed').length;
    const compliancePercentage = dueServices + completedServices > 0 
      ? Math.round((completedServices / (dueServices + completedServices)) * 100) 
      : 0;
    
    setServiceComplianceData({
      dueServices,
      completedServices,
      percentage: compliancePercentage
    });

    // Group by Month for Time to Resolve
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    logs.forEach(log => {
      const date = new Date(log.created_at || new Date());
      const month = monthNames[date.getMonth()];
      
      if (!monthlyData[month]) {
        monthlyData[month] = { resolved: 0, daysToResolve: 0, count: 0 };
      }
      
      if (log.status === 'completed' && log.completed_at) {
        const startDate = new Date(log.created_at);
        const endDate = new Date(log.completed_at);
        const daysToResolve = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        monthlyData[month].daysToResolve += daysToResolve;
        monthlyData[month].resolved++;
      }
      monthlyData[month].count++;
    });

    const timeResolveChartData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      avgDays: data.resolved > 0 ? Math.round(data.daysToResolve / data.resolved) : 0,
      resolvedCount: data.resolved
    }));
    
    setTimeToResolveData(timeResolveChartData);

    // Group by Priority for Trends
    const priorityData = {};
    monthNames.forEach(month => {
      priorityData[month] = { emergency: 0, scheduled: 0, non_scheduled: 0 };
    });

    logs.forEach(log => {
      const date = new Date(log.created_at || new Date());
      const month = monthNames[date.getMonth()];
      const priority = log.priority_class || 'scheduled';
      
      if (priorityData[month]) {
        priorityData[month][priority.toLowerCase()] = (priorityData[month][priority.toLowerCase()] || 0) + 1;
      }
    });

    const priorityChartData = monthNames.map(month => ({
      month,
      ...priorityData[month]
    }));

    setPriorityTrendsData(priorityChartData);
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const [logsRes, vehiclesRes] = await Promise.all([
        api.get('/api/maintenance_logs').catch(() => ({ data: [] })),
        api.get('/api/vehicles').catch(() => ({ data: [] }))
      ]);
      
      const logs = logsRes?.data || [];
      const vehiclesData = vehiclesRes?.data || [];
      
      setMaintenanceLogs(logs);
      setVehicles(vehiclesData);
      processMaintenanceData(logs);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [processMaintenanceData]);

  const formatCurrency = (v) => {
    const n = Number(v || 0);
    try {
      return n.toLocaleString('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 });
    } catch {
      return `GHS ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
  };

  const formatNumber = (v, digits = 0) => {
    const n = Number(v || 0);
    return n.toLocaleString(undefined, { maximumFractionDigits: digits });
  };

  const refreshAllDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const statsResponse = await api.getDashboardStats();
      setStats(statsResponse);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyExpenses = statsResponse.monthly_expenses || {};
      const monthlyFuel = statsResponse.monthly_fuel_costs || {};
      const monthlyTrips = statsResponse.monthly_trips || {};
      
      const expensesData = months.map((_, i) => Number(monthlyExpenses[(i+1).toString()] || 0));
      const fuelData = months.map((_, i) => Number(monthlyFuel[(i+1).toString()] || 0));
      const tripsData = months.map((_, i) => Number(monthlyTrips[(i+1).toString()] || 0));

      // Monthly Trends Chart
      setChartData({
        labels: months,
        datasets: [
          {
            label: 'Total Expenses',
            data: expensesData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y',
          },
          {
            label: 'Fuel Costs',
            data: fuelData,
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y',
          },
        ],
      });

      // Fetch analytics data
      await fetchAnalyticsData();
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchAnalyticsData]);

  useEffect(() => {
    refreshAllDashboardData();
  }, [refreshAllDashboardData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 14,
          color: 'rgba(15,23,42,0.7)',
          font: { size: 12 }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
      }
    },
    elements: {
      line: {
        tension: 0.35,
        borderWidth: 2,
      },
      point: {
        radius: 3,
        hitRadius: 10,
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgba(15,23,42,0.65)', font: { size: 11 } },
        grid: { color: 'rgba(15,23,42,0.03)' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: 'rgba(15,23,42,0.65)', font: { size: 11 } },
        grid: { color: 'rgba(15,23,42,0.03)' }
      },
    },
    animation: {
      easing: 'easeOutQuart',
      duration: 600
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          color: 'rgba(15,23,42,0.7)',
          font: { size: 11 },
          padding: 15,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
      }
    },
    animation: {
      easing: 'easeOutQuart',
      duration: 600
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: 'rgba(15,23,42,0.65)', font: { size: 11 } },
        grid: { color: 'rgba(15,23,42,0.03)' }
      },
      y: {
        ticks: { color: 'rgba(15,23,42,0.65)', font: { size: 11 } },
        grid: { display: false }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading dashboard: {error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        )}

        {!loading && stats && (
          <>
            {/* Header Section */}
            <div className="flex flex-col items-center justify-center text-center py-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <h1 className="text-4xl font-bold text-gray-900">Fleet Dashboard</h1>
              <p className="mt-2 text-lg text-gray-600">Welcome back, <span className="font-semibold text-gray-900">{userName}</span>!</p>
              <p className="mt-1 text-sm text-gray-500">Manage and monitor your entire fleet at a glance</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<FaCar />}
                title="Total Vehicles"
                value={formatNumber(stats?.total_vehicles || 0)}
                description={`${stats?.active_vehicles || 0} active`}
                onClick={() => toggleCard('vehicles')}
              >
                {expandedCards.vehicles && (
                  <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                    <p>Your fleet has <span className="font-semibold text-gray-900">{formatNumber(stats?.total_vehicles)}</span> total vehicles with <span className="text-green-600 font-semibold">{stats?.active_vehicles}</span> currently active.</p>
                  </div>
                )}
              </StatCard>

              <StatCard
                icon={<FaUser />}
                title="Total Drivers"
                value={formatNumber(stats?.total_drivers || 0)}
                description={`${stats?.active_drivers || 0} on duty`}
                onClick={() => toggleCard('drivers')}
              >
                {expandedCards.drivers && (
                  <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                    <p><span className="font-semibold text-gray-900">{formatNumber(stats?.active_drivers)}</span> drivers are currently on duty out of <span className="font-semibold">{formatNumber(stats?.total_drivers)}</span> total.</p>
                  </div>
                )}
              </StatCard>

              <StatCard
                icon={<FaRoad />}
                title="Total Trips"
                value={formatNumber(stats?.total_trips || 0)}
                description={`${stats?.completed_trips || 0} completed`}
                onClick={() => toggleCard('trips')}
              >
                {expandedCards.trips && (
                  <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                    <p><span className="font-semibold text-green-600">{formatNumber(stats?.completed_trips)}</span> completed out of <span className="font-semibold">{formatNumber(stats?.total_trips)}</span> total trips.</p>
                  </div>
                )}
              </StatCard>

              <StatCard
                icon={<FaMoneyBillWave />}
                title="Total Expenses"
                value={formatCurrency(stats?.monthly_expenses ? Object.values(stats.monthly_expenses).reduce((a,b)=>a+Number(b||0),0) : 0)}
                description="This year"
                onClick={() => toggleCard('expense')}
              >
                {expandedCards.expense && (
                  <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
                    <p>Your total expenses for this year amount to <span className="font-semibold text-gray-900">{formatCurrency(stats?.monthly_expenses ? Object.values(stats.monthly_expenses).reduce((a,b)=>a+Number(b||0),0) : 0)}</span>.</p>
                  </div>
                )}
              </StatCard>
            </div>

            {/* Fleet Analytics Cards Grid - SQUARE LAYOUT */}
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Fleet Analytics</h2>
                <button
                  onClick={refreshAllDashboardData}
                  className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#CFAF4B' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b89938'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#CFAF4B'}
                >
                  <FaSync className="text-sm" />
                  Refresh
                </button>
              </div>

              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">

                  {/* SERVICE REMINDER COMPLIANCE CARD - SQUARE */}
                  <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Service Compliance</h3>
                      <FaTools className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                    </div>
                    <div className="flex items-center justify-center flex-1">
                      <div className="relative w-32 h-32">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#CFAF4B"
                            strokeWidth="8"
                            strokeDasharray={`${(serviceComplianceData?.percentage || 0) * 2.827} 282.7`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-900">{serviceComplianceData?.percentage || 0}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center space-y-2 mt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-bold text-gray-900">{serviceComplianceData?.completedServices || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-bold text-gray-900">{serviceComplianceData?.dueServices || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* TIME TO RESOLVE CARD - SQUARE */}
                  <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Time To Resolve</h3>
                      <FaChartLine className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                    </div>
                    {timeToResolveData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={timeToResolveData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#999" />
                          <YAxis stroke="#999" />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px' }}
                            labelStyle={{ color: '#333333' }}
                          />
                          <RechartsLine 
                            type="monotone" 
                            dataKey="avgDays" 
                            stroke="#CFAF4B" 
                            strokeWidth={3}
                            dot={{ fill: '#CFAF4B', r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-400">
                        No data available
                      </div>
                    )}
                  </div>

                  {/* REPAIR PRIORITY TRENDS CARD - SQUARE */}
                  <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Priority Trends</h3>
                      <FaExclamationCircle className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                    </div>
                    {priorityTrendsData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={priorityTrendsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#999" />
                          <YAxis stroke="#999" />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px' }}
                            labelStyle={{ color: '#333333' }}
                          />
                          <Area type="monotone" dataKey="emergency" stackId="1" fill="#ff6b6b" stroke="#ff6b6b" />
                          <Area type="monotone" dataKey="scheduled" stackId="1" fill="#CFAF4B" stroke="#CFAF4B" />
                          <Area type="monotone" dataKey="non_scheduled" stackId="1" fill="#CFAF4B" stroke="#CFAF4B" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-400">
                        No data available
                      </div>
                    )}
                  </div>

                  {/* ONBOARDING & QUICK ACTIONS - SQUARE */}
                  <div className="h-96 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow flex flex-col relative overflow-hidden" style={{ backgroundImage: "url('/images/pexels-onetrillionpixels-33336584.png')", backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                      <FaPlus className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                    </div>
                    
                    {vehicles.length < 1 ? (
                      <div className="flex-1 p-6 text-center flex flex-col justify-end items-center">
                        <button
                          onClick={() => navigate('/vehicles')}
                          className="w-full px-4 py-2 text-white rounded-lg font-medium transition-colors"
                          style={{ backgroundColor: '#CFAF4B' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#b89938'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#CFAF4B'}
                        >
                          Add Vehicle
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          <FaCheckCircle className="text-gray-900" />
                          <span className="text-gray-700 text-sm">Maintenance tasks</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          <FaTools className="text-gray-900" />
                          <span className="text-gray-700 text-sm">Schedule services</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                          <FaSync className="text-gray-900" />
                          <span className="text-gray-700 text-sm">Monitor fleet</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VEHICLES OVERVIEW - SQUARE */}
                  <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Vehicles Overview</h3>
                      <FaCar className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                    </div>
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-gray-600">Total Vehicles</span>
                        <span className="font-bold text-xl text-gray-900">{vehicles.length}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-gray-600">Active</span>
                        <span className="font-bold text-xl text-gray-900">{vehicles.filter(v => v.status === 'active').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Maintenance Due</span>
                        <span className="font-bold text-xl text-red-600">{maintenanceLogs.filter(l => l.status !== 'completed').length}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/vehicles')}
                      className="w-full mt-4 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: '#CFAF4B' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#b89938'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#CFAF4B'}
                    >
                      View All
                    </button>
                  </div>

                  {/* MAINTENANCE SUMMARY - SQUARE */}
                  <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Maintenance Status</h3>
                      <FaTools className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                    </div>
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-bold text-xl text-green-600">{maintenanceLogs.filter(l => l.status === 'completed').length}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-gray-600">In Progress</span>
                        <span className="font-bold text-xl text-blue-600">{maintenanceLogs.filter(l => l.status === 'in_progress').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-bold text-xl text-orange-600">{maintenanceLogs.filter(l => l.status === 'pending').length}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/services')}
                      className="w-full mt-4 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: '#CFAF4B' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#b89938'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#CFAF4B'}
                    >
                      Manage Services
                    </button>
                  </div>

                  {/* FLEET PERFORMANCE - SQUARE */}
                  <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Fleet Performance</h3>
                      <FaChartLine className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                    </div>
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 text-sm">Fleet Health</span>
                          <span className="font-bold text-gray-900">{stats ? Math.round((stats?.active_vehicles / stats?.total_vehicles) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all"
                            style={{
                              width: `${stats ? Math.round((stats?.active_vehicles / stats?.total_vehicles) * 100) : 0}%`,
                              backgroundColor: '#CFAF4B'
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 text-sm">Service Compliance</span>
                          <span className="font-bold text-gray-900">{serviceComplianceData?.percentage || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all"
                            style={{
                              width: `${serviceComplianceData?.percentage || 0}%`,
                              backgroundColor: '#CFAF4B'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/map')}
                      className="w-full mt-4 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                      style={{ backgroundColor: '#CFAF4B' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#b89938'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#CFAF4B'}
                    >
                      View Map
                    </button>
                  </div>

                  {/* ISSUE TRACKING - SQUARE */}
                  <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Issue Tracking</h3>
                      <FaExclamationCircle className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#ff6b6b' }} />
                    </div>
                    <div className="space-y-4 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-gray-600">Open Issues</span>
                        <span className="font-bold text-xl text-red-600">{stats?.recentIssues?.length || 0}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-gray-600">Overdue</span>
                        <span className="font-bold text-xl text-orange-600">{stats?.overdueIssues || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Resolution Rate</span>
                        <span className="font-bold text-xl text-green-600">{maintenanceLogs.length > 0 ? Math.round((maintenanceLogs.filter(l => l.status === 'completed').length / maintenanceLogs.length) * 100) : 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Analytic Cards Row 2 - SQUARE LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
              
              {/* TRIP ANALYTICS - SQUARE */}
              <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Trip Analytics</h3>
                  <FaRoad className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                </div>
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Total Trips</span>
                    <span className="font-bold text-xl text-gray-900">{stats?.total_trips || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-bold text-xl text-green-600">{stats?.completed_trips || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-bold text-xl text-blue-600">{(stats?.total_trips || 0) - (stats?.completed_trips || 0)}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/trips')}
                  className="w-full mt-4 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#CFAF4B' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b89938'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#CFAF4B'}
                >
                  View Trips
                </button>
              </div>

              {/* FUEL CONSUMPTION - SQUARE */}
              <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Fuel Management</h3>
                  <FaGasPump className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                </div>
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Total Fuel Cost</span>
                    <span className="font-bold text-xl text-gray-900">{formatCurrency(stats?.monthlyFuelCosts ? Object.values(stats.monthlyFuelCosts).reduce((a,b)=>a+Number(b||0),0) : 0)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-bold text-xl text-orange-600">{formatCurrency(stats?.monthlyFuelCosts?.[new Date().getMonth() + 1] || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg per Vehicle</span>
                    <span className="font-bold text-xl text-gray-900">{formatCurrency(stats?.totalVehicles > 0 ? (stats?.monthlyFuelCosts ? Object.values(stats.monthlyFuelCosts).reduce((a,b)=>a+Number(b||0),0) : 0) / stats?.totalVehicles : 0)}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/fuel-fillups')}
                  className="w-full mt-4 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#CFAF4B' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b89938'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#CFAF4B'}
                >
                  Log Fuel
                </button>
              </div>

              {/* EXPENSE TRACKING - SQUARE */}
              <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Expense Tracking</h3>
                  <FaMoneyBillWave className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                </div>
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Total Expenses</span>
                    <span className="font-bold text-xl text-gray-900">{formatCurrency(stats?.monthlyExpenses ? Object.values(stats.monthlyExpenses).reduce((a,b)=>a+Number(b||0),0) : 0)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-bold text-xl text-red-600">{formatCurrency(stats?.monthlyExpenses?.[new Date().getMonth() + 1] || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg per Trip</span>
                    <span className="font-bold text-xl text-gray-900">{formatCurrency(stats?.totalTrips > 0 ? (stats?.monthlyExpenses ? Object.values(stats.monthlyExpenses).reduce((a,b)=>a+Number(b||0),0) : 0) / stats?.totalTrips : 0)}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/expenses')}
                  className="w-full mt-4 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#CFAF4B' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b89938'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#CFAF4B'}
                >
                  View Expenses
                </button>
              </div>

              {/* DRIVER MANAGEMENT - SQUARE */}
              <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Driver Management</h3>
                  <FaUser className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                </div>
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Total Drivers</span>
                    <span className="font-bold text-xl text-gray-900">{stats?.totalDrivers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">On Duty</span>
                    <span className="font-bold text-xl text-green-600">{stats?.activeDrivers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Off Duty</span>
                    <span className="font-bold text-xl text-gray-600">{(stats?.totalDrivers || 0) - (stats?.activeDrivers || 0)}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/drivers')}
                  className="w-full mt-4 px-4 py-2 text-white rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#CFAF4B' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b89938'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#CFAF4B'}
                >
                  Manage Drivers
                </button>
              </div>
            </div>

            {/* Performance Metrics - Status Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              {/* Open Issues */}
              <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Open Issues</h3>
                  <FaExclamationCircle className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <div>
                      <div className="text-5xl font-bold text-red-600">{stats?.recentIssues?.length || 0}</div>
                      <div className="text-sm text-gray-600 mt-2 font-medium">Open Issues</div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">{stats?.overdueIssues || 0}</div>
                      <div className="text-sm text-gray-600 mt-1 font-medium">Overdue</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
                  <FaTools className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <div>
                      <div className="text-5xl font-bold text-blue-600">{stats?.upcomingServices?.length || 0}</div>
                      <div className="text-sm text-gray-600 mt-2 font-medium">Upcoming</div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">{stats?.overdueServices || 0}</div>
                      <div className="text-sm text-gray-600 mt-1 font-medium">Overdue</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Fleet */}
              <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Vehicle Fleet</h3>
                  <FaCar className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <div>
                      <div className="text-5xl font-bold text-green-600">{stats?.activeVehicles || 0}</div>
                      <div className="text-sm text-gray-600 mt-2 font-medium">Active</div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                    <div>
                      <div className="text-3xl font-bold text-gray-500">{(stats?.totalVehicles || 0) - (stats?.activeVehicles || 0)}</div>
                      <div className="text-sm text-gray-600 mt-1 font-medium">Inactive</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Driver Status */}
              <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Driver Status</h3>
                  <FaUser className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <div>
                      <div className="text-5xl font-bold text-green-600">{stats?.activeDrivers || 0}</div>
                      <div className="text-sm text-gray-600 mt-2 font-medium">On Duty</div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                    <div>
                      <div className="text-3xl font-bold text-purple-600">{(stats?.totalDrivers || 0) - (stats?.activeDrivers || 0)}</div>
                      <div className="text-sm text-gray-600 mt-1 font-medium">Off Duty</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Renewals */}
              <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Renewal Reminders</h3>
                  <FaChartLine className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <div>
                      <div className="text-5xl font-bold text-red-600">{stats?.overdueRenewals || 0}</div>
                      <div className="text-sm text-gray-600 mt-2 font-medium">Overdue</div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">{stats?.dueSoonRenewals || 0}</div>
                      <div className="text-sm text-gray-600 mt-1 font-medium">Due Soon</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fleet Operations */}
              <div className="h-96 rounded-xl p-6 shadow-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Fleet Operations</h3>
                  <FaRoad className="text-white p-2 rounded-lg text-2xl" style={{ backgroundColor: '#CFAF4B' }} />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <div>
                      <div className="text-5xl font-bold text-indigo-600">{stats?.totalTrips || 0}</div>
                      <div className="text-sm text-gray-600 mt-2 font-medium">Total Trips</div>
                    </div>
                    <div className="h-px bg-gray-200"></div>
                    <div>
                      <div className="text-3xl font-bold text-green-600">{stats?.completedTrips || 0}</div>
                      <div className="text-sm text-gray-600 mt-1 font-medium">Completed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Trend Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FaChartLine className="mr-2 text-gray-900" />
                    Monthly Expense & Fuel Trends
                  </h3>
                </div>
                {chartData ? (
                  <div className="relative h-80 w-full">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="relative h-80 w-full bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FaChartLine className="mx-auto w-12 h-12 text-gray-400" />
                      <p className="mt-2 text-gray-600 font-medium">No chart data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Summary Box */}
              <div className="bg-white border-2 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow" style={{ borderColor: '#CFAF4B' }}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaCheckCircle className="mr-2" style={{ color: '#CFAF4B' }} />
                  Quick Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-700 font-medium">Active Vehicles</span>
                    <span className="font-bold text-lg text-green-600">{stats?.activeVehicles || 0}/{stats?.totalVehicles || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-700 font-medium">On Duty Drivers</span>
                    <span className="font-bold text-lg text-green-600">{stats?.activeDrivers || 0}/{stats?.totalDrivers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-700 font-medium">Fleet Health</span>
                    <span className="font-bold text-lg text-gray-900">{Math.round((stats?.activeVehicles / stats?.totalVehicles) * 100) || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">Completed Trips</span>
                    <span className="font-bold text-lg text-gray-900">{stats?.completedTrips || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
