import { useState, useRef } from 'react';
import { FaUpload, FaTimesCircle, FaTimes } from 'react-icons/fa';

export default function ManualIssueReport({ vehicleId, driverId, tripId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
  ];

  const commonProblems = [
    'Engine overheating',
    'Strange noise',
    'Brake failure',
    'Flat tire',
    'Accident',
    'GPS malfunction',
    'Battery issue',
    'Transmission problem',
    'Electrical issue',
    'Other',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5242880) {
        // 5MB limit
        setError('Photo must be less than 5MB');
        return;
      }

      setPhoto(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQuickSelect = (problem) => {
    setFormData((prev) => ({
      ...prev,
      title: problem,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Issue title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Issue description is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('vehicle_id', vehicleId);
      submitData.append('driver_id', driverId);
      submitData.append('trip_id', tripId);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('priority', formData.priority);
      submitData.append('reported_date', new Date().toISOString().split('T')[0]);

      if (photo) {
        submitData.append('photo', photo);
      }

      await onSubmit(submitData);
    } catch (err) {
      setError('Failed to submit issue report');
      console.error('Issue submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedPriority = priorityOptions.find((p) => p.value === formData.priority);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <FaTimesCircle className="text-red-600 text-2xl" />
          <h2 className="text-2xl font-bold text-gray-900">Report Vehicle Issue</h2>
        </div>
        <p className="text-gray-600">Submit a problem or concern about your vehicle</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Problem Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Common Problems (Click to select)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {commonProblems.map((problem) => (
              <button
                key={problem}
                type="button"
                onClick={() => handleQuickSelect(problem)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors text-left ${
                  formData.title === problem
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {problem}
              </button>
            ))}
          </div>
        </div>

        {/* Issue Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Title * <span className="text-gray-500 text-xs">(or select from above)</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief description of the issue"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Issue Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Provide detailed information about the issue - when did it start, what do you hear/see, etc."
            rows="4"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level *</label>
          <div className="grid grid-cols-4 gap-2">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: option.value,
                  }))
                }
                className={`py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                  formData.priority === option.value
                    ? `${option.color} ring-2 ring-offset-2 ring-blue-500`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className={`mt-2 text-sm px-3 py-2 rounded ${selectedPriority?.color}`}>
            <strong>{selectedPriority?.label} Priority:</strong>
            {selectedPriority?.value === 'low' && ' Can wait, discuss at next service'}
            {selectedPriority?.value === 'medium' && ' Should be addressed soon'}
            {selectedPriority?.value === 'high' && ' Needs attention before next trip'}
            {selectedPriority?.value === 'critical' && ' Stop using vehicle immediately'}
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Photo (Optional)
          </label>

          {photoPreview ? (
            <div className="relative mb-4">
              <img
                src={photoPreview}
                alt="Issue preview"
                className="max-w-full max-h-64 rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                <FaTimes />
              </button>
              <p className="text-sm text-gray-600 mt-2">File: {photo?.name}</p>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
            >
              <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
              <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* Report Info */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> When you submit this report, your company admin will be notified
            and can assign a mechanic to address the issue.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Issue Report'}
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
