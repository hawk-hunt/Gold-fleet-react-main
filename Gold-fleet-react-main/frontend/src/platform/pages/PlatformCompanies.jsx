import React, { useEffect, useState, useCallback } from 'react';
import { FaBuilding, FaSpinner, FaPlus, FaSearch, FaChevronRight, FaSync, FaTrash, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import platformApi from '../services/platformApi';

/**
 * Platform Companies
 * List all tenant companies in the SaaS with light theme
 */
export default function PlatformCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await platformApi.getCompanies(page, 10);
      setCompanies(data.data || data.companies || []);
    } catch (err) {
      setError(err.message);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;

    setDeleting(true);
    try {
      const result = await platformApi.deleteCompany(selectedCompany.id);
      setSuccessMessage(result.message || `Company '${selectedCompany.name}' deleted successfully`);
      setShowDeleteConfirm(false);
      setSelectedCompany(null);
      
      // Refresh the list
      setTimeout(() => {
        fetchCompanies();
        setSuccessMessage('');
      }, 2000);
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const defaultCompanies = [
    {
      id: 1,
      name: 'ABC Logistics',
      email: 'contact@abc-logistics.com',
      status: 'active',
      vehicles: 15,
      drivers: 8,
      subscription: 'Pro',
      joinDate: '2024-01-15',
    },
  ];

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-300 text-green-800 rounded-lg flex items-center gap-3">
            <FaSync className="animate-spin" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && !successMessage && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-800 rounded-lg">
            {error}
          </div>
        )}

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search companies by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaBuilding className="text-yellow-600" />
            Tenant Companies
          </h1>
          <p className="text-gray-600 mt-2">Manage all companies on your platform ({companies.length} total)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchCompanies}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            <FaSync className="text-sm" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors">
            <FaPlus /> Add Company
          </button>
        </div>
      </div>

      {/* Responsive Grid for Mobile, Table for Desktop */}
      <div className="space-y-4 lg:space-y-0">
        {/* Mobile View */}
        <div className="lg:hidden space-y-4">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.email}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    company.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {company.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600">Vehicles</p>
                  <p className="font-semibold text-gray-900">{company.vehicles || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Drivers</p>
                  <p className="font-semibold text-gray-900">{company.drivers || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Plan</p>
                  <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    {company.subscription || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                <button 
                  onClick={() => handleViewCompany(company)}
                  className="flex-1 py-2 text-yellow-600 hover:text-yellow-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaEye className="w-4 h-4" /> View
                </button>
                <button 
                  onClick={() => {
                    setSelectedCompany(company);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex-1 py-2 text-red-600 hover:text-red-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaTrash className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Vehicles</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Drivers</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Plan</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No companies found
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900 font-medium">{company.name}</td>
                      <td className="px-6 py-4 text-gray-600">{company.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            company.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {company.status === 'active' ? 'Active' : 'Trial'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">{company.vehicles || 0}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{company.drivers || 0}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                          {company.subscription || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => handleViewCompany(company)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Company"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg p-4 border border-gray-200">
        <p className="text-gray-600">
          Showing {filteredCompanies.length} of {companies.length} companies
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

      {/* Company Details Modal */}
      {selectedCompany && !showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">{selectedCompany.name}</h3>
              <button 
                onClick={() => setSelectedCompany(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCompany.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedCompany.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedCompany.status === 'active' ? 'Active' : 'Trial'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicles</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCompany.vehicles || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Drivers</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCompany.drivers || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="text-lg font-semibold text-yellow-600">{selectedCompany.subscription || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCompany.joinDate || selectedCompany.created_at || 'N/A'}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4 flex gap-2">
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <FaExclamationTriangle className="text-3xl" />
                <h3 className="text-xl font-bold">Delete Company?</h3>
              </div>
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{selectedCompany.name}</strong>? This action is permanent and will delete:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 bg-red-50 p-3 rounded">
                <li>All company information</li>
                <li>All vehicles ({selectedCompany.vehicles || 0})</li>
                <li>All drivers ({selectedCompany.drivers || 0})</li>
                <li>All users and accounts</li>
                <li>All subscriptions and billing data</li>
                <li>All trips, services, inspections, and records</li>
              </ul>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedCompany(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteCompany}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
