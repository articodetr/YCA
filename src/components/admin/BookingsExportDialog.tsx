import { useState } from 'react';
import { Download, X, Loader2, Calendar, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import {
  styleHeaderRow,
  styleDataRows,
  addSummaryHeader,
  buildCaseNotesMap,
  downloadWorkbook,
  createWorkbook,
} from '../../lib/excel-export';

interface BookingsExportDialogProps {
  serviceId: string;
  onClose: () => void;
}

export default function BookingsExportDialog({ serviceId, onClose }: BookingsExportDialogProps) {
  const { language } = useLanguage();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    en: {
      title: 'Export Bookings',
      from: 'From',
      to: 'To',
      exportRange: 'Export Selected Range',
      exportAll: 'Export All',
      cancel: 'Cancel',
      noData: 'No bookings found for the selected range',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      assignedTo: 'Assigned To',
      notes: 'Notes',
      caseNotes: 'Case Notes',
      createdAt: 'Created At',
      service: 'Service',
      summaryTitle: 'Bookings Report',
      summaryService: 'Service',
      summaryPeriod: 'Period',
      summaryTotal: 'Total Records',
      summaryExported: 'Exported on',
      all: 'All',
    },
    ar: {
      title: 'تصدير الحجوزات',
      from: 'من',
      to: 'إلى',
      exportRange: 'تصدير الفترة المحددة',
      exportAll: 'تصدير الكل',
      cancel: 'إلغاء',
      noData: 'لا توجد حجوزات للفترة المحددة',
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      date: 'التاريخ',
      time: 'الوقت',
      status: 'الحالة',
      assignedTo: 'مُعيّن إلى',
      notes: 'ملاحظات',
      caseNotes: 'ملاحظات القضية',
      createdAt: 'تاريخ الإنشاء',
      service: 'الخدمة',
      summaryTitle: 'تقرير الحجوزات',
      summaryService: 'الخدمة',
      summaryPeriod: 'الفترة',
      summaryTotal: 'إجمالي السجلات',
      summaryExported: 'تم التصدير في',
      all: 'الكل',
    },
  }[language];

  const STATUS_LABELS: Record<string, string> = {
    pending_payment: language === 'ar' ? 'بانتظار الدفع' : 'Pending Payment',
    submitted: language === 'ar' ? 'مقدّم' : 'Submitted',
    in_progress: language === 'ar' ? 'قيد المعالجة' : 'In Progress',
    completed: language === 'ar' ? 'مكتمل' : 'Completed',
    rejected: language === 'ar' ? 'مرفوض' : 'Rejected',
    cancelled: language === 'ar' ? 'ملغي' : 'Cancelled',
    no_show: language === 'ar' ? 'لم يحضر' : 'No Show',
    incomplete: language === 'ar' ? 'لم يكتمل' : 'Incomplete',
  };

  const formatTime = (time: string) => time?.substring(0, 5) || '';

  const handleExport = async (exportAll: boolean) => {
    setExporting(true);
    setError(null);

    try {
      let query = supabase
        .from('wakala_applications')
        .select(`
          id,
          full_name,
          email,
          phone,
          booking_date,
          start_time,
          end_time,
          status,
          additional_notes,
          created_at,
          assigned_admin_id,
          admins:assigned_admin_id (full_name),
          availability_slots!inner (service_id)
        `)
        .eq('availability_slots.service_id', serviceId)
        .not('booking_date', 'is', null)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (!exportAll && startDate && endDate) {
        query = query.gte('booking_date', startDate).lte('booking_date', endDate);
      }

      const { data: bookings, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      if (!bookings || bookings.length === 0) {
        setError(t.noData);
        setExporting(false);
        return;
      }

      const bookingIds = bookings.map((b: any) => b.id);
      const { data: caseNotes } = await supabase
        .from('case_notes')
        .select('entity_id, note_text, note_type, created_at')
        .eq('entity_type', 'booking')
        .in('entity_id', bookingIds)
        .order('created_at', { ascending: true });

      const notesMap = buildCaseNotesMap(caseNotes || []);

      const { data: service } = await supabase
        .from('booking_services')
        .select('name_en, name_ar')
        .eq('id', serviceId)
        .maybeSingle();

      const serviceName = language === 'ar' ? service?.name_ar : service?.name_en;

      const headers = [
        t.name, t.email, t.phone, t.date, t.time,
        t.status, t.assignedTo, t.service, t.notes, t.caseNotes, t.createdAt,
      ];

      const rawStatuses: string[] = [];
      const dataRows = bookings.map((b: any) => {
        rawStatuses.push(b.status);
        return [
          b.full_name || '',
          b.email || '',
          b.phone || '',
          b.booking_date || '',
          `${formatTime(b.start_time)} - ${formatTime(b.end_time)}`,
          STATUS_LABELS[b.status] || b.status,
          (b.admins as any)?.full_name || '',
          serviceName || '',
          b.additional_notes || '',
          notesMap.get(b.id) || '',
          b.created_at ? new Date(b.created_at).toLocaleDateString('en-GB') : '',
        ];
      });

      const workbook = await createWorkbook();
      const sheet = workbook.addWorksheet(
        language === 'ar' ? 'الحجوزات' : 'Bookings'
      );

      sheet.addRow(headers);
      dataRows.forEach((row) => sheet.addRow(row));

      const colWidths = [22, 28, 16, 12, 14, 16, 20, 20, 30, 45, 12];
      sheet.columns = colWidths.map((w) => ({ width: w }));

      styleHeaderRow(sheet);
      const statusColIndex = 6;
      styleDataRows(sheet, statusColIndex, rawStatuses);

      const periodLabel = exportAll
        ? t.all
        : `${startDate} → ${endDate}`;
      addSummaryHeader(sheet, [
        t.summaryTitle,
        `${t.summaryService}: ${serviceName || '-'}`,
        `${t.summaryPeriod}: ${periodLabel}`,
        `${t.summaryTotal}: ${bookings.length}`,
        `${t.summaryExported}: ${new Date().toLocaleDateString('en-GB')}`,
      ], headers.length);

      const dateLabel = exportAll ? 'all' : `${startDate}_${endDate}`;
      await downloadWorkbook(workbook, `bookings_${dateLabel}.xlsx`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t.from}</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t.to}</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => handleExport(false)}
              disabled={exporting || !startDate || !endDate}
              className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {t.exportRange}
            </button>

            <button
              onClick={() => handleExport(true)}
              disabled={exporting}
              className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {t.exportAll}
            </button>

            <button
              onClick={onClose}
              className="w-full text-gray-600 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
