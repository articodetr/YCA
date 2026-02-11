import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2, CheckCircle, AlertCircle, User, X, FileText, Send, Upload, Crown,
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabase';
import { stripePromise } from '../../lib/stripe';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import FileUploadField from '../../components/booking/FileUploadField';
import WakalaCheckoutForm from '../../components/modals/WakalaCheckoutForm';
import type { WakalaFormPayload } from '../../components/modals/WakalaCheckoutForm';
import type { BookingResult } from './BookPage';

interface WakalaBookingFormProps {
  onComplete: (result: BookingResult) => void;
}

const translationsData = {
  en: {
    title: 'Wakala Application',
    subtitle: 'Complete the form and upload required documents',
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
    priceMember: 'FREE - First wakala for eligible members (10+ days membership)',
    priceMemberSecond: '\u00A320 - Subsequent wakalas for members',
    priceStandard: '\u00A340 - Standard rate (non-members)',
    yourPrice: 'Your Price',
    priceFree: 'FREE',
    specialRequests: 'Additional Notes (Optional)',
    membershipNumber: 'Membership Number',
    consentLabel: 'I confirm that I agree to the use of my information in line with YCA Birmingham policies',
    submitAndPay: 'Submit & Proceed to Payment',
    submitFree: 'Submit Application',
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
  },
  ar: {
    title: 'طلب وكالة',
    subtitle: 'أكمل النموذج وارفق المستندات المطلوبة',
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
    priceMember: 'مجاناً - أول وكالة للأعضاء المؤهلين (عضوية 10 أيام فأكثر)',
    priceMemberSecond: '20 جنيه - الوكالات اللاحقة للأعضاء',
    priceStandard: '40 جنيه - السعر الأساسي (غير الأعضاء)',
    yourPrice: 'السعر الخاص بك',
    priceFree: 'مجاناً',
    specialRequests: 'ملاحظات إضافية (اختياري)',
    membershipNumber: 'رقم العضوية',
    consentLabel: 'أؤكد موافقتي على استخدام معلوماتي وفقاً لسياسات جمعية الجالية اليمنية في برمنغهام',
    submitAndPay: 'تقديم الطلب والدفع',
    submitFree: 'تقديم الطلب',
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

  useEffect(() => {
    loadUserData();
    checkMemberEligibility();
  }, []);

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
      const { data: member } = await supabase.from('members').select('start_date, status').eq('email', user.email).eq('status', 'active').maybeSingle();
      if (member?.start_date) {
        setMembershipStatus('active');
        const diffDays = Math.floor((Date.now() - new Date(member.start_date).getTime()) / (1000 * 60 * 60 * 24));
        setMemberDaysSinceJoin(diffDays);
      } else { setMembershipStatus('none'); setMemberDaysSinceJoin(0); }
      const { count: wCount } = await supabase.from('wakala_applications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['submitted', 'in_progress', 'completed', 'approved']);
      const { count: tCount } = await supabase.from('translation_requests').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: oCount } = await supabase.from('other_legal_requests').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      setPreviousWakalaCount((wCount || 0) + (tCount || 0) + (oCount || 0));
    } catch (err) { console.error('Error checking eligibility:', err); }
  };

  const calculatePrice = () => {
    if (membershipStatus === 'active' && memberDaysSinceJoin >= 10) {
      return previousWakalaCount === 0 ? 0 : 20;
    }
    return 40;
  };

  const createPaymentIntent = async (amount: number) => {
    try {
      console.log('Creating payment intent for amount:', amount);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'gbp', metadata: { user_id: user?.id, type: 'wakala' } }),
        }
      );
      const data = await response.json();
      console.log('Payment intent response:', data);
      if (!response.ok) {
        console.error('Payment intent error:', data.error);
        throw new Error(data.error || t.paymentError);
      }
      if (!data.clientSecret) {
        console.error('No client secret in response:', data);
        throw new Error('No client secret returned');
      }
      if (typeof data.clientSecret !== 'string' || !data.clientSecret.startsWith('pi_')) {
        console.error('Invalid client secret format:', data.clientSecret);
        throw new Error('Invalid payment intent format');
      }
      console.log('Client secret received successfully');
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error('Error creating payment intent:', err);
      setError(err.message || t.paymentError);
      setStep('form');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.fullName || !formData.phone || !formData.email || !formData.applicantName || !formData.agentName || !formData.wakalaType || !formData.wakalaFormat) { setError(t.fillAllFields); return; }
    if (applicantPassportUrls.length === 0 || attorneyPassportUrls.length === 0) { setError(t.uploadRequired); return; }
    if (membershipStatus === 'active' && !formData.membershipNumber) { setError(t.fillAllFields); return; }
    if (!consent) { setError(t.fillAllFields); return; }

    setLoading(true);
    try {
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
      };

      setFormPayload(payload);
      setPaymentAmount(price);

      if (price === 0) {
        const bookingRef = `WK-${Date.now().toString(36).toUpperCase()}`;
        const { error: insertError } = await supabase
          .from('wakala_applications')
          .insert([{
            ...payload,
            status: 'submitted',
            payment_status: 'free',
            booking_reference: bookingRef,
          }]);
        if (insertError) throw insertError;
        onComplete({
          bookingReference: bookingRef,
          serviceType: 'wakala',
          date: new Date().toISOString().split('T')[0],
          startTime: '', endTime: '',
          fullName: formData.fullName, email: formData.email, fee: 0,
        });
        return;
      }

      await createPaymentIntent(price);
      setStep('payment');
    } catch (err: any) { setError(err.message || t.errorMessage); }
    finally { setLoading(false); }
  };

  const handlePaymentSuccess = (_applicationId: string, bookingReference: string) => {
    onComplete({
      bookingReference,
      serviceType: 'wakala', date: new Date().toISOString().split('T')[0],
      startTime: '', endTime: '',
      fullName: formData.fullName, email: formData.email, fee: paymentAmount,
    });
  };

  const currentPrice = calculatePrice();
  const isFormComplete = formData.fullName && formData.phone && formData.email &&
    formData.applicantName && formData.agentName && formData.wakalaType && formData.wakalaFormat &&
    applicantPassportUrls.length > 0 && attorneyPassportUrls.length > 0 && consent &&
    (membershipStatus !== 'active' || formData.membershipNumber);

  if (step === 'payment' && clientSecret && formPayload) {
    const elementsOptions = {
      clientSecret,
      appearance: {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#059669',
        },
      },
      loader: 'auto' as const,
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{t.paymentTitle}</h2>
        </div>
        <div className="p-6 sm:p-8">
          <button type="button" onClick={() => setStep('form')} className="mb-4 text-sm text-gray-500 hover:text-gray-700 underline">{t.backToForm}</button>
          {stripePromise && (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <WakalaCheckoutForm amount={paymentAmount} formPayload={formPayload} onSuccess={handlePaymentSuccess} onBack={() => setStep('form')} />
            </Elements>
          )}
          {!stripePromise && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{language === 'ar' ? 'فشل في تحميل نظام الدفع' : 'Failed to load payment system'}</p>
            </div>
          )}
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

        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200">
          <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0"><User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /></div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{t.personalInfo}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{t.contactDescription}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.fullName} *</label>
              <input type="text" value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.phone} *</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.email} *</label>
              <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={dataLoading} />
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

        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200">
          <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0"><FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /></div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{t.wakalaDetails}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.applicantName} *</label>
              <input type="text" value={formData.applicantName} onChange={e => setFormData(p => ({ ...p, applicantName: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.agentName} *</label>
              <input type="text" value={formData.agentName} onChange={e => setFormData(p => ({ ...p, agentName: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.wakalaType} *</label>
              <select value={formData.wakalaType} onChange={e => setFormData(p => ({ ...p, wakalaType: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none" required disabled={dataLoading}>
                <option value="">{t.selectWakalaType}</option>
                {Object.entries(t.wakalaTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.wakalaFormat} *</label>
              <select value={formData.wakalaFormat} onChange={e => setFormData(p => ({ ...p, wakalaFormat: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none" required disabled={dataLoading}>
                <option value="">{t.selectWakalaFormat}</option>
                {Object.entries(t.wakalaFormats).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200">
          <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0"><Upload className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /></div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{t.documents}</h3>
          </div>
          <div className="space-y-5">
            <FileUploadField label={t.applicantPassport} required userId={user?.id} onUploadComplete={setApplicantPassportUrls} existingUrls={applicantPassportUrls} />
            <FileUploadField label={t.attorneyPassport} required userId={user?.id} onUploadComplete={setAttorneyPassportUrls} existingUrls={attorneyPassportUrls} />
            <FileUploadField label={t.witnessPassports} multiple userId={user?.id} onUploadComplete={setWitnessPassportUrls} existingUrls={witnessPassportUrls} />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h4 className="text-md font-bold text-gray-900 mb-3">{t.pricingInfo}</h4>
          <div className="space-y-2 text-sm">
            <p className={currentPrice === 0 ? 'font-bold text-emerald-700' : 'text-gray-600'}>{t.priceMember}</p>
            <p className={currentPrice === 20 ? 'font-bold text-emerald-700' : 'text-gray-600'}>{t.priceMemberSecond}</p>
            <p className={currentPrice === 40 ? 'font-bold text-emerald-700' : 'text-gray-600'}>{t.priceStandard}</p>
            <div className="border-t border-blue-300 pt-2 mt-2">
              <span className="font-bold text-lg text-emerald-700">
                {t.yourPrice}: {currentPrice === 0 ? t.priceFree : `\u00A3${currentPrice}`}
              </span>
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
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.submitting}</> : <><Send className="w-5 h-5" /> {currentPrice === 0 ? t.submitFree : t.submitAndPay}</>}
        </button>
      </form>
    </div>
  );
}
