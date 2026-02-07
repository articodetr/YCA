import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, CheckCircle, AlertCircle, X, User, Phone, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Calendar from '../booking/Calendar';
import TimeSlotGrid from '../booking/TimeSlotGrid';
import BookingSummaryCard from '../booking/BookingSummaryCard';
import { getAvailableSlotsForDuration, reserveSlots, getUnavailableDatesWithReasons, getEffectiveWorkingHours, checkSlotStillAvailable, findNearestAvailableSlot, getPublicSlotCounts } from '../../lib/booking-utils';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
}

interface AdvisoryBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdvisoryBookingModal({ isOpen, onClose, onSuccess }: AdvisoryBookingModalProps) {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'booking' | 'success'>('booking');

  const [advisoryService, setAdvisoryService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<30 | 60 | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [maxDaysAhead, setMaxDaysAhead] = useState(30);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [workingHours, setWorkingHours] = useState<{ startTime: string; endTime: string; breakTimes: { start: string; end: string }[] } | null>(null);

  const [recentlyBookedSlotIds, setRecentlyBookedSlotIds] = useState<Set<string>>(new Set());
  const [slotWarning, setSlotWarning] = useState('');
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isMember, setIsMember] = useState(false);
  const [memberData, setMemberData] = useState<{ fullName: string; phone: string; email: string; membershipNumber: string } | null>(null);

  const [formData, setFormData] = useState({
    reason: '',
    notes: '',
    fullName: '',
    phone: '',
    email: '',
  });

  const t = language === 'ar' ? {
    title: 'حجز موعد المكتب الاستشاري',
    subtitle: 'اختر التاريخ والوقت لموعدك',
    selectDate: 'اختر التاريخ',
    selectDuration: 'اختر المدة',
    selectTime: 'اختر الوقت',
    duration30: 'موعد سريع - 30 دقيقة',
    duration60: 'موعد ممتد - ساعة كاملة',
    duration30Desc: 'استشارة سريعة أو متابعة',
    duration60Desc: 'استشارة شاملة',
    reason: 'سبب الموعد',
    reasons: {
      welfare_benefits: 'المزايا الاجتماعية',
      housing: 'الإسكان',
      immigration: 'الهجرة',
      employment: 'التوظيف',
      education: 'التعليم',
      health: 'الصحة',
      legal: 'قانوني',
      other: 'أخرى',
    },
    selectReason: 'اختر السبب',
    notes: 'ملاحظات إضافية (اختياري)',
    notesPlaceholder: 'أي معلومات إضافية تود مشاركتها...',
    submit: 'تأكيد الحجز',
    submitting: 'جاري الحجز...',
    cancel: 'إلغاء',
    closeModal: 'إغلاق',
    successTitle: 'تم الحجز بنجاح!',
    successMsg: 'تم حجز موعدك في المكتب الاستشاري. سنتواصل معك لتأكيد الموعد.',
    errorMsg: 'فشل في الحجز. يرجى المحاولة مرة أخرى.',
    selectDateTime: 'يرجى اختيار التاريخ والوقت',
    fillRequired: 'يرجى ملء جميع الحقول المطلوبة',
    freeService: 'هذه خدمة مجانية',
    closeConfirm: 'هل تريد الإغلاق؟ سيتم فقدان البيانات.',
    memberInfo: 'بيانات العضو',
    contactInfo: 'بيانات الاتصال',
    contactInfoDesc: 'أدخل بياناتك للتواصل معك بخصوص الموعد',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    memberBadge: 'عضو مسجل',
    membershipNumber: 'رقم العضوية',
    slotTaken: 'الوقت الذي اخترته تم حجزه للتو من قبل شخص آخر. يرجى اختيار وقت آخر.',
    slotTakenSuggestion: 'أقرب وقت متاح هو',
    slotNoLongerAvailable: 'هذا الوقت لم يعد متاحاً. تم تحديث الأوقات المتاحة.',
    tryDifferentDate: 'لا توجد أوقات متاحة لهذا التاريخ. يرجى اختيار تاريخ آخر.',
  } : {
    title: 'Advisory Bureau Appointment',
    subtitle: 'Select a date and time for your appointment',
    selectDate: 'Select Date',
    selectDuration: 'Select Duration',
    selectTime: 'Select Time',
    duration30: 'Quick Appointment - 30 Minutes',
    duration60: 'Extended Appointment - 1 Hour',
    duration30Desc: 'Quick consultation or follow-up',
    duration60Desc: 'Comprehensive consultation',
    reason: 'Reason for Appointment',
    reasons: {
      welfare_benefits: 'Welfare Benefits',
      housing: 'Housing',
      immigration: 'Immigration',
      employment: 'Employment',
      education: 'Education',
      health: 'Health',
      legal: 'Legal',
      other: 'Other',
    },
    selectReason: 'Select reason',
    notes: 'Additional Notes (Optional)',
    notesPlaceholder: 'Any additional information you would like to share...',
    submit: 'Confirm Booking',
    submitting: 'Booking...',
    cancel: 'Cancel',
    closeModal: 'Close',
    successTitle: 'Booking Confirmed!',
    successMsg: 'Your advisory bureau appointment has been booked. We will contact you to confirm.',
    errorMsg: 'Failed to book appointment. Please try again.',
    selectDateTime: 'Please select a date and time',
    fillRequired: 'Please fill in all required fields',
    freeService: 'This is a free service',
    closeConfirm: 'Are you sure you want to close? Your changes will be lost.',
    memberInfo: 'Member Information',
    contactInfo: 'Contact Information',
    contactInfoDesc: 'Enter your details so we can reach you about your appointment',
    fullName: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    memberBadge: 'Registered Member',
    membershipNumber: 'Membership Number',
    slotTaken: 'The time you selected was just booked by someone else. Please choose a different time.',
    slotTakenSuggestion: 'The nearest available time is',
    slotNoLongerAvailable: 'This time slot is no longer available. Available times have been updated.',
    tryDifferentDate: 'No available times for this date. Please try a different date.',
  };

