import React, { useState, useEffect } from 'react';
import { AreaChart, LineChart, ColumnChart } from './Charts';
import { chartService } from '../services/chartService';

/**
 * Example of integrating charts into an existing dashboard
 * This shows how to use the chart components
 */
const DashboardWithCharts = () => {
  const [error, setError] = useState(null);

  return (
    <div className="w-full p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Row 1: Repair Priority & Time to Resolve */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Repair Priority Class Trends</h3>
            <button className="text-gray-400 hover:text-gray-600">⋯</button>
          </div>
          <AreaChart
            title=""
            dataUrl={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/charts/repair-priority-class`}
            colors={['rgba(183, 190, 193, 0.75)', 'rgba(234, 53, 43, 0.75)', 'rgba(242, 170, 42, 0.75)', 'rgba(40, 164, 102, 0.75)']}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Time to Resolve</h3>
            <button className="text-gray-400 hover:text-gray-600">⋯</button>
          </div>
          <LineChart
            title=""
            dataUrl={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/charts/time-to-resolve`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Row 2: Costs */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Fuel Costs</h3>
            <button className="text-gray-400 hover:text-gray-600">⋯</button>
          </div>
          <ColumnChart
            title=""
            dataUrl={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/charts/fuel-costs`}
            color="#34c398"
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Service Costs</h3>
            <button className="text-gray-400 hover:text-gray-600">⋯</button>
          </div>
          <ColumnChart
            title=""
            dataUrl={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/charts/service-costs`}
            color="#FFC107"
          />
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

export default DashboardWithCharts;
