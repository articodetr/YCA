import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2, CheckCircle, AlertCircle, User, X, FileText, Send, Upload, Crown, Calendar as CalendarIcon,
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabase';
import { stripePromise } from '../../lib/stripe';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import FileUploadField from '../../components/booking/FileUploadField';
import Calendar from '../../components/booking/Calendar';
import TimeSlotGrid from '../../components/booking/TimeSlotGrid';
import WakalaCheckoutForm from '../../components/modals/WakalaCheckoutForm';
import type { WakalaFormPayload } from '../../components/modals/WakalaCheckoutForm';
import type { BookingResult } from './BookPage';
import {
  getAvailableSlotsForDuration, reserveSlots, getUnavailableDatesWithReasons,
  getEffectiveWorkingHours, checkSlotStillAvailable, findNearestAvailableSlot,
  getPublicSlotCounts,
} from '../../lib/booking-utils';
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

interface WakalaBookingFormProps {
  onComplete: (result: BookingResult) => void;
}

const translationsData = {
  en: {
    title: 'Wakala Application',
    subtitle: 'Complete the form, select your appointment, and upload required documents',
    personalInfo: 'Contact Details',
    contactDescription: 'Enter your contact information.',
    fullName: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    wakalaDetails: 'Wakala Details',
    applicantName: 'Applicant Name (Al-Muwakkil)',
    agentName: 'Agent Name (Al-Wakeel)',
    wakalaType: 'Wakala Type',
    wakalaFormat: 'Wakala Format',
    selectWakalaType: 'Select wakala type',
    selectWakalaFormat: 'Select wakala format',
    wakalaTypes: {
      general: 'General Power of Attorney',
      specific: 'Specific Power of Attorney',
      property: 'Property Power of Attorney',
      legal: 'Legal Representation',
      financial: 'Financial Power of Attorney',
    } as Record<string, string>,
    wakalaFormats: {
      standard: 'Standard Format',
      notarized: 'Notarized Format',
      apostille: 'With Apostille',
    } as Record<string, string>,
    documents: 'Required Documents',
    applicantPassport: 'Applicant Passport Copy',
    attorneyPassport: 'Attorney Passport Copy',
    witnessPassports: 'Witness Passports (Optional)',
    pricingInfo: 'Pricing Information',
    priceMember: '\u00A320 - First wakala for eligible members (10+ days membership)',
    priceStandard: '\u00A340 - Standard rate',
    yourPrice: 'Your Price',
    specialRequests: 'Additional Notes (Optional)',
    membershipNumber: 'Membership Number',
    consentLabel: 'I confirm that I agree to the use of my information in line with YCA Birmingham policies',
    submitAndPay: 'Submit & Proceed to Payment',
    submitting: 'Processing...',
    errorMessage: 'Failed to submit application. Please try again.',
    fillAllFields: 'Please fill all required fields',
    uploadRequired: 'Please upload applicant and attorney passport copies',
    loadingData: 'Loading your information...',
    paymentTitle: 'Complete Payment',
    settingUpPayment: 'Setting up payment...',
    paymentError: 'Failed to initialize payment. Please try again.',
    memberBadge: 'Active Member',
    memberPromo: 'Become a member to get a discounted first wakala!',
    joinNow: 'Join Now',
    signIn: 'Sign In',
    signInPromo: 'Already a member? Sign in to auto-fill your details and get member pricing.',
    backToForm: 'Back',
    selectAppointment: 'Select Appointment',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    selectDateTimeRequired: 'Please select a date and time for your appointment',
    slotTaken: 'The time you selected was just booked by someone else. Please choose a different time.',
    slotTakenSuggestion: 'The nearest available time is',
    slotNoLongerAvailable: 'This time slot is no longer available. Available times have been updated.',
    tryDifferentDate: 'No available times for this date. Please try a different date.',
    appointmentDuration: '30-minute appointment',
  },
  ar: {
    title: 'طلب وكالة',
    subtitle: 'أكمل النموذج، اختر موعدك، وارفق المستندات المطلوبة',
    personalInfo: 'بيانات الاتصال',
    contactDescription: 'أدخل معلومات الاتصال الخاصة بك.',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    wakalaDetails: 'تفاصيل الوكالة',
    applicantName: 'اسم الموكّل',
    agentName: 'اسم الوكيل',
    wakalaType: 'نوع الوكالة',
    wakalaFormat: 'صيغة الوكالة',
    selectWakalaType: 'اختر نوع الوكالة',
    selectWakalaFormat: 'اختر صيغة الوكالة',
    wakalaTypes: {
      general: 'توكيل عام',
      specific: 'توكيل خاص',
      property: 'توكيل عقاري',
      legal: 'توكيل قضائي',
      financial: 'توكيل مالي',
    } as Record<string, string>,
    wakalaFormats: {
      standard: 'الصيغة العادية',
      notarized: 'الصيغة الموثقة',
      apostille: 'مع أبوستيل',
    } as Record<string, string>,
    documents: 'المستندات المطلوبة',
    applicantPassport: 'جواز سفر الموكّل',
    attorneyPassport: 'جواز سفر الوكيل',
    witnessPassports: 'جوازات الشهود (اختياري)',
    pricingInfo: 'معلومات التسعير',
    priceMember: '20 جنيه - أول وكالة للأعضاء المؤهلين (عضوية 10 أيام فأكثر)',
    priceStandard: '40 جنيه - السعر الأساسي',
    yourPrice: 'السعر الخاص بك',
    specialRequests: 'ملاحظات إضافية (اختياري)',
    membershipNumber: 'رقم العضوية',
    consentLabel: 'أؤكد موافقتي على استخدام معلوماتي وفقاً لسياسات جمعية الجالية اليمنية في برمنغهام',
    submitAndPay: 'تقديم الطلب والدفع',
    submitting: 'جاري المعالجة...',
    errorMessage: 'فشل تقديم الطلب. يرجى المحاولة مرة أخرى.',
    fillAllFields: 'يرجى تعبئة جميع الحقول المطلوبة',
    uploadRequired: 'يرجى رفع جوازات الموكل والوكيل',
    loadingData: 'جاري تحميل معلوماتك...',
    paymentTitle: 'إكمال الدفع',
    settingUpPayment: 'جاري تجهيز الدفع...',
    paymentError: 'فشل في تهيئة الدفع. يرجى المحاولة مرة أخرى.',
    memberBadge: 'عضو نشط',
    memberPromo: 'انضم كعضو واحصل على خصم لأول وكالة!',
    joinNow: 'انضم الآن',
    signIn: 'تسجيل الدخول',
    signInPromo: 'عضو بالفعل؟ سجل دخولك لتعبئة بياناتك تلقائياً والحصول على سعر الأعضاء.',
    backToForm: 'رجوع',
    selectAppointment: 'اختر الموعد',
    selectDate: 'اختر التاريخ',
    selectTime: 'اختر الوقت',
    selectDateTimeRequired: 'يرجى اختيار تاريخ ووقت لموعدك',
    slotTaken: 'الوقت الذي اخترته تم حجزه للتو من قبل شخص آخر. يرجى اختيار وقت آخر.',
    slotTakenSuggestion: 'أقرب وقت متاح هو',
    slotNoLongerAvailable: 'هذا الوقت لم يعد متاحاً. تم تحديث الأوقات المتاحة.',
    tryDifferentDate: 'لا توجد أوقات متاحة لهذا التاريخ. يرجى اختيار تاريخ آخر.',
    appointmentDuration: 'موعد 30 دقيقة',
  },
};

