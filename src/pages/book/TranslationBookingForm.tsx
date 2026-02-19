import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2, CheckCircle, AlertCircle, User, X, FileText, Send, Upload, Crown, Languages,
} from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabase';
import { stripePromise } from '../../lib/stripe';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import FileUploadField from '../../components/booking/FileUploadField';
import ServiceCheckoutForm from '../../components/modals/ServiceCheckoutForm';
import type { ServiceFormPayload } from '../../components/modals/ServiceCheckoutForm';
import type { BookingResult } from './BookPage';

interface TranslationBookingFormProps {
  onComplete: (result: BookingResult) => void;
}

const translationsData = {
  en: {
    title: 'Translation Request',
    subtitle: 'Complete the form and upload your document',
    personalInfo: 'Contact Details',
    contactDescription: 'Enter your contact information.',
    fullName: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    documentDetails: 'Document Details',
    documentType: 'Document Type',
    selectDocType: 'Select document type',
    docTypes: {
      birth_certificate: 'Birth Certificate',
      marriage_certificate: 'Marriage Certificate',
      death_certificate: 'Death Certificate',
      divorce_certificate: 'Divorce Certificate',
      academic_transcript: 'Academic Transcript',
      legal_document: 'Legal Document',
      official_letter: 'Official Letter',
      id_passport: 'ID/Passport',
      other: 'Other',
    } as Record<string, string>,
    languages: 'Languages',
    sourceLanguage: 'Source Language',
    sourcePlaceholder: 'e.g. Arabic',
    targetLanguage: 'Target Language',
    targetPlaceholder: 'e.g. English',
    urgency: 'Urgency Level',
    urgencyOptions: {
      standard: 'Standard (5-7 business days)',
      urgent: 'Urgent (2-3 business days)',
      express: 'Express (within 24 hours)',
    } as Record<string, string>,
    documents: 'Document Upload',
    documentFile: 'Upload your document',
    additionalNotes: 'Additional Notes (Optional)',
    notesPlaceholder: 'Any specific details or requirements for the translation...',
    pricingInfo: 'Pricing Information',
    priceMember: '\u00A320 - First request FREE for eligible members (10+ days membership)',
    priceStandard: '\u00A340 - Standard rate',
    yourPrice: 'Your Price',
    free: 'FREE',
    consentLabel: 'I confirm that I agree to the use of my information in line with YCA Birmingham policies',
    submitAndPay: 'Submit & Proceed to Payment',
    submitFree: 'Submit Request',
    submitting: 'Processing...',
    errorMessage: 'Failed to submit request. Please try again.',
    fillAllFields: 'Please fill all required fields',
    loadingData: 'Loading your information...',
    paymentTitle: 'Complete Payment',
    settingUpPayment: 'Setting up payment...',
    paymentError: 'Failed to initialize payment. Please try again.',
    memberBadge: 'Active Member',
    memberPromo: 'Become a member to get your first request free!',
    joinNow: 'Join Now',
    signIn: 'Sign In',
    signInPromo: 'Already a member? Sign in to auto-fill your details and get member pricing.',
    backToForm: 'Back',
    translationService: 'Translation Service',
  },
  ar: {
    title: 'طلب ترجمة',
    subtitle: 'أكمل النموذج وارفق المستند الخاص بك',
    personalInfo: 'بيانات الاتصال',
    contactDescription: 'أدخل معلومات الاتصال الخاصة بك.',
    fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    documentDetails: 'تفاصيل المستند',
    documentType: 'نوع المستند',
    selectDocType: 'اختر نوع المستند',
    docTypes: {
      birth_certificate: 'شهادة ميلاد',
      marriage_certificate: 'عقد زواج',
      death_certificate: 'شهادة وفاة',
      divorce_certificate: 'شهادة طلاق',
      academic_transcript: 'كشف درجات أكاديمي',
      legal_document: 'مستند قانوني',
      official_letter: 'خطاب رسمي',
      id_passport: 'هوية / جواز سفر',
      other: 'أخرى',
    } as Record<string, string>,
    languages: 'اللغات',
    sourceLanguage: 'اللغة المصدر',
    sourcePlaceholder: 'مثال: العربية',
    targetLanguage: 'اللغة الهدف',
    targetPlaceholder: 'مثال: الإنجليزية',
    urgency: 'مستوى الاستعجال',
    urgencyOptions: {
      standard: 'عادي (5-7 أيام عمل)',
      urgent: 'مستعجل (2-3 أيام عمل)',
      express: 'عاجل (خلال 24 ساعة)',
    } as Record<string, string>,
    documents: 'رفع المستند',
    documentFile: 'ارفق المستند الخاص بك',
    additionalNotes: 'ملاحظات إضافية (اختياري)',
    notesPlaceholder: 'أي تفاصيل أو متطلبات خاصة بالترجمة...',
    pricingInfo: 'معلومات التسعير',
    priceMember: '20 جنيه - الطلب الأول مجاني للأعضاء المؤهلين (عضوية 10 أيام فأكثر)',
    priceStandard: '40 جنيه - السعر الأساسي',
    yourPrice: 'السعر الخاص بك',
    free: 'مجاناً',
    consentLabel: 'أؤكد موافقتي على استخدام معلوماتي وفقاً لسياسات جمعية الجالية اليمنية في برمنغهام',
    submitAndPay: 'تقديم الطلب والدفع',
    submitFree: 'تقديم الطلب',
    submitting: 'جاري المعالجة...',
    errorMessage: 'فشل تقديم الطلب. يرجى المحاولة مرة أخرى.',
    fillAllFields: 'يرجى تعبئة جميع الحقول المطلوبة',
    loadingData: 'جاري تحميل معلوماتك...',
    paymentTitle: 'إكمال الدفع',
    settingUpPayment: 'جاري تجهيز الدفع...',
    paymentError: 'فشل في تهيئة الدفع. يرجى المحاولة مرة أخرى.',
    memberBadge: 'عضو نشط',
    memberPromo: 'انضم كعضو واحصل على أول طلب مجاناً!',
    joinNow: 'انضم الآن',
    signIn: 'تسجيل الدخول',
    signInPromo: 'عضو بالفعل؟ سجل دخولك لتعبئة بياناتك تلقائياً والحصول على سعر الأعضاء.',
    backToForm: 'رجوع',
    translationService: 'خدمة الترجمة',
  },
};