  const cleanupRealtimeAndPolling = useCallback(() => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAdvisoryService();
      loadSettings();
      loadUserData();
      loadUnavailableDates();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      cleanupRealtimeAndPolling();
      resetForm();
    }
    return () => {
      document.body.style.overflow = 'unset';
      cleanupRealtimeAndPolling();
    };
  }, [isOpen]);

  useEffect(() => {
    if (advisoryService && selectedDate && selectedDuration) {
      loadSlots();
      setupRealtimeSubscription();
      setupPolling();
    } else {
      cleanupRealtimeAndPolling();
    }
    return cleanupRealtimeAndPolling;
  }, [advisoryService, selectedDate, selectedDuration]);

  const setupRealtimeSubscription = () => {
    if (!advisoryService || !selectedDate) return;
    cleanupRealtimeAndPolling();

    const dateStr = selectedDate.toISOString().split('T')[0];
    const channel = supabase
      .channel(`slots-${dateStr}-${advisoryService.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'availability_slots',
          filter: `service_id=eq.${advisoryService.id}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; is_available: boolean; date: string };
          if (updated.date !== dateStr) return;

          if (!updated.is_available) {
            setRecentlyBookedSlotIds(prev => new Set([...prev, updated.id]));
            setTimeout(() => {
              setRecentlyBookedSlotIds(prev => {
                const next = new Set(prev);
                next.delete(updated.id);
                return next;
              });
            }, 3000);
          }

          setSlots(prev => prev.map(s =>
            s.id === updated.id ? { ...s, isAvailable: updated.is_available } : s
          ));

          setSelectedSlot(prev => {
            if (prev && prev.id === updated.id && !updated.is_available) {
              setSlotWarning(t.slotTaken);
              return null;
            }
            return prev;
          });
          loadUnavailableDates();
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  };

  const setupPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    pollingIntervalRef.current = setInterval(() => {
      if (advisoryService && selectedDate && selectedDuration) {
        loadSlots();
      }
      loadUnavailableDates();
    }, 10000);
  };

  const loadUserData = async () => {
    if (!user) {
      setIsMember(false);
      setMemberData(null);
      return;
    }

    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('email', user.email)
      .eq('status', 'active')
      .maybeSingle();

    if (member) {
      const fullName = member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim();
      setIsMember(true);
      setMemberData({
        fullName,
        phone: member.phone || '',
        email: member.email || user.email || '',
        membershipNumber: member.membership_number || '',
      });
      setFormData(prev => ({
        ...prev,
        fullName: fullName,
        phone: member.phone || '',
        email: member.email || user.email || '',
      }));
    } else {
      setIsMember(false);
      setMemberData(null);
      const meta = user.user_metadata || {};
      setFormData(prev => ({
        ...prev,
        fullName: meta.full_name || meta.name || '',
        phone: meta.phone || '',
        email: user.email || '',
      }));
    }
  };

  const loadAdvisoryService = async () => {
    try {
      const { data } = await supabase
        .from('booking_services')
        .select('*')
        .eq('name_en', 'Advisory Bureau')
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        setAdvisoryService(data);
      } else {
        const { data: fallback } = await supabase
          .from('booking_services')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();
        if (fallback) setAdvisoryService(fallback);
      }
    } catch (err) {
      console.error('Error loading service:', err);
    }
  };

  const loadSettings = async () => {
    try {
      const { data } = await supabase.from('booking_settings').select('max_booking_days_ahead').maybeSingle();
      if (data) setMaxDaysAhead(data.max_booking_days_ahead);
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const loadUnavailableDates = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + maxDaysAhead);
      const endStr = endDate.toISOString().split('T')[0];

      const datesWithReasons = await getUnavailableDatesWithReasons(todayStr, endStr);
      const unavailable: string[] = [];
      const fullyBooked: string[] = [];
      for (const item of datesWithReasons) {
        if (item.reason === 'fully_booked') {
          fullyBooked.push(item.date);
        } else {
          unavailable.push(item.date);
        }
      }
      setUnavailableDates(unavailable);
      setFullyBookedDates(fullyBooked);

      if (advisoryService) {
        const counts = await getPublicSlotCounts(advisoryService.id, todayStr, endStr);
        setSlotCounts(counts);
      }
    } catch (err) {
      console.error('Error loading unavailable dates:', err);
    }
  };

  const loadSlots = async () => {
    if (!advisoryService || !selectedDate || !selectedDuration) return;
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const hours = await getEffectiveWorkingHours(dateStr);
      if (hours && hours.is_active) {
        setWorkingHours({ startTime: hours.start_time, endTime: hours.end_time, breakTimes: hours.break_times });
      } else {
        setWorkingHours(null);
      }
      const availableSlots = await getAvailableSlotsForDuration(advisoryService.id, dateStr, selectedDuration);
      setSlots(availableSlots.map(s => ({ id: s.id, startTime: s.start_time, endTime: s.end_time, isAvailable: s.is_available })));
    } catch (err) {
      console.error('Error loading slots:', err);
      setSlots([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSlotWarning('');

    if (!selectedDate || !selectedSlot) {
      setError(t.selectDateTime);
      return;
    }
    if (!formData.reason) {
      setError(t.fillRequired);
      return;
    }

    if (!isMember && (!formData.fullName || !formData.phone || !formData.email)) {
      setError(t.fillRequired);
      return;
    }

    if (!advisoryService) return;

    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const stillAvailable = await checkSlotStillAvailable(selectedSlot.id);
      if (!stillAvailable) {
        await loadSlots();
        const nearest = await findNearestAvailableSlot(
          advisoryService.id, dateStr, selectedSlot.startTime, selectedDuration!
        );
        setSelectedSlot(null);
        if (nearest) {
          const formatT = (time: string) => {
            const [h, m] = time.split(':');
            const hour = parseInt(h);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const h12 = hour % 12 || 12;
            return `${h12}:${m} ${ampm}`;
          };
          setSlotWarning(`${t.slotNoLongerAvailable} ${t.slotTakenSuggestion} ${formatT(nearest.start_time)}.`);
        } else {
          setSlotWarning(t.tryDifferentDate);
        }
        setLoading(false);
        return;
      }

      const reserveResult = await reserveSlots({
        slot_id: selectedSlot.id,
        service_id: advisoryService.id,
        booking_date: dateStr,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        duration_minutes: selectedDuration!,
      });

      if (!reserveResult.success) {
        await loadSlots();
        const nearest = await findNearestAvailableSlot(
          advisoryService.id, dateStr, selectedSlot.startTime, selectedDuration!
        );
        setSelectedSlot(null);
        if (nearest) {
          const formatT = (time: string) => {
            const [h, m] = time.split(':');
            const hour = parseInt(h);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const h12 = hour % 12 || 12;
            return `${h12}:${m} ${ampm}`;
          };
          setSlotWarning(`${t.slotTaken} ${t.slotTakenSuggestion} ${formatT(nearest.start_time)}.`);
        } else {
          setSlotWarning(t.tryDifferentDate);
        }
        setLoading(false);
        return;
      }

      const contactName = isMember ? memberData?.fullName : formData.fullName;
      const contactPhone = isMember ? memberData?.phone : formData.phone;
      const contactEmail = isMember ? memberData?.email : formData.email;

      const { error: insertError } = await supabase.from('wakala_applications').insert([{
        user_id: user?.id || null,
        full_name: contactName,
        phone: contactPhone,
        email: contactEmail,
        booking_date: dateStr,
        requested_date: dateStr,
        service_type: `advisory_${formData.reason}`,
        special_requests: formData.notes,
        slot_id: selectedSlot.id,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        duration_minutes: selectedDuration,
        fee_amount: 0,
        payment_status: 'paid',
        status: 'submitted',
      }]);

      if (insertError) throw insertError;
      cleanupRealtimeAndPolling();
      setStep('success');
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || t.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onSuccess?.();
      onClose();
      return;
    }
    const hasData = formData.reason || selectedDate || selectedSlot;
    if (hasData) {
      if (window.confirm(t.closeConfirm)) onClose();
    } else {
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({ reason: '', notes: '', fullName: '', phone: '', email: '' });
    setSelectedDate(null);
    setSelectedDuration(null);
    setSelectedSlot(null);
    setError('');
    setSlotWarning('');
    setRecentlyBookedSlotIds(new Set());
    setFullyBookedDates([]);
    setSlotCounts({});
    setStep('booking');
  };

  if (!isOpen) return null;

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.successTitle}</h2>
            <p className="text-gray-600 mb-6">{t.successMsg}</p>
            <button onClick={handleClose}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              {t.closeModal}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'} onClick={e => e.stopPropagation()}>

        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
          </div>
          <button type="button" onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800 ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {slotWarning && (
          <div className="mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{slotWarning}</p>
            <button onClick={() => setSlotWarning('')} className="text-amber-600 hover:text-amber-800 ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-emerald-800 font-medium">{t.freeService}</p>
              </div>

              {isMember && memberData ? (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{t.memberInfo}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mt-1">
                        <CheckCircle className="w-3 h-3" /> {t.memberBadge}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">{memberData.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{memberData.phone || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{memberData.email}</span>
                    </div>
                    {memberData.membershipNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">{t.membershipNumber}:</span>
                        <span className="text-gray-900 font-medium">#{memberData.membershipNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{t.contactInfo}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">{t.contactInfoDesc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName} *</label>
                      <input type="text" value={formData.fullName}
                        onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone} *</label>
                      <input type="tel" value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t.email} *</label>
                      <input type="email" value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">{t.selectDate}</h4>
                  <div className="max-w-md mx-auto">
                    <Calendar
                      selectedDate={selectedDate}
                      onDateSelect={date => { setSelectedDate(date); setSelectedDuration(null); setSelectedSlot(null); }}
                      maxDaysAhead={maxDaysAhead}
                      unavailableDates={unavailableDates}
                      fullyBookedDates={fullyBookedDates}
                      slotCounts={slotCounts}
                      autoSelectNearest
                    />
                  </div>
                </div>

                {selectedDate && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{t.selectDuration}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button type="button"
                        onClick={() => { setSelectedDuration(30); setSelectedSlot(null); }}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${selectedDuration === 30 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}>
                        <span className="font-bold text-lg text-gray-900">{t.duration30}</span>
                        <p className="text-sm text-gray-600 mt-1">{t.duration30Desc}</p>
                      </button>
                      <button type="button"
                        onClick={() => { setSelectedDuration(60); setSelectedSlot(null); }}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${selectedDuration === 60 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}>
                        <span className="font-bold text-lg text-gray-900">{t.duration60}</span>
                        <p className="text-sm text-gray-600 mt-1">{t.duration60Desc}</p>
                      </button>
                    </div>
                  </div>
                )}

                {selectedDate && selectedDuration && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{t.selectTime}</h4>
                    <TimeSlotGrid
                      selectedDate={selectedDate}
                      slots={slots}
                      selectedSlot={selectedSlot}
                      onSlotSelect={(slot) => { setSlotWarning(''); setSelectedSlot(slot); }}
                      workingHours={workingHours}
                      recentlyBookedSlotIds={recentlyBookedSlotIds}
                    />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.reason} *</label>
                  <select value={formData.reason}
                    onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    required>
                    <option value="">{t.selectReason}</option>
                    {Object.entries(t.reasons).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.notes}</label>
                  <textarea value={formData.notes}
                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={t.notesPlaceholder} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <BookingSummaryCard
                serviceName={advisoryService ? (language === 'ar' ? advisoryService.name_ar : advisoryService.name_en) : (language === 'ar' ? 'المكتب الاستشاري' : 'Advisory Bureau')}
                selectedDate={selectedDate}
                selectedTime={selectedSlot}
                totalPrice={0}
                serviceType={formData.reason}
                isFormComplete={!!formData.reason && (isMember || (!!formData.fullName && !!formData.phone && !!formData.email))}
                onSubmit={() => {}}
                isSubmitting={loading}
              />
              <button type="button" onClick={handleClose} disabled={loading}
                className="w-full py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                {t.cancel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
