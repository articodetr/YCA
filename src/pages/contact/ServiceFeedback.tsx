import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, CheckCircle, Star, MessageSquarePlus, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { fadeInUp, staggerContainer, staggerItem } from '../../lib/animations';

type RatingValue = 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied';

interface RatingsData {
  access: RatingValue | '';
  communication: RatingValue | '';
  staff: RatingValue | '';
  timeliness: RatingValue | '';
  overall: RatingValue | '';
}

interface EqualityData {
  age_range: string;
  gender: string;
  ethnic_background: string;
}

interface FormData {
  service: string;
  service_date: string;
  ratings: RatingsData;
  what_went_well: string;
  what_to_improve: string;
  other_comments: string;
  recommend: string;
  contact_requested: boolean | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  equality_data: EqualityData;
}

const initialFormData: FormData = {
  service: '',
  service_date: '',
  ratings: {
    access: '',
    communication: '',
    staff: '',
    timeliness: '',
    overall: '',
  },
  what_went_well: '',
  what_to_improve: '',
  other_comments: '',
  recommend: '',
  contact_requested: null,
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  equality_data: {
    age_range: '',
    gender: '',
    ethnic_background: '',
  },
};

export default function ServiceFeedback() {
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const txt = {
    title: isAr ? 'التقييم والملاحظات' : 'Service Feedback',
    breadcrumbContact: isAr ? 'اتصل بنا' : 'Contact',
    breadcrumbFeedback: isAr ? 'التقييم والملاحظات' : 'Service Feedback',
    intro: isAr
      ? 'ملاحظاتكم تساعدنا على تحسين الخدمات والأنشطة. يمكن تعبئة هذا النموذج بشكل مجهول. إذا رغبت برد من فريقنا، يرجى إدخال بيانات التواصل.'
      : 'Your feedback helps us improve our services and activities. This form can be completed anonymously. If you would like a response from our team, please provide your contact details.',
    sectionAbout: isAr ? 'حول ملاحظاتك' : 'About Your Feedback',
    serviceLabel: isAr ? 'ما الخدمة/النشاط؟' : 'Which service/activity?',
    selectService: isAr ? 'اختر الخدمة' : 'Select a service',
    serviceAdvisory: isAr ? 'المكتب الاستشاري' : 'Advisory Office Services',
    serviceLegal: isAr ? 'الخدمات القانونية والتوثيق' : 'Legal Services & Documentation',
    serviceEvents: isAr ? 'الأنشطة والفعاليات' : 'Events/Activities',
    serviceVolunteering: isAr ? 'التطوع' : 'Volunteering',
    serviceOther: isAr ? 'أخرى' : 'Other',
    serviceDateLabel: isAr ? 'تاريخ الخدمة' : 'Date of service',
    optional: isAr ? 'اختياري' : 'Optional',
    required: isAr ? 'مطلوب' : 'Required',
    sectionRatings: isAr ? 'التقييم السريع' : 'Quick Ratings',
    verySatisfied: isAr ? 'راضٍ جداً' : 'Very satisfied',
    satisfied: isAr ? 'راضٍ' : 'Satisfied',
    neutral: isAr ? 'محايد' : 'Neutral',
    dissatisfied: isAr ? 'غير راضٍ' : 'Dissatisfied',
    veryDissatisfied: isAr ? 'غير راضٍ إطلاقاً' : 'Very dissatisfied',
    ratingAccess: isAr ? 'سهولة الوصول للخدمة' : 'Access to the service',
    ratingCommunication: isAr ? 'وضوح التواصل والمعلومات' : 'Communication and clarity',
    ratingStaff: isAr ? 'تعامل الفريق والاحترام' : 'Staff support and respect',
    ratingTimeliness: isAr ? 'الالتزام بالوقت' : 'Timeliness',
    ratingOverall: isAr ? 'التقييم العام' : 'Overall experience',
    sectionComments: isAr ? 'ملاحظات مفتوحة' : 'Open Comments',
    whatWentWell: isAr ? 'ما الذي كان جيداً؟' : 'What went well?',
    whatToImprove: isAr ? 'ما الذي يمكن تحسينه؟' : 'What could we improve?',
    otherComments: isAr ? 'أي ملاحظات أخرى؟' : 'Any other comments?',
    sectionRecommend: isAr ? 'هل توصي بنا؟' : 'Would you recommend us?',
    yes: isAr ? 'نعم' : 'Yes',
    no: isAr ? 'لا' : 'No',
    notSure: isAr ? 'غير متأكد' : 'Not sure',
    sectionContact: isAr ? 'التواصل' : 'Contact',
    contactQuestion: isAr ? 'هل تود أن نتواصل معك؟' : 'Want us to contact you?',
    contactName: isAr ? 'الاسم' : 'Name',
    contactEmail: isAr ? 'البريد الإلكتروني' : 'Email',
    contactPhone: isAr ? 'الهاتف' : 'Phone',
    sectionEquality: isAr ? 'بيانات المساواة' : 'Equality Monitoring',
    ageRange: isAr ? 'الفئة العمرية' : 'Age range',
    selectAge: isAr ? 'اختر الفئة العمرية' : 'Select age range',
    gender: isAr ? 'الجنس' : 'Gender',
    selectGender: isAr ? 'اختر الجنس' : 'Select gender',
    ethnicBackground: isAr ? 'الخلفية العرقية' : 'Ethnic background',
    preferNotToSay: isAr ? 'أفضل عدم الإجابة' : 'Prefer not to say',
    genderMale: isAr ? 'ذكر' : 'Male',
    genderFemale: isAr ? 'أنثى' : 'Female',
    genderNonBinary: isAr ? 'غير ثنائي' : 'Non-binary',
    genderOther: isAr ? 'أخرى' : 'Other',
    privacyNote: isAr
      ? 'نستخدم بياناتك فقط لغرض متابعة البلاغ وتحسين الخدمة وفق سياسة حماية البيانات.'
      : 'We use your information only to respond to your submission and improve our services, in line with our Data Protection policy.',
    submit: isAr ? 'إرسال' : 'Submit',
    submitting: isAr ? 'جاري الإرسال...' : 'Submitting...',
    successTitle: isAr ? 'تم الإرسال بنجاح!' : 'Submission Successful!',
    successMessage: isAr
      ? 'شكراً لملاحظاتكم. ستساعدنا على تحسين خدماتنا.'
      : 'Thank you for your feedback. It will help us improve our services.',
    submitAnother: isAr ? 'تقديم تقييم آخر' : 'Submit Another',
    errorTitle: isAr ? 'فشل في الإرسال' : 'Submission Failed',
    errorMessage: isAr
      ? 'حدث خطأ في إرسال التقييم. يرجى المحاولة مرة أخرى.'
      : 'There was an error submitting your feedback. Please try again.',
  };

  const ratingScale: { value: RatingValue; label: string }[] = [
    { value: 'very_satisfied', label: txt.verySatisfied },
    { value: 'satisfied', label: txt.satisfied },
    { value: 'neutral', label: txt.neutral },
    { value: 'dissatisfied', label: txt.dissatisfied },
    { value: 'very_dissatisfied', label: txt.veryDissatisfied },
  ];

  const ratingRows: { key: keyof RatingsData; label: string }[] = [
    { key: 'access', label: txt.ratingAccess },
    { key: 'communication', label: txt.ratingCommunication },
    { key: 'staff', label: txt.ratingStaff },
    { key: 'timeliness', label: txt.ratingTimeliness },
    { key: 'overall', label: txt.ratingOverall },
  ];

  const serviceOptions = [
    { value: 'advisory', label: txt.serviceAdvisory },
    { value: 'legal', label: txt.serviceLegal },
    { value: 'events', label: txt.serviceEvents },
    { value: 'volunteering', label: txt.serviceVolunteering },
    { value: 'other', label: txt.serviceOther },
  ];

  const ageRanges = [
    'Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+',
    txt.preferNotToSay,
  ];

  const genderOptions = [
    { value: 'male', label: txt.genderMale },
    { value: 'female', label: txt.genderFemale },
    { value: 'non_binary', label: txt.genderNonBinary },
    { value: 'other', label: txt.genderOther },
    { value: 'prefer_not_to_say', label: txt.preferNotToSay },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('service_feedback')
        .insert([{
          service: formData.service,
          service_date: formData.service_date || null,
          ratings: formData.ratings,
          what_went_well: formData.what_went_well || null,
          what_to_improve: formData.what_to_improve || null,
          other_comments: formData.other_comments || null,
          recommend: formData.recommend || null,
          contact_requested: formData.contact_requested,
          contact_name: formData.contact_requested ? formData.contact_name || null : null,
          contact_email: formData.contact_requested ? formData.contact_email || null : null,
          contact_phone: formData.contact_requested ? formData.contact_phone || null : null,
          equality_data: formData.equality_data,
        }]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <PageHeader
            title={txt.title}
            breadcrumbs={[
              { label: txt.breadcrumbContact, path: '/contact' },
              { label: txt.breadcrumbFeedback },
            ]}
            pageKey="service-feedback"
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

                <motion.button
                  onClick={() => {
                    setSubmitStatus('idle');
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
            { label: txt.breadcrumbFeedback },
          ]}
          pageKey="service-feedback"
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
                <MessageSquarePlus size={32} className="text-primary mx-auto mb-4" />
                <p className="text-lg text-muted leading-relaxed">{txt.intro}</p>
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
                      {txt.sectionAbout} <span className="text-red-500">*</span>
                    </h3>
                    <motion.div className="space-y-6" variants={staggerItem}>
                      <div>
                        <label htmlFor="service" className="block text-sm font-semibold text-primary mb-2">
                          {txt.serviceLabel}
                        </label>
                        <select
                          id="service"
                          value={formData.service}
                          onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
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
                        <label htmlFor="service_date" className="block text-sm font-semibold text-primary mb-2">
                          {txt.serviceDateLabel}
                          <span className="text-sm font-normal text-muted ms-2">({txt.optional})</span>
                        </label>
                        <input
                          type="date"
                          id="service_date"
                          value={formData.service_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, service_date: e.target.value }))}
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
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2 flex items-center gap-2">
                      <Star size={20} className="text-accent" />
                      {txt.sectionRatings} <span className="text-red-500">*</span>
                    </h3>

                    <div className="hidden md:grid md:grid-cols-6 gap-2 text-center text-xs font-semibold text-muted pb-2 border-b border-sand">
                      <div />
                      {ratingScale.map((scale) => (
                        <div key={scale.value}>{scale.label}</div>
                      ))}
                    </div>

                    {ratingRows.map((row) => (
                      <motion.div key={row.key} variants={staggerItem}>
                        <div className="md:grid md:grid-cols-6 md:gap-2 md:items-center py-3 border-b border-sand/50">
                          <div className="font-semibold text-primary mb-3 md:mb-0">{row.label}</div>
                          <div className="grid grid-cols-5 md:contents gap-1">
                            {ratingScale.map((scale) => (
                              <label
                                key={scale.value}
                                className="flex flex-col items-center gap-1 cursor-pointer group"
                              >
                                <input
                                  type="radio"
                                  name={`rating_${row.key}`}
                                  value={scale.value}
                                  checked={formData.ratings[row.key] === scale.value}
                                  onChange={() =>
                                    setFormData(prev => ({
                                      ...prev,
                                      ratings: { ...prev.ratings, [row.key]: scale.value },
                                    }))
                                  }
                                  required
                                  className="sr-only"
                                />
                                <div
                                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                    formData.ratings[row.key] === scale.value
                                      ? 'border-primary bg-primary'
                                      : 'border-sand group-hover:border-hover'
                                  }`}
                                >
                                  {formData.ratings[row.key] === scale.value && (
                                    <div className="w-3 h-3 rounded-full bg-white" />
                                  )}
                                </div>
                                <span className="text-[10px] text-muted md:hidden text-center leading-tight">
                                  {scale.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">
                      {txt.sectionComments}
                      <span className="text-sm font-normal text-muted ms-2">({txt.optional})</span>
                    </h3>
                    <motion.div className="space-y-6" variants={staggerItem}>
                      <div>
                        <label htmlFor="what_went_well" className="block text-sm font-semibold text-primary mb-2">
                          {txt.whatWentWell}
                        </label>
                        <textarea
                          id="what_went_well"
                          value={formData.what_went_well}
                          onChange={(e) => setFormData(prev => ({ ...prev, what_went_well: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="what_to_improve" className="block text-sm font-semibold text-primary mb-2">
                          {txt.whatToImprove}
                        </label>
                        <textarea
                          id="what_to_improve"
                          value={formData.what_to_improve}
                          onChange={(e) => setFormData(prev => ({ ...prev, what_to_improve: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="other_comments" className="block text-sm font-semibold text-primary mb-2">
                          {txt.otherComments}
                        </label>
                        <textarea
                          id="other_comments"
                          value={formData.other_comments}
                          onChange={(e) => setFormData(prev => ({ ...prev, other_comments: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
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
                      {txt.sectionRecommend} <span className="text-red-500">*</span>
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {([
                        { value: 'yes', label: txt.yes },
                        { value: 'no', label: txt.no },
                        { value: 'not_sure', label: txt.notSure },
                      ]).map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all flex-1 ${
                            formData.recommend === option.value
                              ? 'border-primary bg-accent'
                              : 'border-sand hover:border-hover'
                          }`}
                        >
                          <input
                            type="radio"
                            name="recommend"
                            value={option.value}
                            checked={formData.recommend === option.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, recommend: e.target.value }))}
                            required
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            formData.recommend === option.value ? 'border-primary' : 'border-muted'
                          }`}>
                            {formData.recommend === option.value && (
                              <div className="w-3 h-3 rounded-full bg-primary" />
                            )}
                          </div>
                          <span className={`font-semibold ${
                            formData.recommend === option.value ? 'text-primary' : 'text-muted'
                          }`}>
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">
                      {txt.sectionContact}
                      <span className="text-sm font-normal text-muted ms-2">({txt.optional})</span>
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
                          onChange={() => setFormData(prev => ({ ...prev, contact_requested: true }))}
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
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            contact_requested: false,
                            contact_name: '',
                            contact_email: '',
                            contact_phone: '',
                          }))}
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
                        className="grid md:grid-cols-3 gap-6"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <div>
                          <label htmlFor="contact_name" className="block text-sm font-semibold text-primary mb-2">
                            {txt.contactName}
                          </label>
                          <input
                            type="text"
                            id="contact_name"
                            value={formData.contact_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label htmlFor="contact_email" className="block text-sm font-semibold text-primary mb-2">
                            {txt.contactEmail}
                          </label>
                          <input
                            type="email"
                            id="contact_email"
                            value={formData.contact_email}
                            onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label htmlFor="contact_phone" className="block text-sm font-semibold text-primary mb-2">
                            {txt.contactPhone}
                          </label>
                          <input
                            type="tel"
                            id="contact_phone"
                            value={formData.contact_phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                            className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">
                      {txt.sectionEquality}
                      <span className="text-sm font-normal text-muted ms-2">({txt.optional})</span>
                    </h3>
                    <motion.div className="grid md:grid-cols-3 gap-6" variants={staggerItem}>
                      <div>
                        <label htmlFor="age_range" className="block text-sm font-semibold text-primary mb-2">
                          {txt.ageRange}
                        </label>
                        <select
                          id="age_range"
                          value={formData.equality_data.age_range}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              equality_data: { ...prev.equality_data, age_range: e.target.value },
                            }))
                          }
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors bg-white"
                        >
                          <option value="">{txt.selectAge}</option>
                          {ageRanges.map((age) => (
                            <option key={age} value={age}>{age}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="gender" className="block text-sm font-semibold text-primary mb-2">
                          {txt.gender}
                        </label>
                        <select
                          id="gender"
                          value={formData.equality_data.gender}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              equality_data: { ...prev.equality_data, gender: e.target.value },
                            }))
                          }
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors bg-white"
                        >
                          <option value="">{txt.selectGender}</option>
                          {genderOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="ethnic_background" className="block text-sm font-semibold text-primary mb-2">
                          {txt.ethnicBackground}
                        </label>
                        <input
                          type="text"
                          id="ethnic_background"
                          value={formData.equality_data.ethnic_background}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              equality_data: { ...prev.equality_data, ethnic_background: e.target.value },
                            }))
                          }
                          className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                        />
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="bg-sand p-6 rounded-lg flex items-start gap-4"
                    variants={staggerItem}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <ShieldCheck size={24} className="text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted leading-relaxed">{txt.privacyNote}</p>
                  </motion.div>

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
