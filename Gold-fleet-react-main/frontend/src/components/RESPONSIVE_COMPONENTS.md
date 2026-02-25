/**
 * RESPONSIVE LAYOUT SYSTEM DOCUMENTATION
 * =============================================
 * 
 * This file documents the new responsive layout system components
 * created for the Gold Fleet React + Laravel application.
 * 
 * NEW COMPONENTS:
 * ✅ Header.jsx - Global top navigation bar with search, notifications, user menu
 * ✅ Card.jsx - Reusable card component for displaying content
 * ✅ CardGrid.jsx - Responsive grid layout for cards
 * ✅ StatCardsGrid.jsx - Pre-built grid for displaying statistics
 * ✅ PageHeader.jsx - Consistent page headers with titles and actions
 * ✅ DataTable.jsx - Responsive table/card view for data lists
 * 
 * UPDATED COMPONENTS:
 * ✅ Layout.jsx - Now includes Header globally
 * 
 * ==============================================
 * USAGE EXAMPLES
 * ==============================================
 */

/**
 * 1. STAT CARDS GRID
 * Display key metrics in a responsive grid
 */
export const StatCardsExample = () => {
  import StatCardsGrid from '@/components/StatCardsGrid';
  
  const stats = [
    {
      icon: '🚗',
      title: 'Total Vehicles',
      value: '24',
      subtitle: 'Active fleet',
      description: '5 under maintenance',
      trend: { positive: true, percentage: 12 }
    },
    {
      icon: '👨‍💼',
      title: 'Total Drivers',
      value: '18',
      subtitle: 'Active drivers',
      description: '2 on vacation',
      trend: { positive: false, percentage: 5 }
    },
    {
      icon: '📍',
      title: 'Fleet Distance',
      value: '1,240 mi',
      subtitle: 'This week',
      description: '+125 mi vs last week',
      trend: { positive: true, percentage: 8 }
    },
    {
      icon: '⚠️',
      title: 'Pending Issues',
      value: '3',
      subtitle: 'Need attention',
      description: '1 urgent',
      trend: { positive: false, percentage: 15 }
    }
  ];

  return <StatCardsGrid stats={stats} />;
};

/**
 * 2. CARD COMPONENT
 * Individual card for flexible content
 */
export const CardExample = () => {
  import Card from '@/components/Card';
  
  return (
    <Card
      icon="🔧"
      title="Recent Maintenance"
      subtitle="Last 30 days"
      footer={<a href="#" className="text-blue-600 text-sm">View all →</a>}
    >
      <div className="space-y-2">
        <p>Vehicle AB101 - Oil change</p>
        <p>Vehicle AC103 - Tire rotation</p>
      </div>
    </Card>
  );
};

/**
 * 3. CARD GRID
 * Use CardGrid for custom card layouts
 */
export const CardGridExample = () => {
  import CardGrid from '@/components/CardGrid';
  import Card from '@/components/Card';
  
  return (
    <CardGrid cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card title="Card 1">Content 1</Card>
      <Card title="Card 2">Content 2</Card>
      <Card title="Card 3">Content 3</Card>
    </CardGrid>
  );
};

/**
 * 4. PAGE HEADER
 * Add consistent headers to pages
 */
export const PageHeaderExample = () => {
  import PageHeader from '@/components/PageHeader';
  import Card from '@/components/Card';
  
  return (
    <>
      <PageHeader
        icon="🚗"
        title="Vehicles"
        description="Manage your fleet"
        backButton={{ label: 'Back', onClick: () => window.history.back() }}
        actions={[
          { label: 'Add Vehicle', primary: true, onClick: () => console.log('add') },
          { label: 'Export', onClick: () => console.log('export') }
        ]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Fleet Overview">Content here</Card>
      </div>
    </>
  );
};

/**
 * 5. DATA TABLE
 * Display data in responsive table/card format
 */
export const DataTableExample = () => {
  import DataTable from '@/components/DataTable';
  
  const columns = [
    { key: 'vehicle_id', label: 'Vehicle ID' },
    { key: 'driver_name', label: 'Driver' },
    { key: 'status', label: 'Status', render: (val) => <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{val}</span> },
    { key: 'mileage', label: 'Mileage' }
  ];
  
  const data = [
    { vehicle_id: 'AB101', driver_name: 'John Smith', status: 'Active', mileage: '145,230 mi' },
    { vehicle_id: 'AC103', driver_name: 'Jane Doe', status: 'In Maintenance', mileage: '98,450 mi' }
  ];
  
  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(row) => console.log('clicked', row)}
    />
  );
};

/**
 * 6. RESPONSIVE DASHBOARD
 * Complete dashboard example combining all components
 */
export const DashboardExample = () => {
  import { useState, useEffect } from 'react';
  import PageHeader from '@/components/PageHeader';
  import StatCardsGrid from '@/components/StatCardsGrid';
  import CardGrid from '@/components/CardGrid';
  import Card from '@/components/Card';
  import DataTable from '@/components/DataTable';
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      setLoading(true);
      try {
        // API call here
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { icon: '🚗', title: 'Vehicles', value: '24', trend: { positive: true, percentage: 12 } },
    { icon: '👨‍💼', title: 'Drivers', value: '18', trend: { positive: true, percentage: 8 } },
    { icon: '📊', title: 'Utilization', value: '92%', trend: { positive: true, percentage: 5 } },
    { icon: '⚠️', title: 'Issues', value: '3', trend: { positive: false, percentage: 15 } }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        icon="📊"
        title="Dashboard"
        description="Fleet overview and key metrics"
      />
      
      <StatCardsGrid stats={stats} loading={loading} />
      
      <CardGrid cols="grid-cols-1 lg:grid-cols-2">
        <Card title="Recent Activity">Recent activity content</Card>
        <Card title="Quick Stats">Quick stats content</Card>
      </CardGrid>
    </div>
  );
};

export default StatCardsExample;
