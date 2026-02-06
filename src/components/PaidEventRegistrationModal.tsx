import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, CreditCard, Loader2, CheckCircle, AlertCircle, Ticket, Utensils, Minus, Plus, Copy } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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

export default function PaidEventRegistrationModal({ isOpen, onClose, event }: PaidEventRegistrationModalProps) {
  if (!isOpen) return null;

  return (
    <Elements stripe={stripePromise}>
      <ModalContent isOpen={isOpen} onClose={onClose} event={event} />
    </Elements>
  );
}

function generateBookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'YCA-';
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

interface TicketCounts {
  adult: number;
  child: number;
  member: number;
}

function ModalContent({ isOpen, onClose, event }: PaidEventRegistrationModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [copied, setCopied] = useState(false);

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
  const [cardComplete, setCardComplete] = useState(false);

  const t = language === 'ar' ? {
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
    cancel: 'إلغاء',
    back: 'رجوع',
    cardDetails: 'تفاصيل البطاقة *',
    testCard: 'بطاقة تجريبية: 4242 4242 4242 4242',
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
    cardIncomplete: 'يرجى إدخال بيانات البطاقة كاملة',
  } : {
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
    cancel: 'Cancel',
    back: 'Back',
    cardDetails: 'Card Details *',
    testCard: 'Test card: 4242 4242 4242 4242',
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
    cardIncomplete: 'Please enter complete card details',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
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

  const handleContinueToPayment = () => {
    if (validateDetails()) {
      setStep('payment');
      setError('');
    }
  };

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    if (!cardComplete) {
      setError(t.cardIncomplete);
      return;
    }

    setLoading(true);
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

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
            },
          },
        }
      );

      if (stripeError) {
        await supabase
          .from('event_registrations')
          .update({ payment_status: 'failed', status: 'cancelled' })
          .eq('id', registration.id);
        throw new Error(stripeError.message || t.paymentFailed);
      }

      if (paymentIntent?.status === 'succeeded') {
        await supabase
          .from('event_registrations')
          .update({
            payment_status: 'paid',
            payment_intent_id: paymentIntent.id,
            status: 'confirmed',
          })
          .eq('id', registration.id);

        setBookingRef(ref);
        setStep('success');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || t.paymentFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const eventTitle = language === 'ar' && event.title_ar ? event.title_ar : event.title;
  const eventLocation = language === 'ar' && event.location_ar ? event.location_ar : event.location;

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1a4d2e',
        '::placeholder': { color: '#666666' },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: { color: '#dc2626' },
    },
  };

  const ticketTypes = [
    { key: 'adult' as const, label: t.adult, price: event.ticket_price_adult, show: true },
    { key: 'child' as const, label: t.child, price: event.ticket_price_child, show: event.ticket_price_child !== null },
    { key: 'member' as const, label: t.memberTicket, price: event.ticket_price_member, show: event.ticket_price_member !== null },
  ].filter(tt => tt.show);

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
              className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-secondary transition-colors"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white px-8 py-6 rounded-t-2xl flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold">{t.title}</h2>
                <p className="text-white/90 text-sm mt-1">{eventTitle}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${step === 'details' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                onClick={() => step === 'payment' && setStep('details')}
              >
                1. {t.step1}
              </button>
              <button
                className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${step === 'payment' ? 'text-primary border-b-2 border-primary' : 'text-gray-400'}`}
                disabled
              >
                2. {t.step2}
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
                <button onClick={() => setError('')} className={`text-red-600 hover:text-red-800 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="p-6 lg:p-8">
              {step === 'details' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Ticket className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-gray-900">{t.ticketType}</h3>
                      {spotsRemaining !== null && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isRTL ? 'mr-auto' : 'ml-auto'} ${spotsRemaining > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {spotsRemaining > 0 ? `${spotsRemaining} ${t.spotsLeft}` : t.soldOut}
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {ticketTypes.map(({ key, label, price }) => (
                        <div key={key} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100">
                          <div>
                            <p className="font-semibold text-gray-900">{label}</p>
                            <p className="text-sm text-gray-500">{price !== null && price !== undefined ? `£${Number(price).toFixed(2)}` : '£0.00'} {t.perTicket}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateTicket(key, -1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30"
                              disabled={tickets[key] === 0}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-bold text-lg">{tickets[key]}</span>
                            <button
                              type="button"
                              onClick={() => updateTicket(key, 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.tickets && <p className="text-red-600 text-sm mt-2">{errors.tickets}</p>}

                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-baseline">
                      <span className="font-semibold text-gray-900">{t.total}</span>
                      <span className="text-2xl font-bold text-primary">£{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-gray-900">{t.personalInfo}</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.firstName}</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={e => { setFormData(p => ({ ...p, firstName: e.target.value })); setErrors(p => ({ ...p, firstName: '' })); }}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.lastName}</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={e => { setFormData(p => ({ ...p, lastName: e.target.value })); setErrors(p => ({ ...p, lastName: '' })); }}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.lastName ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <Mail className="w-4 h-4" /> {t.email}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                        placeholder={t.emailPlaceholder}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <Phone className="w-4 h-4" /> {t.phoneLbl}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => { setFormData(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })); }}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.phone ? 'border-red-500' : 'border-gray-200 focus:border-primary'}`}
                        placeholder={t.phonePlaceholder}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.memberQuestion}</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="isMember" value="yes" checked={formData.isMember === 'yes'} onChange={e => setFormData(p => ({ ...p, isMember: e.target.value }))} className="text-primary" />
                          <span className="text-sm">{t.yes}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="isMember" value="no" checked={formData.isMember === 'no'} onChange={e => setFormData(p => ({ ...p, isMember: e.target.value }))} className="text-primary" />
                          <span className="text-sm">{t.no}</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <Utensils className="w-4 h-4" /> {t.dietary}
                      </label>
                      <input
                        type="text"
                        value={formData.dietaryRequirements}
                        onChange={e => setFormData(p => ({ ...p, dietaryRequirements: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder={t.dietaryPlaceholder}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.notesLbl}</label>
                      <textarea
                        value={formData.notes}
                        onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                        placeholder={t.notesPlaceholder}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                      {t.cancel}
                    </button>
                    <motion.button
                      type="button"
                      onClick={handleContinueToPayment}
                      className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={totalTickets === 0}
                    >
                      {t.continueToPayment}
                    </motion.button>
                  </div>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3">{t.orderSummary}</h3>
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
                        <span className="text-xl font-bold text-primary">£{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
                      <CreditCard className="w-5 h-5" /> {t.cardDetails}
                    </label>
                    <div className="border-2 border-gray-200 rounded-lg p-4 focus-within:border-primary transition-colors">
                      <CardElement
                        options={cardElementOptions}
                        onChange={(e) => setCardComplete(e.complete)}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{t.testCard}</p>
                  </div>

                  <p className="text-xs text-center text-gray-400">{t.securePayment}</p>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                      disabled={loading}
                    >
                      {t.back}
                    </button>
                    <motion.button
                      type="button"
                      onClick={handlePayment}
                      className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={loading ? {} : { scale: 1.02 }}
                      whileTap={loading ? {} : { scale: 0.98 }}
                      disabled={loading || !stripe}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t.processing}
                        </>
                      ) : (
                        `${t.payNow} - £${totalPrice.toFixed(2)}`
                      )}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
