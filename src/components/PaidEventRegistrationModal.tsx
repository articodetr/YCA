import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Mail, Phone, CreditCard, Loader2, CheckCircle,
  AlertCircle, Ticket, Utensils, Minus, Plus, Copy, ChevronLeft, Lock,
} from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface EventData {
  id: string;
  title: string;
  title_ar?: string;
  date: string;
  time: string;
  location: string;
  location_ar?: string;
  ticket_price_adult: number;
  ticket_price_child: number | null;
  ticket_price_member: number | null;
  max_capacity: number | null;
  current_registrations: number;
}

interface PaidEventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
}

interface TicketCounts {
  adult: number;
  child: number;
  member: number;
}

interface PaymentFormProps {
  totalPrice: number;
  registrationId: string;
  bookingRef: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
  t: Record<string, string>;
}

function generateBookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'YCA-';
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

function PaymentForm({ totalPrice, registrationId, onSuccess, onError, t }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) throw submitError;

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        await supabase
          .from('event_registrations')
          .update({ payment_status: 'failed', status: 'cancelled' })
          .eq('id', registrationId);
        throw new Error(confirmError.message || t.paymentFailed);
      }

      if (paymentIntent?.status === 'succeeded') {
        await supabase
          .from('event_registrations')
          .update({
            payment_status: 'paid',
            payment_intent_id: paymentIntent.id,
            status: 'confirmed',
          })
          .eq('id', registrationId);

        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || t.paymentFailed);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: true,
            spacedAccordionItems: true,
          },
        }}
      />
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Lock className="w-3.5 h-3.5" />
        <span>{t.securePayment}</span>
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t.processing}
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {t.payNow} - £{totalPrice.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
}

const translations = {
  ar: {
    title: 'تسجيل الحدث',
    step1: 'تفاصيل التذاكر',
    step2: 'الدفع',
    ticketType: 'نوع التذكرة',
    adult: 'بالغ',
    child: 'طفل',
    memberTicket: 'عضو',
    perTicket: 'للتذكرة',
    total: 'المجموع',
    spotsLeft: 'أماكن متبقية',
    soldOut: 'نفذت التذاكر',
    personalInfo: 'المعلومات الشخصية',
    firstName: 'الاسم الأول *',
    lastName: 'اسم العائلة *',
    email: 'البريد الإلكتروني *',
    emailPlaceholder: 'your.email@example.com',
    phoneLbl: 'رقم الهاتف *',
    phonePlaceholder: '07123 456789',
    dietary: 'المتطلبات الغذائية (اختياري)',
    dietaryPlaceholder: 'مثل: نباتي، حساسية المكسرات، حلال',
    notesLbl: 'ملاحظات إضافية (اختياري)',
    notesPlaceholder: 'أي متطلبات خاصة',
    memberQuestion: 'هل أنت عضو مسجل في YCA؟',
    yes: 'نعم',
    no: 'لا',
    continueToPayment: 'المتابعة للدفع',
    payNow: 'ادفع الآن',
    processing: 'جاري المعالجة...',
    settingUp: 'جاري تجهيز الدفع...',
    cancel: 'إلغاء',
    back: 'رجوع',
    securePayment: 'الدفع يتم بأمان عبر Stripe. لا نقوم بتخزين بيانات بطاقتك.',
    successTitle: 'تم التسجيل بنجاح!',
    successMsg: 'تم تأكيد تسجيلك وإتمام الدفع.',
    bookingRefLabel: 'مرجع الحجز',
    copyRef: 'نسخ',
    copiedRef: 'تم النسخ!',
    keepRef: 'يرجى الاحتفاظ بمرجع الحجز هذا. ستحتاج إليه عند الحضور.',
    close: 'إغلاق',
    orderSummary: 'ملخص الطلب',
    eventDate: 'التاريخ',
    eventTime: 'الوقت',
    eventLocation: 'المكان',
    required: 'مطلوب',
    invalidEmail: 'بريد إلكتروني غير صالح',
    selectTickets: 'يرجى اختيار تذكرة واحدة على الأقل',
    paymentFailed: 'فشل الدفع. يرجى المحاولة مرة أخرى.',
  },
  en: {
    title: 'Event Registration',
    step1: 'Ticket Details',
    step2: 'Payment',
    ticketType: 'Ticket Type',
    adult: 'Adult',
    child: 'Child',
    memberTicket: 'Member',
    perTicket: 'per ticket',
    total: 'Total',
    spotsLeft: 'spots left',
    soldOut: 'Sold Out',
    personalInfo: 'Personal Information',
    firstName: 'First Name *',
    lastName: 'Last Name *',
    email: 'Email Address *',
    emailPlaceholder: 'your.email@example.com',
    phoneLbl: 'Phone Number *',
    phonePlaceholder: '07123 456789',
    dietary: 'Dietary Requirements (Optional)',
    dietaryPlaceholder: 'e.g. Vegetarian, Nut allergy, Halal',
    notesLbl: 'Additional Notes (Optional)',
    notesPlaceholder: 'Any special requirements',
    memberQuestion: 'Are you a registered YCA member?',
    yes: 'Yes',
    no: 'No',
    continueToPayment: 'Continue to Payment',
    payNow: 'Pay Now',
    processing: 'Processing...',
    settingUp: 'Setting up payment...',
    cancel: 'Cancel',
    back: 'Back',
    securePayment: 'Your payment is processed securely by Stripe. We never store your card details.',
    successTitle: 'Registration Confirmed!',
    successMsg: 'Your registration has been confirmed and payment processed.',
    bookingRefLabel: 'Booking Reference',
    copyRef: 'Copy',
    copiedRef: 'Copied!',
    keepRef: 'Please keep this booking reference. You will need it at the event.',
    close: 'Close',
    orderSummary: 'Order Summary',
    eventDate: 'Date',
    eventTime: 'Time',
    eventLocation: 'Location',
    required: 'Required',
    invalidEmail: 'Invalid email address',
    selectTickets: 'Please select at least one ticket',
    paymentFailed: 'Payment failed. Please try again.',
  },
};

