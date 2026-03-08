import React, { useEffect, useState, useCallback } from 'react';
import {
  FaCreditCard,
  FaCheck,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaSync,
  FaEye,
  FaChartLine,
  FaDownload,
  FaArrowRight,
  FaInfo,
} from 'react-icons/fa';
import platformApi from '../../platform/services/platformApi';

/**
 * Payment Management Component
 * Displays all company payments, earnings breakdown, and verification status
 */
export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [companiesSummary, setCompaniesSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchPaymentData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch revenue stats
      const revenueData = await platformApi.getRevenueStats();

      // Fetch all payments
      const paymentsData = await platformApi.getAllPayments(1, 50);

      // Fetch companies summary
      const companiesData = await platformApi.getCompaniesSummary();

      if (revenueData.success) {
        setStats(revenueData.data);
      }
      if (paymentsData.success) {
        setPayments(paymentsData.data || []);
      }
      if (companiesData.success) {
        setCompaniesSummary(companiesData.data || []);
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
      setError(err.message || 'Failed to load payment data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVerifyPayment = async (paymentId) => {
    try {
      const data = await platformApi.verifyPayment(paymentId);
      if (data.success) {
        // Refresh payments list
        fetchPaymentData();
      } else {
        setError(data.error || 'Failed to verify payment');
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError(err.message || 'Failed to verify payment');
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <FaCheck className="text-yellow-700" />;
      case 'pending':
        return <FaClock className="text-yellow-700" />;
      case 'failed':
        return <FaTimesCircle className="text-yellow-700" />;
      default:
        return null;
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const statusMatch =
      filterStatus === 'all' || payment.payment_status === filterStatus;
    const companyMatch =
      filterCompany === 'all' || payment.company_id === parseInt(filterCompany);
    return statusMatch && companyMatch;
  });

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Payment Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-xl border border-yellow-200 p-6 shadow-lg">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <FaCreditCard className="text-yellow-700" />
              Payment Management
            </h1>
            <p className="mt-2 text-lg text-gray-600">Track and manage all company payments</p>
          </div>
          <button
            onClick={fetchPaymentData}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 border border-gray-300 text-yellow-700 font-semibold rounded-lg hover:bg-gray-200 hover:shadow-md active:scale-95 transition-all duration-200"
          >
            <FaSync className="text-sm" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-gray-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
            {error}
          </div>
        )}

        {/* Revenue Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Collected */}
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Collected</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.total_collected)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">From all payments</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-yellow-700">
                  <FaCreditCard />
                </div>
              </div>
            </div>

            {/* Platform Revenue */}
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Platform Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.platform_revenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{stats.commission_rate}% commission</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-yellow-700">
                  <FaChartLine />
                </div>
              </div>
            </div>

            {/* Company Earnings */}
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Company Earnings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.companies_total_earnings)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{100 - stats.commission_rate}% to companies</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-yellow-700">
                  <FaCreditCard />
                </div>
              </div>
            </div>

            {/* Payment Count */}
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Verified Payments</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.payment_count}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Confirmed transactions</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-yellow-700">
                  <FaCheck />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Companies Summary */}
        {companiesSummary.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Company Payment Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Total Paid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Company Earnings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Payments</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Last Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {companiesSummary.map((company) => (
                    <tr key={company.company_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{company.company_name}</p>
                        <p className="text-sm text-gray-500">{company.company_email}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatCurrency(company.total_paid)}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">
                        {formatCurrency(company.company_earnings)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{company.payment_count}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(company.last_payment_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-semibold text-yellow-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-yellow-700 mb-2">Company</label>
            <select
              value={filterCompany}
              onChange={(e) => {
                setFilterCompany(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all duration-200"
            >
              <option value="all">All Companies</option>
              {companiesSummary.map((company) => (
                <option key={company.company_id} value={company.company_id}>
                  {company.company_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden">
          <div className="p-6 border-b border-yellow-200">
            <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {paginatedPayments.length} of {filteredPayments.length} payments
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Platform Earnings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPayments.length > 0 ? (
                  paginatedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">#{payment.id}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{payment.company?.name}</p>
                        <p className="text-sm text-gray-500">{payment.company?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {payment.subscription?.plan?.name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(payment.simulated_amount)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900 font-semibold">
                          {formatCurrency(payment.platform_earnings)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                            payment.payment_status
                          )}`}
                        >
                          {getPaymentStatusIcon(payment.payment_status)}
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {payment.payment_status === 'pending' ? (
                          <button
                            onClick={() => handleVerifyPayment(payment.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold rounded-lg border border-yellow-200 hover:border-yellow-400 active:scale-95 transition-all duration-200 text-sm"
                          >
                            <FaCheck className="text-sm" /> Verify
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold rounded-lg border border-yellow-200 hover:border-yellow-400 active:scale-95 transition-all duration-200 text-sm"
                          >
                            <FaEye className="text-sm" /> View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-yellow-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {Math.ceil(filteredPayments.length / pageSize)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, Math.ceil(filteredPayments.length / pageSize))
                  )
                }
                disabled={currentPage >= Math.ceil(filteredPayments.length / pageSize)}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Payment Detail Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Payment ID</p>
                  <p className="text-lg font-semibold text-gray-900">#{selectedPayment.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-700">Status</p>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getPaymentStatusColor(
                      selectedPayment.payment_status
                    )}`}
                  >
                    {getPaymentStatusIcon(selectedPayment.payment_status)}
                    {selectedPayment.payment_status}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-yellow-700">Company</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPayment.company?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-700">Plan</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPayment.subscription?.plan?.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-yellow-700">Payment Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(selectedPayment.simulated_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-700">Payment Method</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPayment.payment_method?.replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="col-span-2 border-t pt-4">
                  <p className="text-sm font-medium text-yellow-700 mb-2">Earnings Breakdown</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600">Platform Earns (20%)</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(selectedPayment.platform_earnings)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600">Company Gets (80%)</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(selectedPayment.company_earnings)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 border-t pt-4">
                  <p className="text-sm font-medium text-yellow-700">Verified At</p>
                  <p className="text-gray-900">
                    {selectedPayment.verified_at
                      ? new Date(selectedPayment.verified_at).toLocaleString()
                      : 'Not verified'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPayment(null)}
                className="mt-6 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

