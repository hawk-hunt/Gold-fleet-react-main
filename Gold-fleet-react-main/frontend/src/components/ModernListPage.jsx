import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaSync } from 'react-icons/fa';

/**
 * Modern CRUD List Page with enhanced UI/UX
 * Features: Search, Filter, Cards/Table view, Smooth animations, Pro styling
 */
const ModernListPage = ({
  title,
  description = '',
  fetchData,
  deleteItem,
  createUrl,
  viewUrl,
  editUrl,
  columns = [],
  keyField = 'id',
  icon: Icon = FaFilter,
}) => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchData();
      setItems(data || []);
      setFilteredItems(data || []);
    } catch (err) {
      setError(`Failed to load ${title.toLowerCase()}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Handle search/filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = items.filter(item => {
      return Object.values(item).some(val =>
        val && String(val).toLowerCase().includes(term)
      );
    });
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      try {
        await deleteItem(id);
        setItems(items.filter(i => i[keyField] !== id));
      } catch (err) {
        setError(`Delete failed: ${err.message}`);
      }
    }
  };

  // Render column value
  const renderCell = (item, col) => {
    if (col.render) return col.render(item);
    if (col.transform) return col.transform(item);
    return item[col.key] ?? '-';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-40 -mt-40"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {Icon && <Icon className="text-white text-2xl" />}
                <h1 className="text-4xl font-bold text-white">{title}</h1>
              </div>
              {description && <p className="text-blue-100 text-lg">{description}</p>}
              <div className="mt-3 text-blue-100 text-sm">
                <span className="bg-blue-500 bg-opacity-50 px-3 py-1 rounded-full">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            
            {createUrl && (
              <Link
                to={createUrl}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <FaPlus className="text-lg" /> New {title.slice(0, -1)}
              </Link>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={load}
            className="p-3 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors duration-200 flex items-center gap-2"
            title="Refresh"
          >
            <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-red-600 text-sm hover:text-red-800 mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4 text-lg">Loading {title.toLowerCase()}...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-12 text-center border border-blue-100">
            <div className="mb-4 text-5xl">📭</div>
            <h3 className="text-gray-700 font-semibold text-lg mb-2">
              No {title.toLowerCase()} found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? `Try adjusting your search terms`
                : `Create your first ${title.slice(0, -1).toLowerCase()} to get started`}
            </p>
            {createUrl && !searchTerm && (
              <Link
                to={createUrl}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg"
              >
                <FaPlus className="inline mr-2" /> Create {title.slice(0, -1)}
              </Link>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Table Header */}
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 border-b-2 border-blue-700">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-6 py-4 text-left text-sm font-semibold text-white"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {filteredItems.map((item, idx) => (
                    <tr
                      key={item[keyField]}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      {columns.map((col) => (
                        <td
                          key={`${item[keyField]}-${col.key}`}
                          className="px-6 py-4 text-sm text-gray-700"
                        >
                          {renderCell(item, col)}
                        </td>
                      ))}
                      
                      {/* Action Buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {viewUrl && (
                            <Link
                              to={viewUrl(item[keyField])}
                              className="inline-flex items-center justify-center p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200 hover:scale-110"
                              title="View"
                            >
                              <FaEye className="text-sm" />
                            </Link>
                          )}
                          
                          {editUrl && (
                            <Link
                              to={editUrl(item[keyField])}
                              className="inline-flex items-center justify-center p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Edit"
                            >
                              <FaEdit className="text-sm" />
                            </Link>
                          )}
                          
                          {deleteItem && (
                            <button
                              onClick={() => handleDelete(item[keyField])}
                              className="inline-flex items-center justify-center p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all duration-200 hover:scale-110"
                              title="Delete"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center text-sm text-gray-600">
              <span>
                Showing <span className="font-semibold">{filteredItems.length}</span> of{' '}
                <span className="font-semibold">{items.length}</span> items
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernListPage;
