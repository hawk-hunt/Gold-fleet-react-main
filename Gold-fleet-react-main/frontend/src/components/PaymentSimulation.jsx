import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaPlus, FaTrash, FaCheck, FaCreditCard } from 'react-icons/fa';

export const PaymentSimulation = ({ selectedPlan, subscriptionId, onPaymentProcessed, onSimulationsUpdate }) => {
  const [simulations, setSimulations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    simulated_amount: selectedPlan?.price || 0,
    payment_method: 'credit_card',
    payment_date: new Date().toISOString().split('T')[0],
    due_date: '',
    card_number: '',
    expiry_date: '',
    cvc: '',
  });

  // Fetch payment simulations on component mount
  useEffect(() => {
    fetchPaymentSimulations();
  }, [subscriptionId]);

  // Notify parent when simulations list changes
  useEffect(() => {
    onSimulationsUpdate?.(simulations);
  }, [simulations, onSimulationsUpdate]);

  // Auto-update amount based on selected plan
  useEffect(() => {
    if (selectedPlan?.price !== undefined) {
      setFormData(prev => ({
        ...prev,
        simulated_amount: selectedPlan.price
      }));
    }
  }, [selectedPlan]);

  const fetchPaymentSimulations = async () => {
    try {
      setLoading(true);
      const response = await api.getPaymentSimulationsBySubscription(subscriptionId);
      setSimulations(Array.isArray(response) ? response : (response.data || []));
    } catch (err) {
      console.error('Error fetching payment simulations:', err);
      setError('Failed to load payment simulations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'simulated_amount' ? 
        (isNaN(value) ? value : Number(value)) : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        subscription_id: subscriptionId,
        ...formData,
        simulated_amount: Number(formData.simulated_amount),
        simulated_vehicles: 0,
        simulated_drivers: 0,
        simulated_users: 0,
      };

      if (editingId) {
        await api.updatePaymentSimulation(editingId, payload);
        setSuccess('Payment simulation updated successfully');
      } else {
        await api.createPaymentSimulation(payload);
        setSuccess('Payment simulation created successfully');
      }

      // Reset form
      setFormData({
        simulated_amount: selectedPlan?.price || 0,
        payment_method: 'credit_card',
        payment_date: new Date().toISOString().split('T')[0],
        due_date: '',
        card_number: '',
        expiry_date: '',
        cvc: '',
      });
      setShowForm(false);
      setEditingId(null);

      // Refresh list
      fetchPaymentSimulations();
      onPaymentProcessed?.();
    } catch (err) {
      console.error('Error:', err);
      if (err.data?.errors) {
        setError(Object.values(err.data.errors).flat().join(', '));
      } else {
        setError(err.message || 'Failed to save payment simulation');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (simulation) => {
    setEditingId(simulation.id);
    setFormData({
      simulated_amount: simulation.simulated_amount,
      payment_method: simulation.payment_method,
      payment_date: simulation.payment_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      due_date: simulation.due_date?.split('T')[0] || '',
      card_number: simulation.card_number || '',
      expiry_date: simulation.expiry_date || '',
      cvc: simulation.cvc || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment simulation?')) return;

    try {
      setLoading(true);
      await api.deletePaymentSimulation(id);
      setSuccess('Payment simulation deleted successfully');
      fetchPaymentSimulations();
    } catch (err) {
      setError('Failed to delete payment simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (id) => {
    try {
      setLoading(true);
      const simulation = simulations.find(s => s.id === id);
      await api.processPaymentSimulation(id, {
        payment_method: simulation.payment_method,
        payment_date: simulation.payment_date || new Date().toISOString(),
      });
      setSuccess('Payment processed successfully');
      fetchPaymentSimulations();
      onPaymentProcessed?.(id);
    } catch (err) {
      setError('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatPaymentMethod = (method) => {
    const methodMap = {
      'credit_card_visa': 'Credit Card (Visa)',
      'credit_card_mastercard': 'Credit Card (Mastercard)',
      'credit_card_amex': 'Credit Card (American Express)',
      'credit_card_discover': 'Credit Card (Discover)',
      'paypal': 'PayPal',
      'apple_pay': 'Apple Pay',
      'google_pay': 'Google Pay',
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'bank_transfer': 'Bank Transfer',
      'check': 'Check',
      'other': 'Other'
    };
    return methodMap[method] || method;
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Payment Simulation</h3>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                simulated_amount: selectedPlan?.price || 0,
                payment_method: 'credit_card',
                payment_date: new Date().toISOString().split('T')[0],
                due_date: '',
                card_number: '',
                expiry_date: '',
                cvc: '',
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
          >
            <FaPlus /> Add Payment
          </button>
        )}
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-300 text-green-800 rounded-lg flex items-center gap-2">
          <FaCheck /> {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h4 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Payment Simulation' : 'Create Payment Simulation'}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected Plan Information */}
            {selectedPlan && (
              <div className="bg-gray-700 p-4 rounded-lg space-y-2 mb-4">
                <h5 className="font-semibold text-amber-400">Selected Plan</h5>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-300">
                    <span className="font-semibold">Plan Name:</span> {selectedPlan.name}
                  </div>
                  <div className="text-gray-300">
                    <span className="font-semibold">Plan Price:</span> ${parseFloat(selectedPlan.price).toFixed(2)}/month
                  </div>
                  <div className="text-gray-300">
                    <span className="font-semibold">Trial Period:</span> {selectedPlan.trial_days} days
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Amount ($) - Auto-calculated from plan
                </label>
                <input
                  type="text"
                  value={`$${parseFloat(formData.simulated_amount).toFixed(2)}`}
                  disabled
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 text-gray-300 rounded-lg cursor-not-allowed"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-400 mt-1">Amount is automatically based on your selected plan</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-amber-500"
                >
                  <optgroup label="Credit & Debit Cards">
                    <option value="credit_card_visa">Credit Card (Visa)</option>
                    <option value="credit_card_mastercard">Credit Card (Mastercard)</option>
                    <option value="credit_card_amex">Credit Card (American Express)</option>
                    <option value="credit_card_discover">Credit Card (Discover)</option>
                  </optgroup>
                  <optgroup label="Digital Wallets">
                    <option value="paypal">PayPal</option>
                    <option value="apple_pay">Apple Pay</option>
                    <option value="google_pay">Google Pay</option>
                  </optgroup>
                  <optgroup label="Cryptocurrency">
                    <option value="bitcoin">Bitcoin</option>
                    <option value="ethereum">Ethereum</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="other">Other</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Card Payment Fields - Show only for credit card payments */}
            {formData.payment_method.includes('credit_card') && (
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h5 className="font-semibold text-amber-400 mb-4">Card Details</h5>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="card_number"
                      value={formData.card_number}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Expiry Date (MM/YY)
                      </label>
                      <input
                        type="text"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleInputChange}
                        placeholder="12/25"
                        maxLength="5"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        name="cvc"
                        value={formData.cvc}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {/* Removed - Notes field no longer displayed */}

            {/* Form Actions */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-600 transition"
              >
                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setError('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Simulations List */}
      {!loading && simulations.length === 0 && !showForm && (
        <div className="text-center py-8 text-gray-400">
          <p>No payment simulations yet. Create one to get started.</p>
        </div>
      )}

      {simulations.length > 0 && (
        <div className="space-y-3">
          {simulations.map((simulation) => (
            <div
              key={simulation.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-amber-500 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-semibold text-white">
                      ${Number(simulation.simulated_amount || 0).toFixed(2)}
                    </h5>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(
                        simulation.payment_status
                      )}`}
                    >
                      {simulation.payment_status?.charAt(0).toUpperCase() +
                        simulation.payment_status?.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Method: {formatPaymentMethod(simulation.payment_method)} | Date:{' '}
                    {new Date(simulation.payment_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {simulation.payment_status === 'pending' && (
                    <button
                      onClick={() => handleProcessPayment(simulation.id)}
                      disabled={loading}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1 disabled:bg-gray-600 transition"
                    >
                      <FaCreditCard className="w-4 h-4" /> Process
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(simulation)}
                    disabled={loading || simulation.payment_status !== 'pending'}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:bg-gray-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(simulation.id)}
                    disabled={loading}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1 disabled:bg-gray-600 transition"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && !showForm && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default PaymentSimulation;
