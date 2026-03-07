import { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClipboardList } from 'react-icons/fa';

export default function VehicleInspectionChecklist({ vehicleId, driverId, onSubmit, onCancel }) {
  const inspectionItems = [
    { id: 'brakes', label: 'Brakes', icon: '🛑' },
    { id: 'tires', label: 'Tires', icon: '🛞' },
    { id: 'lights', label: 'Lights', icon: '💡' },
    { id: 'engine', label: 'Engine', icon: '⚙️' },
    { id: 'oil level', label: 'Oil Level', icon: '🛢️' },
    { id: 'mirrors', label: 'Mirrors', icon: '🪞' },
    { id: 'horn', label: 'Horn', icon: '🔔' },
  ];

  const [checklist, setChecklist] = useState(
    inspectionItems.reduce((acc, item) => {
      acc[item.id] = { status: null, notes: '' };
      return acc;
    }, {})
  );

  const [inspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleItemStatus = (itemId, status) => {
    setChecklist((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], status },
    }));
  };

  const handleItemNotes = (itemId, notes) => {
    setChecklist((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes },
    }));
  };

  const allItemsChecked = Object.values(checklist).every((item) => item.status !== null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allItemsChecked) {
      setError('Please check all items before submitting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const items = inspectionItems
        .filter((item) => checklist[item.id].status !== null)
        .map((item) => ({
          item_name: item.id,
          status: checklist[item.id].status,
          notes: checklist[item.id].notes,
        }));

      const inspectionData = {
        vehicle_id: vehicleId,
        driver_id: driverId,
        inspection_date: inspectionDate,
        notes: generalNotes || 'Vehicle inspection completed',
        result: Object.values(checklist).some((item) => item.status === 'fail') ? 'fail' : 'pass',
        items,
      };

      await onSubmit(inspectionData);
    } catch (err) {
      setError('Failed to submit inspection');
      console.error('Inspection submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const failedCount = Object.values(checklist).filter((item) => item.status === 'fail').length;
  const passedCount = Object.values(checklist).filter((item) => item.status === 'ok').length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <FaClipboardList className="text-yellow-600 text-2xl" />
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Inspection Checklist</h2>
        </div>
        <p className="text-gray-600">Complete the pre-trip inspection for your vehicle</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Progress Summary */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-gray-600 text-sm font-medium">Total Items</div>
          <div className="text-2xl font-bold text-blue-600">7</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-gray-600 text-sm font-medium">OK</div>
          <div className="text-2xl font-bold text-green-600">{passedCount}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-gray-600 text-sm font-medium">Issues</div>
          <div className="text-2xl font-bold text-red-600">{failedCount}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Inspection Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Inspection Items</h3>
          
          {inspectionItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.label}</h4>
                    <p className="text-xs text-gray-500 mt-1">Select OK or FAIL</p>
                  </div>
                </div>
              </div>

              {/* Status buttons */}
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => handleItemStatus(item.id, 'ok')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    checklist[item.id].status === 'ok'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  <FaCheckCircle />
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => handleItemStatus(item.id, 'fail')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    checklist[item.id].status === 'fail'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                  }`}
                >
                  <FaTimesCircle />
                  FAIL
                </button>
              </div>

              {/* Notes for failed items */}
              {checklist[item.id].status === 'fail' && (
                <input
                  type="text"
                  placeholder="Describe the issue..."
                  value={checklist[item.id].notes}
                  onChange={(e) => handleItemNotes(item.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              )}
            </div>
          ))}
        </div>

        {/* General Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">General Notes</label>
          <textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Add any additional observations about the vehicle condition"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Inspection Date */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Inspection Date:</strong> {new Date(inspectionDate).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={!allItemsChecked || loading}
            className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Inspection'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