export default function PaidEventRegistrationModal({ isOpen, onClose, event }: PaidEventRegistrationModalProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = translations[language];

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [error, setError] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [settingUpPayment, setSettingUpPayment] = useState(false);

  const [tickets, setTickets] = useState<TicketCounts>({ adult: 1, child: 0, member: 0 });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dietaryRequirements: '',
    notes: '',
    isMember: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setError('');
      setBookingRef('');
      setClientSecret(null);
      setRegistrationId(null);
      setTickets({ adult: 1, child: 0, member: 0 });
      setFormData({ firstName: '', lastName: '', email: '', phone: '', dietaryRequirements: '', notes: '', isMember: '' });
      setErrors({});
    }
  }, [isOpen]);

  const totalTickets = tickets.adult + tickets.child + tickets.member;
  const spotsRemaining = event.max_capacity ? event.max_capacity - event.current_registrations : null;

  const totalPrice = useMemo(() => {
    let total = tickets.adult * (event.ticket_price_adult || 0);
    total += tickets.child * (event.ticket_price_child || 0);
    total += tickets.member * (event.ticket_price_member || event.ticket_price_adult || 0);
    return total;
  }, [tickets, event]);

  const updateTicket = (type: keyof TicketCounts, delta: number) => {
    setTickets(prev => {
      const newVal = Math.max(0, prev[type] + delta);
      const newTotal = (type === 'adult' ? newVal : prev.adult) +
                       (type === 'child' ? newVal : prev.child) +
                       (type === 'member' ? newVal : prev.member);
      if (spotsRemaining !== null && newTotal > spotsRemaining) return prev;
      return { ...prev, [type]: newVal };
    });
  };

  const validateDetails = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = t.required;
    if (!formData.lastName.trim()) newErrors.lastName = t.required;
    if (!formData.email.trim()) newErrors.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.invalidEmail;
    if (!formData.phone.trim()) newErrors.phone = t.required;
    if (totalTickets === 0) newErrors.tickets = t.selectTickets;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = async () => {
    if (!validateDetails()) return;

    setSettingUpPayment(true);
    setError('');

    try {
      const ref = generateBookingRef();

      const { data: registration, error: regError } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          number_of_attendees: totalTickets,
          notes: formData.notes.trim() || null,
          dietary_requirements: formData.dietaryRequirements.trim() || null,
          is_member: formData.isMember === 'yes' ? true : formData.isMember === 'no' ? false : null,
          ticket_type: tickets.member > 0 ? 'member' : tickets.child > 0 ? 'mixed' : 'adult',
          amount_paid: totalPrice,
          payment_status: 'pending',
          booking_reference: ref,
          status: 'pending',
        })
        .select('id')
        .single();

      if (regError) throw regError;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(totalPrice * 100),
            currency: 'gbp',
            metadata: {
              type: 'event_registration',
              event_registration_id: registration.id,
              event_id: event.id,
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.paymentFailed);
      if (!data.clientSecret) throw new Error('No client secret returned');

      setRegistrationId(registration.id);
      setBookingRef(ref);
      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || t.paymentFailed);
    } finally {
      setSettingUpPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  const handlePaymentError = (msg: string) => {
    setError(msg);
  };

  const handleBack = () => {
    setStep('details');
    setClientSecret(null);
    setError('');
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const eventTitle = language === 'ar' && event.title_ar ? event.title_ar : event.title;
  const eventLocation = language === 'ar' && event.location_ar ? event.location_ar : event.location;

  const ticketTypes = [
    { key: 'adult' as const, label: t.adult, price: event.ticket_price_adult, show: true },
    { key: 'child' as const, label: t.child, price: event.ticket_price_child, show: event.ticket_price_child !== null },
    { key: 'member' as const, label: t.memberTicket, price: event.ticket_price_member, show: event.ticket_price_member !== null },
  ].filter(tt => tt.show);

  if (!isOpen) return null;

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.successTitle}</h2>
            <p className="text-gray-600 mb-6">{t.successMsg}</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">{t.bookingRefLabel}</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-mono font-bold text-primary tracking-wider">{bookingRef}</span>
                <button onClick={handleCopyRef} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">{copied ? t.copiedRef : t.copyRef}</p>
            </div>

            <p className="text-sm text-gray-500 mb-6">{t.keepRef}</p>

            <button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {t.close}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {step === 'payment' && (
                  <button
                    onClick={handleBack}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className={`w-5 h-5 text-gray-500 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                )}
                <h2 className="text-lg font-bold text-gray-900">
                  {step === 'details' ? t.step1 : t.step2}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 pt-4 pb-2">
              <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-emerald-600 font-medium">{t.title}</p>
                  <p className="font-semibold text-emerald-800 text-sm truncate">{eventTitle}</p>
                </div>
                <span className="text-lg font-bold text-emerald-700 flex-shrink-0">
                  £{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 flex-1">{error}</p>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-5"
                  >
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Ticket className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900 text-sm">{t.ticketType}</h3>
                        {spotsRemaining !== null && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isRTL ? 'mr-auto' : 'ml-auto'} ${spotsRemaining > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {spotsRemaining > 0 ? `${spotsRemaining} ${t.spotsLeft}` : t.soldOut}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {ticketTypes.map(({ key, label, price }) => (
                          <div key={key} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{label}</p>
                              <p className="text-xs text-gray-500">
                                {price !== null && price !== undefined ? `£${Number(price).toFixed(2)}` : '£0.00'} {t.perTicket}
                              </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => updateTicket(key, -1)}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30"
                                disabled={tickets[key] === 0}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center font-bold">{tickets[key]}</span>
                              <button
                                type="button"
                                onClick={() => updateTicket(key, 1)}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors.tickets && <p className="text-red-600 text-xs mt-2">{errors.tickets}</p>}

                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-baseline">
                        <span className="font-semibold text-gray-900 text-sm">{t.total}</span>
                        <span className="text-xl font-bold text-emerald-700">£{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900 text-sm">{t.personalInfo}</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.firstName}</label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={e => { setFormData(p => ({ ...p, firstName: e.target.value })); setErrors(p => ({ ...p, firstName: '' })); }}
                            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${errors.firstName ? 'border-red-400' : 'border-gray-300'}`}
                          />
                          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">{t.lastName}</label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={e => { setFormData(p => ({ ...p, lastName: e.target.value })); setErrors(p => ({ ...p, lastName: '' })); }}
                            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${errors.lastName ? 'border-red-400' : 'border-gray-300'}`}
                          />
                          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                          <Mail className="w-3.5 h-3.5" /> {t.email}
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                          placeholder={t.emailPlaceholder}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                          <Phone className="w-3.5 h-3.5" /> {t.phoneLbl}
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={e => { setFormData(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })); }}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                          placeholder={t.phonePlaceholder}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.memberQuestion}</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="isMember" value="yes" checked={formData.isMember === 'yes'} onChange={e => setFormData(p => ({ ...p, isMember: e.target.value }))} className="text-emerald-600" />
                            <span className="text-sm">{t.yes}</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="isMember" value="no" checked={formData.isMember === 'no'} onChange={e => setFormData(p => ({ ...p, isMember: e.target.value }))} className="text-emerald-600" />
                            <span className="text-sm">{t.no}</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                          <Utensils className="w-3.5 h-3.5" /> {t.dietary}
                        </label>
                        <input
                          type="text"
                          value={formData.dietaryRequirements}
                          onChange={e => setFormData(p => ({ ...p, dietaryRequirements: e.target.value }))}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                          placeholder={t.dietaryPlaceholder}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.notesLbl}</label>
                        <textarea
                          value={formData.notes}
                          onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                          placeholder={t.notesPlaceholder}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={handleContinueToPayment}
                        className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={totalTickets === 0 || settingUpPayment}
                      >
                        {settingUpPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t.settingUp}
                          </>
                        ) : (
                          t.continueToPayment
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 text-sm mb-3">{t.orderSummary}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t.eventDate}</span>
                          <span className="font-medium">{new Date(event.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t.eventTime}</span>
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t.eventLocation}</span>
                          <span className="font-medium">{eventLocation}</span>
                        </div>
                        <div className="border-t border-gray-200 my-2" />
                        {ticketTypes.map(({ key, label, price }) => tickets[key] > 0 && (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{tickets[key]}x {label}</span>
                            <span className="font-medium">£{((price || 0) * tickets[key]).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-200 pt-2 flex justify-between">
                          <span className="font-bold text-gray-900">{t.total}</span>
                          <span className="text-lg font-bold text-emerald-700">£{totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {clientSecret && registrationId ? (
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret,
                          appearance: {
                            theme: 'stripe',
                            variables: {
                              colorPrimary: '#059669',
                              borderRadius: '8px',
                            },
                          },
                        }}
                      >
                        <PaymentForm
                          totalPrice={totalPrice}
                          registrationId={registrationId}
                          bookingRef={bookingRef}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          t={t}
                        />
                      </Elements>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
