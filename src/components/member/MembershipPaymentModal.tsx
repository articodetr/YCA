import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  X, Loader2, CreditCard, AlertCircle, CheckCircle, ArrowRight,
  User as UserIcon, Phone, MapPin, Calendar, ChevronLeft, UserPlus, Trash2,
  Lock, Mail,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { supabase } from '../../lib/supabase';
import { stripePromise } from '../../lib/stripe';
import BusinessSupportSelector from '../BusinessSupportSelector';

interface MembershipPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  membershipType: {
    id: string;
    nameEn: string;
    nameAr: string;
    price: number;
    priceLabel: string;
  };
  onStepChange?: (step: number) => void;
  preSelectedBusinessSupport?: { tier: string; amount: number; frequency: string } | null;
}

interface FamilyMember {
  name: string;
  relationship: string;
  date_of_birth: string;
}

const translations = {
  en: {
    stepAuth: 'Sign In or Create Account',
    stepDetails: 'Complete Your Details',
    stepPayment: 'Make Payment',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    dateOfBirth: 'Date of Birth',
    address: 'Address',
    city: 'City',
    postcode: 'Postcode',
    continueToPayment: 'Continue to Payment',
    back: 'Back',
    payNow: 'Pay Now',
    processing: 'Processing payment...',
    required: 'This field is required',
    membershipPlan: 'Membership Plan',
    total: 'Total',
    paymentSuccess: 'Membership Activated!',
    memberNumber: 'Your Membership Number',
    startDate: 'Start Date',
    endDate: 'End Date',
    membershipType: 'Membership Type',
    goToProfile: 'Go to My Profile',
    creatingApplication: 'Saving your details...',
    settingUpPayment: 'Setting up payment...',
    paymentError: 'Payment failed. Please try again.',
    familyMembers: 'Family Members',
    addFamilyMember: 'Add Family Member',
    memberName: 'Member Name',
    relationship: 'Relationship',
    spouse: 'Spouse',
    child: 'Child',
    parent: 'Parent',
    sibling: 'Sibling',
    other: 'Other',
    removeMember: 'Remove',
    individual: 'Individual',
    family: 'Family',
    associate: 'Associate',
    business_support: 'Business Support',
    waitingConfirmation: 'Confirming membership...',
    continueWithGoogle: 'Continue with Google',
    or: 'OR',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    signingIn: 'Signing in...',
    creatingAccount: 'Creating account...',
    noAccount: "Don't have an account?",
    register: 'Register',
    haveAccount: 'Already have an account?',
    login: 'Sign In',
    passwordMismatch: 'Passwords do not match',
    passwordMinLength: 'Password must be at least 6 characters',
    authError: 'Authentication failed. Please try again.',
    userExists: 'An account with this email already exists. Please sign in instead.',
  },
  ar: {
    stepAuth: 'تسجيل الدخول أو إنشاء حساب',
    stepDetails: 'أكمل بياناتك',
    stepPayment: 'ادفع الرسوم',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    phone: 'رقم الهاتف',
    dateOfBirth: 'تاريخ الميلاد',
    address: 'العنوان',
    city: 'المدينة',
    postcode: 'الرمز البريدي',
    continueToPayment: 'متابعة للدفع',
    back: 'رجوع',
    payNow: 'ادفع الآن',
    processing: 'جاري معالجة الدفع...',
    required: 'هذا الحقل مطلوب',
    membershipPlan: 'خطة العضوية',
    total: 'المجموع',
    paymentSuccess: 'تم تفعيل العضوية!',
    memberNumber: 'رقم عضويتك',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    membershipType: 'نوع العضوية',
    goToProfile: 'الذهاب إلى ملفي الشخصي',
    creatingApplication: 'جاري حفظ البيانات...',
    settingUpPayment: 'جاري تجهيز الدفع...',
    paymentError: 'فشل الدفع. يرجى المحاولة مرة أخرى.',
    familyMembers: 'أفراد العائلة',
    addFamilyMember: 'إضافة فرد عائلة',
    memberName: 'اسم الفرد',
    relationship: 'صلة القرابة',
    spouse: 'زوج/زوجة',
    child: 'ابن/ابنة',
    parent: 'والد/والدة',
    sibling: 'أخ/أخت',
    other: 'أخرى',
    removeMember: 'إزالة',
    individual: 'فردية',
    family: 'عائلية',
    associate: 'منتسب',
    business_support: 'دعم الأعمال',
    waitingConfirmation: 'جاري تأكيد العضوية...',
    continueWithGoogle: 'المتابعة مع جوجل',
    or: 'أو',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    fullName: 'الاسم الكامل',
    signIn: 'تسجيل الدخول',
    createAccount: 'إنشاء حساب',
    signingIn: 'جاري تسجيل الدخول...',
    creatingAccount: 'جاري إنشاء الحساب...',
    noAccount: 'ليس لديك حساب؟',
    register: 'سجل الآن',
    haveAccount: 'لديك حساب بالفعل؟',
    login: 'تسجيل الدخول',
    passwordMismatch: 'كلمات المرور غير متطابقة',
    passwordMinLength: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
    authError: 'فشل التحقق. يرجى المحاولة مرة أخرى.',
    userExists: 'يوجد حساب بهذا البريد الإلكتروني. يرجى تسجيل الدخول بدلاً من ذلك.',
  },
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
      </g>
    </svg>
  );
}

