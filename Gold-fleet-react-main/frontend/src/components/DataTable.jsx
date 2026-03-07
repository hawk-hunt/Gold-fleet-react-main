/**
 * Responsive DataTable Component
 * Handles responsive table display with mobile card fallback
 * Props:
 *   columns - array of column configs: { key, label, render }
 *   data - array of row data
 *   loading - show loading skeleton
 *   onRowClick - optional row click handler
 *   selectable - show checkboxes
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectRow,
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new entry.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
      {/* Desktop table */}
      <table className="hidden md:table w-full divide-y divide-gray-200">
        <thead className="bg-yellow-600 border-b border-gray-200">
          <tr>
            {selectable && (
              <th className="px-6 py-3 w-12">
                <input type="checkbox" className="rounded" />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`
                ${onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
                ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              `}
            >
              {selectable && (
                <td className="px-6 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(idx)}
                    onChange={() => onSelectRow && onSelectRow(idx)}
                    className="rounded"
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-base text-gray-900">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile card view */}
      <div className="md:hidden divide-y divide-gray-200">
        {data.map((row, idx) => (
          <div
            key={idx}
            onClick={() => onRowClick && onRowClick(row)}
            className={`
              p-4 space-y-2
              ${onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
              ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            `}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between items-start">
                <span className="text-base text-gray-700">{col.label}</span>
                <span className="text-base text-gray-900 text-right">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </span>
              </div>
            ))}}
          </div>
        ))}
      </div>
    </div>
  );
}
