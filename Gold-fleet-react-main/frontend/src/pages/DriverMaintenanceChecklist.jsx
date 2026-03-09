import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaPlus, FaTrash } from 'react-icons/fa';
import { api } from '../services/api';

/**
 * DriverMaintenanceChecklist Component
 * Allows drivers to submit vehicle maintenance checklists
 * Checklist items get reported to company admin with notifications
 */
export default function DriverMaintenanceChecklist() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Default maintenance check items
  const DEFAULT_ITEMS = [
    { name: 'Brakes', checked: false, notes: '' },
    { name: 'Tires', checked: false, notes: '' },
    { name: 'Lights (Front & Back)', checked: false, notes: '' },
    { name: 'Engine Oil Level', checked: false, notes: '' },
    { name: 'Mirrors', checked: false, notes: '' },
    { name: 'Horn', checked: false, notes: '' },
    { name: 'Windshield Wipers', checked: false, notes: '' },
    { name: 'Battery', checked: false, notes: '' },
  ];

  const [formData, setFormData] = useState({
    vehicle_id: '',
    checklist_items: DEFAULT_ITEMS,
    notes: '',
    trip_id: null,
  });
  const [vehicles, setVehicles] = useState([]);

  // Load vehicles when component mounts
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await api.getVehicles();
      setVehicles(response.data || []);
    } catch (err) {
      setError('Failed to load vehicles');
      console.error(err);
    }
  };

  const handleVehicleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      vehicle_id: e.target.value,
    }));
  };

  const handleItemChecked = (index, checked) => {
    const newItems = [...formData.checklist_items];
    newItems[index].checked = checked;
    setFormData(prev => ({
      ...prev,
      checklist_items: newItems,
    }));
  };

  const handleItemNotesChange = (index, notes) => {
    const newItems = [...formData.checklist_items];
    newItems[index].notes = notes;
    setFormData(prev => ({
      ...prev,
      checklist_items: newItems,
    }));
  };

  const addCustomItem = () => {
    setFormData(prev => ({
      ...prev,
      checklist_items: [
        ...prev.checklist_items,
        { name: 'Custom Item', checked: false, notes: '' },
      ],
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist_items: prev.checklist_items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.vehicle_id) {
      setError('Please select a vehicle');
      setLoading(false);
      return;
    }

    try {
      const response = await api.submitMaintenanceChecklist(formData);

      setSuccess('Maintenance checklist submitted successfully! Your admin has been notified.');

      // Reset form
      setFormData({
        vehicle_id: '',
        checklist_items: DEFAULT_ITEMS.map(item => ({ ...item })),
        notes: '',
        trip_id: null,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/driver/dashboard');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit checklist'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkedCount = formData.checklist_items.filter(item => item.checked).length;
  const totalItems = formData.checklist_items.length;
  const completionPercentage = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Maintenance Checklist
          </h1>
          <p className="text-gray-600">
            Complete this checklist before or after your trip. Your admin will be notified.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Form Content */}
          <div className="p-8">
            {/* Vehicle Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Vehicle *
              </label>
              <select
                value={formData.vehicle_id}
                onChange={handleVehicleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                  </option>
                ))}
              </select>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Completion: {checkedCount} of {totalItems}
                </span>
                <span className="text-lg font-bold text-yellow-600">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Inspection Items
              </h2>
              <div className="space-y-4">
                {formData.checklist_items.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 transition"
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div className="flex items-center pt-1">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => handleItemChecked(index, e.target.checked)}
                          className="w-5 h-5 text-yellow-600 rounded cursor-pointer"
                        />
                      </div>

                      {/* Item Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {item.checked ? (
                            <FaCheckCircle className="text-green-500 text-lg flex-shrink-0" />
                          ) : (
                            <FaTimesCircle className="text-gray-300 text-lg flex-shrink-0" />
                          )}
                          <label className={`font-medium cursor-pointer ${
                            item.checked ? 'text-green-700 line-through' : 'text-gray-900'
                          }`}>
                            {item.name}
                          </label>
                        </div>

                        {/* Notes Input */}
                        <textarea
                          value={item.notes}
                          onChange={(e) => handleItemNotesChange(index, e.target.value)}
                          placeholder="Add notes if there's an issue..."
                          className="w-full mt-2 px-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none"
                          rows="2"
                        />
                      </div>

                      {/* Remove Button (for custom items) */}
                      {index >= DEFAULT_ITEMS.length && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 pt-2"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Item Button */}
              <button
                type="button"
                onClick={addCustomItem}
                className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-yellow-500 hover:text-yellow-600 transition flex items-center justify-center gap-2 font-medium"
              >
                <FaPlus /> Add Custom Item
              </button>
            </div>

            {/* General Notes */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional observations or concerns..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none"
                rows="4"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/driver/dashboard')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.vehicle_id}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Submitting...' : 'Submit Checklist'}
              </button>
            </div>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>✓ Your checklist will be submitted to your company admin</li>
            <li>✓ A notification will be sent to all admins immediately</li>
            <li>✓ Admins will review and provide feedback</li>
            <li>✓ You'll receive a notification when the review is complete</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
