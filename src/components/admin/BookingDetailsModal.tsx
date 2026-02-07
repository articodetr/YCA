import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Mail, Phone, User, FileText, CheckCircle, XCircle, UserCheck, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { supabase } from '../../lib/supabase';
import CaseTimeline, { addSystemNote } from './CaseTimeline';

interface BookingDetails {
  id: string;
  applicant_name_en: string;
  applicant_name_ar: string;
  email: string;
  phone: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  service_name_en?: string;
  service_name_ar?: string;
  created_at: string;
  assigned_admin_id?: string;
  assigned_admin_name?: string;
}

interface Admin {
  id: string;
  full_name: string;
}

interface BookingDetailsModalProps {
  booking: BookingDetails | null;
  onClose: () => void;
  onUpdate?: () => void;
}

const STATUS_OPTIONS = [
  'submitted',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
  'incomplete',
] as const;

export default function BookingDetailsModal({ booking, onClose, onUpdate }: BookingDetailsModalProps) {
  const { language } = useLanguage();
  const { user } = useAdminAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentAssignedId, setCurrentAssignedId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timelineKey, setTimelineKey] = useState(0);

  useEffect(() => {
    if (booking) {
      setCurrentStatus(booking.status);
      setCurrentAssignedId(booking.assigned_admin_id || null);
      fetchAdmins();
    }
  }, [booking?.id]);

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from('admins')
      .select('id, full_name')
      .eq('is_active', true)
      .order('full_name');
    if (data) setAdmins(data);
  };

  if (!booking) return null;

  const t = {
    en: {
      title: 'Booking Details',
      applicantName: 'Applicant Name',
      email: 'Email',
      phone: 'Phone Number',
      service: 'Service',
      date: 'Date',
      time: 'Time',
      status: 'Status',
      notes: 'Notes',
      createdAt: 'Created At',
      close: 'Close',
      assignedTo: 'Assigned To',
      unassigned: 'Unassigned',
      selectStaff: 'Select staff member...',
      changeStatus: 'Change Status',
      submitted: 'Submitted',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_show: 'No Show',
      incomplete: 'Incomplete',
      pending_payment: 'Pending Payment',
      rejected: 'Rejected',
      saved: 'Saved',
    },
    ar: {
      title: 'تفاصيل الحجز',
      applicantName: 'اسم المتقدم',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      service: 'الخدمة',
      date: 'التاريخ',
      time: 'الوقت',
      status: 'الحالة',
      notes: 'ملاحظات',
      createdAt: 'تاريخ الإنشاء',
      close: 'إغلاق',
      assignedTo: 'مُعيّن إلى',
      unassigned: 'غير مُعيّن',
      selectStaff: 'اختر موظف...',
      changeStatus: 'تغيير الحالة',
      submitted: 'مقدّم',
      in_progress: 'قيد المعالجة',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      no_show: 'لم يحضر',
      incomplete: 'لم يكتمل',
      pending_payment: 'بانتظار الدفع',
      rejected: 'مرفوض',
      saved: 'تم الحفظ',
    },
  }[language];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted':
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'incomplete':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'no_show':
        return <XCircle className="w-4 h-4" />;
      case 'incomplete':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string): string => {
    return (t as Record<string, string>)[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || !user) return;
    setSavingStatus(true);
    setError(null);
    setStatusSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('wakala_applications')
        .update({ status: newStatus })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      const oldLabel = getStatusLabel(currentStatus);
      const newLabel = getStatusLabel(newStatus);
      await addSystemNote(
        'booking',
        booking.id,
        user.id,
        `Status changed: ${oldLabel} → ${newLabel}`,
        'status_change'
      );

      setCurrentStatus(newStatus);
      setStatusSuccess(true);
      setTimelineKey((k) => k + 1);
      onUpdate?.();
      setTimeout(() => setStatusSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAssignmentChange = async (adminId: string) => {
    if (!user) return;
    const newAdminId = adminId === '' ? null : adminId;
    if (newAdminId === currentAssignedId) return;

    setSavingAssignment(true);
    setError(null);
    setAssignSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('wakala_applications')
        .update({ assigned_admin_id: newAdminId })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      const adminName = newAdminId
        ? admins.find((a) => a.id === newAdminId)?.full_name || 'Unknown'
        : t.unassigned;
      await addSystemNote(
        'booking',
        booking.id,
        user.id,
        `Assigned to: ${adminName}`,
        'assignment'
      );

      setCurrentAssignedId(newAdminId);
      setAssignSuccess(true);
      setTimelineKey((k) => k + 1);
      onUpdate?.();
      setTimeout(() => setAssignSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update assignment');
    } finally {
      setSavingAssignment(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{t.applicantName}</span>
              </div>
              <p className="text-gray-900 font-medium">
                {language === 'ar' ? booking.applicant_name_ar : booking.applicant_name_en}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{t.email}</span>
              </div>
              <p className="text-gray-900 font-medium break-all">{booking.email}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{t.phone}</span>
              </div>
              <p className="text-gray-900 font-medium" dir="ltr">{booking.phone}</p>
            </div>

            {booking.service_name_en && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">{t.service}</span>
                </div>
                <p className="text-gray-900 font-medium">
                  {language === 'ar' ? booking.service_name_ar : booking.service_name_en}
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{t.date}</span>
            </div>
            <p className="text-blue-900 font-semibold text-lg">{formatDate(booking.date)}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">{t.time}</span>
            </div>
            <p className="text-green-900 font-semibold text-lg" dir="ltr">
              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentStatus)}
                  <span className="text-sm font-medium text-gray-700">{t.changeStatus}</span>
                </div>
                {savingStatus && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                {statusSuccess && <span className="text-xs text-green-600 font-medium">{t.saved}</span>}
              </div>
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={savingStatus}
                className={`w-full px-3 py-2 text-sm font-medium rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getStatusColor(currentStatus)}`}
              >
                {currentStatus === 'pending_payment' && (
                  <option value="pending_payment">{t.pending_payment}</option>
                )}
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {getStatusLabel(s)}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">{t.assignedTo}</span>
                </div>
                {savingAssignment && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                {assignSuccess && <span className="text-xs text-green-600 font-medium">{t.saved}</span>}
              </div>
              <select
                value={currentAssignedId || ''}
                onChange={(e) => handleAssignmentChange(e.target.value)}
                disabled={savingAssignment}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
              >
                <option value="">{t.selectStaff}</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {booking.notes && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{t.notes}</span>
              </div>
              <p className="text-gray-900 whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}

          <CaseTimeline key={timelineKey} entityType="booking" entityId={booking.id} />

          <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            {t.createdAt}: {new Date(booking.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-GB')}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
