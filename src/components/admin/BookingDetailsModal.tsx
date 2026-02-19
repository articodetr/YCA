import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Calendar, Clock, Mail, Phone, User, FileText, CheckCircle, XCircle, UserCheck, Loader2, AlertCircle, ArrowRightLeft, Save } from 'lucide-react';
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
  service_type?: string;
  advisory_reason?: string;
  services_provided?: string[] | null;
  created_at: string;
  assigned_admin_id?: string;
  assigned_admin_name?: string;
}

const ADVISORY_REASON_LABELS: Record<string, { en: string; ar: string }> = {
  welfare_benefits: { en: 'Welfare Benefits', ar: 'المزايا الاجتماعية' },
  housing: { en: 'Housing', ar: 'الإسكان' },
  immigration: { en: 'Immigration', ar: 'الهجرة' },
  employment: { en: 'Employment', ar: 'التوظيف' },
  education: { en: 'Education', ar: 'التعليم' },
  health: { en: 'Health', ar: 'الصحة' },
  legal: { en: 'Legal', ar: 'قانوني' },
  other: { en: 'Other', ar: 'أخرى' },
};

const SERVICES_PROVIDED_OPTIONS = Object.entries(ADVISORY_REASON_LABELS).map(([key, labels]) => ({
  key,
  labelEn: labels.en,
  labelAr: labels.ar,
}));

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
  const { user, adminData } = useAdminAuth();
  const [currentStatus, setCurrentStatus] = useState('');
  const [assignedAdminId, setAssignedAdminId] = useState<string | null>(null);
  const [assignedAdminName, setAssignedAdminName] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [takingOver, setTakingOver] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timelineKey, setTimelineKey] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [savingServices, setSavingServices] = useState(false);
  const [servicesSuccess, setServicesSuccess] = useState(false);
  const assignedRef = useRef({ id: null as string | null, name: null as string | null });

  const isAdvisoryBooking = !!(booking?.service_type?.startsWith('advisory_'));

  useEffect(() => {
    if (booking) {
      setCurrentStatus(booking.status);
      setAssignedAdminId(booking.assigned_admin_id || null);
      setAssignedAdminName(booking.assigned_admin_name || null);
      assignedRef.current = {
        id: booking.assigned_admin_id || null,
        name: booking.assigned_admin_name || null,
      };
      const derivedReason = booking.advisory_reason
        || (booking.service_type?.startsWith('advisory_') ? booking.service_type.replace('advisory_', '') : null);
      if (booking.services_provided && booking.services_provided.length > 0) {
        setSelectedServices(booking.services_provided);
      } else if (derivedReason && ADVISORY_REASON_LABELS[derivedReason]) {
        setSelectedServices([derivedReason]);
      } else {
        setSelectedServices([]);
      }
    }
  }, [booking?.id]);

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
      handledBy: 'Handled by',
      notAssigned: 'Not yet assigned',
      autoAssignHint: 'Will be auto-assigned on first action',
      takeOver: 'Take Over',
      takeOverConfirm: 'Taking over...',
      advisoryReason: 'Advisory Reason',
      servicesProvided: 'Services Provided',
      saveServices: 'Save Services',
      savingServices: 'Saving...',
      servicesSaved: 'Saved',
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
      handledBy: 'مسؤول المتابعة',
      notAssigned: 'لم يُعيّن بعد',
      autoAssignHint: 'سيتم التعيين تلقائياً عند أول إجراء',
      takeOver: 'استلام',
      takeOverConfirm: 'جاري الاستلام...',
      advisoryReason: 'سبب الاستشارة',
      servicesProvided: 'الخدمات المقدمة',
      saveServices: 'حفظ الخدمات',
      savingServices: 'جاري الحفظ...',
      servicesSaved: 'تم الحفظ',
    },
  }[language];

  if (!booking) return null;

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

  const ensureAssignment = useCallback(async () => {
    if (assignedRef.current.id || !user || !adminData) return;

    try {
      const { error: updateError } = await supabase
        .from('wakala_applications')
        .update({ assigned_admin_id: user.id })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      await addSystemNote(
        'booking',
        booking.id,
        user.id,
        language === 'ar'
          ? `تم التعيين تلقائياً إلى: ${adminData.full_name}`
          : `Auto-assigned to: ${adminData.full_name}`,
        'assignment'
      );

      assignedRef.current = { id: user.id, name: adminData.full_name };
      setAssignedAdminId(user.id);
      setAssignedAdminName(adminData.full_name);
      setTimelineKey((k) => k + 1);
      onUpdate?.();
    } catch (err: any) {
      console.error('Auto-assignment failed:', err);
    }
  }, [booking?.id, user, adminData, language, onUpdate]);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || !user) return;
    setSavingStatus(true);
    setError(null);
    setStatusSuccess(false);

    try {
      await ensureAssignment();

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
        `${language === 'ar' ? 'تغيير الحالة' : 'Status changed'}: ${oldLabel} → ${newLabel}`,
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

  const handleTakeOver = async () => {
    if (!user || !adminData) return;
    setTakingOver(true);
    setError(null);

    try {
      const previousName = assignedAdminName || (language === 'ar' ? 'غير معيّن' : 'Unassigned');

      const { error: updateError } = await supabase
        .from('wakala_applications')
        .update({ assigned_admin_id: user.id })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      await addSystemNote(
        'booking',
        booking.id,
        user.id,
        language === 'ar'
          ? `تم الاستلام بواسطة ${adminData.full_name} من ${previousName}`
          : `Taken over by ${adminData.full_name} from ${previousName}`,
        'assignment'
      );

      assignedRef.current = { id: user.id, name: adminData.full_name };
      setAssignedAdminId(user.id);
      setAssignedAdminName(adminData.full_name);
      setTimelineKey((k) => k + 1);
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || 'Failed to take over booking');
    } finally {
      setTakingOver(false);
    }
  };

  const handleSaveServices = async () => {
    if (!user || !adminData) return;
    setSavingServices(true);
    setError(null);

    try {
      await ensureAssignment();

      const { error: updateError } = await supabase
        .from('wakala_applications')
        .update({
          services_provided: selectedServices,
          services_provided_updated_at: new Date().toISOString(),
          services_provided_updated_by: user.id,
        })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      const serviceLabels = selectedServices.map((key) =>
        language === 'ar'
          ? ADVISORY_REASON_LABELS[key]?.ar || key
          : ADVISORY_REASON_LABELS[key]?.en || key
      );

      await addSystemNote(
        'booking',
        booking.id,
        user.id,
        language === 'ar'
          ? `تم تحديث الخدمات المقدمة: ${serviceLabels.join('، ') || 'لا شيء'}`
          : `Services provided updated: ${serviceLabels.join(', ') || 'none'}`,
        'update'
      );

      setServicesSuccess(true);
      setTimelineKey((k) => k + 1);
      onUpdate?.();
      setTimeout(() => setServicesSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save services');
    } finally {
      setSavingServices(false);
    }
  };

  const toggleService = (key: string) => {
    setSelectedServices((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const isAssignedToMe = assignedAdminId === user?.id;
  const isAssignedToOther = !!assignedAdminId && !isAssignedToMe;

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

          {assignedAdminId ? (
            <div className={`rounded-lg p-3 flex items-center justify-between ${
              isAssignedToMe
                ? 'bg-teal-50 border border-teal-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <UserCheck className={`w-4.5 h-4.5 ${isAssignedToMe ? 'text-teal-600' : 'text-amber-600'}`} />
                <span className={`text-sm font-medium ${isAssignedToMe ? 'text-teal-800' : 'text-amber-800'}`}>
                  {t.handledBy}: <span className="font-semibold">{assignedAdminName}</span>
                </span>
              </div>
              {isAssignedToOther && (
                <button
                  onClick={handleTakeOver}
                  disabled={takingOver}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                >
                  {takingOver ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  )}
                  {takingOver ? t.takeOverConfirm : t.takeOver}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-3 flex items-center gap-2.5">
              <UserCheck className="w-4.5 h-4.5 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">{t.notAssigned}</span>
                <span className="text-xs text-gray-400 block">{t.autoAssignHint}</span>
              </div>
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
                {isAdvisoryBooking && (() => {
                  const r = booking.advisory_reason || (booking.service_type?.startsWith('advisory_') ? booking.service_type.replace('advisory_', '') : null);
                  return r && ADVISORY_REASON_LABELS[r] ? (
                    <p className="text-sm text-gray-500 mt-1">
                      {t.advisoryReason}:{' '}
                      <span className="font-medium text-gray-700">
                        {language === 'ar' ? ADVISORY_REASON_LABELS[r].ar : ADVISORY_REASON_LABELS[r].en}
                      </span>
                    </p>
                  ) : null;
                })()}
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

          {isAdvisoryBooking && (
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-semibold text-teal-900">{t.servicesProvided}</span>
                </div>
                <div className="flex items-center gap-2">
                  {servicesSuccess && (
                    <span className="text-xs text-green-600 font-medium">{t.servicesSaved}</span>
                  )}
                  <button
                    onClick={handleSaveServices}
                    disabled={savingServices}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {savingServices ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    {savingServices ? t.savingServices : t.saveServices}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES_PROVIDED_OPTIONS.map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedServices.includes(opt.key)
                        ? 'bg-teal-100 border-teal-400'
                        : 'bg-white border-gray-200 hover:border-teal-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(opt.key)}
                      onChange={() => toggleService(opt.key)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className={`text-xs font-medium ${selectedServices.includes(opt.key) ? 'text-teal-800' : 'text-gray-700'}`}>
                      {language === 'ar' ? opt.labelAr : opt.labelEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {booking.notes && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-600">{t.notes}</span>
              </div>
              <p className="text-gray-900 whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}

          <CaseTimeline
            key={timelineKey}
            entityType="booking"
            entityId={booking.id}
            onBeforeAddNote={ensureAssignment}
          />

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
