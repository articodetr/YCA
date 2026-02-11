import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Send, Loader2, CheckCircle, ShieldAlert, MessageSquare, Lightbulb, MessageCircle } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';

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

  const txt = {
    title: isAr ? 'الشكاوى والمقترحات' : 'Complaints & Suggestions',
    breadcrumbContact: isAr ? 'اتصل بنا' : 'Contact',
    breadcrumbComplaints: isAr ? 'الشكاوى والمقترحات' : 'Complaints & Suggestions',
    intro: isAr
      ? 'نرحب بملاحظاتكم. يُستخدم هذا النموذج لتقديم شكوى أو اقتراح أو ملاحظة عامة تتعلق بخدمات الجالية أو العاملين أو الأنشطة المجتمعية.'
      : 'We welcome your feedback. This form is used to submit a complaint, suggestion, or general comment relating to community services, staff, or community activities.',
    confidentiality: isAr
      ? 'تُعامل جميع البلاغات بسرية وفق سياسة الشكاوى المعتمدة، ويجري الرد خلال 10–20 يوم عمل بحسب طبيعة الموضوع.'
      : 'All submissions are treated confidentially in accordance with our approved complaints policy, and a response will be provided within 10-20 working days depending on the nature of the matter.',
    safeguardingTitle: isAr ? 'تنبيه حماية' : 'Safeguarding Notice',
    safeguarding: isAr
      ? 'إذا كانت الشكوى تتعلق بسلامة طفل أو بالغ مستضعف بشكل عاجل، يرجى عدم استخدام هذا النموذج، وفي الحالات الطارئة اتصل على 999'
      : 'If your concern is about the immediate safety of a child or vulnerable adult, please do not use this form. In an emergency, call 999.',
    sectionPersonal: isAr ? 'البيانات الشخصية' : 'Personal Details',
    optional: isAr ? 'اختياري' : 'Optional',
    name: isAr ? 'الاسم' : 'Name',
    phone: isAr ? 'الهاتف' : 'Phone',
    email: isAr ? 'البريد الإلكتروني' : 'Email',
    address: isAr ? 'العنوان' : 'Address',
    sectionFeedbackType: isAr ? 'نوع الملاحظة' : 'Type of Feedback',
    complaint: isAr ? 'شكوى' : 'Complaint',
    suggestion: isAr ? 'اقتراح' : 'Suggestion',
    generalComment: isAr ? 'ملاحظة عامة' : 'General Comment',
    sectionDetails: isAr ? 'التفاصيل' : 'Details',
    detailsPlaceholder: isAr
      ? 'يرجى وصف ملاحظتك بالتفصيل، مع ذكر التواريخ والأشخاص المعنيين إن أمكن...'
      : 'Please describe your feedback in detail, including dates and individuals involved where possible...',
    sectionOutcome: isAr ? 'النتيجة المرجوة' : 'Desired Outcome',
    outcomePlaceholder: isAr
      ? 'ما الذي تودّ أن يحدث نتيجة لهذا البلاغ؟'
      : 'What would you like to happen as a result of this submission?',
    sectionContact: isAr ? 'تفضيل التواصل' : 'Contact Preference',
    contactQuestion: isAr ? 'هل تود أن نتواصل معك بخصوص هذا البلاغ؟' : 'Would you like us to contact you regarding this submission?',
    yes: isAr ? 'نعم، تواصلوا معي' : 'Yes, contact me',
    no: isAr ? 'لا، لا أرغب بالتواصل' : 'No, I do not wish to be contacted',
    preferredMethod: isAr ? 'الطريقة المفضلة للتواصل' : 'Preferred Contact Method',
    methodPhone: isAr ? 'هاتف' : 'Phone',
    methodEmail: isAr ? 'بريد إلكتروني' : 'Email',
    methodOther: isAr ? 'أخرى' : 'Other',
    sectionConsent: isAr ? 'الموافقة' : 'Consent',
    consentLabel: isAr
      ? 'أؤكد موافقتي على استخدام بياناتي وفقاً لسياسات جمعية الجالية اليمنية في برمنغهام.'
      : 'I confirm that I agree to the use of my information in line with YCA Birmingham policies.',
    submit: isAr ? 'إرسال' : 'Submit',
    submitting: isAr ? 'جاري الإرسال...' : 'Submitting...',
    successTitle: isAr ? 'تم الإرسال بنجاح!' : 'Submission Successful!',
    successMessage: isAr
      ? 'شكراً لتواصلكم. تم استلام بلاغكم وسيتم مراجعته وفقاً لسياسة الشكاوى المعتمدة.'
      : 'Thank you for reaching out. Your submission has been received and will be reviewed in accordance with our complaints policy.',
    referenceLabel: isAr ? 'الرقم المرجعي:' : 'Reference Number:',
    referenceNote: isAr
      ? 'يرجى الاحتفاظ بهذا الرقم لمتابعة بلاغكم.'
      : 'Please keep this number for your records.',
    submitAnother: isAr ? 'تقديم بلاغ آخر' : 'Submit Another',
    errorTitle: isAr ? 'فشل في الإرسال' : 'Submission Failed',
    errorMessage: isAr
      ? 'حدث خطأ في إرسال بلاغكم. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.'
      : 'There was an error submitting your feedback. Please try again or contact us directly.',
    validationContact: isAr
      ? 'عند اختيار "نعم، تواصلوا معي"، يجب تقديم رقم الهاتف أو البريد الإلكتروني على الأقل.'
      : 'When selecting "Yes, contact me", you must provide at least a phone number or email address.',
    required: isAr ? 'مطلوب' : 'Required',
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

  const feedbackTypeIcons = {
    complaint: <AlertTriangle size={20} />,
    suggestion: <Lightbulb size={20} />,
    general_comment: <MessageCircle size={20} />,
  };

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
                <MessageSquare size={32} className="text-primary mx-auto mb-4" />
                <p className="text-lg text-muted leading-relaxed mb-4">{txt.intro}</p>
                <p className="text-muted leading-relaxed">{txt.confidentiality}</p>
              </motion.div>

              <motion.div
                className="bg-red-50 border-2 border-red-300 p-6 rounded-lg mb-10"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldAlert size={24} className="text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-red-800 mb-2">{txt.safeguardingTitle}</h3>
                    <p className="text-red-700 leading-relaxed">{txt.safeguarding}</p>
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

                {validationError && (
                  <motion.div
                    className="bg-amber-50 border-2 border-amber-400 text-amber-800 p-4 rounded-lg mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="font-semibold">{validationError}</p>
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
                      {txt.sectionPersonal}
                      <span className="text-sm font-normal text-muted ms-2">({txt.optional})</span>
                    </h3>
                    <motion.div className="grid md:grid-cols-2 gap-6" variants={staggerItem}>
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-primary mb-2">
                          {txt.name}
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-primary mb-2">
                          {txt.phone}
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
                          {txt.email}
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="address" className="block text-sm font-semibold text-primary mb-2">
                          {txt.address}
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                    </motion.div>
                  </motion.div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">
                      {txt.sectionFeedbackType} <span className="text-red-500">*</span>
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {([
                        { value: 'complaint' as FeedbackType, label: txt.complaint },
                        { value: 'suggestion' as FeedbackType, label: txt.suggestion },
                        { value: 'general_comment' as FeedbackType, label: txt.generalComment },
                      ]).map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.feedback_type === option.value
                              ? 'border-primary bg-accent'
                              : 'border-sand hover:border-hover'
                          }`}
                        >
                          <input
                            type="radio"
                            name="feedback_type"
                            value={option.value}
                            checked={formData.feedback_type === option.value}
                            onChange={handleChange}
                            required
                            className="sr-only"
                          />
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            formData.feedback_type === option.value ? 'bg-primary text-white' : 'bg-sand text-muted'
                          }`}>
                            {feedbackTypeIcons[option.value]}
                          </div>
                          <span className={`font-semibold ${
                            formData.feedback_type === option.value ? 'text-primary' : 'text-muted'
                          }`}>
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">
                      {txt.sectionDetails} <span className="text-red-500">*</span>
                    </h3>
                    <textarea
                      id="details"
                      name="details"
                      value={formData.details}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder={txt.detailsPlaceholder}
                    />
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">
                      {txt.sectionOutcome}
                    </h3>
                    <textarea
                      id="desired_outcome"
                      name="desired_outcome"
                      value={formData.desired_outcome}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder={txt.outcomePlaceholder}
                    />
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">
                      {txt.sectionContact} <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-muted">{txt.contactQuestion}</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all flex-1 ${
                          formData.contact_requested === true
                            ? 'border-primary bg-accent'
                            : 'border-sand hover:border-hover'
                        }`}
                      >
                        <input
                          type="radio"
                          name="contact_requested_radio"
                          checked={formData.contact_requested === true}
                          onChange={() => {
                            setFormData(prev => ({ ...prev, contact_requested: true }));
                            setValidationError('');
                          }}
                          required
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          formData.contact_requested === true ? 'border-primary' : 'border-muted'
                        }`}>
                          {formData.contact_requested === true && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className={`font-semibold ${
                          formData.contact_requested === true ? 'text-primary' : 'text-muted'
                        }`}>
                          {txt.yes}
                        </span>
                      </label>
                      <label
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all flex-1 ${
                          formData.contact_requested === false
                            ? 'border-primary bg-accent'
                            : 'border-sand hover:border-hover'
                        }`}
                      >
                        <input
                          type="radio"
                          name="contact_requested_radio"
                          checked={formData.contact_requested === false}
                          onChange={() => {
                            setFormData(prev => ({ ...prev, contact_requested: false, preferred_contact_method: '' }));
                            setValidationError('');
                          }}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          formData.contact_requested === false ? 'border-primary' : 'border-muted'
                        }`}>
                          {formData.contact_requested === false && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className={`font-semibold ${
                          formData.contact_requested === false ? 'text-primary' : 'text-muted'
                        }`}>
                          {txt.no}
                        </span>
                      </label>
                    </div>

                    {formData.contact_requested === true && (
                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="block text-sm font-semibold text-primary mb-2">
                          {txt.preferredMethod}
                        </label>
                        <div className="flex flex-wrap gap-4">
                          {([
                            { value: 'phone' as ContactPreference, label: txt.methodPhone },
                            { value: 'email' as ContactPreference, label: txt.methodEmail },
                            { value: 'other' as ContactPreference, label: txt.methodOther },
                          ]).map((method) => (
                            <label
                              key={method.value}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                                formData.preferred_contact_method === method.value
                                  ? 'border-primary bg-accent'
                                  : 'border-sand hover:border-hover'
                              }`}
                            >
                              <input
                                type="radio"
                                name="preferred_contact_method"
                                value={method.value}
                                checked={formData.preferred_contact_method === method.value}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <span className={`font-medium ${
                                formData.preferred_contact_method === method.value ? 'text-primary' : 'text-muted'
                              }`}>
                                {method.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">
                      {txt.sectionConsent} <span className="text-red-500">*</span>
                    </h3>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                        required
                        className="mt-1 w-5 h-5 rounded border-2 border-sand text-primary focus:ring-accent cursor-pointer"
                      />
                      <span className="text-muted leading-relaxed">{txt.consentLabel}</span>
                    </label>
                  </div>

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
  );
}
