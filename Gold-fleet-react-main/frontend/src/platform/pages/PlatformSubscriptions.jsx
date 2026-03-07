import React, { useEffect, useState, useCallback } from 'react';
import { FaCreditCard, FaSpinner, FaPlus, FaSearch, FaChevronRight, FaSync, FaCheckCircle, FaTimesCircle, FaPauseCircle, FaPlayCircle, FaEye } from 'react-icons/fa';
import platformApi from '../services/platformApi';

/**
 * Platform Subscriptions - Admin Management
 * View and manage all company subscriptions with payment simulations
 */
export default function PlatformSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformApi.getAllSubscriptionsWithSimulations(page, 10);
      setSubscriptions(data.data || []);
    } catch (err) {
      setError(err.message);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const fetchSubscriptionDetails = async (subscriptionId) => {
    setDetailLoading(true);
    try {
      const data = await platformApi.getSubscriptionWithSimulations(subscriptionId);
      setSubscriptionDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetails = async (subscriptionId) => {
    setSelectedSubscription(subscriptionId);
    await fetchSubscriptionDetails(subscriptionId);
    setShowDetailModal(true);
  };

  const handleActivate = async (subscriptionId) => {
    setActionLoading(subscriptionId);
    try {
      await platformApi.activateSubscription(subscriptionId);
      fetchSubscriptions();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to deactivate this subscription?')) return;
    setActionLoading(subscriptionId);
    try {
      await platformApi.deactivateSubscription(subscriptionId);
      fetchSubscriptions();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to suspend this subscription?')) return;
    setActionLoading(subscriptionId);
    try {
      await platformApi.suspendSubscription(subscriptionId);
      fetchSubscriptions();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResume = async (subscriptionId) => {
    setActionLoading(subscriptionId);
    try {
      await platformApi.resumeSubscription(subscriptionId);
      fetchSubscriptions();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSubscriptions = subscriptions.filter((item) => {
    const sub = item.subscription;
    const company = sub.company;
    const plan = sub.plan;
    
    return (
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTotalRevenue = () => {
    return subscriptions
      .filter(item => item.subscription.status === 'active')
      .reduce((sum, item) => sum + (item.plan_details.price * 12), 0);
  };

  const getActiveCount = () => {
    return subscriptions.filter(item => item.subscription.status === 'active').length;
  };

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
              Subscription Management
            </h1>
            <p className="text-gray-600 mt-2">Manage and monitor all company subscriptions</p>
          </div>
          <button
            onClick={fetchSubscriptions}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            <FaSync className="text-sm" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm font-medium mb-2">Annual Revenue (Active)</p>
            <p className="text-3xl font-bold text-gray-900">${getTotalRevenue().toLocaleString()}</p>
            <p className="text-xs text-green-600 mt-1 font-medium">From active subscriptions</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm font-medium mb-2">Active Subscriptions</p>
            <p className="text-3xl font-bold text-gray-900">{getActiveCount()}</p>
            <p className="text-xs text-green-600 mt-1 font-medium">Running plans</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Companies</p>
            <p className="text-3xl font-bold text-gray-900">{subscriptions.length}</p>
            <p className="text-xs text-blue-600 mt-1 font-medium">With subscriptions</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by company or plan..."
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
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Trial</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((item) => {
                  const sub = item.subscription;
                  const plan = item.plan_details;
                  const isInTrial = sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date();
                  
                  return (
                    <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">{sub.company.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                          {plan.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">${plan.price}/mo</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {isInTrial ? (
                          <span className="text-blue-600 font-medium">Active</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        {sub.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleSuspend(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded text-xs font-semibold disabled:opacity-50 transition"
                              title="Suspend subscription"
                            >
                              <FaPauseCircle className="w-3 h-3" /> Suspend
                            </button>
                            <button
                              onClick={() => handleDeactivate(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold disabled:opacity-50 transition"
                              title="Deactivate subscription"
                            >
                              <FaTimesCircle className="w-3 h-3" /> Deactivate
                            </button>
                          </>
                        )}
                        {sub.status === 'suspended' && (
                          <button
                            onClick={() => handleResume(sub.id)}
                            disabled={actionLoading === sub.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-semibold disabled:opacity-50 transition"
                            title="Resume subscription"
                          >
                            <FaPlayCircle className="w-3 h-3" /> Resume
                          </button>
                        )}
                        {(sub.status === 'cancelled' || sub.status === 'expired') && (
                          <button
                            onClick={() => handleActivate(sub.id)}
                            disabled={actionLoading === sub.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-semibold disabled:opacity-50 transition"
                            title="Activate subscription"
                          >
                            <FaCheckCircle className="w-3 h-3" /> Activate
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetails(sub.id)}
                          className="text-yellow-600 hover:text-yellow-700 transition-colors"
                          title="View details"
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {filteredSubscriptions.map((item) => {
            const sub = item.subscription;
            const plan = item.plan_details;
            const isInTrial = sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date();
            
            return (
              <div key={sub.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{sub.company.name}</h3>
                    <p className="text-sm text-gray-600">Plan: {plan.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">Price</p>
                    <p className="font-semibold text-gray-900">${plan.price}/mo</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Trial</p>
                    <p className={`font-semibold ${isInTrial ? 'text-blue-600' : 'text-gray-500'}`}>
                      {isInTrial ? 'Active' : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleViewDetails(sub.id)}
                    className="flex-1 py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-median rounded text-sm transition"
                  >
                    <FaEye className="inline mr-1" /> Details
                  </button>
                  {sub.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleSuspend(sub.id)}
                        className="flex-1 py-2 px-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded text-sm transition"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => handleDeactivate(sub.id)}
                        className="flex-1 py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded text-sm transition"
                      >
                        Deactivate
                      </button>
                    </>
                  )}
                  {sub.status === 'suspended' && (
                    <button
                      onClick={() => handleResume(sub.id)}
                      className="flex-1 py-2 px-3 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded text-sm transition"
                    >
                      Resume
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-gray-600">
            Showing {filteredSubscriptions.length} subscriptions
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

      {/* Detail Modal */}
      {showDetailModal && subscriptionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{subscriptionDetails.subscription.company.name}</h2>
                <p className="text-gray-300 text-sm mt-1">Plan: {subscriptionDetails.plan_details.name}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-300 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center">
                <FaSpinner className="animate-spin mx-auto text-4xl text-yellow-600 mb-4" />
                <p className="text-gray-600">Loading details...</p>
              </div>
            ) : (
              <div className="p-6 space-y-8">
                {/* Subscription Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Subscription Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscriptionDetails.subscription.status)}`}>
                          {subscriptionDetails.subscription.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Started</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(subscriptionDetails.subscription.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      {subscriptionDetails.subscription.trial_ends_at && (
                        <div>
                          <p className="text-xs text-gray-600">Trial Ends</p>
                          <p className={`font-semibold ${new Date(subscriptionDetails.subscription.trial_ends_at) > new Date() ? 'text-blue-600' : 'text-gray-900'}`}>
                            {new Date(subscriptionDetails.subscription.trial_ends_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {subscriptionDetails.subscription.expires_at && (
                        <div>
                          <p className="text-xs text-gray-600">Expires</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(subscriptionDetails.subscription.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Plan Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600">Plan Name</p>
                        <p className="font-semibold text-gray-900">{subscriptionDetails.plan_details.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Monthly Price</p>
                        <p className="font-semibold text-gray-900">${subscriptionDetails.plan_details.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Trial Days</p>
                        <p className="font-semibold text-gray-900">{subscriptionDetails.plan_details.trial_days} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Limits</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Vehicles: {subscriptionDetails.plan_details.max_vehicles || 'Unlimited'}</li>
                          <li>• Drivers: {subscriptionDetails.plan_details.max_drivers || 'Unlimited'}</li>
                          <li>• Users: {subscriptionDetails.plan_details.max_users || 'Unlimited'}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Simulations */}
                {subscriptionDetails.simulations && subscriptionDetails.simulations.length > 0 && (
                  <div className="border-t pt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Simulations</h3>
                    <div className="space-y-3">
                      {subscriptionDetails.simulations.map((sim) => (
                        <div key={sim.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">${sim.simulated_amount}</p>
                              <p className="text-sm text-gray-600">
                                Vehicles: {sim.simulated_vehicles}, Drivers: {sim.simulated_drivers}, Users: {sim.simulated_users}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Method: {sim.payment_method} | Date: {new Date(sim.payment_date).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              sim.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                              sim.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sim.payment_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!subscriptionDetails.simulations || subscriptionDetails.simulations.length === 0) && (
                  <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                    <p className="text-gray-600">No payment simulations yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
