import { useState } from 'react';
import { Search, Loader2, Download } from 'lucide-react';

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
  onRefresh?: () => void;
  exportFilename?: string;
}

export default function ManagementTable({
  data,
  columns,
  loading = false,
  onView,
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium ml-4"
        >
          <Download className="w-4 h-4" />
          Export CSV
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900"
                  >
                    {col.label}
                  </th>
                ))}
                {onView && <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className={`hover:bg-gray-50 ${onView ? 'cursor-pointer' : ''}`}
                  onClick={() => onView?.(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4 text-sm text-gray-600">
                      {col.render ? col.render(item[col.key], item) : item[col.key] || '-'}
                    </td>
                  ))}
                  {onView && (
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                        View
                      </span>
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
