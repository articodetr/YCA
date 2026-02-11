import { useState, useEffect, FormEvent, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Loader2, CheckCircle, Send, Info, Scale } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';

type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent';

interface FormData {
  service_needed: string;
  description: string;
  file: File | null;
  urgency: UrgencyLevel | '';
}

const initialFormData: FormData = {
  service_needed: '',
  description: '',
  file: null,
  urgency: '',
};

export default function OtherLegalRequest() {
  const { language, isRTL } = useLanguage();
  const { member, isAuthenticated } = useMemberAuth();
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isFirstRequest, setIsFirstRequest] = useState(false);
  const [membershipDays, setMembershipDays] = useState<number | null>(null);

  const txt = {
    title: isAr ? 'طلب قانوني / توثيق آخر' : 'Other Legal / Documentation Request',
    breadcrumbServices: isAr ? 'الخدمات' : 'Services',
    breadcrumbLegal: isAr ? 'الخدمات القانونية' : 'Legal Services',
    breadcrumbOther: isAr ? 'طلب آخر' : 'Other Request',
    intro: isAr
      ? 'يمكنك استخدام هذا النموذج لتقديم طلب للحصول على أي خدمة قانونية أو توثيقية غير مدرجة في خدماتنا الأساسية. سيقوم فريقنا بمراجعة طلبك والتواصل معك.'
      : 'Use this form to submit a request for any legal or documentation service not listed in our core services. Our team will review your request and get in touch with you.',
    pricingTitle: isAr ? 'معلومات التسعير' : 'Pricing Information',
    pricingNonMember: isAr
      ? 'غير الأعضاء: 40 جنيه إسترليني لكل طلب'
      : 'Non-members: \u00a340 per request',
    pricingNewMember: isAr
      ? 'عضو جديد (أقل من 10 أيام): 40 جنيه إسترليني لكل طلب'
      : 'New member (less than 10 days): \u00a340 per request',
    pricingFirstFree: isAr
      ? 'الطلب الأول مجاني للأعضاء المؤهلين (عبر جميع الخدمات القانونية)'
      : 'First request FREE for eligible members (across all legal services)',
    pricingSubsequent: isAr
      ? 'الطلبات اللاحقة: 20 جنيه إسترليني للأعضاء'
      : 'Subsequent requests: \u00a320 for members',
    yourPrice: isAr ? 'السعر الخاص بك:' : 'Your price:',
    free: isAr ? 'مجاني' : 'FREE',
    loginForPricing: isAr
      ? 'قم بتسجيل الدخول للاستفادة من أسعار الأعضاء'
      : 'Log in to benefit from member pricing',
    sectionService: isAr ? 'تفاصيل الخدمة' : 'Service Details',
    serviceLabel: isAr ? 'الخدمة المطلوبة' : 'Service Needed',
    selectService: isAr ? 'اختر الخدمة' : 'Select a service',
    serviceLegalConsultation: isAr ? 'استشارة قانونية' : 'Legal Consultation',
    serviceNotarization: isAr ? 'توثيق المستندات' : 'Document Notarization',
    serviceImmigration: isAr ? 'مساعدة في الهجرة' : 'Immigration Assistance',
    serviceHousing: isAr ? 'دعم الإسكان' : 'Housing Support',
    serviceBenefits: isAr ? 'استئناف المزايا' : 'Benefits Appeal',
    serviceDebt: isAr ? 'نصيحة الديون' : 'Debt Advice',
    serviceEmployment: isAr ? 'مسألة توظيف' : 'Employment Issue',
    serviceFamily: isAr ? 'مسألة قانون الأسرة' : 'Family Law Matter',
    serviceOther: isAr ? 'أخرى' : 'Other',
    descriptionLabel: isAr ? 'وصف الطلب' : 'Request Description',
    descriptionPlaceholder: isAr
      ? 'يرجى وصف طلبك بالتفصيل، بما في ذلك أي معلومات ذات صلة...'
      : 'Please describe your request in detail, including any relevant information...',
    sectionUpload: isAr ? 'رفع الملفات' : 'File Upload',
    uploadLabel: isAr ? 'إرفاق مستند' : 'Attach a Document',
    uploadHint: isAr
      ? 'اختياري - يمكنك رفع مستند داعم (PDF، صورة، Word - حد أقصى 10 ميجابايت)'
      : 'Optional - You can upload a supporting document (PDF, image, Word - max 10MB)',
    chooseFile: isAr ? 'اختر ملف' : 'Choose File',
    noFile: isAr ? 'لم يتم اختيار ملف' : 'No file chosen',
    sectionUrgency: isAr ? 'مستوى الاستعجال' : 'Urgency Level',
    urgencyLow: isAr ? 'منخفض' : 'Low',
    urgencyLowDesc: isAr ? 'لا يوجد موعد نهائي محدد' : 'No specific deadline',
    urgencyMedium: isAr ? 'متوسط' : 'Medium',
    urgencyMediumDesc: isAr ? 'خلال بضعة أسابيع' : 'Within a few weeks',
    urgencyHigh: isAr ? 'مرتفع' : 'High',
    urgencyHighDesc: isAr ? 'خلال أسبوع' : 'Within a week',
    urgencyUrgent: isAr ? 'عاجل' : 'Urgent',
    urgencyUrgentDesc: isAr ? 'خلال 48 ساعة' : 'Within 48 hours',
    submit: isAr ? 'إرسال الطلب' : 'Submit Request',
    submitting: isAr ? 'جاري الإرسال...' : 'Submitting...',
    successTitle: isAr ? 'تم إرسال الطلب بنجاح!' : 'Request Submitted Successfully!',
    successMessage: isAr
      ? 'شكراً لك. تم استلام طلبك وسيقوم فريقنا بمراجعته والتواصل معك في أقرب وقت.'
      : 'Thank you. Your request has been received and our team will review it and contact you shortly.',
    referenceLabel: isAr ? 'الرقم المرجعي:' : 'Reference Number:',
    referenceNote: isAr
      ? 'يرجى الاحتفاظ بهذا الرقم لمتابعة طلبك.'
      : 'Please keep this number for your records.',
    submitAnother: isAr ? 'تقديم طلب آخر' : 'Submit Another Request',
    errorTitle: isAr ? 'فشل في الإرسال' : 'Submission Failed',
    errorMessage: isAr
      ? 'حدث خطأ في إرسال طلبك. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.'
      : 'There was an error submitting your request. Please try again or contact us directly.',
    required: isAr ? 'مطلوب' : 'Required',
    optional: isAr ? 'اختياري' : 'Optional',
    amountDue: isAr ? 'المبلغ المستحق:' : 'Amount due:',
  };

  const serviceOptions = [
    { value: 'legal_consultation', label: txt.serviceLegalConsultation },
    { value: 'document_notarization', label: txt.serviceNotarization },
    { value: 'immigration_assistance', label: txt.serviceImmigration },
    { value: 'housing_support', label: txt.serviceHousing },
    { value: 'benefits_appeal', label: txt.serviceBenefits },
    { value: 'debt_advice', label: txt.serviceDebt },
    { value: 'employment_issue', label: txt.serviceEmployment },
    { value: 'family_law', label: txt.serviceFamily },
    { value: 'other', label: txt.serviceOther },
  ];

  const urgencyOptions: { value: UrgencyLevel; label: string; desc: string; color: string }[] = [
    { value: 'low', label: txt.urgencyLow, desc: txt.urgencyLowDesc, color: 'border-green-300 bg-green-50 text-green-800' },
    { value: 'medium', label: txt.urgencyMedium, desc: txt.urgencyMediumDesc, color: 'border-yellow-300 bg-yellow-50 text-yellow-800' },
    { value: 'high', label: txt.urgencyHigh, desc: txt.urgencyHighDesc, color: 'border-orange-300 bg-orange-50 text-orange-800' },
    { value: 'urgent', label: txt.urgencyUrgent, desc: txt.urgencyUrgentDesc, color: 'border-red-300 bg-red-50 text-red-800' },
  ];

  const calculatePrice = async () => {
    if (!isAuthenticated || !member) {
      setIsMember(false);
      setIsFirstRequest(false);
      setMembershipDays(null);
      return 40;
    }

    const { data: membership } = await supabase
      .from('membership_applications')
      .select('payment_date, status')
      .eq('user_id', member.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership?.payment_date) {
      setIsMember(false);
      setIsFirstRequest(false);
      setMembershipDays(null);
      return 40;
    }

    const activationDate = new Date(membership.payment_date);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));

    setMembershipDays(daysSince);
    setIsMember(true);

    if (daysSince < 10) {
      setIsFirstRequest(false);
      return 40;
    }

    const { count: wakalaCount } = await supabase
      .from('wakala_applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', member.id);

    const { count: translationCount } = await supabase
      .from('translation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', member.id);

    const { count: otherCount } = await supabase
      .from('other_legal_requests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', member.id);

    const totalRequests = (wakalaCount || 0) + (translationCount || 0) + (otherCount || 0);

    if (totalRequests === 0) {
      setIsFirstRequest(true);
      return 0;
    }

    setIsFirstRequest(false);
    return 20;
  };

  useEffect(() => {
    setPriceLoading(true);
    calculatePrice().then((p) => {
      setPrice(p);
      setPriceLoading(false);
    });
  }, [isAuthenticated, member]);

  const generateReference = () => {
    const prefix = 'YCA-LR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  const uploadFile = async (file: File, userId: string): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('legal-documents')
      .upload(fileName, file);

    if (error) return null;

    const { data: urlData } = supabase.storage
      .from('legal-documents')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const ref = generateReference();

    try {
      let fileUrl: string | null = null;

      if (formData.file && isAuthenticated && member) {
        fileUrl = await uploadFile(formData.file, member.id);
      }

      const currentPrice = await calculatePrice();

      const { error } = await supabase
        .from('other_legal_requests')
        .insert([{
          user_id: isAuthenticated && member ? member.id : null,
          service_needed: formData.service_needed,
          description: formData.description,
          file_url: fileUrl,
          urgency: formData.urgency,
          status: 'pending',
          amount: currentPrice,
          is_member: isMember,
          is_first_request: isFirstRequest,
        }]);

      if (error) throw error;

      setReferenceNumber(ref);
      setSubmitStatus('success');
      setFormData(initialFormData);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error submitting legal request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="pt-20">
          <PageHeader
            title={txt.title}
            breadcrumbs={[
              { label: txt.breadcrumbServices, path: '/services' },
              { label: txt.breadcrumbLegal },
            ]}
            pageKey="other-legal"
          />

          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <motion.div
                className="max-w-2xl mx-auto text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                >
                  <CheckCircle size={40} className="text-green-600" />
                </motion.div>

                <h2 className="text-3xl font-bold text-primary mb-4">{txt.successTitle}</h2>
                <p className="text-lg text-muted mb-8">{txt.successMessage}</p>

                <div className="bg-sand p-6 rounded-lg mb-8">
                  <p className="text-sm text-muted mb-2">{txt.referenceLabel}</p>
                  <p className="text-2xl font-bold text-primary font-mono tracking-wider">{referenceNumber}</p>
                  <p className="text-sm text-muted mt-3">{txt.referenceNote}</p>
                </div>

                {price !== null && (
                  <div className="bg-white border-2 border-gray-200 p-4 rounded-lg mb-8 shadow-sm">
                    <p className="text-lg font-semibold text-primary">
                      {txt.amountDue} {price === 0 ? txt.free : `\u00a3${price}`}
                    </p>
                  </div>
                )}

                <motion.button
                  onClick={() => {
                    setSubmitStatus('idle');
                    setReferenceNumber('');
                  }}
                  className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {txt.submitAnother}
                </motion.button>
              </motion.div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="pt-20">
        <PageHeader
          title={txt.title}
          breadcrumbs={[
            { label: txt.breadcrumbServices, path: '/services' },
            { label: txt.breadcrumbLegal },
          ]}
          pageKey="other-legal"
        />

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                className="bg-sand p-8 rounded-lg mb-8 text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <Scale size={32} className="text-primary mx-auto mb-4" />
                <p className="text-lg text-muted leading-relaxed">{txt.intro}</p>
              </motion.div>

              <motion.div
                className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg mb-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Info size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-primary mb-3">{txt.pricingTitle}</h3>
                    <ul className="space-y-2 text-muted">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-muted rounded-full mt-2 flex-shrink-0" />
                        {txt.pricingNonMember}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-muted rounded-full mt-2 flex-shrink-0" />
                        {txt.pricingNewMember}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {txt.pricingFirstFree}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-muted rounded-full mt-2 flex-shrink-0" />
                        {txt.pricingSubsequent}
                      </li>
                    </ul>

                    <div className="mt-4 pt-4 border-t border-blue-200">
                      {priceLoading ? (
                        <div className="flex items-center gap-2 text-muted">
                          <Loader2 size={16} className="animate-spin" />
                          {isAr ? 'جاري حساب السعر...' : 'Calculating price...'}
                        </div>
                      ) : isAuthenticated && member ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">{txt.yourPrice}</span>
                          <span className={`text-xl font-bold ${price === 0 ? 'text-green-600' : 'text-primary'}`}>
                            {price === 0 ? txt.free : `\u00a3${price}`}
                          </span>
                          {isMember && membershipDays !== null && membershipDays < 10 && (
                            <span className="text-sm text-amber-600 ms-2">
                              ({isAr ? `${10 - membershipDays} أيام متبقية للأهلية` : `${10 - membershipDays} days until eligible`})
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-amber-700 font-medium">{txt.loginForPricing}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white border-2 border-primary p-8 md:p-10 rounded-lg"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                {submitStatus === 'error' && (
                  <motion.div
                    className="bg-red-50 border-2 border-red-500 text-red-800 p-6 rounded-lg mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="font-bold text-xl mb-2">{txt.errorTitle}</h3>
                    <p>{txt.errorMessage}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">
                      {txt.sectionService} <span className="text-red-500">*</span>
                    </h3>
                    <motion.div className="space-y-6" variants={staggerItem}>
                      <div>
                        <label htmlFor="service_needed" className="block text-sm font-semibold text-primary mb-2">
                          {txt.serviceLabel}
                        </label>
                        <select
                          id="service_needed"
                          value={formData.service_needed}
                          onChange={(e) => setFormData(prev => ({ ...prev, service_needed: e.target.value }))}
                          required
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors bg-white"
                        >
                          <option value="">{txt.selectService}</option>
                          {serviceOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-primary mb-2">
                          {txt.descriptionLabel}
                        </label>
                        <textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          required
                          rows={6}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                          placeholder={txt.descriptionPlaceholder}
                        />
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">
                      {txt.sectionUpload}
                      <span className="text-sm font-normal text-muted ms-2">({txt.optional})</span>
                    </h3>
                    <motion.div variants={staggerItem}>
                      <label htmlFor="file_upload" className="block text-sm font-semibold text-primary mb-2">
                        {txt.uploadLabel}
                      </label>
                      <p className="text-sm text-muted mb-3">{txt.uploadHint}</p>
                      <div className="flex items-center gap-4">
                        <label
                          className="flex items-center gap-2 px-6 py-3 bg-sand text-primary rounded-lg cursor-pointer hover:bg-hover transition-colors font-medium"
                        >
                          <Upload size={18} />
                          {txt.chooseFile}
                          <input
                            type="file"
                            id="file_upload"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            className="sr-only"
                          />
                        </label>
                        <span className="text-sm text-muted">
                          {formData.file ? formData.file.name : txt.noFile}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">
                      {txt.sectionUrgency} <span className="text-red-500">*</span>
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {urgencyOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.urgency === option.value
                              ? `border-primary bg-accent`
                              : 'border-sand hover:border-hover'
                          }`}
                        >
                          <input
                            type="radio"
                            name="urgency"
                            value={option.value}
                            checked={formData.urgency === option.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as UrgencyLevel }))}
                            required
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              formData.urgency === option.value ? 'bg-primary text-white' : 'bg-sand text-muted'
                            }`}>
                              <FileText size={18} />
                            </div>
                            <div>
                              <span className={`font-semibold block ${
                                formData.urgency === option.value ? 'text-primary' : 'text-muted'
                              }`}>
                                {option.label}
                              </span>
                              <span className="text-xs text-muted">{option.desc}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </motion.div>

                  {price !== null && (
                    <motion.div
                      className="bg-sand p-6 rounded-lg flex items-center justify-between"
                      variants={staggerItem}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={24} className="text-primary" />
                        <span className="font-semibold text-primary">{txt.amountDue}</span>
                      </div>
                      <span className={`text-2xl font-bold ${price === 0 ? 'text-green-600' : 'text-primary'}`}>
                        {price === 0 ? txt.free : `\u00a3${price}`}
                      </span>
                    </motion.div>
                  )}

                  <div className="flex justify-center pt-4">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary text-white px-10 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          {txt.submitting}
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          {txt.submit}
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