export default function TranslationBookingForm({ onComplete }: TranslationBookingFormProps) {
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
  const [formPayload, setFormPayload] = useState<ServiceFormPayload | null>(null);

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: user?.email || '',
    documentType: '', sourceLanguage: '', targetLanguage: '',
    urgency: 'standard', notes: '',
  });

  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [membershipStatus, setMembershipStatus] = useState<'none' | 'active'>('none');
  const [memberDaysSinceJoin, setMemberDaysSinceJoin] = useState(0);
  const [previousRequestCount, setPreviousRequestCount] = useState(0);
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
        if (memberData.membership_number) setMemberNumber(memberData.membership_number);
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
        setFormData(prev => ({ ...prev, fullName: fullName || prev.fullName, phone: application.phone || prev.phone, email: application.email || user.email || prev.email }));
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
      setPreviousRequestCount((wCount || 0) + (tCount || 0) + (oCount || 0));
    } catch (err) { console.error('Error checking eligibility:', err); }
  };

  const calculatePrice = () => {
    if (membershipStatus === 'active' && memberDaysSinceJoin >= 10) {
      return previousRequestCount === 0 ? 0 : 20;
    }
    return 40;
  };

  const createPaymentIntent = async (amount: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
          body: JSON.stringify({ amount: Math.round(amount * 100), currency: 'gbp', metadata: { user_id: user?.id, type: 'translation' } }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.paymentError);
      if (!data.clientSecret || typeof data.clientSecret !== 'string' || !data.clientSecret.startsWith('pi_')) {
        throw new Error('Invalid payment intent format');
      }
      setClientSecret(data.clientSecret);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const msg = err instanceof Error
        ? (err.name === 'AbortError' ? (language === 'ar' ? 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.' : 'Request timed out. Please try again.') : err.message)
        : t.paymentError;
      throw new Error(msg);
    }
  };

  const buildPayload = (): ServiceFormPayload => ({
    table: 'translation_requests',
    data: {
      user_id: user?.id || null,
      full_name: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      document_type: formData.documentType,
      source_language: formData.sourceLanguage,
      target_language: formData.targetLanguage,
      urgency: formData.urgency,
      notes: formData.notes,
      file_url: fileUrls[0] || null,
      amount_due: calculatePrice(),
      payment_status: 'paid',
      status: 'submitted',
      is_first_request: previousRequestCount === 0 && membershipStatus === 'active' && memberDaysSinceJoin >= 10,
      consent_given: consent,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.fullName || !formData.phone || !formData.email || !formData.documentType || !formData.sourceLanguage || !formData.targetLanguage) {
      setError(t.fillAllFields); return;
    }
    if (!consent) { setError(t.fillAllFields); return; }

    setLoading(true);
    try {
      const price = calculatePrice();
      const payload = buildPayload();
      setFormPayload(payload);
      setPaymentAmount(price);

      if (price === 0) {
        const { data: record, error: insertError } = await supabase
          .from('translation_requests')
          .insert({ ...payload.data, payment_status: 'paid', status: 'submitted' })
          .select('booking_reference')
          .single();
        if (insertError) throw new Error(insertError.message || t.errorMessage);
        onComplete({
          bookingReference: record?.booking_reference || '',
          serviceType: 'translation',
          date: new Date().toISOString().split('T')[0],
          startTime: '', endTime: '',
          fullName: formData.fullName, email: formData.email, fee: 0,
        });
        return;
      }

      await createPaymentIntent(price);
      setStep('payment');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t.errorMessage;
      setError(msg);
    } finally { setLoading(false); }
  };

  const handlePaymentSuccess = (_id: string, bookingReference: string) => {
    onComplete({
      bookingReference,
      serviceType: 'translation',
      date: new Date().toISOString().split('T')[0],
      startTime: '', endTime: '',
      fullName: formData.fullName, email: formData.email, fee: paymentAmount,
    });
  };

  const currentPrice = calculatePrice();
  const isFormComplete = formData.fullName && formData.phone && formData.email &&
    formData.documentType && formData.sourceLanguage && formData.targetLanguage && consent;

  if (step === 'payment' && clientSecret && formPayload) {
    const elementsOptions = {
      clientSecret,
      appearance: { theme: 'stripe' as const, variables: { colorPrimary: '#059669' } },
      loader: 'auto' as const,
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 sm:px-8 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{t.paymentTitle}</h2>
        </div>
        <div className="p-6 sm:p-8">
          <button type="button" onClick={() => setStep('form')} className="mb-4 text-sm text-gray-500 hover:text-gray-700 underline">{t.backToForm}</button>
          {stripePromise ? (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <ServiceCheckoutForm amount={paymentAmount} serviceLabel={t.translationService} formPayload={formPayload} onSuccess={handlePaymentSuccess} onBack={() => setStep('form')} />
            </Elements>
          ) : (
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
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 sm:px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Languages className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t.title}</h2>
            <p className="text-teal-100 text-sm mt-1">{t.subtitle}</p>
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

        {membershipStatus !== 'active' && user && (
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
            <div className="p-1.5 sm:p-2 bg-teal-100 rounded-lg flex-shrink-0"><User className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" /></div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">{t.personalInfo}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{t.contactDescription}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.fullName} *</label>
              <input type="text" value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.phone} *</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.email} *</label>
              <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" required disabled={dataLoading} />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200">
          <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="p-1.5 sm:p-2 bg-teal-100 rounded-lg flex-shrink-0"><FileText className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" /></div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{t.documentDetails}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.documentType} *</label>
              <select value={formData.documentType} onChange={e => setFormData(p => ({ ...p, documentType: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none" required disabled={dataLoading}>
                <option value="">{t.selectDocType}</option>
                {Object.entries(t.docTypes).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.sourceLanguage} *</label>
                <input type="text" value={formData.sourceLanguage} onChange={e => setFormData(p => ({ ...p, sourceLanguage: e.target.value }))}
                  placeholder={t.sourcePlaceholder}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" required disabled={dataLoading} />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.targetLanguage} *</label>
                <input type="text" value={formData.targetLanguage} onChange={e => setFormData(p => ({ ...p, targetLanguage: e.target.value }))}
                  placeholder={t.targetPlaceholder}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" required disabled={dataLoading} />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{t.urgency}</label>
              <select value={formData.urgency} onChange={e => setFormData(p => ({ ...p, urgency: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none" disabled={dataLoading}>
                {Object.entries(t.urgencyOptions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-gray-200">
          <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="p-1.5 sm:p-2 bg-teal-100 rounded-lg flex-shrink-0"><Upload className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" /></div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{t.documents}</h3>
          </div>
          <FileUploadField label={t.documentFile} userId={user?.id} onUploadComplete={setFileUrls} existingUrls={fileUrls} />
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
          <h4 className="text-md font-bold text-gray-900 mb-3">{t.pricingInfo}</h4>
          <div className="space-y-2 text-sm">
            <p className={currentPrice === 0 || currentPrice === 20 ? 'font-bold text-emerald-700' : 'text-gray-600'}>{t.priceMember}</p>
            <p className={currentPrice === 40 ? 'font-bold text-emerald-700' : 'text-gray-600'}>{t.priceStandard}</p>
            <div className="border-t border-teal-300 pt-2 mt-2">
              <span className="font-bold text-lg text-emerald-700">{t.yourPrice}: {currentPrice === 0 ? t.free : `\u00A3${currentPrice}`}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.additionalNotes}</label>
          <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3}
            placeholder={t.notesPlaceholder}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none" disabled={dataLoading} />
        </div>

        <div className="flex items-start gap-2">
          <input type="checkbox" id="translation-consent" checked={consent} onChange={e => setConsent(e.target.checked)}
            className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" disabled={dataLoading} />
          <label htmlFor="translation-consent" className="text-sm text-gray-700">{t.consentLabel}</label>
        </div>

        <button type="submit" disabled={!isFormComplete || loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.submitting}</> : <><Send className="w-5 h-5" /> {currentPrice === 0 ? t.submitFree : t.submitAndPay}</>}
        </button>
      </form>
    </div>
  );
}
