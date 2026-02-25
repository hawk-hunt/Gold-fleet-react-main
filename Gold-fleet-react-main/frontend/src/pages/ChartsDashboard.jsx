import React from 'react';
import { AreaChart, LineChart, ColumnChart } from '../components/Charts';
import { chartService } from '../services/chartService';

const ChartsDashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Dashboard Charts</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Repair Priority Class - Area Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Repair Priority Class Trends</h2>
          <AreaChart
            title=""
            dataUrl={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/charts/repair-priority-class`}
            colors={['rgba(183, 190, 193, 0.75)', 'rgba(234, 53, 43, 0.75)', 'rgba(242, 170, 42, 0.75)', 'rgba(40, 164, 102, 0.75)']}
          />
        </div>

        {/* Time to Resolve - Line Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Time to Resolve</h2>
          <LineChart
            title=""
            dataUrl={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/charts/time-to-resolve`}
          />
        </div>

        {/* Fuel Costs - Column Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Fuel Costs</h2>
          <ColumnChart
            title=""
            dataUrl={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/charts/fuel-costs`}
            color="#34c398"
          />
        </div>

        {/* Service Costs - Column Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Service Costs</h2>
          <ColumnChart
            title=""
            dataUrl={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/charts/service-costs`}
            color="#FFC107"
          />
        </div>
      </div>
    </div>
  );
};

export default ChartsDashboard;