export default function WakalaBookingForm({ onComplete }: WakalaBookingFormProps) {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const isRTL = language === 'ar';
  const t = translationsData[language];

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [consent, setConsent] = useState(false);
  const [formPayload, setFormPayload] = useState<WakalaFormPayload | null>(null);

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: user?.email || '',
    applicantName: '', agentName: '', wakalaType: '', wakalaFormat: '',
    specialRequests: '', membershipNumber: '',
  });

  const [applicantPassportUrls, setApplicantPassportUrls] = useState<string[]>([]);
  const [attorneyPassportUrls, setAttorneyPassportUrls] = useState<string[]>([]);
  const [witnessPassportUrls, setWitnessPassportUrls] = useState<string[]>([]);

  const [membershipStatus, setMembershipStatus] = useState<'none' | 'active'>('none');
  const [memberDaysSinceJoin, setMemberDaysSinceJoin] = useState(0);
  const [previousWakalaCount, setPreviousWakalaCount] = useState(0);
  const [memberNumber, setMemberNumber] = useState('');

  const [wakalaService, setWakalaService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

  const WAKALA_DURATION = 30 as const;

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
    loadUserData();
    checkMemberEligibility();
    loadWakalaService();
    loadSettings();
    loadUnavailableDates();
    return () => cleanupRealtimeAndPolling();
  }, []);

  useEffect(() => {
    if (wakalaService && selectedDate) {
      loadSlots();
      setupRealtimeSubscription();
      setupPolling();
    } else {
      cleanupRealtimeAndPolling();
    }
    return cleanupRealtimeAndPolling;
  }, [wakalaService, selectedDate]);

  const setupRealtimeSubscription = () => {
    if (!wakalaService || !selectedDate) return;
    cleanupRealtimeAndPolling();
    const dateStr = selectedDate.toISOString().split('T')[0];
    const channel = supabase
      .channel(`wakala-slots-${dateStr}-${wakalaService.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'availability_slots',
        filter: `service_id=eq.${wakalaService.id}`,
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
      if (wakalaService && selectedDate) loadSlots();
      loadUnavailableDates();
    }, 10000);
  };

  const loadWakalaService = async () => {
    try {
      const { data } = await supabase.from('booking_services').select('*').eq('name_en', 'Wakala Services').eq('is_active', true).limit(1).maybeSingle();
      if (data) setWakalaService(data);
    } catch (err) { console.error('Error loading wakala service:', err); }
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
        if (item.reason === 'fully_booked') fullyBooked.push(item.date);
        else unavailable.push(item.date);
      }
      setUnavailableDates(unavailable);
      setFullyBookedDates(fullyBooked);
      if (wakalaService) {
        const counts = await getPublicSlotCounts(wakalaService.id, todayStr, endStr);
        setSlotCounts(counts);
      }
    } catch (err) { console.error('Error loading unavailable dates:', err); }
  };

  const loadSlots = async () => {
    if (!wakalaService || !selectedDate) return;
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const hours = await getEffectiveWorkingHours(dateStr);
      if (hours && hours.is_active) {
        setWorkingHours({ startTime: hours.start_time, endTime: hours.end_time, breakTimes: hours.break_times });
      } else { setWorkingHours(null); }
      const availableSlots = await getAvailableSlotsForDuration(wakalaService.id, dateStr, WAKALA_DURATION);
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

  const loadUserData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const { data: memberData } = await supabase.from('members').select('*').eq('email', user.email).maybeSingle();
      if (memberData) {
        const fullName = memberData.full_name || (memberData.first_name && memberData.last_name ? `${memberData.first_name} ${memberData.last_name}` : '');
        setFormData(prev => ({ ...prev, fullName: fullName || prev.fullName, phone: memberData.phone || prev.phone, email: memberData.email || user.email || prev.email }));
        if (memberData.membership_number) {
          setMemberNumber(memberData.membership_number);
          setFormData(prev => ({ ...prev, membershipNumber: memberData.membership_number }));
        }
        return;
      }
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
        setFormData(prev => ({ ...prev, fullName: meta.full_name || meta.name || prev.fullName, phone: meta.phone || prev.phone, email: user.email || prev.email }));
      }
    } catch (err) { console.error('Error loading user data:', err); }
    finally { setDataLoading(false); }
  };

  const checkMemberEligibility = async () => {
    if (!user) return;
    try {
      const { data: member } = await supabase.from('members').select('membership_start_date, status').eq('email', user.email).eq('status', 'active').maybeSingle();
      if (member?.membership_start_date) {
        setMembershipStatus('active');
        const diffDays = Math.floor((Date.now() - new Date(member.membership_start_date).getTime()) / (1000 * 60 * 60 * 24));
        setMemberDaysSinceJoin(diffDays);
      } else { setMembershipStatus('none'); setMemberDaysSinceJoin(0); }
      const { count } = await supabase.from('wakala_applications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['submitted', 'in_progress', 'completed', 'approved']);
      setPreviousWakalaCount(count || 0);
    } catch (err) { console.error('Error checking eligibility:', err); }
  };

  const calculatePrice = () => {
    if (membershipStatus === 'active' && memberDaysSinceJoin >= 10) {
      return previousWakalaCount === 0 ? 20 : 40;
    }
    return 40;
  };

  const createPaymentIntent = async (amount: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'gbp', metadata: { user_id: user?.id, type: 'wakala' } }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.paymentError);
      if (!data.clientSecret) throw new Error('No client secret returned');
      setClientSecret(data.clientSecret);
    } catch (err: any) { setError(err.message || t.paymentError); setStep('form'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSlotWarning('');
    if (!formData.fullName || !formData.phone || !formData.email || !formData.applicantName || !formData.agentName || !formData.wakalaType || !formData.wakalaFormat) { setError(t.fillAllFields); return; }
    if (applicantPassportUrls.length === 0 || attorneyPassportUrls.length === 0) { setError(t.uploadRequired); return; }
    if (membershipStatus === 'active' && !formData.membershipNumber) { setError(t.fillAllFields); return; }
    if (!consent) { setError(t.fillAllFields); return; }
    if (!selectedDate || !selectedSlot) { setError(t.selectDateTimeRequired); return; }
    if (!wakalaService) return;

    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const stillAvailable = await checkSlotStillAvailable(selectedSlot.id);
      if (!stillAvailable) {
        await loadSlots();
        const nearest = await findNearestAvailableSlot(wakalaService.id, dateStr, selectedSlot.startTime, WAKALA_DURATION);
        setSelectedSlot(null);
        setSlotWarning(nearest ? `${t.slotNoLongerAvailable} ${t.slotTakenSuggestion} ${formatTimeDisplay(nearest.start_time)}.` : t.tryDifferentDate);
        setLoading(false); return;
      }

      const reserveResult = await reserveSlots({
        slot_id: selectedSlot.id, service_id: wakalaService.id, booking_date: dateStr,
        start_time: selectedSlot.startTime, end_time: selectedSlot.endTime, duration_minutes: WAKALA_DURATION,
      });

      if (!reserveResult.success) {
        await loadSlots();
        const nearest = await findNearestAvailableSlot(wakalaService.id, dateStr, selectedSlot.startTime, WAKALA_DURATION);
        setSelectedSlot(null);
        setSlotWarning(nearest ? `${t.slotTaken} ${t.slotTakenSuggestion} ${formatTimeDisplay(nearest.start_time)}.` : t.tryDifferentDate);
        setLoading(false); return;
      }

      const price = calculatePrice();
      const payload: WakalaFormPayload = {
        user_id: user?.id || null,
        full_name: formData.fullName, phone: formData.phone, email: formData.email,
        service_type: `wakala_${formData.wakalaType}`,
        special_requests: formData.specialRequests,
        fee_amount: price,
        applicant_name: formData.applicantName, agent_name: formData.agentName,
        wakala_type: formData.wakalaType, wakala_format: formData.wakalaFormat,
        membership_status: membershipStatus === 'active' ? 'member' : 'non_member',
        is_first_wakala: previousWakalaCount === 0,
        applicant_passport_url: applicantPassportUrls[0] || null,
        attorney_passport_url: attorneyPassportUrls[0] || null,
        witness_passports_url: witnessPassportUrls.length > 0 ? witnessPassportUrls.join(',') : null,
        booking_date: dateStr,
        requested_date: dateStr,
        slot_id: selectedSlot.id,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        duration_minutes: WAKALA_DURATION,
      };

      setFormPayload(payload);
      setPaymentAmount(price);
      await createPaymentIntent(price);
      setStep('payment');
    } catch (err: any) { setError(err.message || t.errorMessage); }
    finally { setLoading(false); }
  };

  const handlePaymentSuccess = (_applicationId: string, bookingReference: string) => {
    cleanupRealtimeAndPolling();
    const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    onComplete({
      bookingReference,
      serviceType: 'wakala',
      date: dateStr,
      startTime: selectedSlot?.startTime || '',
      endTime: selectedSlot?.endTime || '',
      fullName: formData.fullName, email: formData.email, fee: paymentAmount,
    });
  };

  const currentPrice = calculatePrice();
  const isFormComplete = formData.fullName && formData.phone && formData.email &&
    formData.applicantName && formData.agentName && formData.wakalaType && formData.wakalaFormat &&
    applicantPassportUrls.length > 0 && attorneyPassportUrls.length > 0 && consent &&
    (membershipStatus !== 'active' || formData.membershipNumber) &&
    selectedDate && selectedSlot;

  if (step === 'payment' && clientSecret && formPayload) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{t.paymentTitle}</h2>
        </div>
        <div className="p-6 sm:p-8">
          <button type="button" onClick={() => setStep('form')} className="mb-4 text-sm text-gray-500 hover:text-gray-700 underline">{t.backToForm}</button>
          <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#059669' } } }}>
            <WakalaCheckoutForm amount={paymentAmount} formPayload={formPayload} onSuccess={handlePaymentSuccess} onBack={() => setStep('form')} />
          </Elements>
        </div>
      </div>
    );
  }

  if (step === 'payment' && !clientSecret) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-gray-600">{t.settingUpPayment}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t.title}</h2>
            <p className="text-blue-100 text-sm mt-1">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {dataLoading && (
        <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
          <p className="text-sm text-blue-800">{t.loadingData}</p>
        </div>
      )}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800"><X className="w-4 h-4" /></button>
        </div>
      )}
      {slotWarning && (
        <div className="mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 flex-1">{slotWarning}</p>
          <button onClick={() => setSlotWarning('')} className="text-amber-600 hover:text-amber-800"><X className="w-4 h-4" /></button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {membershipStatus === 'active' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-sm font-medium text-emerald-800">{t.memberBadge}</span>
            {memberNumber && <span className="text-sm text-emerald-600">#{memberNumber}</span>}
          </div>
        )}

        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-blue-800">{t.signInPromo}</p>
            <Link to="/member/login?redirect=/book" className="text-sm font-semibold text-blue-700 hover:text-blue-900 underline">{t.signIn}</Link>
          </div>
        )}

        {membershipStatus !== 'active' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800 font-medium">{t.memberPromo}</p>
            </div>
            <Link to="/membership" className="text-sm font-semibold text-amber-700 hover:text-amber-900 underline">{t.joinNow}</Link>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-start gap-3 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg"><User className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t.personalInfo}</h3>
              <p className="text-sm text-gray-600 mt-0.5">{t.contactDescription}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName} *</label>
              <input type="text" value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone} *</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.email} *</label>
              <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
            {membershipStatus === 'active' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.membershipNumber} *</label>
                <input type="text" value={formData.membershipNumber} onChange={e => setFormData(p => ({ ...p, membershipNumber: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={dataLoading} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-start gap-3 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
            <h3 className="text-lg font-bold text-gray-900">{t.wakalaDetails}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.applicantName} *</label>
              <input type="text" value={formData.applicantName} onChange={e => setFormData(p => ({ ...p, applicantName: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.agentName} *</label>
              <input type="text" value={formData.agentName} onChange={e => setFormData(p => ({ ...p, agentName: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.wakalaType} *</label>
              <select value={formData.wakalaType} onChange={e => setFormData(p => ({ ...p, wakalaType: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none" required disabled={dataLoading}>
                <option value="">{t.selectWakalaType}</option>
                {Object.entries(t.wakalaTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.wakalaFormat} *</label>
              <select value={formData.wakalaFormat} onChange={e => setFormData(p => ({ ...p, wakalaFormat: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none" required disabled={dataLoading}>
                <option value="">{t.selectWakalaFormat}</option>
                {Object.entries(t.wakalaFormats).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-start gap-3 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg"><Upload className="w-5 h-5 text-blue-600" /></div>
            <h3 className="text-lg font-bold text-gray-900">{t.documents}</h3>
          </div>
          <div className="space-y-5">
            <FileUploadField label={t.applicantPassport} required userId={user?.id} onUploadComplete={setApplicantPassportUrls} existingUrls={applicantPassportUrls} />
            <FileUploadField label={t.attorneyPassport} required userId={user?.id} onUploadComplete={setAttorneyPassportUrls} existingUrls={attorneyPassportUrls} />
            <FileUploadField label={t.witnessPassports} multiple userId={user?.id} onUploadComplete={setWitnessPassportUrls} existingUrls={witnessPassportUrls} />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-start gap-3 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg"><CalendarIcon className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t.selectAppointment}</h3>
              <p className="text-sm text-gray-600 mt-0.5">{t.appointmentDuration}</p>
            </div>
          </div>
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t.selectDate}</h4>
            <div className="max-w-md mx-auto">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={date => { setSelectedDate(date); setSelectedSlot(null); }}
                maxDaysAhead={maxDaysAhead}
                unavailableDates={unavailableDates}
                fullyBookedDates={fullyBookedDates}
                slotCounts={slotCounts}
                autoSelectNearest
              />
            </div>
          </div>
          {selectedDate && (
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

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h4 className="text-md font-bold text-gray-900 mb-3">{t.pricingInfo}</h4>
          <div className="space-y-2 text-sm">
            <p className={currentPrice === 20 ? 'font-bold text-emerald-700' : 'text-gray-600'}>{t.priceMember}</p>
            <p className={currentPrice === 40 ? 'font-bold text-emerald-700' : 'text-gray-600'}>{t.priceStandard}</p>
            <div className="border-t border-blue-300 pt-2 mt-2">
              <span className="font-bold text-lg text-emerald-700">{t.yourPrice}: {`\u00A3${currentPrice}`}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.specialRequests}</label>
          <textarea value={formData.specialRequests} onChange={e => setFormData(p => ({ ...p, specialRequests: e.target.value }))} rows={3}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" disabled={dataLoading} />
        </div>

        <div className="flex items-start gap-2">
          <input type="checkbox" id="wakala-consent-page" checked={consent} onChange={e => setConsent(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" disabled={dataLoading} />
          <label htmlFor="wakala-consent-page" className="text-sm text-gray-700">{t.consentLabel}</label>
        </div>

        <button type="submit" disabled={!isFormComplete || loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.submitting}</> : <><Send className="w-5 h-5" /> {t.submitAndPay}</>}
        </button>
      </form>
    </div>
  );
}
