import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Send, Loader2, CheckCircle, ShieldAlert, Lightbulb, MessageCircle, Phone, Mail, ChevronRight, Copy, Check } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { fadeInUp } from '../../lib/animations';

type FeedbackType = 'complaint' | 'suggestion' | 'general_comment';
type ContactPreference = 'phone' | 'email' | 'other';

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  feedback_type: FeedbackType | '';
  details: string;
  desired_outcome: string;
  contact_requested: boolean | null;
  preferred_contact_method: ContactPreference | '';
  consent: boolean;
}

const initialFormData: FormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  feedback_type: '',
  details: '',
  desired_outcome: '',
  contact_requested: null,
  preferred_contact_method: '',
  consent: false,
};

export default function ComplaintsSuggestions() {
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [validationError, setValidationError] = useState('');
  const [copied, setCopied] = useState(false);

  const txt = {
    title: isAr ? 'الشكاوى والمقترحات' : 'Complaints & Suggestions',
    breadcrumbContact: isAr ? 'اتصل بنا' : 'Contact',
    breadcrumbComplaints: isAr ? 'الشكاوى والمقترحات' : 'Complaints & Suggestions',
    subtitle: isAr
      ? 'ملاحظاتكم تهمنا وتساعدنا على تحسين خدماتنا'
      : 'Your voice matters and helps us improve our services',
    confidentiality: isAr
      ? 'جميع البلاغات تُعامل بسرية تامة. يتم الرد خلال 10-20 يوم عمل.'
      : 'All submissions are treated confidentially. Response within 10-20 working days.',
    safeguardingTitle: isAr ? 'تنبيه حماية' : 'Safeguarding Notice',
    safeguarding: isAr
      ? 'إذا كانت الشكوى تتعلق بسلامة طفل أو بالغ مستضعف بشكل عاجل، يرجى عدم استخدام هذا النموذج. في الحالات الطارئة اتصل على 999'
      : 'If your concern is about the immediate safety of a child or vulnerable adult, please do not use this form. In an emergency, call 999.',
    optional: isAr ? 'اختياري' : 'Optional',
    name: isAr ? 'الاسم' : 'Name',
    namePlaceholder: isAr ? 'أدخل اسمك الكامل' : 'Enter your full name',
    phone: isAr ? 'الهاتف' : 'Phone',
    phonePlaceholder: isAr ? 'رقم الهاتف' : 'Phone number',
    email: isAr ? 'البريد الإلكتروني' : 'Email',
    emailPlaceholder: isAr ? 'بريدك الإلكتروني' : 'Your email address',
    address: isAr ? 'العنوان' : 'Address',
    addressPlaceholder: isAr ? 'عنوانك البريدي' : 'Your postal address',
    feedbackTypeLabel: isAr ? 'ما نوع ملاحظتك؟' : 'What type of feedback?',
    complaint: isAr ? 'شكوى' : 'Complaint',
    complaintDesc: isAr ? 'الإبلاغ عن مشكلة' : 'Report an issue',
    suggestion: isAr ? 'اقتراح' : 'Suggestion',
    suggestionDesc: isAr ? 'شاركنا أفكارك' : 'Share your ideas',
    generalComment: isAr ? 'ملاحظة عامة' : 'General Comment',
    generalCommentDesc: isAr ? 'أخبرنا برأيك' : 'Tell us what you think',
    detailsLabel: isAr ? 'التفاصيل' : 'Details',
    detailsPlaceholder: isAr
      ? 'يرجى وصف ملاحظتك بالتفصيل...'
      : 'Please describe your feedback in detail...',
    outcomeLabel: isAr ? 'النتيجة المرجوة' : 'Desired Outcome',
    outcomePlaceholder: isAr
      ? 'ما الذي تودّ أن يحدث نتيجة لهذا البلاغ؟'
      : 'What would you like to happen as a result?',
    contactQuestion: isAr ? 'هل تود أن نتواصل معك؟' : 'Would you like us to contact you?',
    yes: isAr ? 'نعم' : 'Yes',
    no: isAr ? 'لا' : 'No',
    preferredMethod: isAr ? 'طريقة التواصل المفضلة' : 'Preferred contact method',
    methodPhone: isAr ? 'هاتف' : 'Phone',
    methodEmail: isAr ? 'بريد إلكتروني' : 'Email',
    methodOther: isAr ? 'أخرى' : 'Other',
    consentLabel: isAr
      ? 'أوافق على استخدام بياناتي وفقاً لسياسات جمعية الجالية اليمنية في برمنغهام.'
      : 'I agree to the use of my information in line with YCA Birmingham policies.',
    submit: isAr ? 'إرسال' : 'Submit',
    submitting: isAr ? 'جاري الإرسال...' : 'Submitting...',
    successTitle: isAr ? 'تم الإرسال بنجاح!' : 'Submitted Successfully!',
    successMessage: isAr
      ? 'شكراً لتواصلكم. تم استلام بلاغكم وسيتم مراجعته.'
      : 'Thank you for reaching out. Your submission has been received and will be reviewed.',
    referenceLabel: isAr ? 'الرقم المرجعي' : 'Reference Number',
    referenceNote: isAr
      ? 'احتفظ بهذا الرقم لمتابعة بلاغك'
      : 'Keep this number for your records',
    copyRef: isAr ? 'نسخ' : 'Copy',
    copiedRef: isAr ? 'تم النسخ' : 'Copied',
    submitAnother: isAr ? 'تقديم بلاغ آخر' : 'Submit Another',
    errorTitle: isAr ? 'فشل في الإرسال' : 'Submission Failed',
    errorMessage: isAr
      ? 'حدث خطأ. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.'
      : 'Something went wrong. Please try again or contact us directly.',
    validationContact: isAr
      ? 'يجب تقديم رقم الهاتف أو البريد الإلكتروني عند طلب التواصل.'
      : 'Please provide a phone number or email when requesting contact.',
    personalInfo: isAr ? 'البيانات الشخصية' : 'Personal Information',
  };

  const generateReference = () => {
    const prefix = 'YCA-CS';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (formData.contact_requested === true && !formData.phone.trim() && !formData.email.trim()) {
      setValidationError(txt.validationContact);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    const ref = generateReference();

    try {
      const { error } = await supabase
        .from('complaints_submissions')
        .insert([{
          reference_number: ref,
          name: formData.name || null,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          feedback_type: formData.feedback_type,
          details: formData.details,
          desired_outcome: formData.desired_outcome || null,
          contact_requested: formData.contact_requested,
          preferred_contact_method: formData.contact_requested ? formData.preferred_contact_method || null : null,
          consent: formData.consent,
        }]);

      if (error) throw error;

      setReferenceNumber(ref);
      setSubmitStatus('success');
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const feedbackTypes = [
    { value: 'complaint' as FeedbackType, label: txt.complaint, desc: txt.complaintDesc, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', activeBg: 'bg-red-500', activeBorder: 'border-red-500' },
    { value: 'suggestion' as FeedbackType, label: txt.suggestion, desc: txt.suggestionDesc, icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50', activeBg: 'bg-amber-500', activeBorder: 'border-amber-500' },
    { value: 'general_comment' as FeedbackType, label: txt.generalComment, desc: txt.generalCommentDesc, icon: MessageCircle, color: 'text-teal-500', bg: 'bg-teal-50', activeBg: 'bg-teal-500', activeBorder: 'border-teal-500' },
  ];

  if (submitStatus === 'success') {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <PageHeader
          title={txt.title}
          breadcrumbs={[
            { label: txt.breadcrumbContact, path: '/contact' },
            { label: txt.breadcrumbComplaints },
          ]}
          pageKey="complaints"
        />
        <section className="py-16 md:py-24 bg-gradient-to-b from-sand to-white min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-lg mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-8"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <CheckCircle size={36} className="text-emerald-600" />
              </motion.div>

              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">{txt.successTitle}</h2>
              <p className="text-muted mb-10 leading-relaxed">{txt.successMessage}</p>

              <motion.div
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs text-muted uppercase tracking-wider mb-3 font-medium">{txt.referenceLabel}</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-2xl font-bold text-primary font-mono tracking-widest">{referenceNumber}</p>
                  <button
                    onClick={handleCopyRef}
                    className="p-2 rounded-lg hover:bg-sand transition-colors"
                  >
                    {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-muted" />}
                  </button>
                </div>
                <p className="text-xs text-muted mt-3">{txt.referenceNote}</p>
              </motion.div>

              <motion.button
                onClick={() => { setSubmitStatus('idle'); setReferenceNumber(''); setCopied(false); }}
                className="text-primary font-semibold hover:text-secondary transition-colors inline-flex items-center gap-2"
                whileHover={{ x: isRTL ? -4 : 4 }}
              >
                {txt.submitAnother}
                <ChevronRight size={18} className={isRTL ? 'rotate-180' : ''} />
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={txt.title}
        breadcrumbs={[
          { label: txt.breadcrumbContact, path: '/contact' },
          { label: txt.breadcrumbComplaints },
        ]}
        pageKey="complaints"
      />

      <section className="py-16 md:py-24 bg-gradient-to-b from-sand to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="text-center mb-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <p className="text-muted leading-relaxed max-w-lg mx-auto">{txt.subtitle}</p>
              <p className="text-sm text-muted/70 mt-2">{txt.confidentiality}</p>
            </motion.div>

            <motion.div
              className="bg-red-50/60 border border-red-200 px-5 py-4 rounded-xl mb-10 flex items-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <ShieldAlert size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-red-800 mb-0.5">{txt.safeguardingTitle}</p>
                <p className="text-sm text-red-700/80 leading-relaxed">{txt.safeguarding}</p>
              </div>
            </motion.div>

            <AnimatePresence>
              {submitStatus === 'error' && (
                <motion.div
                  className="bg-red-50 border border-red-300 text-red-800 px-5 py-4 rounded-xl mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="font-semibold text-sm">{txt.errorTitle}</p>
                  <p className="text-sm text-red-700">{txt.errorMessage}</p>
                </motion.div>
              )}
              {validationError && (
                <motion.div
                  className="bg-amber-50 border border-amber-300 text-amber-800 px-5 py-4 rounded-xl mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="text-sm font-medium">{validationError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <label className="block text-sm font-semibold text-primary mb-4">{txt.feedbackTypeLabel}</label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {feedbackTypes.map((type) => {
                    const active = formData.feedback_type === type.value;
                    const Icon = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          active
                            ? `${type.activeBorder} bg-white shadow-md`
                            : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <input
                          type="radio"
                          name="feedback_type"
                          value={type.value}
                          checked={active}
                          onChange={handleChange}
                          required
                          className="sr-only"
                        />
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          active ? `${type.activeBg} text-white` : `${type.bg} ${type.color}`
                        }`}>
                          <Icon size={20} />
                        </div>
                        <span className={`font-semibold text-sm transition-colors ${active ? 'text-primary' : 'text-muted'}`}>
                          {type.label}
                        </span>
                        <span className="text-xs text-muted/70">{type.desc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                <p className="text-sm font-medium text-muted flex items-center gap-2">
                  {txt.personalInfo}
                  <span className="text-xs bg-sand px-2 py-0.5 rounded-full">{txt.optional}</span>
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-muted mb-1.5">{txt.name}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={txt.namePlaceholder}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-muted mb-1.5">{txt.phone}</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={txt.phonePlaceholder}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-muted mb-1.5">{txt.email}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={txt.emailPlaceholder}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-xs font-medium text-muted mb-1.5">{txt.address}</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder={txt.addressPlaceholder}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="details" className="block text-sm font-semibold text-primary mb-2">
                  {txt.detailsLabel} <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder={txt.detailsPlaceholder}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none resize-none"
                />
              </div>

              <div>
                <label htmlFor="desired_outcome" className="block text-sm font-semibold text-primary mb-2">
                  {txt.outcomeLabel}
                  <span className="text-xs font-normal text-muted ms-2">({txt.optional})</span>
                </label>
                <textarea
                  id="desired_outcome"
                  name="desired_outcome"
                  value={formData.desired_outcome}
                  onChange={handleChange}
                  rows={3}
                  placeholder={txt.outcomePlaceholder}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-4">{txt.contactQuestion}</label>
                <div className="flex gap-3">
                  {[
                    { val: true, label: txt.yes },
                    { val: false, label: txt.no },
                  ].map((opt) => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          contact_requested: opt.val,
                          ...(opt.val === false ? { preferred_contact_method: '' as ContactPreference | '' } : {}),
                        }));
                        setValidationError('');
                      }}
                      className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        formData.contact_requested === opt.val
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-sand text-muted hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {formData.contact_requested === true && (
                    <motion.div
                      className="mt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-xs font-medium text-muted mb-2">{txt.preferredMethod}</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'phone' as ContactPreference, label: txt.methodPhone, icon: Phone },
                          { value: 'email' as ContactPreference, label: txt.methodEmail, icon: Mail },
                          { value: 'other' as ContactPreference, label: txt.methodOther, icon: MessageCircle },
                        ].map((method) => {
                          const active = formData.preferred_contact_method === method.value;
                          const Icon = method.icon;
                          return (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, preferred_contact_method: method.value }))}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                active
                                  ? 'bg-primary text-white'
                                  : 'bg-sand text-muted hover:bg-gray-100'
                              }`}
                            >
                              <Icon size={14} />
                              {method.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={formData.consent}
                      onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                      required
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-gray-300 peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                      {formData.consent && <Check size={14} className="text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-muted leading-relaxed group-hover:text-primary transition-colors">
                    {txt.consentLabel}
                  </span>
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 hover:bg-secondary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20"
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {txt.submitting}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {txt.submit}
                  </>
                )}
              </motion.button>
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  );
}
