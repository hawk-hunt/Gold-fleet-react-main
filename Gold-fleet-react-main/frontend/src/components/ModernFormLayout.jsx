import React from 'react';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

/**
 * Modern Two-Block Form Layout
 * Splits form into left and right columns with beautiful styling
 */
export const ModernFormLayout = ({
  title,
  subtitle = '',
  onSubmit,
  isLoading = false,
  error = '',
  isEditing = false,
  icon: Icon = null,
  leftBlock,  // React component for left column
  rightBlock, // React component for right column
  backUrl = -1,
}) => {
  const handleBack = () => {
    if (typeof backUrl === 'string') {
      window.location.href = backUrl;
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-2xl shadow-xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-40 -mt-40"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {Icon && <Icon className="text-white text-2xl" />}
                <h1 className="text-3xl font-bold text-white">{title}</h1>
                {isEditing && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                    EDIT
                  </span>
                )}
              </div>
              {subtitle && <p className="text-indigo-100 text-md">{subtitle}</p>}
            </div>
            
            <button
              onClick={handleBack}
              className="ml-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-xl transition-all duration-200 hover:scale-110"
              title="Go back"
            >
              <FaArrowLeft className="text-lg" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-red-800 font-semibold text-lg mb-1">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Two Column Form */}
        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Block */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-yellow-50 border-b border-gray-200 px-8 py-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-yellow-400 rounded"></div>
                Primary Information
              </h2>
            </div>
            <div className="p-8 space-y-6">
              {leftBlock}
            </div>
          </div>

          {/* Right Block */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-yellow-50 border-b border-gray-200 px-8 py-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-yellow-400 rounded"></div>
                Additional Details
              </h2>
            </div>
            <div className="p-8 space-y-6">
              {rightBlock}
            </div>
          </div>
        </form>

        {/* Form Footer */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              onClick={onSubmit}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isLoading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
              <FaSave /> {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Form Field Wrapper Component
 */
export const FormFieldGroup = ({ children }) => (
  <div className="space-y-6">
    {children}
  </div>
);

/**
 * Modern Form Input Components
 */
export const ModernTextInput = ({ label, error, required = false, helperText, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300 focus:ring-yellow-500'
      }`}
      {...props}
    />
    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
    {helperText && !error && <p className="text-gray-500 text-xs">{helperText}</p>}
  </div>
);

export const ModernSelectInput = ({ label, error, required = false, options = [], helperText, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300 focus:ring-yellow-500'
      }`}
      {...props}
    >
      <option value="">Select an option</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
    {helperText && !error && <p className="text-gray-500 text-xs">{helperText}</p>}
  </div>
);

export const ModernTextAreaInput = ({ label, error, required = false, rows = 4, helperText, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      rows={rows}
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300 focus:ring-yellow-500'
      }`}
      {...props}
    />
    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
    {helperText && !error && <p className="text-gray-500 text-xs">{helperText}</p>}
  </div>
);

export const ModernFileInput = ({ label, error, required = false, preview = null, helperText, onChange, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="flex gap-4">
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-24 h-24 object-cover rounded-lg border border-gray-200 flex-shrink-0"
        />
      )}
      <div className="flex-1">
        <input
          type="file"
          onChange={onChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-white hover:file:bg-yellow-600 transition-colors"
          {...props}
        />
        <p className="mt-2 text-xs text-gray-500">{helperText || 'PNG, JPG, GIF or WebP up to 50MB'}</p>
      </div>
    </div>
    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
  </div>
);

/**
 * Status Badge Component
 */
export const ModernStatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800 border border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    completed: 'bg-blue-100 text-blue-800 border border-blue-200',
    suspended: 'bg-red-100 text-red-800 border border-red-200',
    maintenance: 'bg-orange-100 text-orange-800 border border-orange-200',
    open: 'bg-red-100 text-red-800 border border-red-200',
    closed: 'bg-green-100 text-green-800 border border-green-200',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles.pending}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};
