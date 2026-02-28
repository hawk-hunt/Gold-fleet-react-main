import React, { useEffect, useState, useCallback } from 'react';
import { FaCreditCard, FaSpinner, FaPlus, FaSearch, FaChevronRight, FaSync } from 'react-icons/fa';
import platformApi from '../services/platformApi';

/**
 * Platform Subscriptions
 * Manage all tenant subscriptions with light theme
 */
export default function PlatformSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await platformApi.getSubscriptions(page, 10);
      setSubscriptions(data.data || data.subscriptions || defaultSubscriptions);
    } catch (err) {
      setError(err.message);
      setSubscriptions(defaultSubscriptions);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const defaultSubscriptions = [
    {
      id: 1,
      company: 'ABC Logistics',
      plan: 'Pro',
      status: 'active',
      monthlyPrice: 299,
      vehicles: 15,
      startDate: '2024-01-15',
      renewalDate: '2024-07-15',
      paymentStatus: 'paid',
    },
    {
      id: 2,
      company: 'Fast Delivery Co',
      plan: 'Enterprise',
      status: 'active',
      monthlyPrice: 999,
      vehicles: 50,
      startDate: '2024-02-20',
      renewalDate: '2024-08-20',
      paymentStatus: 'paid',
    },
    {
      id: 3,
      company: 'Quick Transport',
      plan: 'Basic',
      status: 'active',
      monthlyPrice: 99,
      vehicles: 5,
      startDate: '2024-03-10',
      renewalDate: '2024-09-10',
      paymentStatus: 'pending',
    },
    {
      id: 4,
      company: 'Modern Fleets',
      plan: 'Pro',
      status: 'trial',
      monthlyPrice: 0,
      vehicles: 10,
      startDate: '2024-06-01',
      renewalDate: '2024-07-01',
      paymentStatus: 'trial',
    },
  ];

  const filteredSubscriptions = subscriptions.filter((s) =>
    s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMonthlyRevenue = subscriptions
    .filter((s) => s.status === 'active' && s.paymentStatus === 'paid')
    .reduce((sum, s) => sum + s.monthlyPrice, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscriptions...</p>
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
            <FaCreditCard className="text-yellow-600" />
            Subscriptions
          </h1>
          <p className="text-gray-600 mt-2">Manage customer subscriptions and billing</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSubscriptions}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            <FaSync className="text-sm" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors">
            <FaPlus /> New Subscription
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          Using demo data. {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Revenue (Monthly)</p>
          <p className="text-3xl font-bold text-gray-900">${totalMonthlyRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1 font-medium">+12% from last month</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Active Subscriptions</p>
          <p className="text-3xl font-bold text-gray-900">
            {subscriptions.filter((s) => s.status === 'active').length}
          </p>
          <p className="text-xs text-green-600 mt-1 font-medium">All paid plans</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Trial Subscriptions</p>
          <p className="text-3xl font-bold text-gray-900">
            {subscriptions.filter((s) => s.status === 'trial').length}
          </p>
          <p className="text-xs text-blue-600 mt-1 font-medium">Converting to paid</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search subscriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
        />
      </div>

      {/* Subscriptions Table */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plan</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Monthly Price</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Renewal Date</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{sub.company}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">${sub.monthlyPrice}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : sub.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {sub.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{sub.renewalDate}</td>
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

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {filteredSubscriptions.map((sub) => (
          <div key={sub.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{sub.company}</h3>
                <p className="text-sm text-gray-600">Renewal: {sub.renewalDate}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                {sub.plan}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-600">Price</p>
                <p className="font-semibold text-gray-900">${sub.monthlyPrice}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {sub.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Payment</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  sub.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {sub.paymentStatus}
                </span>
              </div>
            </div>
            <button className="w-full mt-3 py-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors flex items-center justify-center gap-2">
              View Details <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg p-4 border border-gray-200">
        <p className="text-gray-600">
          Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
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
