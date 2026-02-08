import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, User, X, FileText, Send, Upload } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabase';
import { stripePromise } from '../../lib/stripe';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import FileUploadField from '../booking/FileUploadField';
import WakalaCheckoutForm from './WakalaCheckoutForm';

interface WakalaBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: any;
  onSuccess?: () => void;
}

export default function WakalaBookingModal({ isOpen, onClose, onSuccess }: WakalaBookingModalProps) {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [consent, setConsent] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: user?.email || '',
    applicantName: '',
    agentName: '',
    wakalaType: '',
    wakalaFormat: '',
    specialRequests: '',
    membershipNumber: '',
  });

  const [applicantPassportUrls, setApplicantPassportUrls] = useState<string[]>([]);
  const [attorneyPassportUrls, setAttorneyPassportUrls] = useState<string[]>([]);
  const [witnessPassportUrls, setWitnessPassportUrls] = useState<string[]>([]);

  const [membershipStatus, setMembershipStatus] = useState<'none' | 'active'>('none');
  const [memberDaysSinceJoin, setMemberDaysSinceJoin] = useState(0);
  const [previousWakalaCount, setPreviousWakalaCount] = useState(0);
  const [memberNumber, setMemberNumber] = useState('');

  const t = language === 'ar' ? {
    title: 'طلب وكالة جديد',
    subtitle: 'أكمل النموذج وارفق المستندات المطلوبة',
    closeModal: 'إغلاق',
    cancel: 'إلغاء',
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
    },
    wakalaFormats: {
      standard: 'الصيغة العادية',
      notarized: 'الصيغة الموثقة',
      apostille: 'مع أبوستيل',
    },
    documents: 'المستندات المطلوبة',
    applicantPassport: 'جواز سفر الموكّل',
    attorneyPassport: 'جواز سفر الوكيل',
    witnessPassports: 'جوازات الشهود (اختياري)',
    pricingInfo: 'معلومات التسعير',
    priceFree: 'مجاناً - أول وكالة للأعضاء المؤهلين (عضوية 10 أيام فأكثر)',
    priceMember: '20 جنيه - وكالة إضافية للأعضاء المؤهلين',
    priceNonMember: '40 جنيه - سعر غير الأعضاء',
    yourPrice: 'السعر الخاص بك',
    free: 'مجاناً',
    specialRequests: 'ملاحظات إضافية (اختياري)',
    membershipNumber: 'رقم العضوية',
    consentLabel: 'أؤكد موافقتي على استخدام معلوماتي وفقاً لسياسات جمعية الجالية اليمنية في برمنغهام',
    submit: 'تقديم الطلب',
    submitAndPay: 'تقديم الطلب والدفع',
    submitting: 'جاري المعالجة...',
    successTitle: 'تم تقديم الطلب بنجاح!',
    successMsg: 'سنراجع طلبك ونتواصل معك قريباً.',
    paymentSuccess: 'تم الدفع وتقديم الطلب بنجاح!',
    errorMessage: 'فشل تقديم الطلب. يرجى المحاولة مرة أخرى.',
    fillAllFields: 'يرجى تعبئة جميع الحقول المطلوبة',
    uploadRequired: 'يرجى رفع جوازات الموكل والوكيل',
    loadingData: 'جاري تحميل معلوماتك...',
    closeConfirm: 'هل تريد الإغلاق؟ سيتم فقدان البيانات.',
    paymentTitle: 'إكمال الدفع',
    settingUpPayment: 'جاري تجهيز الدفع...',
    paymentError: 'فشل في تهيئة الدفع. يرجى المحاولة مرة أخرى.',
    memberBadge: 'عضو نشط',
  } : {
    title: 'New Wakala Application',
    subtitle: 'Complete the form and upload required documents',
    closeModal: 'Close',
    cancel: 'Cancel',
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
    },
    wakalaFormats: {
      standard: 'Standard Format',
      notarized: 'Notarized Format',
      apostille: 'With Apostille',
    },
    documents: 'Required Documents',
    applicantPassport: 'Applicant Passport Copy',
    attorneyPassport: 'Attorney Passport Copy',
    witnessPassports: 'Witness Passports (Optional)',
    pricingInfo: 'Pricing Information',
    priceFree: 'Free - First wakala for eligible members (10+ days membership)',
    priceMember: '\u00A320 - Additional wakala for eligible members',
    priceNonMember: '\u00A340 - Non-member rate',
    yourPrice: 'Your Price',
    free: 'Free',
    specialRequests: 'Additional Notes (Optional)',
    membershipNumber: 'Membership Number',
    consentLabel: 'I confirm that I agree to the use of my information in line with YCA Birmingham policies',
    submit: 'Submit Application',
    submitAndPay: 'Submit & Proceed to Payment',
    submitting: 'Processing...',
    successTitle: 'Application Submitted!',
    successMsg: 'We will review your application and contact you soon.',
    paymentSuccess: 'Payment completed and application submitted!',
    errorMessage: 'Failed to submit application. Please try again.',
    fillAllFields: 'Please fill all required fields',
    uploadRequired: 'Please upload applicant and attorney passport copies',
    loadingData: 'Loading your information...',
    closeConfirm: 'Are you sure you want to close? Your changes will be lost.',
    paymentTitle: 'Complete Payment',
    settingUpPayment: 'Setting up payment...',
    paymentError: 'Failed to initialize payment. Please try again.',
    memberBadge: 'Active Member',
  };

  useEffect(() => {
    if (isOpen) {
      loadUserData();
      checkMemberEligibility();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      resetForm();
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const loadUserData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const { data: memberData } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (memberData) {
        const fullName = memberData.full_name ||
          (memberData.first_name && memberData.last_name
            ? `${memberData.first_name} ${memberData.last_name}` : '');
        setFormData(prev => ({
          ...prev,
          fullName: fullName || prev.fullName,
          phone: memberData.phone || prev.phone,
          email: memberData.email || user.email || prev.email,
        }));
        if (memberData.membership_number) {
          setMemberNumber(memberData.membership_number);
          setFormData(prev => ({ ...prev, membershipNumber: memberData.membership_number }));
        }
        return;
      }

      const { data: appData } = await supabase
        .from('membership_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (appData) {
        const fullName = appData.full_name ||
          (appData.first_name && appData.last_name ? `${appData.first_name} ${appData.last_name}` : '');
        setFormData(prev => ({
          ...prev,
          fullName: fullName || prev.fullName,
          phone: appData.phone || prev.phone,
          email: appData.email || user.email || prev.email,
        }));
        return;
      }

      const meta = user.user_metadata || {};
      setFormData(prev => ({
        ...prev,
        fullName: meta.full_name || meta.name || prev.fullName,
        phone: meta.phone || prev.phone,
        email: user.email || prev.email,
      }));
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const checkMemberEligibility = async () => {
    if (!user) return;
    try {
      const { data: member } = await supabase
        .from('members')
        .select('membership_start_date, status')
        .eq('email', user.email)
        .eq('status', 'active')
        .maybeSingle();

      if (member?.membership_start_date) {
        setMembershipStatus('active');
        const start = new Date(member.membership_start_date);
        const diffDays = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
        setMemberDaysSinceJoin(diffDays);
      } else {
        setMembershipStatus('none');
        setMemberDaysSinceJoin(0);
      }

      const { count } = await supabase
        .from('wakala_applications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('status', 'cancelled');

      setPreviousWakalaCount(count || 0);
    } catch (err) {
      console.error('Error checking eligibility:', err);
    }
  };

  const calculatePrice = () => {
    if (membershipStatus === 'active' && memberDaysSinceJoin >= 10) {
      return previousWakalaCount === 0 ? 0 : 20;
    }
    return 40;
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
            metadata: { user_id: user?.id, wakala_id: wakalaId, type: 'wakala' },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.paymentError);
      if (!data.clientSecret) throw new Error('No client secret returned');

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setError(err.message || t.paymentError);
      setStep('form');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.phone || !formData.email ||
        !formData.applicantName || !formData.agentName ||
        !formData.wakalaType || !formData.wakalaFormat) {
      setError(t.fillAllFields);
      return;
    }

    if (applicantPassportUrls.length === 0 || attorneyPassportUrls.length === 0) {
      setError(t.uploadRequired);
      return;
    }

    if (membershipStatus === 'active' && !formData.membershipNumber) {
      setError(t.fillAllFields);
      return;
    }

    if (!consent) {
      setError(t.fillAllFields);
      return;
    }

    setLoading(true);
    try {
      const price = calculatePrice();

      const applicationData = {
        user_id: user?.id,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        service_type: `wakala_${formData.wakalaType}`,
        special_requests: formData.specialRequests,
        fee_amount: price,
        payment_status: price === 0 ? 'paid' : 'pending',
        status: price === 0 ? 'submitted' : 'pending_payment',
        applicant_name: formData.applicantName,
        agent_name: formData.agentName,
        wakala_type: formData.wakalaType,
        wakala_format: formData.wakalaFormat,
        membership_status: membershipStatus === 'active' ? 'member' : 'non_member',
        is_first_wakala: previousWakalaCount === 0,
        applicant_passport_url: applicantPassportUrls[0] || null,
        attorney_passport_url: attorneyPassportUrls[0] || null,
        witness_passports_url: witnessPassportUrls.length > 0 ? witnessPassportUrls.join(',') : null,
      };

      const { data: application, error: appError } = await supabase
        .from('wakala_applications')
        .insert([applicationData])
        .select()
        .maybeSingle();

      if (appError) throw appError;

      setApplicationId(application.id);
      setPaymentAmount(price);

      if (price === 0) {
        setStep('success');
      } else {
        await createPaymentIntent(application.id, price);
        setStep('payment');
      }
    } catch (err: any) {
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
    const hasData = formData.fullName || formData.applicantName || applicantPassportUrls.length > 0 || step === 'payment';
    if (hasData && step !== 'success') {
      if (window.confirm(t.closeConfirm)) onClose();
    } else {
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '', phone: '', email: user?.email || '',
      applicantName: '', agentName: '', wakalaType: '', wakalaFormat: '',
      specialRequests: '', membershipNumber: '',
    });
    setApplicantPassportUrls([]);
    setAttorneyPassportUrls([]);
    setWitnessPassportUrls([]);
    setError('');
    setStep('form');
    setClientSecret(null);
    setApplicationId(null);
    setPaymentAmount(0);
    setConsent(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, step]);

  if (!isOpen) return null;

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {paymentAmount > 0 ? t.paymentSuccess : t.successTitle}
            </h2>
            <p className="text-gray-600 mb-6">{t.successMsg}</p>
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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          dir={isRTL ? 'rtl' : 'ltr'} onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">{t.paymentTitle}</h2>
            <button type="button" onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <div className="p-6">
            <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#059669' } } }}>
              <WakalaCheckoutForm amount={paymentAmount} wakalaId={applicationId || undefined} onSuccess={() => setStep('success')} onBack={() => setStep('form')} />
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

  const currentPrice = calculatePrice();
  const isFormComplete = formData.fullName && formData.phone && formData.email &&
    formData.applicantName && formData.agentName && formData.wakalaType && formData.wakalaFormat &&
    applicantPassportUrls.length > 0 && attorneyPassportUrls.length > 0 && consent &&
    (membershipStatus !== 'active' || formData.membershipNumber);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
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
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {membershipStatus === 'active' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="text-sm font-medium text-emerald-800">{t.memberBadge}</span>
              {memberNumber && (
                <span className="text-sm text-emerald-600">#{memberNumber}</span>
              )}
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start gap-3 mb-5">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t.personalInfo}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{t.contactDescription}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.fullName} *</label>
                <input type="text" name="fullName" value={formData.fullName}
                  onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required disabled={dataLoading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.phone} *</label>
                <input type="tel" name="phone" value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required disabled={dataLoading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.email} *</label>
                <input type="email" name="email" value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required disabled={dataLoading} />
              </div>
              {membershipStatus === 'active' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.membershipNumber} *</label>
                  <input type="text" value={formData.membershipNumber}
                    onChange={e => setFormData(p => ({ ...p, membershipNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required disabled={dataLoading} />
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start gap-3 mb-5">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t.wakalaDetails}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.applicantName} *</label>
                <input type="text" value={formData.applicantName}
                  onChange={e => setFormData(p => ({ ...p, applicantName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required disabled={dataLoading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.agentName} *</label>
                <input type="text" value={formData.agentName}
                  onChange={e => setFormData(p => ({ ...p, agentName: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required disabled={dataLoading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.wakalaType} *</label>
                <select value={formData.wakalaType}
                  onChange={e => setFormData(p => ({ ...p, wakalaType: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  required disabled={dataLoading}>
                  <option value="">{t.selectWakalaType}</option>
                  {Object.entries(t.wakalaTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.wakalaFormat} *</label>
                <select value={formData.wakalaFormat}
                  onChange={e => setFormData(p => ({ ...p, wakalaFormat: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  required disabled={dataLoading}>
                  <option value="">{t.selectWakalaFormat}</option>
                  {Object.entries(t.wakalaFormats).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start gap-3 mb-5">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t.documents}</h3>
            </div>

            <div className="space-y-5">
              <FileUploadField
                label={t.applicantPassport}
                required
                userId={user?.id}
                onUploadComplete={setApplicantPassportUrls}
                existingUrls={applicantPassportUrls}
              />
              <FileUploadField
                label={t.attorneyPassport}
                required
                userId={user?.id}
                onUploadComplete={setAttorneyPassportUrls}
                existingUrls={attorneyPassportUrls}
              />
              <FileUploadField
                label={t.witnessPassports}
                multiple
                userId={user?.id}
                onUploadComplete={setWitnessPassportUrls}
                existingUrls={witnessPassportUrls}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h4 className="text-md font-bold text-gray-900 mb-3">{t.pricingInfo}</h4>
            <div className="space-y-2 text-sm">
              <p className={currentPrice === 0 ? 'font-bold text-emerald-700' : 'text-gray-600'}>{t.priceFree}</p>
              <p className={currentPrice === 20 ? 'font-bold text-emerald-700' : 'text-gray-600'}>{t.priceMember}</p>
              <p className={currentPrice === 40 ? 'font-bold text-emerald-700' : 'text-gray-600'}>{t.priceNonMember}</p>
              <div className="border-t border-blue-300 pt-2 mt-2">
                <span className="font-bold text-lg text-emerald-700">
                  {t.yourPrice}: {currentPrice === 0 ? t.free : `\u00A3${currentPrice}`}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.specialRequests}</label>
            <textarea value={formData.specialRequests}
              onChange={e => setFormData(p => ({ ...p, specialRequests: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={dataLoading} />
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" id="wakala-consent" checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={dataLoading} />
            <label htmlFor="wakala-consent" className="text-sm text-gray-700">{t.consentLabel}</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} disabled={loading}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              {t.cancel}
            </button>
            <button type="submit" disabled={!isFormComplete || loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> {t.submitting}</>
              ) : (
                <><Send className="w-5 h-5" /> {currentPrice > 0 ? t.submitAndPay : t.submit}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
