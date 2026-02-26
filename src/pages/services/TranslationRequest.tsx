import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Loader2, CheckCircle, Send, Info, DollarSign } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';

interface FormData {
  document_type: string;
  source_language: string;
  target_language: string;
  notes: string;
  file: File | null;
  urgency: string;
}

const initialFormData: FormData = {
  document_type: '',
  source_language: '',
  target_language: '',
  notes: '',
  file: null,
  urgency: 'standard',
};

export default function TranslationRequest() {
  const { language, isRTL } = useLanguage();
  const { member, isAuthenticated } = useMemberAuth();
  const isAr = language === 'ar';

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [isFirstRequest, setIsFirstRequest] = useState(false);
  const [daysSinceActivation, setDaysSinceActivation] = useState<number | null>(null);

  const txt = {
    title: isAr ? 'طلب ترجمة' : 'Translation Request',
    breadcrumbServices: isAr ? 'الخدمات' : 'Services',
    breadcrumbLegal: isAr ? 'الخدمات القانونية' : 'Legal Services',
    breadcrumbTranslation: isAr ? 'طلب ترجمة' : 'Translation Request',
    intro: isAr
      ? 'يمكنك تقديم طلب ترجمة للمستندات الرسمية. يرجى تعبئة النموذج أدناه وسيقوم فريقنا بمراجعة طلبك والتواصل معك.'
      : 'Submit a translation request for official documents. Please fill out the form below and our team will review your request and get in touch with you.',
    pricingTitle: isAr ? 'معلومات التسعير' : 'Pricing Information',
    pricingNonMember: isAr
      ? 'غير الأعضاء: 40 جنيه إسترليني لكل طلب. انضم كعضو للحصول على أسعار مخفضة!'
      : 'Non-members: \u00a340 per request. Join as a member for discounted rates!',
    pricingNewMember: isAr
      ? 'عضويتك مفعلة منذ أقل من 30 يومًا. ستكون مؤهلاً للأسعار المخفضة بعد 30 يومًا من التفعيل.'
      : 'Your membership was activated less than 30 days ago. You will be eligible for discounted rates after 30 days from activation.',
    pricingFirstFree: isAr
      ? 'بصفتك عضواً مؤهلاً، طلبك الأول عبر جميع الخدمات القانونية مجاني!'
      : 'As an eligible member, your first request across all legal services is FREE!',
    pricingMemberRate: isAr
      ? 'سعر الأعضاء: 20 جنيه إسترليني لكل طلب.'
      : 'Member rate: \u00a320 per request.',
    yourPrice: isAr ? 'السعر الخاص بك' : 'Your Price',
    free: isAr ? 'مجاناً' : 'FREE',
    sectionDocumentDetails: isAr ? 'تفاصيل المستند' : 'Document Details',
    documentTypeLabel: isAr ? 'نوع المستند' : 'Document Type',
    selectDocumentType: isAr ? 'اختر نوع المستند' : 'Select document type',
    birthCertificate: isAr ? 'شهادة ميلاد' : 'Birth Certificate',
    marriageCertificate: isAr ? 'عقد زواج' : 'Marriage Certificate',
    deathCertificate: isAr ? 'شهادة وفاة' : 'Death Certificate',
    divorceCertificate: isAr ? 'شهادة طلاق' : 'Divorce Certificate',
    academicTranscript: isAr ? 'كشف درجات أكاديمي' : 'Academic Transcript',
    legalDocument: isAr ? 'مستند قانوني' : 'Legal Document',
    officialLetter: isAr ? 'خطاب رسمي' : 'Official Letter',
    idPassport: isAr ? 'هوية / جواز سفر' : 'ID/Passport',
    other: isAr ? 'أخرى' : 'Other',
    sectionLanguages: isAr ? 'اللغات' : 'Languages',
    sourceLanguageLabel: isAr ? 'اللغة المصدر' : 'Source Language',
    sourceLanguagePlaceholder: isAr ? 'مثال: العربية' : 'e.g. Arabic',
    targetLanguageLabel: isAr ? 'اللغة الهدف' : 'Target Language',
    targetLanguagePlaceholder: isAr ? 'مثال: الإنجليزية' : 'e.g. English',
    sectionAdditional: isAr ? 'معلومات إضافية' : 'Additional Information',
    notesLabel: isAr ? 'ملاحظات إضافية' : 'Additional Notes',
    notesPlaceholder: isAr
      ? 'أي تفاصيل أو متطلبات خاصة بالترجمة...'
      : 'Any specific details or requirements for the translation...',
    fileLabel: isAr ? 'رفع المستند' : 'Upload Document',
    fileHint: isAr
      ? 'اختياري - يمكنك رفع نسخة من المستند (PDF, JPG, PNG - حد أقصى 10 ميجابايت)'
      : 'Optional - Upload a copy of the document (PDF, JPG, PNG - max 10MB)',
    chooseFile: isAr ? 'اختر ملف' : 'Choose file',
    noFileChosen: isAr ? 'لم يتم اختيار ملف' : 'No file chosen',
    urgencyLabel: isAr ? 'مستوى الاستعجال' : 'Urgency Level',
    urgencyStandard: isAr ? 'عادي (5-7 أيام عمل)' : 'Standard (5-7 business days)',
    urgencyUrgent: isAr ? 'مستعجل (2-3 أيام عمل)' : 'Urgent (2-3 business days)',
    urgencyExpress: isAr ? 'عاجل (خلال 24 ساعة)' : 'Express (within 24 hours)',
    optional: isAr ? 'اختياري' : 'Optional',
    required: isAr ? 'مطلوب' : 'Required',
    submit: isAr ? 'إرسال الطلب' : 'Submit Request',
    submitting: isAr ? 'جاري الإرسال...' : 'Submitting...',
    successTitle: isAr ? 'تم إرسال الطلب بنجاح!' : 'Request Submitted Successfully!',
    successMessage: isAr
      ? 'شكراً لتقديم طلب الترجمة. سيقوم فريقنا بمراجعة طلبك والتواصل معك قريباً.'
      : 'Thank you for submitting your translation request. Our team will review your request and contact you soon.',
    referenceLabel: isAr ? 'رقم المرجع' : 'Reference Number',
    submitAnother: isAr ? 'تقديم طلب آخر' : 'Submit Another Request',
    errorTitle: isAr ? 'فشل في الإرسال' : 'Submission Failed',
    errorMessage: isAr
      ? 'حدث خطأ في إرسال طلبك. يرجى المحاولة مرة أخرى.'
      : 'There was an error submitting your request. Please try again.',
    loginNote: isAr
      ? 'قم بتسجيل الدخول كعضو للحصول على أسعار مخفضة.'
      : 'Log in as a member to get discounted rates.',
    amountLabel: isAr ? 'المبلغ المطلوب' : 'Amount Due',
    daysRemaining: isAr ? 'الأيام المتبقية للأهلية' : 'Days until eligible',
  };

  const documentTypes = [
    { value: 'birth_certificate', label: txt.birthCertificate },
    { value: 'marriage_certificate', label: txt.marriageCertificate },
    { value: 'death_certificate', label: txt.deathCertificate },
    { value: 'divorce_certificate', label: txt.divorceCertificate },
    { value: 'academic_transcript', label: txt.academicTranscript },
    { value: 'legal_document', label: txt.legalDocument },
    { value: 'official_letter', label: txt.officialLetter },
    { value: 'id_passport', label: txt.idPassport },
    { value: 'other', label: txt.other },
  ];

  const urgencyOptions = [
    { value: 'standard', label: txt.urgencyStandard },
    { value: 'urgent', label: txt.urgencyUrgent },
    { value: 'express', label: txt.urgencyExpress },
  ];

  const calculatePrice = async () => {
    if (!isAuthenticated || !member) return 40;

    const { data: membership } = await supabase
      .from('membership_applications')
      .select('payment_date, status')
      .eq('user_id', member.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!membership?.payment_date) return 40;

    const activationDate = new Date(membership.payment_date);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - activationDate.getTime()) / (1000 * 60 * 60 * 24));

    setDaysSinceActivation(daysSince);

    if (daysSince < 30) return 40;

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

    return 20;
  };

  useEffect(() => {
    const loadPrice = async () => {
      setPriceLoading(true);
      const calculatedPrice = await calculatePrice();
      setPrice(calculatedPrice);
      setPriceLoading(false);
    };
    loadPrice();
  }, [isAuthenticated, member]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      let fileUrl: string | null = null;

      if (formData.file) {
        const fileExt = formData.file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `translation-documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, formData.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
      }

      const refNumber = `TR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { error } = await supabase
        .from('translation_requests')
        .insert([{
          user_id: member?.id || null,
          document_type: formData.document_type,
          source_language: formData.source_language,
          target_language: formData.target_language,
          notes: formData.notes || null,
          file_url: fileUrl,
          urgency: formData.urgency,
          status: 'pending',
          amount: price,
          is_member: isAuthenticated && !!member,
          is_first_request: isFirstRequest,
        }]);

      if (error) throw error;

      setReferenceNumber(refNumber);
      setSubmitStatus('success');
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error submitting translation request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPricingInfo = () => {
    if (priceLoading) {
      return (
        <div className="flex items-center gap-3 text-muted">
          <Loader2 size={20} className="animate-spin" />
          <span>{isAr ? 'جاري حساب السعر...' : 'Calculating price...'}</span>
        </div>
      );
    }

    if (!isAuthenticated || !member) {
      return (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-muted">{txt.pricingNonMember}</p>
          </div>
          <p className="text-sm text-muted">{txt.loginNote}</p>
        </div>
      );
    }

    if (daysSinceActivation !== null && daysSinceActivation < 30) {
      return (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-muted">{txt.pricingNewMember}</p>
              <p className="text-sm text-amber-600 font-semibold mt-1">
                {txt.daysRemaining}: {30 - daysSinceActivation}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (isFirstRequest) {
      return (
        <div className="flex items-start gap-3">
          <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 font-semibold">{txt.pricingFirstFree}</p>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-3">
        <DollarSign size={20} className="text-primary flex-shrink-0 mt-0.5" />
        <p className="text-muted">{txt.pricingMemberRate}</p>
      </div>
    );
  };

  if (submitStatus === 'success') {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="pt-20">
          <PageHeader
            title={txt.title}
            breadcrumbs={[
              { label: txt.breadcrumbServices, path: '/services' },
              { label: txt.breadcrumbLegal, path: '/services/legal' },
              { label: txt.breadcrumbTranslation },
            ]}
            pageKey="translation-request"
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
                <p className="text-lg text-muted mb-6">{txt.successMessage}</p>

                <motion.div
                  className="bg-sand p-6 rounded-lg mb-8 inline-block"
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                >
                  <p className="text-sm text-muted mb-1">{txt.referenceLabel}</p>
                  <p className="text-2xl font-bold text-primary tracking-wider">{referenceNumber}</p>
                </motion.div>

                {price !== null && (
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-sm text-muted mb-1">{txt.amountLabel}</p>
                    <p className="text-xl font-bold text-primary">
                      {price === 0 ? txt.free : `\u00a3${price}`}
                    </p>
                  </motion.div>
                )}

                <motion.button
                  onClick={() => {
                    setSubmitStatus('idle');
                    setReferenceNumber('');
                    setIsFirstRequest(false);
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
            { label: txt.breadcrumbLegal, path: '/services/legal' },
            { label: txt.breadcrumbTranslation },
          ]}
          pageKey="translation-request"
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
                <FileText size={32} className="text-primary mx-auto mb-4" />
                <p className="text-lg text-muted leading-relaxed">{txt.intro}</p>
              </motion.div>

              <motion.div
                className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg mb-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                  <DollarSign size={20} className="text-accent" />
                  {txt.pricingTitle}
                </h3>
                {renderPricingInfo()}
                {price !== null && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">{txt.yourPrice}:</span>
                      <span className={`text-2xl font-bold ${price === 0 ? 'text-green-600' : 'text-primary'}`}>
                        {price === 0 ? txt.free : `\u00a3${price}`}
                      </span>
                    </div>
                  </div>
                )}
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
                      {txt.sectionDocumentDetails} <span className="text-red-500">*</span>
                    </h3>
                    <motion.div className="space-y-6" variants={staggerItem}>
                      <div>
                        <label htmlFor="document_type" className="block text-sm font-semibold text-primary mb-2">
                          {txt.documentTypeLabel}
                        </label>
                        <select
                          id="document_type"
                          value={formData.document_type}
                          onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value }))}
                          required
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors bg-white"
                        >
                          <option value="">{txt.selectDocumentType}</option>
                          {documentTypes.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
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
                      {txt.sectionLanguages} <span className="text-red-500">*</span>
                    </h3>
                    <motion.div className="grid md:grid-cols-2 gap-6" variants={staggerItem}>
                      <div>
                        <label htmlFor="source_language" className="block text-sm font-semibold text-primary mb-2">
                          {txt.sourceLanguageLabel}
                        </label>
                        <input
                          type="text"
                          id="source_language"
                          value={formData.source_language}
                          onChange={(e) => setFormData(prev => ({ ...prev, source_language: e.target.value }))}
                          required
                          placeholder={txt.sourceLanguagePlaceholder}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="target_language" className="block text-sm font-semibold text-primary mb-2">
                          {txt.targetLanguageLabel}
                        </label>
                        <input
                          type="text"
                          id="target_language"
                          value={formData.target_language}
                          onChange={(e) => setFormData(prev => ({ ...prev, target_language: e.target.value }))}
                          required
                          placeholder={txt.targetLanguagePlaceholder}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
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
                      {txt.sectionAdditional}
                    </h3>
                    <motion.div className="space-y-6" variants={staggerItem}>
                      <div>
                        <label htmlFor="notes" className="block text-sm font-semibold text-primary mb-2">
                          {txt.notesLabel}
                          <span className="text-sm font-normal text-muted ms-2">({txt.optional})</span>
                        </label>
                        <textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          rows={4}
                          placeholder={txt.notesPlaceholder}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                          {txt.fileLabel}
                          <span className="text-sm font-normal text-muted ms-2">({txt.optional})</span>
                        </label>
                        <p className="text-sm text-muted mb-3">{txt.fileHint}</p>
                        <div className="flex items-center gap-4">
                          <label className="cursor-pointer bg-sand hover:bg-border transition-colors px-6 py-3 rounded-lg flex items-center gap-2 text-primary font-semibold">
                            <Upload size={18} />
                            {txt.chooseFile}
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFormData(prev => ({ ...prev, file }));
                              }}
                              className="hidden"
                            />
                          </label>
                          <span className="text-sm text-muted">
                            {formData.file ? formData.file.name : txt.noFileChosen}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="urgency" className="block text-sm font-semibold text-primary mb-2">
                          {txt.urgencyLabel}
                        </label>
                        <select
                          id="urgency"
                          value={formData.urgency}
                          onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors bg-white"
                        >
                          {urgencyOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  </motion.div>

                  {price !== null && (
                    <motion.div
                      className={`p-6 rounded-lg flex items-center justify-between ${
                        price === 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-sand border-2 border-border'
                      }`}
                      variants={staggerItem}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      <span className="font-semibold text-primary">{txt.amountLabel}</span>
                      <span className={`text-2xl font-bold ${price === 0 ? 'text-green-600' : 'text-primary'}`}>
                        {price === 0 ? txt.free : `\u00a3${price}`}
                      </span>
                    </motion.div>
                  )}

                  <div className="flex justify-center pt-4">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || priceLoading}
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
