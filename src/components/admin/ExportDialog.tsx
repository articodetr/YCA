import { useState } from 'react';
import { X, Download, Loader2, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ExcelJS from 'exceljs';
import {
  styleHeaderRow,
  styleDataRows,
  addSummaryHeader,
  buildCaseNotesMap,
  downloadWorkbook,
} from '../../lib/excel-export';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  entityType: 'wakala' | 'bookings';
  admins: { id: string; full_name: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending Payment',
  submitted: 'Submitted',
  in_progress: 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  no_show: 'No Show',
  incomplete: 'Incomplete',
};

export default function ExportDialog({ open, onClose, entityType, admins }: ExportDialogProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [adminFilter, setAdminFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  if (!open) return null;

  const exportExcel = async () => {
    setExporting(true);
    try {
      let query = supabase.from('wakala_applications').select('*');

      if (dateFrom) {
        query = query.gte('created_at', `${dateFrom}T00:00:00`);
      }
      if (dateTo) {
        query = query.lte('created_at', `${dateTo}T23:59:59`);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (adminFilter !== 'all') {
        query = query.eq('assigned_admin_id', adminFilter);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        alert('No data found for the selected filters');
        setExporting(false);
        return;
      }

      const adminIds = [...new Set(data.map((d) => d.assigned_admin_id).filter(Boolean))];
      let adminMap = new Map<string, string>();
      if (adminIds.length > 0) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('id, full_name')
          .in('id', adminIds);
        adminMap = new Map(adminData?.map((a) => [a.id, a.full_name]) || []);
      }

      const entityIds = data.map((d) => d.id);
      const allNotes: any[] = [];
      if (entityIds.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < entityIds.length; i += batchSize) {
          const batch = entityIds.slice(i, i + batchSize);
          const { data: notes } = await supabase
            .from('case_notes')
            .select('entity_id, note_text, note_type, created_at')
            .eq('entity_type', 'wakala_application')
            .in('entity_id', batch)
            .order('created_at', { ascending: true });
          if (notes) allNotes.push(...notes);
        }
      }

      const notesMap = buildCaseNotesMap(allNotes);

      const headers = [
        'Booking Reference',
        'Full Name (EN)',
        'Full Name (AR)',
        'Nationality',
        'Passport Number',
        'Date of Birth',
        'Phone',
        'Email',
        'Service Type',
        'Wakala Type',
        'Wakala Format',
        'Agent Name',
        'Booking Date',
        'Start Time',
        'End Time',
        'Duration (min)',
        'Status',
        'Payment Status',
        'Assigned Admin',
        'Special Requests',
        'Passport Documents',
        'Case Notes',
        'Created At',
      ];

      const rawStatuses: string[] = [];
      const dataRows = data.map((row) => {
        rawStatuses.push(row.status);
        return [
          row.booking_reference || '',
          row.full_name || '',
          row.applicant_name_ar || '',
          row.nationality || '',
          row.passport_number || '',
          row.date_of_birth || '',
          row.phone || '',
          row.email || '',
          row.service_type || '',
          row.wakala_type || '',
          row.wakala_format || '',
          row.agent_name || '',
          row.booking_date || '',
          row.start_time || '',
          row.end_time || '',
          row.duration_minutes || '',
          STATUS_LABELS[row.status] || row.status || '',
          row.payment_status || '',
          adminMap.get(row.assigned_admin_id) || 'Unassigned',
          row.special_requests || '',
          Array.isArray(row.passport_copies) ? row.passport_copies.join(' | ') : '',
          notesMap.get(row.id) || '',
          row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB') : '',
        ];
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Wakala Applications');

      sheet.addRow(headers);
      dataRows.forEach((row) => sheet.addRow(row));

      const colWidths = [
        16, 22, 22, 14, 16, 12, 14, 26, 14, 14, 14, 20,
        12, 10, 10, 10, 16, 14, 20, 30, 30, 45, 12,
      ];
      sheet.columns = colWidths.map((w) => ({ width: w }));

      styleHeaderRow(sheet);
      const statusColIndex = 17;
      styleDataRows(sheet, statusColIndex, rawStatuses);

      const periodLabel = dateFrom && dateTo
        ? `${dateFrom} → ${dateTo}`
        : 'All';
      addSummaryHeader(sheet, [
        'Wakala Applications Report',
        `Period: ${periodLabel}`,
        `Total Records: ${data.length}`,
        `Exported on: ${new Date().toLocaleDateString('en-GB')}`,
      ], headers.length);

      const dateStr = new Date().toISOString().split('T')[0];
      await downloadWorkbook(workbook, `wakala-applications-${dateStr}.xlsx`);
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Export Data
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Filter className="w-4 h-4" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {admins.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Assigned Admin
              </label>
              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Admins</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={exportExcel}
            disabled={exporting}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
