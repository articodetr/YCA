import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  X, Loader2, CreditCard, AlertCircle, CheckCircle, ArrowRight,
  User as UserIcon, Phone, MapPin, Calendar, ChevronLeft, UserPlus, Trash2,
  Lock, Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface FamilyMember {
  name: string;
  relationship: string;
  date_of_birth: string;
}

interface MembershipPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  membershipType: string;
  onStepChange?: (step: string) => void;
  preSelectedBusinessSupport?: string | null;
}

function PaymentForm({
  clientSecret,
  onBack,
  onSuccess,
  membershipType,
}: {
  clientSecret: string;
  onBack: () => void;
  onSuccess: () => void;
  membershipType: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const [processing, setProcessing] = useState(false);
  const [elementReady, setElementReady] = useState(false);
  const [elementComplete, setElementComplete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isRTL = language === 'ar';

  const translations = {
    en: {
      title: 'Payment',
      subtitle: 'Complete your membership payment',
      payNow: 'Pay Now',
      processing: 'Processing...',
      secure: 'Secure payment',
      back: 'Back',
      paymentNotReady: 'Payment form is still loading...',
      paymentIncomplete: 'Please complete the payment information.',
      paymentError: 'Payment failed. Please try again.',
    },
    ar: {
      title: 'الدفع',
      subtitle: 'أكمل دفع رسوم العضوية',
      payNow: 'ادفع الآن',
      processing: 'جاري المعالجة...',
      secure: 'دفع آمن',
      back: 'رجوع',
      paymentNotReady: 'نموذج الدفع لا يزال قيد التحميل...',
      paymentIncomplete: 'يرجى إكمال معلومات الدفع.',
      paymentError: 'فشل الدفع. يرجى المحاولة مرة أخرى.',
    },
  };

  const t = translations[language as 'en' | 'ar'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!stripe || !elements) return;

    if (!elementReady) {
      setError(t.paymentNotReady);
      return;
    }

    if (!elementComplete) {
      setError(t.paymentIncomplete);
      return;
    }

    setProcessing(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/membership/success`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        console.error('Payment error:', result.error);
        setError(result.error.message || t.paymentError);
        setProcessing(false);
        return;
      }

      setMessage(language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment successful!');
      onSuccess();
    } catch (err: any) {
      console.error('Unexpected payment error:', err);
      setError(t.paymentError);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!elements) return;
    const paymentElement = elements.getElement('payment');
    if (paymentElement) {
      setElementReady(true);
    }
  }, [elements]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600 text-sm">{t.subtitle}</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <PaymentElement
          onReady={() => setElementReady(true)}
          onChange={(e) => setElementComplete(e.complete)}
        />
      </div>

      {(message || error) && (
        <div className={`p-4 rounded-xl ${message ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-sm ${message ? 'text-green-700' : 'text-red-700'}`}>{message || error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-colors"
        >
          {t.back}
        </button>
        <button
          type="submit"
          disabled={processing || !stripe}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              {t.processing}
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              {t.payNow}
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">{t.secure}</p>
    </form>
  );
}

export default function MembershipPaymentModal({
  isOpen,
  onClose,
  membershipType,
  onStepChange,
  preSelectedBusinessSupport,
}: MembershipPaymentModalProps) {
  const { language } = useLanguage();
  const { user, refreshMember, signIn, signUp, signInWithGoogle } = useMemberAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const translations = {
    en: {
      title: 'Membership',
      subtitle: 'Join the Yemeni Community Association',
      close: 'Close',
      continue: 'Continue',
      back: 'Back',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      password: 'Password',
      phone: 'Phone Number',
      address: 'Address',
      dob: 'Date of Birth',
      familyMembers: 'Family Members',
      addFamilyMember: 'Add Family Member',
      remove: 'Remove',
      relationship: 'Relationship',
      child: 'Child',
      spouse: 'Spouse',
      parent: 'Parent',
      other: 'Other',
      payment: 'Payment',
      successTitle: 'Welcome!',
      successSubtitle: 'Your membership is now active.',
      goToProfile: 'Go to Profile',
      creatingPayment: 'Preparing payment...',
      errorTitle: 'Something went wrong',
      tryAgain: 'Try Again',
      google: 'Continue with Google',
      or: 'OR',
      signInTitle: 'Sign In',
      signUpTitle: 'Create Account',
      haveAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      signIn: 'Sign In',
      signUp: 'Create Account',
      signingIn: 'Signing in...',
      signingUp: 'Creating account...',
      invalidEmail: 'Please enter a valid email.',
      required: 'This field is required.',
    },
    ar: {
      title: 'العضوية',
      subtitle: 'انضم إلى جمعية الجالية اليمنية',
      close: 'إغلاق',
      continue: 'متابعة',
      back: 'رجوع',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      phone: 'رقم الهاتف',
      address: 'العنوان',
      dob: 'تاريخ الميلاد',
      familyMembers: 'أفراد العائلة',
      addFamilyMember: 'إضافة فرد',
      remove: 'حذف',
      relationship: 'صلة القرابة',
      child: 'طفل',
      spouse: 'زوج/زوجة',
      parent: 'أب/أم',
      other: 'أخرى',
      payment: 'الدفع',
      successTitle: 'مرحباً بك!',
      successSubtitle: 'تم تفعيل عضويتك بنجاح.',
      goToProfile: 'الذهاب للملف الشخصي',
      creatingPayment: 'جاري تجهيز الدفع...',
      errorTitle: 'حدث خطأ',
      tryAgain: 'حاول مرة أخرى',
      google: 'التسجيل عبر جوجل',
      or: 'أو',
      signInTitle: 'تسجيل الدخول',
      signUpTitle: 'إنشاء حساب',
      haveAccount: 'لديك حساب بالفعل؟',
      noAccount: 'ليس لديك حساب؟',
      signIn: 'تسجيل الدخول',
      signUp: 'إنشاء حساب',
      signingIn: 'جاري تسجيل الدخول...',
      signingUp: 'جاري إنشاء الحساب...',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح.',
      required: 'هذا الحقل مطلوب.',
    },
  };

  const t = translations[language as 'en' | 'ar'];

  type ModalStep = 'auth' | 'details' | 'payment' | 'success';

  const [step, setStep] = useState<ModalStep>(!user ? 'auth' : 'details');
  const [autoRedirecting, setAutoRedirecting] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processingAuth, setProcessingAuth] = useState(false);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [memberData, setMemberData] = useState<{ member_number: string; start_date: string; expiry_date: string } | null>(null);
  const [pollingMember, setPollingMember] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (onStepChange) onStepChange(step);
  }, [step, isOpen, onStepChange]);

  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      setStep('details');
    } else {
      setStep('auth');
    }
  }, [isOpen, user]);

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = t.required;
    if (!lastName.trim()) newErrors.lastName = t.required;

    if (!phone.trim()) newErrors.phone = t.required;
    if (!address.trim()) newErrors.address = t.required;
    if (!dob.trim()) newErrors.dob = t.required;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildMembershipMeta = () => {
    return {
      first_name: firstName,
      last_name: lastName,
      phone,
      address,
      date_of_birth: dob,
      membership_type: membershipType,
      family_members: familyMembers,
      business_support_level: preSelectedBusinessSupport || null,
    };
  };

  const createPaymentIntent = async () => {
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-membership-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          membership_type: membershipType,
          business_support_level: preSelectedBusinessSupport || null,
          user_id: user?.id,
          email: user?.email || email,
          meta: buildMembershipMeta(),
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (err: any) {
      console.error('Payment intent error:', err);
      setPaymentError(err.message || 'Payment setup failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const pollForMember = async () => {
    if (!user?.id) return;
    setPollingMember(true);

    try {
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1200));
        const { data } = await supabase
          .from('members')
          .select('member_number, start_date, expiry_date')
          .eq('user_id', user?.id)
          .maybeSingle();

        if (data) {
          setMemberData(data);
          await refreshMember();
          setPollingMember(false);
          return;
        }
      }
    } catch (err) {
      console.error('Polling member failed:', err);
    }

    await refreshMember();
    setPollingMember(false);
  };

  const handlePaymentSuccess = async () => {
    setStep('success');
    await refreshMember();
    pollForMember();
  };

  const handleGoToProfile = async () => {
    await new Promise(r => setTimeout(r, 500));
    await refreshMember();
    navigate('/member/dashboard?tab=profile');
  };

  // ✅ Auto-redirect to profile after successful payment + membership activation
  useEffect(() => {
    if (step !== 'success') return;
    if (!memberData) return;
    if (autoRedirecting) return;

    setAutoRedirecting(true);

    const timer = setTimeout(() => {
      (async () => {
        await new Promise(r => setTimeout(r, 500));
        await refreshMember();
        navigate('/member/dashboard?tab=profile');
      })();
    }, 1200);

    return () => clearTimeout(timer);
  }, [step, memberData, autoRedirecting, navigate, refreshMember]);

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { name: '', relationship: 'child', date_of_birth: '' }]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const handleAuthSubmit = async (mode: 'signin' | 'signup') => {
    setErrors({});
    setPaymentError(null);

    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = t.required;
    if (!password.trim()) newErrors.password = t.required;
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setProcessingAuth(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        setStep('details');
      } else {
        const { error } = await signUp(email, password, buildMembershipMeta());
        if (error) throw error;
        setStep('details');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setPaymentError(language === 'ar' ? 'فشل تسجيل الدخول/إنشاء الحساب' : 'Authentication failed');
    } finally {
      setProcessingAuth(false);
    }
  };

  const handleGoogle = async () => {
    setPaymentError(null);
    setProcessingAuth(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      console.error('Google auth error:', err);
      setPaymentError(language === 'ar' ? 'فشل تسجيل الدخول عبر جوجل' : 'Google sign in failed');
      setProcessingAuth(false);
    }
  };

  const handleNext = async () => {
    if (step === 'auth') return;
    if (step === 'details') {
      if (!validateDetails()) return;
      await createPaymentIntent();
      return;
    }
  };

  const handleBack = () => {
    if (step === 'payment') setStep('details');
    if (step === 'details' && !user) setStep('auth');
  };

  const handleClose = () => {
    setClientSecret(null);
    setPaymentError(null);
    setMemberData(null);
    setPollingMember(false);
    setAutoRedirecting(false);
    onClose();
  };

  if (!isOpen) return null;

  const stripeElementsOptions = clientSecret
    ? { clientSecret }
    : undefined;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t.title}</h2>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            {paymentError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{paymentError}</p>
              </div>
            )}

            {step === 'auth' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{t.signInTitle}</h3>
                  <p className="text-sm text-gray-600">{language === 'ar' ? 'قم بتسجيل الدخول للمتابعة' : 'Sign in to continue'}</p>
                </div>

                <button
                  onClick={handleGoogle}
                  disabled={processingAuth}
                  className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingAuth ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="inline-flex"><Mail className="w-5 h-5" /></span>}
                  {t.google}
                </button>

                <div className="my-2 flex items-center">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="px-4 text-sm text-gray-500">{t.or}</span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
                    <div className="relative">
                      <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
                    <div className="relative">
                      <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
                      />
                    </div>
                    {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAuthSubmit('signin')}
                      disabled={processingAuth}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {processingAuth ? <Loader2 className="w-5 h-5 animate-spin" /> : t.signIn}
                    </button>
                    <button
                      onClick={() => handleAuthSubmit('signup')}
                      disabled={processingAuth}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {processingAuth ? <Loader2 className="w-5 h-5 animate-spin" /> : t.signUp}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.firstName}</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                    {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.lastName}</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                    {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone}</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.address}</label>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.dob}</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    />
                    {errors.dob && <p className="text-xs text-red-600 mt-1">{errors.dob}</p>}
                  </div>
                </div>

                {/* Family members (optional for certain plans) */}
                {membershipType === 'family' && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">{t.familyMembers}</h4>
                      <button
                        type="button"
                        onClick={addFamilyMember}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                      >
                        <UserPlus className="w-4 h-4" />
                        {t.addFamilyMember}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {familyMembers.map((fm, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                              <input
                                value={fm.name}
                                onChange={(e) => updateFamilyMember(idx, 'name', e.target.value)}
                                placeholder={language === 'ar' ? 'الاسم' : 'Name'}
                                className="w-full py-2.5 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                              />
                              <select
                                value={fm.relationship}
                                onChange={(e) => updateFamilyMember(idx, 'relationship', e.target.value)}
                                className="w-full py-2.5 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all bg-white"
                              >
                                <option value="child">{t.child}</option>
                                <option value="spouse">{t.spouse}</option>
                                <option value="parent">{t.parent}</option>
                                <option value="other">{t.other}</option>
                              </select>
                              <input
                                type="date"
                                value={fm.date_of_birth}
                                onChange={(e) => updateFamilyMember(idx, 'date_of_birth', e.target.value)}
                                className="w-full py-2.5 px-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFamilyMember(idx)}
                              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                              aria-label="Remove"
                            >
                              <Trash2 className="w-5 h-5 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center"
                  >
                    <ChevronLeft className={`w-5 h-5 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                    {t.back}
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={paymentLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {t.creatingPayment}
                      </>
                    ) : (
                      <>
                        {t.continue}
                        <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && clientSecret && (
              <Elements stripe={stripePromise} options={stripeElementsOptions}>
                <PaymentForm
                  clientSecret={clientSecret}
                  onBack={handleBack}
                  onSuccess={handlePaymentSuccess}
                  membershipType={membershipType}
                />
              </Elements>
            )}

            {step === 'success' && (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t.successTitle}</h3>
                <p className="text-gray-600">{t.successSubtitle}</p>

                {pollingMember && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === 'ar' ? 'جاري تفعيل العضوية...' : 'Activating membership...'}
                  </div>
                )}

                <button
                  onClick={handleGoToProfile}
                  className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  {t.goToProfile}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