interface PaymentFormProps {
  amount: number;
  applicationId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function PaymentForm({ amount, applicationId, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const [processing, setProcessing] = useState(false);
  const t = translations[language];

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
          return_url: `${window.location.origin}/member/dashboard`,
        },
        redirect: 'if_required',
      });

      if (confirmError) throw confirmError;

      if (paymentIntent?.status === 'succeeded') {
        const activateResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-membership`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              application_id: applicationId,
              user_id: user?.id,
            }),
          }
        );

        const activateData = await activateResponse.json();
        if (!activateResponse.ok || !activateData.success) {
          console.error('Activation failed:', activateData.error);
        }

        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || t.paymentError);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
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
            {t.payNow} - £{amount}
          </>
        )}
      </button>
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
  const t = translations[language];

  type ModalStep = 'auth' | 'details' | 'payment' | 'success';

  const [step, setStep] = useState<ModalStep>(!user ? 'auth' : 'details');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [businessSupport, setBusinessSupport] = useState<{ tier: string; amount: number; frequency: string } | null>(
    preSelectedBusinessSupport || null
  );
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [submittingDetails, setSubmittingDetails] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [memberData, setMemberData] = useState<{ member_number: string; start_date: string; expiry_date: string } | null>(null);
  const [pollingMember, setPollingMember] = useState(false);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const paymentAmount = membershipType.id === 'business_support'
    ? (businessSupport?.amount || 0)
    : membershipType.price;

  useEffect(() => {
    if (isOpen && user) {
      if (step === 'auth') {
        setStep('details');
      }
      const meta = user.user_metadata || {};
      const fullName = meta.full_name || meta.name || '';
      const parts = fullName.split(' ');
      if (!firstName) setFirstName(parts[0] || '');
      if (!lastName) setLastName(parts.slice(1).join(' ') || '');
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      setStep(!user ? 'auth' : 'details');
      setErrors({});
      setApplicationId(null);
      setClientSecret(null);
      setPaymentError(null);
      setMemberData(null);
      setFamilyMembers([]);
      setBusinessSupport(preSelectedBusinessSupport || null);
      setPollingMember(false);
      setAuthError('');
      setAuthEmail('');
      setAuthPassword('');
      setAuthConfirmPassword('');
      setAuthFullName('');
      setAuthMode('login');
      setFirstName('');
      setLastName('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (onStepChange) {
      const stepMap: Record<ModalStep, number> = { auth: 1, details: 2, payment: 2, success: 3 };
      onStepChange(stepMap[step]);
    }
  }, [step, onStepChange]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await signIn(authEmail, authPassword);
        if (error) throw error;
      } else {
        if (authPassword !== authConfirmPassword) {
          setAuthError(t.passwordMismatch);
          setAuthLoading(false);
          return;
        }
        if (authPassword.length < 6) {
          setAuthError(t.passwordMinLength);
          setAuthLoading(false);
          return;
        }
        const { data, error } = await signUp(authEmail, authPassword, { full_name: authFullName });
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('already registered') || msg.includes('user already exists')) {
            setAuthError(t.userExists);
          } else {
            throw error;
          }
          setAuthLoading(false);
          return;
        }
        if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
          setAuthError(t.userExists);
          setAuthLoading(false);
          return;
        }
      }
    } catch (err: any) {
      setAuthError(err.message || t.authError);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || t.authError);
      setGoogleLoading(false);
    }
  };

  const validate = () => {
    const errs: Record<string, boolean> = {};
    if (!firstName.trim()) errs.firstName = true;
    if (!lastName.trim()) errs.lastName = true;
    if (!phone.trim()) errs.phone = true;
    if (!dateOfBirth) errs.dateOfBirth = true;
    if (!address.trim()) errs.address = true;
    if (!city.trim()) errs.city = true;
    if (!postcode.trim()) errs.postcode = true;
    if (membershipType.id === 'business_support' && !businessSupport) errs.businessSupport = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinueToPayment = async () => {
    if (!validate() || !user) return;

    setSubmittingDetails(true);
    try {
      const applicationData: any = {
        user_id: user.id,
        email: user.email,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.trim(),
        date_of_birth: dateOfBirth,
        address: address.trim(),
        city: city.trim(),
        postcode: postcode.trim(),
        membership_type: membershipType.id,
        status: 'pending',
        payment_status: 'pending',
      };

      if (membershipType.id === 'business_support' && businessSupport) {
        applicationData.business_support_tier = businessSupport.tier;
        applicationData.custom_amount = businessSupport.amount;
        applicationData.payment_frequency = businessSupport.frequency;
      }

      const { data: appData, error: appError } = await supabase
        .from('membership_applications')
        .insert(applicationData)
        .select('id')
        .single();

      if (appError) throw appError;

      const appId = appData.id;
      setApplicationId(appId);

      if (membershipType.id === 'family' && familyMembers.length > 0) {
        const familyData = familyMembers.map(fm => ({
          application_id: appId,
          name: fm.name,
          relationship: fm.relationship,
          date_of_birth: fm.date_of_birth || null,
        }));
        await supabase.from('membership_application_family_members').insert(familyData);
      }

      setLoadingPayment(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount: Math.round(paymentAmount * 100),
            currency: 'gbp',
            metadata: {
              user_id: user.id,
              application_id: appId,
              type: 'membership',
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create payment');
      if (!data.clientSecret) throw new Error('No client secret returned');

      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (err: any) {
      console.error('Application/payment setup error:', err);
      setPaymentError(err.message);
    } finally {
      setSubmittingDetails(false);
      setLoadingPayment(false);
    }
  };

  const pollForMember = async () => {
    setPollingMember(true);
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 500));
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-GB' : 'en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const typeLabel = t[membershipType.id as keyof typeof t] || membershipType.nameEn;

  if (!isOpen) return null;

  const getStepTitle = () => {
    switch (step) {
      case 'auth': return t.stepAuth;
      case 'details': return t.stepDetails;
      case 'payment': return t.stepPayment;
      default: return '';
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('details');
      setClientSecret(null);
      setPaymentError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step !== 'success' ? onClose : undefined}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {step !== 'success' && (
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
              <h2 className="text-lg font-bold text-gray-900">{getStepTitle()}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'auth' && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-emerald-700 font-medium">{t.membershipPlan}</p>
                  <p className="font-bold text-emerald-800 text-lg">
                    {language === 'ar' ? membershipType.nameAr : membershipType.nameEn}
                    {membershipType.id !== 'business_support' && (
                      <span className="text-emerald-600 mx-2">{membershipType.priceLabel}</span>
                    )}
                    {membershipType.id === 'business_support' && businessSupport && (
                      <span className="text-emerald-600 mx-2">£{businessSupport.amount}</span>
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={googleLoading || authLoading}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.signingIn}
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      {t.continueWithGoogle}
                    </>
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">{t.or}</span>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{authError}</p>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.fullName}</label>
                      <div className="relative">
                        <UserIcon className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                        <input
                          type="text"
                          value={authFullName}
                          onChange={e => setAuthFullName(e.target.value)}
                          className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                          required
                          disabled={authLoading}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.email}</label>
                    <div className="relative">
                      <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                        placeholder="member@example.com"
                        required
                        disabled={authLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.password}</label>
                    <div className="relative">
                      <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                      <input
                        type="password"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        disabled={authLoading}
                      />
                    </div>
                  </div>

                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.confirmPassword}</label>
                      <div className="relative">
                        <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                        <input
                          type="password"
                          value={authConfirmPassword}
                          onChange={e => setAuthConfirmPassword(e.target.value)}
                          className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          disabled={authLoading}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {authMode === 'login' ? t.signingIn : t.creatingAccount}
                      </>
                    ) : (
                      authMode === 'login' ? t.signIn : t.createAccount
                    )}
                  </button>
                </form>

                <p className="text-sm text-gray-600 text-center">
                  {authMode === 'login' ? t.noAccount : t.haveAccount}{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    {authMode === 'login' ? t.register : t.login}
                  </button>
                </p>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">{t.membershipPlan}</p>
                    <p className="font-bold text-emerald-800">
                      {language === 'ar' ? membershipType.nameAr : membershipType.nameEn}
                    </p>
                  </div>
                  {membershipType.id !== 'business_support' && (
                    <span className="text-2xl font-bold text-emerald-600">{membershipType.priceLabel}</span>
                  )}
                  {membershipType.id === 'business_support' && businessSupport && (
                    <span className="text-2xl font-bold text-emerald-600">£{businessSupport.amount}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.firstName} *</label>
                    <div className="relative">
                      <UserIcon className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => { setFirstName(e.target.value); setErrors(p => ({ ...p, firstName: false })); }}
                        className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.lastName} *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => { setLastName(e.target.value); setErrors(p => ({ ...p, lastName: false })); }}
                      className={`w-full px-3 py-2.5 border ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.phone} *</label>
                  <div className="relative">
                    <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: false })); }}
                      className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.dateOfBirth} *</label>
                  <div className="relative">
                    <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={e => { setDateOfBirth(e.target.value); setErrors(p => ({ ...p, dateOfBirth: false })); }}
                      className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border ${errors.dateOfBirth ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.address} *</label>
                  <div className="relative">
                    <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-gray-400`} />
                    <input
                      type="text"
                      value={address}
                      onChange={e => { setAddress(e.target.value); setErrors(p => ({ ...p, address: false })); }}
                      className={`w-full ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.city} *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => { setCity(e.target.value); setErrors(p => ({ ...p, city: false })); }}
                      className={`w-full px-3 py-2.5 border ${errors.city ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.postcode} *</label>
                    <input
                      type="text"
                      value={postcode}
                      onChange={e => { setPostcode(e.target.value); setErrors(p => ({ ...p, postcode: false })); }}
                      className={`w-full px-3 py-2.5 border ${errors.postcode ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm`}
                    />
                  </div>
                </div>

                {membershipType.id === 'family' && (
                  <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{t.familyMembers}</h3>
                      <button
                        type="button"
                        onClick={addFamilyMember}
                        className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        <UserPlus className="w-4 h-4" />
                        {t.addFamilyMember}
                      </button>
                    </div>
                    {familyMembers.map((fm, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {language === 'ar' ? `فرد ${idx + 1}` : `Member ${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFamilyMember(idx)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                            {t.removeMember}
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder={t.memberName}
                          value={fm.name}
                          onChange={e => updateFamilyMember(idx, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={fm.relationship}
                            onChange={e => updateFamilyMember(idx, 'relationship', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          >
                            <option value="spouse">{t.spouse}</option>
                            <option value="child">{t.child}</option>
                            <option value="parent">{t.parent}</option>
                            <option value="sibling">{t.sibling}</option>
                            <option value="other">{t.other}</option>
                          </select>
                          <input
                            type="date"
                            value={fm.date_of_birth}
                            onChange={e => updateFamilyMember(idx, 'date_of_birth', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {membershipType.id === 'business_support' && !preSelectedBusinessSupport && (
                  <div className={`border rounded-xl p-4 ${errors.businessSupport ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                    <BusinessSupportSelector
                      onSelect={(data) => {
                        setBusinessSupport(data);
                        setErrors(p => ({ ...p, businessSupport: false }));
                      }}
                    />
                  </div>
                )}

                {paymentError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{paymentError}</p>
                  </div>
                )}

                <button
                  onClick={handleContinueToPayment}
                  disabled={submittingDetails || loadingPayment || (membershipType.id === 'business_support' && paymentAmount === 0)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingDetails ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.creatingApplication}
                    </>
                  ) : loadingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.settingUpPayment}
                    </>
                  ) : (
                    <>
                      {t.continueToPayment}
                      <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {step === 'payment' && clientSecret && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{t.membershipPlan}</p>
                    <p className="font-semibold text-gray-900">
                      {language === 'ar' ? membershipType.nameAr : membershipType.nameEn}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm text-gray-600">{t.total}</p>
                    <p className="text-2xl font-bold text-emerald-600">£{paymentAmount}</p>
                  </div>
                </div>

                {paymentError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{paymentError}</p>
                  </div>
                )}

                <Elements
                  key={clientSecret}
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: { colorPrimary: '#059669' },
                    },
                  }}
                >
                  <PaymentForm
                    amount={paymentAmount}
                    applicationId={applicationId!}
                    onSuccess={handlePaymentSuccess}
                    onError={(msg) => setPaymentError(msg)}
                  />
                </Elements>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.paymentSuccess}</h2>
                </div>

                {pollingMember && !memberData && (
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{t.waitingConfirmation}</span>
                  </div>
                )}

                {memberData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 space-y-4 border border-emerald-200"
                  >
                    <div>
                      <p className="text-sm text-emerald-700 mb-1">{t.memberNumber}</p>
                      <p className="text-3xl font-black text-emerald-800 tracking-wider">{memberData.member_number}</p>
                    </div>
                    <div className="h-px bg-emerald-200" />
                    <div className="grid grid-cols-2 gap-4 text-start">
                      <div>
                        <p className="text-xs text-emerald-600 mb-0.5">{t.membershipType}</p>
                        <p className="text-sm font-semibold text-gray-900">{typeLabel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 mb-0.5">{t.startDate}</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(memberData.start_date)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-emerald-600 mb-0.5">{t.endDate}</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(memberData.expiry_date)}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={handleGoToProfile}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {t.goToProfile}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
