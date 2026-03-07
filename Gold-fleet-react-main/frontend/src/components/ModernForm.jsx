import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';

/**
 * Modern CRUD Form Component
 * Features: Professional gradient header, smooth form styling, better inputs, loading states
 */
export const ModernForm = ({
  title,
  subtitle = '',
  onSubmit,
  isLoading = false,
  error = '',
  isEditing = false,
  children,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl shadow-xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-40 -mt-40"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
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
              <button className="text-red-500 hover:text-red-700 text-xl">
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {/* Form Content */}
          <div className="p-8 space-y-6">
            {children}
          </div>

          {/* Form Footer */}
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
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 hover:shadow-lg disabled:cursor-not-allowed"
            >
              {isLoading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
              <FaSave /> {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Modern Form Field Components
 */
export const FormField = ({ label, error, required = false, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
  </div>
);

export const TextInput = ({
  label,
  error,
  required = false,
  placeholder = '',
  ...props
}) => (
  <FormField label={label} error={error} required={required}>
    <input
      placeholder={placeholder}
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
        error ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
      }`}
      {...props}
    />
  </FormField>
);

export const SelectInput = ({
  label,
  error,
  required = false,
  options = [],
  placeholder = 'Select an option',
  ...props
}) => (
  <FormField label={label} error={error} required={required}>
    <select
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
        error ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
      }`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </FormField>
);

export const TextAreaInput = ({
  label,
  error,
  required = false,
  placeholder = '',
  rows = 4,
  ...props
}) => (
  <FormField label={label} error={error} required={required}>
    <textarea
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none ${
        error ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
      }`}
      {...props}
    />
  </FormField>
);

export const FileInput = ({
  label,
  error,
  required = false,
  onChange,
  preview = null,
  ...props
}) => (
  <FormField label={label} error={error} required={required}>
    <div className="flex gap-4">
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
        />
      )}
      <div className="flex-1">
        <input
          type="file"
          onChange={onChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
          {...props}
        />
        <p className="mt-2 text-xs text-gray-500">
          PNG, JPG, GIF or WebP up to 50MB
        </p>
      </div>
    </div>
  </FormField>
);

/**
 * Grid layout for form fields
 */
export const FormGrid = ({ columns = 2, children }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
    {children}
  </div>
);

/**
 * Status Badge Component
 */
export const StatusBadge = ({ status, className = '' }) => {
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
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles.pending} ${className}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};
