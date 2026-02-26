import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Save, Calendar, Clock, FileText, MessageSquare, CreditCard, User, Phone, Mail, AlertCircle, CheckCircle, XCircle, Upload, Image as ImageIcon, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import BookingCalendar from '../booking/Calendar';
import TimeSlotGrid from '../booking/TimeSlotGrid';
import {
  cancelBooking,
  checkSlotStillAvailable,
  getAvailableSlotsForDuration,
  getEffectiveWorkingHours,
  releaseSlots,
  reserveSlots,
  formatTimeRange,
} from '../../lib/booking-utils';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  application: any;
  onUpdate?: () => void;
}

const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
  submitted: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: CheckCircle },
  in_progress: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', icon: Clock },
  completed: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
  approved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
  rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle },
  cancelled: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle },
  pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
};

function isAdvisory(serviceType: string) {
  return serviceType?.startsWith('advisory_');
}

function getAdvisoryReasonLabel(serviceType: string, language: string) {
  const reason = serviceType.replace('advisory_', '');
  const labels: Record<string, Record<string, string>> = {
    en: {
      welfare_benefits: 'Welfare Benefits',
      housing: 'Housing',
      immigration: 'Immigration',
      employment: 'Employment',
      education: 'Education',
      health: 'Health',
      legal: 'Legal',
      other: 'Other',
    },
    ar: {
      welfare_benefits: 'المزايا الاجتماعية',
      housing: 'الإسكان',
      immigration: 'الهجرة',
      employment: 'التوظيف',
      education: 'التعليم',
      health: 'الصحة',
      legal: 'قانوني',
      other: 'أخرى',
    },
  };
  return labels[language]?.[reason] || reason;
}

function getWakalaTypeLabel(wakalaType: string, language: string) {
  const labels: Record<string, Record<string, string>> = {
    en: {
      general: 'General Power of Attorney',
      specific: 'Specific Power of Attorney',
      property: 'Property Power of Attorney',
      legal: 'Legal Representation',
      financial: 'Financial Power of Attorney',
    },
    ar: {
      general: 'توكيل عام',
      specific: 'توكيل خاص',
      property: 'توكيل عقاري',
      legal: 'توكيل قضائي',
      financial: 'توكيل مالي',
    },
  };
  return labels[language]?.[wakalaType] || wakalaType;
}

