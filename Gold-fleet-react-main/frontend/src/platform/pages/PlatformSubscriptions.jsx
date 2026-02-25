import React, { useEffect, useState } from 'react';
import { FaCreditCard, FaSpinner, FaPlus, FaSearch, FaChevronRight } from 'react-icons/fa';
import platformApi from '../services/platformApi';

/**
 * Platform Subscriptions
 * Manage all tenant subscriptions
 */
export default function PlatformSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchSubscriptions = async () => {
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
    };

    fetchSubscriptions();
  }, [page]);

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
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading subscriptions...</p>
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
            <FaCreditCard className="text-yellow-500" />
            Subscriptions
          </h1>
          <p className="text-slate-400 mt-2">Manage customer subscriptions and billing</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 font-semibold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all">
          <FaPlus /> New Subscription
        </button>
      </div>

      {error && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
          Using demo data. {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-yellow-500/20 rounded-lg p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Total Revenue (Monthly)</p>
          <p className="text-3xl font-bold text-white">${totalMonthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-green-500/20 rounded-lg p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Active Subscriptions</p>
          <p className="text-3xl font-bold text-white">
            {subscriptions.filter((s) => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-blue-500/20 rounded-lg p-6">
          <p className="text-slate-400 text-sm font-medium mb-2">Trial Subscriptions</p>
          <p className="text-3xl font-bold text-white">
            {subscriptions.filter((s) => s.status === 'trial').length}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search subscriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500 transition-colors"
        />
      </div>

      {/* Subscriptions Table */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-900/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Company</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Plan</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">Monthly Price</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">Payment</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Renewal Date</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4 text-slate-200 font-medium">{sub.company}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">
                      {sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-300">${sub.monthlyPrice}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.paymentStatus === 'paid'
                          ? 'bg-green-500/20 text-green-400'
                          : sub.paymentStatus === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {sub.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{sub.renewalDate}</td>
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
          Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
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
