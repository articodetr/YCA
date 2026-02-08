import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2, CheckCircle, AlertCircle, X, User, Phone, Mail, Building2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Calendar from '../../components/booking/Calendar';
import TimeSlotGrid from '../../components/booking/TimeSlotGrid';
import BookingSummaryCard from '../../components/booking/BookingSummaryCard';
import {
  getAvailableSlotsForDuration, reserveSlots, getUnavailableDatesWithReasons,
  getEffectiveWorkingHours, checkSlotStillAvailable, findNearestAvailableSlot,
  getPublicSlotCounts,
} from '../../lib/booking-utils';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { BookingResult } from './BookPage';

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

interface AdvisoryBookingFormProps {
  onComplete: (result: BookingResult) => void;
}

const translationsData = {
  en: {
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
    } as Record<string, string>,
    selectReason: 'Select reason',
    notes: 'Additional Notes (Optional)',
    notesPlaceholder: 'Any additional information you would like to share...',
    submit: 'Confirm Booking',
    submitting: 'Booking...',
    selectDateTime: 'Please select a date and time',
    fillRequired: 'Please fill in all required fields',
    freeService: 'This is a free service',
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
    errorMsg: 'Failed to book appointment. Please try again.',
    memberPromo: 'Already a member? Sign in to auto-fill your details.',
    signIn: 'Sign In',
  },
  ar: {
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
    } as Record<string, string>,
    selectReason: 'اختر السبب',
    notes: 'ملاحظات إضافية (اختياري)',
    notesPlaceholder: 'أي معلومات إضافية تود مشاركتها...',
    submit: 'تأكيد الحجز',
    submitting: 'جاري الحجز...',
    selectDateTime: 'يرجى اختيار التاريخ والوقت',
    fillRequired: 'يرجى ملء جميع الحقول المطلوبة',
    freeService: 'هذه خدمة مجانية',
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
    errorMsg: 'فشل في الحجز. يرجى المحاولة مرة أخرى.',
    memberPromo: 'عضو بالفعل؟ سجل دخولك لتعبئة بياناتك تلقائياً.',
    signIn: 'تسجيل الدخول',
  },
};

