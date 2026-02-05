import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, User, X, CreditCard, ArrowLeft } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Calendar from '../booking/Calendar';
import TimeSlotGrid from '../booking/TimeSlotGrid';
import BookingSummaryCard from '../booking/BookingSummaryCard';
import HelpCard from '../booking/HelpCard';
import { getAvailableSlotsForDuration, reserveSlots } from '../../lib/booking-utils';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}

function CheckoutForm({ amount, onSuccess, onBack }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const translations = {
    en: {
      amount: 'Amount',
      paymentType: 'Payment Type',
      processing: 'Processing payment...',
      payNow: 'Pay Now',
      wakalaService: 'Wakala Service',
      backToBooking: 'Back to Booking',
    },
    ar: {
      amount: 'المبلغ',
      paymentType: 'نوع الدفع',
      processing: 'جاري معالجة الدفع...',
      payNow: 'ادفع الآن',
      wakalaService: 'خدمة الوكالة',
      backToBooking: 'العودة للحجز',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/member/dashboard`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw confirmError;
      }

      onSuccess();
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">{t.paymentType}:</span>
          <span className="font-semibold text-gray-900">{t.wakalaService}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t.amount}:</span>
          <span className="font-bold text-2xl text-emerald-600">£{amount}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <PaymentElement />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.backToBooking}
        </button>

        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t.processing}
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              {t.payNow}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

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

interface UserData {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  postcode?: string;
  city?: string;
}

interface WakalaBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: UserData | null;
  onSuccess?: () => void;
}

export default function WakalaBookingModal({ isOpen, onClose, onSuccess }: WakalaBookingModalProps) {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'booking' | 'payment' | 'success'>('booking');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const [wakalaService, setWakalaService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<30 | 60 | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [maxDaysAhead, setMaxDaysAhead] = useState(30);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: user?.email || '',
    serviceType: '',
    specialRequests: '',
  });

  const translations = {
    en: {
      title: 'New Wakala Booking',
      subtitle: 'Select a date, choose a time, and complete your booking',
      closeModal: 'Close',
      cancel: 'Cancel',
      selectSlot: 'Select Date & Time',
      selectDate: 'Select Date',
      selectDuration: 'Select Duration',
      selectTime: 'Select Time',
      duration30: 'Quick Appointment - 30 Minutes',
      duration60: 'Extended Appointment - 1 Hour',
      duration30Desc: 'Perfect for quick services and consultations',
      duration60Desc: 'Ideal for comprehensive services requiring more time',
      personalInfo: 'Contact Details',
      contactDescription: 'Enter your contact information for this booking.',
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      serviceType: 'Service Type',
      specialRequests: 'Special Requests (Optional)',
      submit: 'Proceed to Payment',
      submitting: 'Processing...',
      successMessage: 'Booking submitted successfully!',
      redirecting: 'Redirecting to payment...',
      errorMessage: 'Failed to submit booking. Please try again.',
      serviceTypes: {
        passport_renewal: 'Passport Renewal',
        visa_application: 'Visa Application',
        document_authentication: 'Document Authentication',
        power_of_attorney: 'Power of Attorney',
        other: 'Other',
      },
      selectDateTime: 'Please select date and time',
      fillAllFields: 'Please fill all required fields',
      selectServiceType: 'Select service type',
      agreeToTerms: 'I agree to the',
      termsOfService: 'Terms of Service',
      loadingData: 'Loading your information...',
      weekendError: 'We are closed on weekends. Please select a weekday.',
      closeConfirm: 'Are you sure you want to close? Your changes will be lost.',
      paymentTitle: 'Complete Payment',
      paymentType: 'Payment Type',
      wakalaService: 'Wakala Service',
      amount: 'Amount',
      processing: 'Processing payment...',
      payNow: 'Pay Now',
      paymentSuccess: 'Payment completed successfully!',
      settingUpPayment: 'Setting up payment...',
      paymentError: 'Failed to initialize payment. Please try again.',
      backToBooking: 'Back to Booking',
    },
    ar: {
      title: 'حجز وكالة جديد',
      subtitle: 'اختر التاريخ والوقت وأكمل حجزك',
      closeModal: 'إغلاق',
      cancel: 'إلغاء',
      selectSlot: 'اختيار التاريخ والوقت',
      selectDate: 'اختر التاريخ',
      selectDuration: 'اختر المدة',
      selectTime: 'اختر الوقت',
      duration30: 'موعد سريع - 30 دقيقة',
      duration60: 'موعد ممتد - ساعة كاملة',
      duration30Desc: 'مثالي للخدمات السريعة والاستشارات',
      duration60Desc: 'مناسب للخدمات الشاملة التي تتطلب وقتاً أطول',
      personalInfo: 'تفاصيل الاتصال',
      contactDescription: 'أدخل معلومات الاتصال الخاصة بك لهذا الحجز.',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      serviceType: 'نوع الخدمة',
      specialRequests: 'طلبات خاصة (اختياري)',
      submit: 'المتابعة للدفع',
      submitting: 'جاري المعالجة...',
      successMessage: 'تم إرسال الحجز بنجاح!',
      redirecting: 'جاري التحويل للدفع...',
      errorMessage: 'فشل إرسال الحجز. يرجى المحاولة مرة أخرى.',
      serviceTypes: {
        passport_renewal: 'تجديد جواز السفر',
        visa_application: 'طلب تأشيرة',
        document_authentication: 'توثيق المستندات',
        power_of_attorney: 'توكيل رسمي',
        other: 'أخرى',
      },
      selectDateTime: 'الرجاء اختيار التاريخ والوقت',
      fillAllFields: 'الرجاء تعبئة جميع الحقول المطلوبة',
      selectServiceType: 'اختر نوع الخدمة',
      agreeToTerms: 'أوافق على',
      termsOfService: 'شروط الخدمة',
      loadingData: 'جاري تحميل معلوماتك...',
      weekendError: 'نحن مغلقون في عطلة نهاية الأسبوع. الرجاء اختيار يوم من أيام الأسبوع.',
      closeConfirm: 'هل تريد الإغلاق؟ سيتم فقدان التغييرات.',
      paymentTitle: 'إكمال الدفع',
      paymentType: 'نوع الدفع',
      wakalaService: 'خدمة الوكالة',
      amount: 'المبلغ',
      processing: 'جاري معالجة الدفع...',
      payNow: 'ادفع الآن',
      paymentSuccess: 'تم الدفع بنجاح!',
      settingUpPayment: 'جاري تجهيز الدفع...',
      paymentError: 'فشل في تهيئة الدفع. يرجى المحاولة مرة أخرى.',
      backToBooking: 'العودة للحجز',
    },
  };

  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      loadWakalaService();
      loadSettings();
      loadUserData();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      resetForm();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (wakalaService && selectedDate && selectedDuration) {
      loadSlots();
    }
  }, [wakalaService, selectedDate, selectedDuration]);

  const loadUserData = async () => {
    if (!user) return;

    setDataLoading(true);
    try {
      let fetchedData: UserData | null = null;

      const { data: memberData } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (memberData) {
        fetchedData = memberData;
      } else {
        const { data: appData } = await supabase
          .from('membership_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (appData) {
          fetchedData = appData;
        }
      }

      if (fetchedData) {
        const fullName = fetchedData.full_name ||
          (fetchedData.first_name && fetchedData.last_name
            ? `${fetchedData.first_name} ${fetchedData.last_name}`
            : '');

        setFormData(prev => ({
          ...prev,
          fullName: fullName || prev.fullName,
          phone: fetchedData.phone || prev.phone,
          email: fetchedData.email || user.email || prev.email,
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const loadWakalaService = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_services')
        .select('*')
        .eq('name_en', 'Wakala Services')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (data) setWakalaService(data);
    } catch (error) {
      console.error('Error loading service:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_settings')
        .select('max_booking_days_ahead')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setMaxDaysAhead(data.max_booking_days_ahead);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadSlots = async () => {
    if (!wakalaService || !selectedDate || !selectedDuration) return;

    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setError(t.weekendError);
      setSlots([]);
      return;
    }

    setError('');

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const availableSlots = await getAvailableSlotsForDuration(
        wakalaService.id,
        dateStr,
        selectedDuration
      );

      const formattedSlots: TimeSlot[] = availableSlots.map(slot => ({
        id: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isAvailable: slot.is_available
      }));

      setSlots(formattedSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setSlots([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const calculatePrice = (appointmentDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilAppointment = Math.ceil((appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const baseFee = 50;
    if (daysUntilAppointment >= 10) {
      return baseFee;
    } else if (daysUntilAppointment >= 7) {
      return baseFee * 1.5;
    } else if (daysUntilAppointment >= 5) {
      return baseFee * 2;
    } else {
      return baseFee * 3;
    }
  };

  const createPaymentIntent = async (wakalaId: string, amount: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency: 'gbp',
            metadata: {
              user_id: user?.id,
              wakala_id: wakalaId,
              type: 'wakala',
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.paymentError);
      }

      if (!data.clientSecret) {
        throw new Error('No client secret returned from server');
      }

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error('Payment intent error:', err);
      setError(err.message || t.paymentError);
      setStep('booking');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedDate || !selectedSlot) {
      setError(t.selectDateTime);
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.email || !formData.serviceType) {
      setError(t.fillAllFields);
      return;
    }

    if (!wakalaService) return;

    setLoading(true);

    try {
      const price = calculatePrice(selectedDate);
      const dateStr = selectedDate.toISOString().split('T')[0];

      const applicationData = {
        user_id: user?.id,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        booking_date: dateStr,
        requested_date: dateStr,
        service_type: formData.serviceType,
        special_requests: formData.specialRequests,
        slot_id: selectedSlot.id,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        duration_minutes: selectedDuration,
        fee_amount: price,
        payment_status: 'pending',
      };

      const { data: application, error: appError } = await supabase
        .from('wakala_applications')
        .insert([applicationData])
        .select()
        .maybeSingle();

      if (appError) throw appError;

      const reserveResult = await reserveSlots({
        slot_id: selectedSlot.id,
        booking_date: dateStr,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        duration_minutes: selectedDuration!,
      });

      if (!reserveResult.success) {
        throw new Error(reserveResult.error || 'Failed to reserve slot');
      }

      setApplicationId(application.id);
      setPaymentAmount(price);

      await createPaymentIntent(application.id, price);
      setStep('payment');
    } catch (err: any) {
      console.error('Application error:', err);
      setError(err.message || t.errorMessage);
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

    const hasData = formData.fullName || formData.phone || selectedDate || selectedSlot || step === 'payment';
    if (hasData && step !== 'success') {
      if (window.confirm(t.closeConfirm)) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: user?.email || '',
      serviceType: '',
      specialRequests: '',
    });
    setSelectedDate(null);
    setSelectedDuration(null);
    setSelectedSlot(null);
    setError('');
    setStep('booking');
    setClientSecret(null);
    setApplicationId(null);
    setPaymentAmount(0);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, formData, selectedDate, selectedSlot, step]);

  if (!isOpen) return null;

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.paymentSuccess}</h2>
            <p className="text-gray-600 mb-6">{t.redirecting}</p>
            <button
              onClick={handleClose}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {t.closeModal}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment' && clientSecret) {
    return (
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          dir={isRTL ? 'rtl' : 'ltr'}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">{t.paymentTitle}</h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t.closeModal}
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#059669',
                  },
                },
              }}
            >
              <CheckoutForm
                amount={paymentAmount}
                onSuccess={() => setStep('success')}
                onBack={() => setStep('booking')}
              />
            </Elements>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment' && !clientSecret) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">{t.settingUpPayment}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = selectedDate ? calculatePrice(selectedDate) : 50;
  const isFormComplete = formData.fullName && formData.phone && formData.email && formData.serviceType;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
            {step === 'booking' && (
              <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t.closeModal}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
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
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t.selectSlot}</h3>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {t.selectDate}
                    {selectedDate && (
                      <span className="text-gray-500 font-normal">
                        {' - '}
                        {new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', {
                          month: 'long',
                          year: 'numeric'
                        }).format(selectedDate)}
                      </span>
                    )}
                  </h4>
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedDuration(null);
                      setSelectedSlot(null);
                    }}
                    maxDaysAhead={maxDaysAhead}
                  />
                </div>

                {selectedDate && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      {t.selectDuration}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDuration(30);
                          setSelectedSlot(null);
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedDuration === 30
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg text-gray-900">{t.duration30}</span>
                          {selectedDuration === 30 && (
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{t.duration30Desc}</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDuration(60);
                          setSelectedSlot(null);
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedDuration === 60
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-lg text-gray-900">{t.duration60}</span>
                          {selectedDuration === 60 && (
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{t.duration60Desc}</p>
                      </button>
                    </div>
                  </div>
                )}

                {selectedDate && selectedDuration && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      {t.selectTime}
                    </h4>
                    <TimeSlotGrid
                      selectedDate={selectedDate}
                      slots={slots}
                      selectedSlot={selectedSlot}
                      onSlotSelect={setSelectedSlot}
                    />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-start gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t.personalInfo}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t.contactDescription}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={dataLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.phone} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="1234-567-890"
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={dataLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.email} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@gmail.com"
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={dataLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.serviceType} *
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      required
                      disabled={dataLoading}
                    >
                      <option value="">{t.selectServiceType}</option>
                      {Object.entries(t.serviceTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.specialRequests}
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={dataLoading}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={dataLoading}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    {t.agreeToTerms}{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      {t.termsOfService}
                    </a>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <BookingSummaryCard
                serviceName={wakalaService ? (language === 'ar' ? wakalaService.name_ar : wakalaService.name_en) : 'Wakala Services'}
                selectedDate={selectedDate}
                selectedTime={selectedSlot}
                totalPrice={currentPrice}
                serviceType={formData.serviceType}
                isFormComplete={!!isFormComplete}
                onSubmit={() => {}}
                isSubmitting={loading}
              />

              <HelpCard />

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
