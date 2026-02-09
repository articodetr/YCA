import { useState } from 'react';
import { Search, Loader2, Download, Eye, Trash2 } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ManagementTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  onView?: (item: any) => void;
  onDelete?: (item: any) => void;
  onRefresh?: () => void;
  exportFilename?: string;
}

export default function ManagementTable({
  data,
  columns,
  loading = false,
  onView,
  onDelete,
  exportFilename,
}: ManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const searchString = searchTerm.toLowerCase();
    return columns.some((col) => {
      const value = item[col.key];
      return value && value.toString().toLowerCase().includes(searchString);
    });
  });

  const exportToCSV = () => {
    const headers = columns.map((col) => col.label);
    const rows = filteredData.map((item) =>
      columns.map((col) => {
        const value = item[col.key];
        if (value instanceof Date) return value.toLocaleDateString();
        if (Array.isArray(value)) return value.join(', ');
        return value || '';
      })
    );

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFilename || `export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1 max-w-xs sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span className="hidden xs:inline">Export CSV</span>
          <span className="xs:hidden">Export</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No data found</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900"
                  >
                    {col.label}
                  </th>
                ))}
                {(onView || onDelete) && <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="hover:bg-gray-50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-xs sm:text-sm text-gray-600">
                      {col.render ? col.render(item[col.key], item) : item[col.key] || '-'}
                    </td>
                  ))}
                  {(onView || onDelete) && (
                    <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {onView && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(item);
                            }}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredData.length} of {data.length} records
      </div>
    </div>
  );
}
