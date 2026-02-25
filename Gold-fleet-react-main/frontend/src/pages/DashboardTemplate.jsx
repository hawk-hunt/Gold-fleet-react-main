/**
 * DASHBOARD PAGE EXAMPLE
 * Shows how to use all new responsive components together
 * This is a template - copy and adapt for your actual pages
 */

import { useState, useEffect } from 'react';
import './dashboard.css';
import PageHeader from '../components/PageHeader';
import StatCardsGrid from '../components/StatCardsGrid';
import CardGrid from '../components/CardGrid';
import Card from '../components/Card';
import DataTable from '../components/DataTable';

export default function DashboardTemplate() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [recentDataset, setRecentData] = useState([]);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Example: Fetch stats from Laravel API
        const response = await fetch('http://localhost:8000/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`,
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Transform API response to stat cards format
          setStats([
            {
              icon: '🚗',
              title: 'Total Vehicles',
              value: data.total_vehicles || '0',
              subtitle: 'Active fleet',
              description: `${data.maintenance_count || 0} under maintenance`,
              trend: { positive: data.vehicle_trend?.positive, percentage: data.vehicle_trend?.percentage }
            },
            {
              icon: '👨‍💼',
              title: 'Total Drivers',
              value: data.total_drivers || '0',
              subtitle: 'Active drivers',
              description: `${data.inactive_drivers || 0} inactive`,
              trend: { positive: data.driver_trend?.positive, percentage: data.driver_trend?.percentage }
            },
            {
              icon: '📍',
              title: 'Fleet Distance',
              value: (data.total_distance || 0) + ' mi',
              subtitle: 'This week',
              description: '+' + (data.distance_increase || 0) + ' mi vs last week',
              trend: { positive: true, percentage: data.distance_percentage || 0 }
            },
            {
              icon: '⚠️',
              title: 'Pending Issues',
              value: data.pending_issues || '0',
              subtitle: 'Need attention',
              description: `${data.urgent_issues || 0} urgent`,
              trend: { positive: data.issues_trend?.positive, percentage: data.issues_trend?.percentage }
            }
          ]);

          // Get recent data
          setRecentData(data.recent_vehicles || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Table columns configuration
  const vehicleColumns = [
    { key: 'vehicle_id', label: 'Vehicle ID' },
    { key: 'driver_name', label: 'Driver' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            val === 'Active'
              ? 'bg-green-100 text-green-800'
              : val === 'In Maintenance'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {val}
        </span>
      )
    },
    { key: 'mileage', label: 'Mileage' },
    { key: 'last_service', label: 'Last Service' }
  ];

  return (
    <div className="space-y-8 dashboard-root">
      {/* Page Header */}
      <PageHeader
        icon="📊"
        title="Dashboard"
        description="Fleet overview and key metrics"
      />

      {/* Stats Grid - Responsive 1/2/3/4 columns based on screen size */}
      <StatCardsGrid
        stats={stats}
        loading={loading}
        cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      />

      {/* Main Content Grid - 2 columns on large, 1 on mobile */}
      <CardGrid cols="grid-cols-1 lg:grid-cols-2" gap="gap-6">
        {/* Chart Card */}
        <Card
          icon="📈"
          title="Fleet Performance"
          subtitle="Last 30 days"
          loading={loading}
        >
          <div className="h-64 bg-gradient-to-br from-blue-50 to-gray-50 rounded flex items-center justify-center">
            {/* Your chart component here */}
            <span className="text-gray-400">Chart placeholder</span>
          </div>
        </Card>

        {/* Stats Card */}
        <Card
          icon="📊"
          title="Quick Stats"
          subtitle="Current period"
          loading={loading}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Utilization</span>
              <span className="text-lg font-semibold text-blue-600">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600">Fuel Efficiency</span>
              <span className="text-lg font-semibold text-green-600">8.5 MPG</span>
            </div>
          </div>
        </Card>
      </CardGrid>

      {/* Data Table - Responsive table/card view */}
      <Card
        icon="🚗"
        title="Recent Vehicles"
        subtitle="Last updated activity"
        footer={
          <a href="/vehicles" className="text-blue-600 text-sm font-medium hover:text-blue-700">
            View all vehicles →
          </a>
        }
      >
        <DataTable
          columns={vehicleColumns}
          data={recentDataset}
          loading={loading}
          onRowClick={(row) => console.log('Navigate to vehicle:', row)}
        />
      </Card>

      {/* Additional Info Cards */}
      <CardGrid cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" gap="gap-6">
        <Card icon="🔧" title="Scheduled Maintenance">
          <p className="text-gray-600">5 vehicles scheduled for service</p>
          <a href="/maintenance" className="text-blue-600 text-sm mt-2 inline-block">
            View schedule →
          </a>
        </Card>

        <Card icon="⛽" title="Fuel Status">
          <p className="text-gray-600">85% of fleet tanks full</p>
          <a href="/fuel" className="text-blue-600 text-sm mt-2 inline-block">
            View details →
          </a>
        </Card>

        <Card icon="📍" title="GPS Status">
          <p className="text-gray-600">All 24 vehicles tracked</p>
          <a href="/locations" className="text-blue-600 text-sm mt-2 inline-block">
            View map →
          </a>
        </Card>
      </CardGrid>
    </div>
  );
}