export default function ApplicationDetailsModal({ isOpen, onClose, application, onUpdate }: Props) {
  const { language, t } = useLanguage();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleDuration, setRescheduleDuration] = useState<30 | 60 | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState<any | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<any[]>([]);
  const [rescheduleWorkingHours, setRescheduleWorkingHours] = useState<{ startTime: string; endTime: string; breakTimes: { start: string; end: string }[] } | null>(null);
  const [rescheduleError, setRescheduleError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    special_requests: '',
    applicant_name: '',
    agent_name: '',
    applicant_passport_url: '',
    attorney_passport_url: '',
    passport_copies: [] as string[],
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageToView, setImageToView] = useState<string | null>(null);

  useEffect(() => {
    if (application) {
      setFormData({
        full_name: application.full_name || '',
        phone: application.phone || '',
        email: application.email || '',
        special_requests: application.special_requests || '',
        applicant_name: application.applicant_name || '',
        agent_name: application.agent_name || '',
        applicant_passport_url: application.applicant_passport_url || '',
        attorney_passport_url: application.attorney_passport_url || '',
        passport_copies: application.passport_copies || [],
      });
      setIsEditMode(false);
      setShowReschedule(false);
      setRescheduleDate(application.booking_date ? new Date(application.booking_date + 'T00:00:00') : null);
      const dur = application.duration_minutes === 60 ? 60 : 30;
      setRescheduleDuration(dur);
      setRescheduleSlot(null);
      setRescheduleSlots([]);
      setRescheduleWorkingHours(null);
      setRescheduleError('');
      setHasUnsavedChanges(false);
      setSaveError('');
      setSaveSuccess(false);
    }
  }, [application]);

  useEffect(() => {
    const load = async () => {
      if (!showReschedule) return;
      if (!application?.availability_slots?.service_id) return;
      if (!rescheduleDate || !rescheduleDuration) return;

      setRescheduleError('');
      try {
        const toLocalDateString = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const dateStr = toLocalDateString(rescheduleDate);
        const serviceId = application.availability_slots.service_id as string;

        const hours = await getEffectiveWorkingHours(dateStr);
        if (hours && hours.is_active) {
          setRescheduleWorkingHours({ startTime: hours.start_time, endTime: hours.end_time, breakTimes: hours.break_times });
        } else {
          setRescheduleWorkingHours(null);
        }

        const slots = await getAvailableSlotsForDuration(serviceId, dateStr, rescheduleDuration);
        setRescheduleSlots(
          slots.map(s => ({
            id: s.id,
            startTime: s.start_time,
            endTime: s.end_time,
            isAvailable: s.is_available,
          }))
        );
      } catch (e: any) {
        console.error('Reschedule load error:', e);
        setRescheduleSlots([]);
        setRescheduleError(e?.message || (language === 'ar' ? 'فشل في تحميل الأوقات' : 'Failed to load slots'));
      }
    };
    load();
  }, [showReschedule, application?.availability_slots?.service_id, rescheduleDate, rescheduleDuration, language]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    setSaveError('');
    setSaveSuccess(false);
  };

  const uploadImageToSupabase = async (file: File, imageType: 'applicant' | 'attorney' | 'witness'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${application.id}_${imageType}_${Date.now()}.${fileExt}`;
    const filePath = `wakala-documents/${application.user_id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('wakala-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('wakala-documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSaveError(language === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'Image size must be less than 5MB');
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|pdf)$/)) {
      setSaveError(language === 'ar' ? 'صيغة الصورة يجب أن تكون JPG، PNG أو PDF' : 'Image format must be JPG, PNG or PDF');
      return;
    }

    setUploadingImage(true);
    setSaveError('');

    try {
      const imageType = fieldName === 'applicant_passport_url' ? 'applicant' : 'attorney';
      const url = await uploadImageToSupabase(file, imageType);

      setFormData(prev => ({ ...prev, [fieldName]: url }));
      setHasUnsavedChanges(true);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setSaveError(language === 'ar' ? 'فشل في رفع الصورة' : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = (fieldName: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: '' }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const updateData: any = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        special_requests: formData.special_requests,
      };

      if (!isAdvisory(application.service_type)) {
        updateData.applicant_name = formData.applicant_name;
        updateData.agent_name = formData.agent_name;
        updateData.applicant_passport_url = formData.applicant_passport_url;
        updateData.attorney_passport_url = formData.attorney_passport_url;
        updateData.passport_copies = formData.passport_copies;
      }

      const { error } = await supabase
        .from('wakala_applications')
        .update(updateData)
        .eq('id', application.id);

      if (error) throw error;

      setSaveSuccess(true);
      setHasUnsavedChanges(false);
      setTimeout(() => {
        setIsEditMode(false);
        if (onUpdate) onUpdate();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating application:', error);
      setSaveError(error.message || (language === 'ar' ? 'فشل في حفظ التغييرات' : 'Failed to save changes'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!application) return;
    const confirmMsg = language === 'ar'
      ? 'هل أنت متأكد أنك تريد الإلغاء؟'
      : 'Are you sure you want to cancel?';
    if (!confirm(confirmMsg)) return;

    setIsCancelling(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      if (isAdvisoryApp && application.slot_id && application.booking_date && application.start_time && application.duration_minutes && application.availability_slots?.service_id) {
        const result = await cancelBooking(
          application.id,
          application.slot_id,
          application.availability_slots.service_id,
          application.duration_minutes,
          application.booking_date,
          application.start_time
        );
        if (!result.success) throw new Error(result.error || 'Failed to cancel booking');
      } else {
        const { error } = await supabase
          .from('wakala_applications')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancelled_by_user: true,
          })
          .eq('id', application.id);
        if (error) throw error;
      }

      setSaveSuccess(true);
      setTimeout(() => {
        if (onUpdate) onUpdate();
        onClose();
      }, 900);
    } catch (e: any) {
      console.error('Cancel error:', e);
      setSaveError(e?.message || (language === 'ar' ? 'فشل في الإلغاء' : 'Failed to cancel'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!application?.availability_slots?.service_id) {
      setRescheduleError(language === 'ar' ? 'لم يتم العثور على الخدمة' : 'Service not found');
      return;
    }
    if (!rescheduleDate || !rescheduleDuration || !rescheduleSlot) {
      setRescheduleError(language === 'ar' ? 'يرجى اختيار التاريخ والوقت' : 'Please select a date and time');
      return;
    }
    if (!application.slot_id || !application.booking_date || !application.start_time || !application.duration_minutes) {
      setRescheduleError(language === 'ar' ? 'بيانات الموعد الحالي غير مكتملة' : 'Current booking data is incomplete');
      return;
    }

    setIsRescheduling(true);
    setRescheduleError('');
    setSaveError('');
    setSaveSuccess(false);

    const toLocalDateString = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const newDateStr = toLocalDateString(rescheduleDate);
    const serviceId = application.availability_slots.service_id as string;

    try {
      const stillAvailable = await checkSlotStillAvailable(rescheduleSlot.id);
      if (!stillAvailable) {
        throw new Error(language === 'ar' ? 'هذا الوقت لم يعد متاحاً. جرّب وقتاً آخر.' : 'This time is no longer available. Please choose another slot.');
      }

      const reserveResult = await reserveSlots({
        slot_id: rescheduleSlot.id,
        service_id: serviceId,
        booking_date: newDateStr,
        start_time: rescheduleSlot.startTime,
        end_time: rescheduleSlot.endTime,
        duration_minutes: rescheduleDuration,
      });

      if (!reserveResult.success) {
        throw new Error(reserveResult.error || (language === 'ar' ? 'فشل في حجز الوقت الجديد' : 'Failed to reserve new slot'));
      }

      const releaseOld = await releaseSlots(
        application.slot_id,
        serviceId,
        application.duration_minutes,
        application.booking_date,
        application.start_time
      );

      if (!releaseOld.success) {
        // Try to release the new slot to avoid locking it forever
        await releaseSlots(rescheduleSlot.id, serviceId, rescheduleDuration, newDateStr, rescheduleSlot.startTime);
        throw new Error(releaseOld.error || (language === 'ar' ? 'فشل في تحرير الوقت القديم' : 'Failed to release old slot'));
      }

      const { error: updErr } = await supabase
        .from('wakala_applications')
        .update({
          booking_date: newDateStr,
          requested_date: newDateStr,
          slot_id: rescheduleSlot.id,
          start_time: rescheduleSlot.startTime,
          end_time: rescheduleSlot.endTime,
          duration_minutes: rescheduleDuration,
        })
        .eq('id', application.id);

      if (updErr) {
        // rollback new reservation best-effort
        await releaseSlots(rescheduleSlot.id, serviceId, rescheduleDuration, newDateStr, rescheduleSlot.startTime);
        throw updErr;
      }

      setSaveSuccess(true);
      setShowReschedule(false);
      setTimeout(() => {
        if (onUpdate) onUpdate();
      }, 500);
    } catch (e: any) {
      console.error('Reschedule error:', e);
      setRescheduleError(e?.message || (language === 'ar' ? 'فشل في إعادة الجدولة' : 'Failed to reschedule'));
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmMsg = language === 'ar'
        ? 'لديك تغييرات غير محفوظة. هل تريد المتابعة؟'
        : 'You have unsaved changes. Do you want to continue?';
      if (!confirm(confirmMsg)) return;
    }
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    onClose();
  };

  if (!application) return null;

  const isAdvisoryApp = isAdvisory(application.service_type);
  const isCancelled = application.status === 'cancelled';
  const StatusIcon = statusConfig[application.status]?.icon || Clock;

  const isAppointmentPast = (() => {
    if (!application.booking_date) return false;
    const appointmentDate = new Date(application.booking_date);
    if (application.start_time) {
      const [h, m] = application.start_time.split(':').map(Number);
      appointmentDate.setHours(h, m, 0, 0);
    }
    return appointmentDate < new Date();
  })();
  const canEdit = !isCancelled && application.status !== 'completed' && !isAppointmentPast;
  const canCancel = canEdit && application.status !== 'in_progress' && application.status !== 'approved';
  const canReschedule = canCancel && isAdvisoryApp;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className={`flex items-center justify-between p-5 border-b ${isCancelled ? 'bg-red-50' : 'bg-gradient-to-r from-primary/5 to-sand'}`}>
                <div className="flex items-center gap-3">
                  {isAdvisoryApp ? (
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isAdvisoryApp
                        ? (language === 'ar' ? 'موعد استشاري' : 'Advisory Appointment')
                        : (language === 'ar' ? 'طلب وكالة' : 'Wakala Application')}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {application.booking_reference || ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-700 font-medium">
                      {language === 'ar' ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully'}
                    </p>
                  </motion.div>
                )}

                {saveError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{saveError}</p>
                  </motion.div>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig[application.status]?.bg || 'bg-gray-50'} ${statusConfig[application.status]?.text || 'text-gray-600'}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {language === 'ar' ? (
                        application.status === 'submitted' ? 'مقدم' :
                        application.status === 'in_progress' ? 'قيد المعالجة' :
                        application.status === 'completed' ? 'مكتمل' :
                        application.status === 'cancelled' ? 'ملغى' :
                        application.status
                      ) : (
                        application.status.replace(/_/g, ' ')
                      )}
                    </span>
                  </div>

                  {isAdvisoryApp && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-600">
                        {language === 'ar' ? 'نوع الاستشارة' : 'Consultation Type'}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {getAdvisoryReasonLabel(application.service_type, language)}
                      </p>
                    </div>
                  )}

                  {!isAdvisoryApp && application.wakala_type && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-600">
                        {language === 'ar' ? 'نوع الوكالة' : 'Wakala Type'}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {getWakalaTypeLabel(application.wakala_type, language)}
                      </p>
                    </div>
                  )}
                </div>

                {showReschedule && isAdvisoryApp && (
                  <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-700" />
                        <span className="text-sm font-bold text-blue-900">
                          {language === 'ar' ? 'إعادة جدولة الموعد' : 'Reschedule Appointment'}
                        </span>
                      </div>
                      <button
                        onClick={() => { setShowReschedule(false); setRescheduleError(''); }}
                        className="text-blue-700 hover:text-blue-900 text-sm font-semibold"
                      >
                        {language === 'ar' ? 'إغلاق' : 'Close'}
                      </button>
                    </div>

                    <div className="p-4 space-y-4">
                      {rescheduleError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          <p className="text-sm text-red-700">{rescheduleError}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">{language === 'ar' ? 'اختر التاريخ' : 'Select Date'}</p>
                          <div className="max-w-md">
                            <BookingCalendar
                              selectedDate={rescheduleDate}
                              onDateSelect={(d) => { setRescheduleDate(d); setRescheduleSlot(null); }}
                              maxDaysAhead={30}
                              unavailableDates={[]}
                              fullyBookedDates={[]}
                              slotCounts={{}}
                              autoSelectNearest={false}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">{language === 'ar' ? 'المدة' : 'Duration'}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => { setRescheduleDuration(30); setRescheduleSlot(null); }}
                                className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                  rescheduleDuration === 30 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50'
                                }`}
                              >
                                30 {language === 'ar' ? 'دقيقة' : 'min'}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setRescheduleDuration(60); setRescheduleSlot(null); }}
                                className={`px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                                  rescheduleDuration === 60 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50'
                                }`}
                              >
                                60 {language === 'ar' ? 'دقيقة' : 'min'}
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">{language === 'ar' ? 'اختر الوقت' : 'Select Time'}</p>
                            <TimeSlotGrid
                              selectedDate={rescheduleDate}
                              slots={rescheduleSlots}
                              selectedSlot={rescheduleSlot}
                              onSlotSelect={(s) => { setRescheduleSlot(s); setRescheduleError(''); }}
                              workingHours={rescheduleWorkingHours}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleConfirmReschedule}
                            disabled={isRescheduling || !rescheduleDate || !rescheduleDuration || !rescheduleSlot}
                            className="w-full mt-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
                          >
                            {isRescheduling
                              ? (language === 'ar' ? 'جاري إعادة الجدولة...' : 'Rescheduling...')
                              : (language === 'ar' ? 'تأكيد إعادة الجدولة' : 'Confirm Reschedule')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {application.booking_date && (
                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {language === 'ar' ? 'موعد الحجز' : 'Appointment Date'}
                        </p>
                        <p className="text-base font-bold text-gray-900 mt-1">
                          {new Date(application.booking_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {application.start_time && application.end_time && (
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <p className="text-sm font-semibold text-gray-700">
                              {formatTimeRange(application.start_time, application.end_time)}
                            </p>
                            {application.duration_minutes && (
                              <span className="text-xs text-gray-600">
                                ({application.duration_minutes} {language === 'ar' ? 'دقيقة' : 'minutes'})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                    {language === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
                    {!isEditMode && canEdit && (
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        {language === 'ar' ? 'تعديل' : 'Edit'}
                      </button>
                    )}
                    {isAppointmentPast && !isCancelled && application.status !== 'completed' && (
                      <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg">
                        {language === 'ar' ? 'انتهى الموعد' : 'Appointment passed'}
                      </span>
                    )}
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        <User className="w-4 h-4" />
                        {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                      </label>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      ) : (
                        <p className="text-base text-gray-900 font-medium">{application.full_name || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        <Phone className="w-4 h-4" />
                        {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      </label>
                      {isEditMode ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          dir="ltr"
                        />
                      ) : (
                        <p className="text-base text-gray-900 font-medium" dir="ltr">{application.phone || '-'}</p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        <Mail className="w-4 h-4" />
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </label>
                      {isEditMode ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          dir="ltr"
                        />
                      ) : (
                        <p className="text-base text-gray-900 font-medium" dir="ltr">{application.email || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {!isAdvisoryApp && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      {language === 'ar' ? 'تفاصيل الوكالة' : 'Wakala Details'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          {language === 'ar' ? 'اسم الموكل' : 'Applicant Name'}
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={formData.applicant_name}
                            onChange={(e) => handleInputChange('applicant_name', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        ) : (
                          <p className="text-base text-gray-900 font-medium">{application.applicant_name || '-'}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          {language === 'ar' ? 'اسم الوكيل' : 'Agent Name'}
                        </label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={formData.agent_name}
                            onChange={(e) => handleInputChange('agent_name', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        ) : (
                          <p className="text-base text-gray-900 font-medium">{application.agent_name || '-'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {application.special_requests && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-600 block">
                      {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
                    </label>
                    {isEditMode ? (
                      <textarea
                        value={formData.special_requests}
                        onChange={(e) => handleInputChange('special_requests', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      />
                    ) : (
                      <p className="text-base text-gray-700 bg-gray-50 rounded-lg p-3">{application.special_requests}</p>
                    )}
                  </div>
                )}

                {!isAdvisoryApp && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                      {language === 'ar' ? 'صور المستندات' : 'Document Images'}
                    </h3>

                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          {language === 'ar' ? 'صورة جواز سفر الموكل' : 'Applicant Passport Copy'}
                        </label>
                        {formData.applicant_passport_url ? (
                          <div className="relative group">
                            <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={formData.applicant_passport_url}
                                alt={language === 'ar' ? 'جواز سفر الموكل' : 'Applicant Passport'}
                                className="w-full h-full object-contain"
                              />
                              {isEditMode && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setImageToView(formData.applicant_passport_url)}
                                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    <ExternalLink className="w-5 h-5 text-gray-700" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteImage('applicant_passport_url')}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          isEditMode && (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Upload className="w-8 h-8 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  {uploadingImage
                                    ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...')
                                    : (language === 'ar' ? 'انقر لرفع الصورة' : 'Click to upload image')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {language === 'ar' ? 'JPG, PNG أو PDF (حد أقصى 5MB)' : 'JPG, PNG or PDF (Max 5MB)'}
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                onChange={(e) => handleImageUpload(e, 'applicant_passport_url')}
                                disabled={uploadingImage}
                              />
                            </label>
                          )
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          {language === 'ar' ? 'صورة جواز سفر الوكيل' : 'Attorney Passport Copy'}
                        </label>
                        {formData.attorney_passport_url ? (
                          <div className="relative group">
                            <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                src={formData.attorney_passport_url}
                                alt={language === 'ar' ? 'جواز سفر الوكيل' : 'Attorney Passport'}
                                className="w-full h-full object-contain"
                              />
                              {isEditMode && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setImageToView(formData.attorney_passport_url)}
                                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    <ExternalLink className="w-5 h-5 text-gray-700" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteImage('attorney_passport_url')}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          isEditMode && (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Upload className="w-8 h-8 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  {uploadingImage
                                    ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...')
                                    : (language === 'ar' ? 'انقر لرفع الصورة' : 'Click to upload image')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {language === 'ar' ? 'JPG, PNG أو PDF (حد أقصى 5MB)' : 'JPG, PNG or PDF (Max 5MB)'}
                                </p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/jpg,image/png,application/pdf"
                                onChange={(e) => handleImageUpload(e, 'attorney_passport_url')}
                                disabled={uploadingImage}
                              />
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {application.fee_amount !== null && application.fee_amount !== undefined && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'ar' ? 'الرسوم' : 'Fee'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {application.fee_amount === 0
                            ? (language === 'ar' ? 'مجاناً' : 'Free')
                            : `£${application.fee_amount}`}
                        </span>
                        {application.payment_status === 'paid' && (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                  {language === 'ar' ? 'تم الإنشاء في' : 'Created at'}: {new Date(application.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-GB')}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 p-5 border-t bg-gray-50">
                {isEditMode ? (
                  <div className="flex items-center gap-3 ml-auto">
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setFormData({
                          full_name: application.full_name || '',
                          phone: application.phone || '',
                          email: application.email || '',
                          special_requests: application.special_requests || '',
                          applicant_name: application.applicant_name || '',
                          agent_name: application.agent_name || '',
                          applicant_passport_url: application.applicant_passport_url || '',
                          attorney_passport_url: application.attorney_passport_url || '',
                          passport_copies: application.passport_copies || [],
                        });
                        setHasUnsavedChanges(false);
                      }}
                      disabled={isSaving}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !hasUnsavedChanges}
                      className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving
                        ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                        : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      {language === 'ar' ? 'إغلاق' : 'Close'}
                    </button>

                    <div className="flex items-center gap-2">
                      {canReschedule && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowReschedule(true);
                            setIsEditMode(false);
                            setRescheduleError('');
                          }}
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          {language === 'ar' ? 'تعديل الموعد' : 'Reschedule'}
                        </button>
                      )}

                      {canCancel && (
                        <button
                          type="button"
                          onClick={handleCancelRequest}
                          disabled={isCancelling}
                          className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-60"
                        >
                          {isCancelling
                            ? (language === 'ar' ? 'جاري الإلغاء...' : 'Cancelling...')
                            : (isAdvisoryApp
                              ? (language === 'ar' ? 'إلغاء الموعد' : 'Cancel Appointment')
                              : (language === 'ar' ? 'إلغاء الطلب' : 'Cancel Request'))}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {imageToView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setImageToView(null)}
            className="fixed inset-0 z-[10010] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[90vw] h-[90vh]"
            >
              <div className="relative w-full h-full bg-white rounded-lg overflow-hidden">
                <button
                  onClick={() => setImageToView(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
                <div className="w-full h-full flex items-center justify-center p-8">
                  <img
                    src={imageToView}
                    alt={language === 'ar' ? 'معاينة الصورة' : 'Image Preview'}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
