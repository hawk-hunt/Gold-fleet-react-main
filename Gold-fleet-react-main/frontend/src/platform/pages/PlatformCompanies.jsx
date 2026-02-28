import React, { useEffect, useState, useCallback } from 'react';
import { FaBuilding, FaSpinner, FaPlus, FaSearch, FaChevronRight, FaSync } from 'react-icons/fa';
import platformApi from '../services/platformApi';

/**
 * Platform Companies
 * List all tenant companies in the SaaS with light theme
 */
export default function PlatformCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await platformApi.getCompanies(page, 10);
      setCompanies(data.data || data.companies || defaultCompanies);
    } catch (err) {
      setError(err.message);
      setCompanies(defaultCompanies);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const defaultCompanies = [
    {
      id: 1,
      name: 'ABC Logistics',
      email: 'contact@abc-logistics.com',
      status: 'active',
      vehicles: 15,
      drivers: 8,
      subscription: 'Pro',
      joinDate: '2024-01-15',
    },
    {
      id: 2,
      name: 'Fast Delivery Co',
      email: 'info@fastdelivery.com',
      status: 'active',
      vehicles: 22,
      drivers: 12,
      subscription: 'Enterprise',
      joinDate: '2024-02-20',
    },
    {
      id: 3,
      name: 'Quick Transport',
      email: 'admin@quicktransport.com',
      status: 'active',
      vehicles: 8,
      drivers: 4,
      subscription: 'Basic',
      joinDate: '2024-03-10',
    },
    {
      id: 4,
      name: 'Modern Fleets',
      email: 'support@modernfleets.com',
      status: 'trial',
      vehicles: 5,
      drivers: 3,
      subscription: 'Pro',
      joinDate: '2024-06-01',
    },
  ];

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading companies...</p>
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
            <FaBuilding className="text-yellow-600" />
            Tenant Companies
          </h1>
          <p className="text-gray-600 mt-2">Manage all companies on your platform</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCompanies}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            <FaSync className="text-sm" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors">
            <FaPlus /> Add Company
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          Using demo data. {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search companies by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
        />
      </div>

      {/* Responsive Grid for Mobile, Table for Desktop */}
      <div className="space-y-4 lg:space-y-0">
        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.email}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    company.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {company.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600">Vehicles</p>
                  <p className="font-semibold text-gray-900">{company.vehicles}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Drivers</p>
                  <p className="font-semibold text-gray-900">{company.drivers}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Plan</p>
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    {company.subscription}
                  </span>
                </div>
              </div>
              <button className="w-full mt-3 py-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors flex items-center justify-center gap-2">
                View Details <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Vehicles</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Drivers</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Plan</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">{company.name}</td>
                    <td className="px-6 py-4 text-gray-600">{company.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          company.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {company.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{company.vehicles}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{company.drivers}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        {company.subscription}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-yellow-600 hover:text-yellow-700 transition-colors">
                        <FaChevronRight />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg p-4 border border-gray-200">
        <p className="text-gray-600">
          Showing {filteredCompanies.length} of {companies.length} companies
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
