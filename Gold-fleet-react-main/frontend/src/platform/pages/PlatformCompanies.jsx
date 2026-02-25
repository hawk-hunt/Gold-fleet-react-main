import React, { useEffect, useState } from 'react';
import { FaBuilding, FaSpinner, FaPlus, FaSearch, FaChevronRight } from 'react-icons/fa';
import platformApi from '../services/platformApi';

/**
 * Platform Companies
 * List all tenant companies in the SaaS
 */
export default function PlatformCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCompanies = async () => {
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
    };

    fetchCompanies();
  }, [page]);

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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FaBuilding className="text-yellow-500" />
            Tenant Companies
          </h1>
          <p className="text-slate-400 mt-2">Manage all companies on your platform</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all">
          <FaPlus /> Add Company
        </button>
      </div>

      {error && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
          Using demo data. {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search companies by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 transition-colors"
        />
      </div>

      {/* Companies Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Company Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">Vehicles</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">Drivers</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">Plan</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 text-slate-200 font-medium">{company.name}</td>
                  <td className="px-6 py-4 text-slate-400">{company.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        company.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-300">{company.vehicles}</td>
                  <td className="px-6 py-4 text-center text-slate-300">{company.drivers}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">
                      {company.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                      <FaChevronRight />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400">
          Showing {filteredCompanies.length} of {companies.length} companies
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-600/50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