export default function AdvisoryBookingForm({ onComplete }: AdvisoryBookingFormProps) {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const isRTL = language === 'ar';
  const t = translationsData[language];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    loadAdvisoryService();
    loadSettings();
    loadUserData();
    loadUnavailableDates();
    return () => cleanupRealtimeAndPolling();
  }, []);

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
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'availability_slots',
        filter: `service_id=eq.${advisoryService.id}`,
      }, (payload) => {
        const updated = payload.new as { id: string; is_available: boolean; date: string };
        if (updated.date !== dateStr) return;
        if (!updated.is_available) {
          setRecentlyBookedSlotIds(prev => new Set([...prev, updated.id]));
          setTimeout(() => {
            setRecentlyBookedSlotIds(prev => { const next = new Set(prev); next.delete(updated.id); return next; });
          }, 3000);
        }
        setSlots(prev => prev.map(s => s.id === updated.id ? { ...s, isAvailable: updated.is_available } : s));
        setSelectedSlot(prev => {
          if (prev && prev.id === updated.id && !updated.is_available) {
            setSlotWarning(t.slotTaken);
            return null;
          }
          return prev;
        });
        loadUnavailableDates();
      })
      .subscribe();
    realtimeChannelRef.current = channel;
  };

  const setupPolling = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(() => {
      if (advisoryService && selectedDate && selectedDuration) loadSlots();
      loadUnavailableDates();
    }, 10000);
  };

  const loadUserData = async () => {
    if (!user) { setIsMember(false); setMemberData(null); return; }
    const { data: member } = await supabase
      .from('members').select('*').eq('email', user.email).eq('status', 'active').maybeSingle();
    if (member) {
      const fullName = member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim();
      setIsMember(true);
      setMemberData({ fullName, phone: member.phone || '', email: member.email || user.email || '', membershipNumber: member.membership_number || '' });
      setFormData(prev => ({ ...prev, fullName, phone: member.phone || '', email: member.email || user.email || '' }));
    } else {
      setIsMember(false); setMemberData(null);
      const { data: application } = await supabase
        .from('membership_applications')
        .select('first_name, last_name, email, phone')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (application) {
        const fullName = `${application.first_name || ''} ${application.last_name || ''}`.trim();
        setFormData(prev => ({
          ...prev,
          fullName: fullName || prev.fullName,
          phone: application.phone || prev.phone,
          email: application.email || user.email || prev.email,
        }));
      } else {
        const meta = user.user_metadata || {};
        setFormData(prev => ({ ...prev, fullName: meta.full_name || meta.name || '', phone: meta.phone || '', email: user.email || '' }));
      }
    }
  };

  const loadAdvisoryService = async () => {
    try {
      const { data } = await supabase.from('booking_services').select('*').eq('name_en', 'Advisory Bureau').eq('is_active', true).maybeSingle();
      if (data) { setAdvisoryService(data); } else {
        const { data: fallback } = await supabase.from('booking_services').select('*').eq('is_active', true).limit(1).maybeSingle();
        if (fallback) setAdvisoryService(fallback);
      }
    } catch (err) { console.error('Error loading service:', err); }
  };

  const loadSettings = async () => {
    try {
      const { data } = await supabase.from('booking_settings').select('max_booking_days_ahead').maybeSingle();
      if (data) setMaxDaysAhead(data.max_booking_days_ahead);
    } catch (err) { console.error('Error loading settings:', err); }
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
    } catch (err) { console.error('Error loading unavailable dates:', err); }
  };

  const loadSlots = async () => {
    if (!advisoryService || !selectedDate || !selectedDuration) return;
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const hours = await getEffectiveWorkingHours(dateStr);
      if (hours && hours.is_active) {
        setWorkingHours({ startTime: hours.start_time, endTime: hours.end_time, breakTimes: hours.break_times });
      } else { setWorkingHours(null); }
      const availableSlots = await getAvailableSlotsForDuration(advisoryService.id, dateStr, selectedDuration);
      setSlots(availableSlots.map(s => ({ id: s.id, startTime: s.start_time, endTime: s.end_time, isAvailable: s.is_available })));
    } catch (err) { console.error('Error loading slots:', err); setSlots([]); }
  };

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSlotWarning('');
    if (!selectedDate || !selectedSlot) { setError(t.selectDateTime); return; }
    if (!formData.reason || !formData.fullName || !formData.phone || !formData.email) { setError(t.fillRequired); return; }
    if (!advisoryService) return;

    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const stillAvailable = await checkSlotStillAvailable(selectedSlot.id);
      if (!stillAvailable) {
        await loadSlots();
        const nearest = await findNearestAvailableSlot(advisoryService.id, dateStr, selectedSlot.startTime, selectedDuration!);
        setSelectedSlot(null);
        setSlotWarning(nearest ? `${t.slotNoLongerAvailable} ${t.slotTakenSuggestion} ${formatTimeDisplay(nearest.start_time)}.` : t.tryDifferentDate);
        setLoading(false); return;
      }

      const reserveResult = await reserveSlots({
        slot_id: selectedSlot.id, service_id: advisoryService.id, booking_date: dateStr,
        start_time: selectedSlot.startTime, end_time: selectedSlot.endTime, duration_minutes: selectedDuration!,
      });

      if (!reserveResult.success) {
        await loadSlots();
        const nearest = await findNearestAvailableSlot(advisoryService.id, dateStr, selectedSlot.startTime, selectedDuration!);
        setSelectedSlot(null);
        setSlotWarning(nearest ? `${t.slotTaken} ${t.slotTakenSuggestion} ${formatTimeDisplay(nearest.start_time)}.` : t.tryDifferentDate);
        setLoading(false); return;
      }

      const contactName = formData.fullName;
      const contactPhone = formData.phone;
      const contactEmail = formData.email;

      const { data: inserted, error: insertError } = await supabase.from('wakala_applications').insert([{
        user_id: user?.id || null,
        full_name: contactName, phone: contactPhone, email: contactEmail,
        booking_date: dateStr, requested_date: dateStr,
        service_type: `advisory_${formData.reason}`,
        special_requests: formData.notes,
        slot_id: selectedSlot.id,
        start_time: selectedSlot.startTime, end_time: selectedSlot.endTime,
        duration_minutes: selectedDuration,
        fee_amount: 0, payment_status: 'paid', status: 'submitted',
      }]).select('booking_reference').maybeSingle();

      if (insertError) throw insertError;
      cleanupRealtimeAndPolling();

      onComplete({
        bookingReference: inserted?.booking_reference || '',
        serviceType: 'advisory',
        date: dateStr,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        fullName: contactName || '',
        email: contactEmail || '',
        fee: 0,
      });
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || t.errorMsg);
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 sm:px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t.title}</h2>
            <p className="text-emerald-100 text-sm mt-1">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
          <button onClick={() => setError('')} className={`text-red-600 hover:text-red-800 ${isRTL ? 'mr-auto' : 'ml-auto'}`}><X className="w-4 h-4" /></button>
        </div>
      )}
      {slotWarning && (
        <div className="mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{slotWarning}</p>
          <button onClick={() => setSlotWarning('')} className={`text-amber-600 hover:text-amber-800 ${isRTL ? 'mr-auto' : 'ml-auto'}`}><X className="w-4 h-4" /></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-emerald-800 font-medium text-sm">{t.freeService}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isMember ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                  <User className={`w-5 h-5 ${isMember ? 'text-emerald-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t.contactInfo}</h3>
                  {isMember && memberData ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mt-1">
                      <CheckCircle className="w-3 h-3" /> {t.memberBadge}
                      {memberData.membershipNumber && <span className="mx-1">#{memberData.membershipNumber}</span>}
                    </span>
                  ) : (
                    <p className="text-sm text-gray-600 mt-0.5">{t.contactInfoDesc}</p>
                  )}
                </div>
              </div>
              {!user && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm text-blue-800">{t.memberPromo}</p>
                  <Link to="/member/login?redirect=/book" className="text-sm font-semibold text-blue-700 hover:text-blue-900 underline">{t.signIn}</Link>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName} *</label>
                  <input type="text" value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone} *</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.email} *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" required />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">{t.selectDate}</h4>
                <div className="max-w-md mx-auto">
                  <Calendar selectedDate={selectedDate}
                    onDateSelect={date => { setSelectedDate(date); setSelectedDuration(null); setSelectedSlot(null); }}
                    maxDaysAhead={maxDaysAhead} unavailableDates={unavailableDates}
                    fullyBookedDates={fullyBookedDates} slotCounts={slotCounts}
                    autoSelectNearest />
                </div>
              </div>
              {selectedDate && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">{t.selectDuration}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button type="button" onClick={() => { setSelectedDuration(30); setSelectedSlot(null); }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${selectedDuration === 30 ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 bg-white'}`}>
                      <span className="font-bold text-lg text-gray-900">{t.duration30}</span>
                      <p className="text-sm text-gray-600 mt-1">{t.duration30Desc}</p>
                    </button>
                    <button type="button" onClick={() => { setSelectedDuration(60); setSelectedSlot(null); }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${selectedDuration === 60 ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 bg-white'}`}>
                      <span className="font-bold text-lg text-gray-900">{t.duration60}</span>
                      <p className="text-sm text-gray-600 mt-1">{t.duration60Desc}</p>
                    </button>
                  </div>
                </div>
              )}
              {selectedDate && selectedDuration && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">{t.selectTime}</h4>
                  <TimeSlotGrid selectedDate={selectedDate} slots={slots} selectedSlot={selectedSlot}
                    onSlotSelect={(slot) => { setSlotWarning(''); setSelectedSlot(slot); }}
                    workingHours={workingHours} recentlyBookedSlotIds={recentlyBookedSlotIds} />
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.reason} *</label>
                <select value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none" required>
                  <option value="">{t.selectReason}</option>
                  {Object.entries(t.reasons).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.notes}</label>
                <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" placeholder={t.notesPlaceholder} />
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
              isFormComplete={!!formData.reason && !!formData.fullName && !!formData.phone && !!formData.email}
              onSubmit={() => {}}
              isSubmitting={loading}
            />
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.submitting}</> : t.submit}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
