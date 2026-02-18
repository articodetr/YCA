import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, CheckCircle, Star, ChevronDown, ChevronRight, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { fadeInUp } from '../../lib/animations';

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
  service_type: string;
  service_date: string;
  ratings: RatingsData;
  what_went_well: string;
  what_to_improve: string;
  other_comments: string;
  would_recommend: string;
  contact_requested: boolean | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  equality_data: EqualityData;
}

const initialFormData: FormData = {
  service_type: '',
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
  would_recommend: '',
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

const ratingToStars: Record<RatingValue, number> = {
  very_dissatisfied: 1,
  dissatisfied: 2,
  neutral: 3,
  satisfied: 4,
  very_satisfied: 5,
};

const starsToRating: Record<number, RatingValue> = {
  1: 'very_dissatisfied',
  2: 'dissatisfied',
  3: 'neutral',
  4: 'satisfied',
  5: 'very_satisfied',
};

export default function ServiceFeedback() {
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hoveredRating, setHoveredRating] = useState<Record<string, number>>({});
  const [showEquality, setShowEquality] = useState(false);

  const txt = {
    title: isAr ? 'التقييم والملاحظات' : 'Service Feedback',
    breadcrumbContact: isAr ? 'اتصل بنا' : 'Contact',
    breadcrumbFeedback: isAr ? 'التقييم والملاحظات' : 'Service Feedback',
    subtitle: isAr
      ? 'ملاحظاتكم تساعدنا على تحسين خدماتنا. يمكن تعبئة النموذج بشكل مجهول.'
      : 'Your feedback helps us improve. This form can be completed anonymously.',
    serviceLabel: isAr ? 'الخدمة / النشاط' : 'Service / Activity',
    selectService: isAr ? 'اختر الخدمة' : 'Select a service',
    serviceAdvisory: isAr ? 'المكتب الاستشاري' : 'Advisory Office',
    serviceLegal: isAr ? 'الخدمات القانونية' : 'Legal Services',
    serviceEvents: isAr ? 'الأنشطة والفعاليات' : 'Events & Activities',
    serviceVolunteering: isAr ? 'التطوع' : 'Volunteering',
    serviceOther: isAr ? 'أخرى' : 'Other',
    serviceDateLabel: isAr ? 'تاريخ الخدمة' : 'Date of service',
    optional: isAr ? 'اختياري' : 'Optional',
    rateExperience: isAr ? 'قيّم تجربتك' : 'Rate Your Experience',
    ratingAccess: isAr ? 'سهولة الوصول' : 'Accessibility',
    ratingCommunication: isAr ? 'التواصل والوضوح' : 'Communication',
    ratingStaff: isAr ? 'تعامل الفريق' : 'Staff Support',
    ratingTimeliness: isAr ? 'الالتزام بالوقت' : 'Timeliness',
    ratingOverall: isAr ? 'التقييم العام' : 'Overall',
    commentsLabel: isAr ? 'شاركنا ملاحظاتك' : 'Share Your Thoughts',
    whatWentWell: isAr ? 'ما الذي أعجبك؟' : 'What went well?',
    whatToImprove: isAr ? 'ما الذي يمكن تحسينه؟' : 'What could improve?',
    otherComments: isAr ? 'ملاحظات أخرى' : 'Other comments',
    recommendLabel: isAr ? 'هل توصي بخدماتنا؟' : 'Would you recommend us?',
    yes: isAr ? 'نعم' : 'Yes',
    no: isAr ? 'لا' : 'No',
    notSure: isAr ? 'غير متأكد' : 'Not sure',
    contactLabel: isAr ? 'هل تود أن نتواصل معك؟' : 'Want us to follow up?',
    contactName: isAr ? 'الاسم' : 'Name',
    contactEmail: isAr ? 'البريد الإلكتروني' : 'Email',
    contactPhone: isAr ? 'الهاتف' : 'Phone',
    namePlaceholder: isAr ? 'اسمك' : 'Your name',
    emailPlaceholder: isAr ? 'بريدك الإلكتروني' : 'Your email',
    phonePlaceholder: isAr ? 'رقم هاتفك' : 'Your phone number',
    equalityLabel: isAr ? 'بيانات المساواة' : 'Equality Monitoring',
    equalityDesc: isAr ? 'اختياري - يساعدنا على ضمان تقديم خدمات عادلة' : 'Optional - helps us ensure fair service delivery',
    ageRange: isAr ? 'الفئة العمرية' : 'Age range',
    selectAge: isAr ? 'اختر' : 'Select',
    gender: isAr ? 'الجنس' : 'Gender',
    selectGender: isAr ? 'اختر' : 'Select',
    ethnicBackground: isAr ? 'الخلفية العرقية' : 'Ethnic background',
    ethnicPlaceholder: isAr ? 'أدخل خلفيتك العرقية' : 'Enter your ethnic background',
    preferNotToSay: isAr ? 'أفضل عدم الإجابة' : 'Prefer not to say',
    genderMale: isAr ? 'ذكر' : 'Male',
    genderFemale: isAr ? 'أنثى' : 'Female',
    genderNonBinary: isAr ? 'غير ثنائي' : 'Non-binary',
    genderOther: isAr ? 'أخرى' : 'Other',
    privacyNote: isAr
      ? 'بياناتك محمية وتُستخدم فقط لتحسين خدماتنا.'
      : 'Your data is protected and used only to improve our services.',
    submit: isAr ? 'إرسال التقييم' : 'Submit Feedback',
    submitting: isAr ? 'جاري الإرسال...' : 'Submitting...',
    successTitle: isAr ? 'شكراً لتقييمك!' : 'Thank You for Your Feedback!',
    successMessage: isAr
      ? 'ملاحظاتكم ستساعدنا على تحسين خدماتنا المجتمعية.'
      : 'Your feedback will help us improve our community services.',
    submitAnother: isAr ? 'تقديم تقييم آخر' : 'Submit Another',
    errorTitle: isAr ? 'فشل في الإرسال' : 'Submission Failed',
    errorMessage: isAr
      ? 'حدث خطأ. يرجى المحاولة مرة أخرى.'
      : 'Something went wrong. Please try again.',
  };

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

  const ageRanges = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+', txt.preferNotToSay];

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
          service_type: formData.service_type,
          service_date: formData.service_date || null,
          ratings: formData.ratings,
          what_went_well: formData.what_went_well || null,
          what_to_improve: formData.what_to_improve || null,
          other_comments: formData.other_comments || null,
          would_recommend: formData.would_recommend || null,
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

  const getStarCount = (key: keyof RatingsData): number => {
    const val = formData.ratings[key];
    return val ? ratingToStars[val] : 0;
  };

  const setStarRating = (key: keyof RatingsData, stars: number) => {
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [key]: starsToRating[stars] },
    }));
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

              <motion.button
                onClick={() => setSubmitStatus('idle')}
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
          { label: txt.breadcrumbFeedback },
        ]}
        pageKey="service-feedback"
      />

      <section className="py-16 md:py-24 bg-gradient-to-b from-sand to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <motion.p
              className="text-center text-lg text-muted mb-10 leading-relaxed"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              {txt.subtitle}
            </motion.p>

            <AnimatePresence>
              {submitStatus === 'error' && (
                <motion.div
                  className="bg-red-50 border border-red-300 text-red-800 px-5 py-4 rounded-xl mb-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p className="font-semibold text-base">{txt.errorTitle}</p>
                  <p className="text-base text-red-700">{txt.errorMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="service" className="block text-base font-semibold text-primary mb-2">
                    {txt.serviceLabel} <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="service"
                    value={formData.service_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none appearance-none"
                  >
                    <option value="">{txt.selectService}</option>
                    {serviceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="service_date" className="block text-base font-semibold text-primary mb-2">
                    {txt.serviceDateLabel}
                    <span className="text-sm font-normal text-muted ms-2">({txt.optional})</span>
                  </label>
                  <input
                    type="date"
                    id="service_date"
                    value={formData.service_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_date: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-base font-semibold text-primary mb-6 flex items-center gap-2">
                  <Star size={18} className="text-amber-400" />
                  {txt.rateExperience} <span className="text-red-400">*</span>
                </h3>
                <div className="space-y-5">
                  {ratingRows.map((row) => {
                    const currentStars = getStarCount(row.key);
                    const hovered = hoveredRating[row.key] || 0;
                    return (
                      <div key={row.key} className="flex items-center justify-between gap-4">
                        <span className="text-base text-muted font-medium min-w-[120px]">{row.label}</span>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const filled = hovered ? star <= hovered : star <= currentStars;
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setStarRating(row.key, star)}
                                onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [row.key]: star }))}
                                onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [row.key]: 0 }))}
                                className="p-0.5 transition-transform hover:scale-110"
                              >
                                <Star
                                  size={26}
                                  className={`transition-colors duration-150 ${
                                    filled ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-primary mb-4">
                  {txt.commentsLabel}
                  <span className="text-sm font-normal text-muted ms-2">({txt.optional})</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="what_went_well" className="block text-sm font-medium text-muted mb-2">
                      {txt.whatWentWell}
                    </label>
                    <textarea
                      id="what_went_well"
                      value={formData.what_went_well}
                      onChange={(e) => setFormData(prev => ({ ...prev, what_went_well: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="what_to_improve" className="block text-sm font-medium text-muted mb-2">
                      {txt.whatToImprove}
                    </label>
                    <textarea
                      id="what_to_improve"
                      value={formData.what_to_improve}
                      onChange={(e) => setFormData(prev => ({ ...prev, what_to_improve: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="other_comments" className="block text-sm font-medium text-muted mb-2">
                      {txt.otherComments}
                    </label>
                    <textarea
                      id="other_comments"
                      value={formData.other_comments}
                      onChange={(e) => setFormData(prev => ({ ...prev, other_comments: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-primary mb-3">
                  {txt.recommendLabel} <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'yes', label: txt.yes },
                    { value: 'no', label: txt.no },
                    { value: 'not_sure', label: txt.notSure },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, would_recommend: opt.value }))}
                      className={`px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                        formData.would_recommend === opt.value
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-sand text-muted hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <input type="hidden" name="would_recommend" value={formData.would_recommend} required />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-primary mb-3">{txt.contactLabel}</label>
                <div className="flex gap-2 mb-4">
                  {[
                    { val: true, label: txt.yes },
                    { val: false, label: txt.no },
                  ].map((opt) => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          contact_requested: opt.val,
                          ...(opt.val === false ? { contact_name: '', contact_email: '', contact_phone: '' } : {}),
                        }))
                      }
                      className={`px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
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
                      className="grid sm:grid-cols-3 gap-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div>
                        <label htmlFor="contact_name" className="block text-sm font-medium text-muted mb-2">{txt.contactName}</label>
                        <input
                          type="text"
                          id="contact_name"
                          value={formData.contact_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                          placeholder={txt.namePlaceholder}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact_email" className="block text-sm font-medium text-muted mb-2">{txt.contactEmail}</label>
                        <input
                          type="email"
                          id="contact_email"
                          value={formData.contact_email}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                          placeholder={txt.emailPlaceholder}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact_phone" className="block text-sm font-medium text-muted mb-2">{txt.contactPhone}</label>
                        <input
                          type="tel"
                          id="contact_phone"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                          placeholder={txt.phonePlaceholder}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowEquality(!showEquality)}
                  className="w-full flex items-center justify-between px-5 py-4 text-base font-medium text-muted hover:bg-sand/50 transition-colors"
                >
                  <div>
                    <span>{txt.equalityLabel}</span>
                    <span className="text-sm text-muted/60 ms-2">- {txt.equalityDesc}</span>
                  </div>
                  <ChevronDown size={20} className={`transition-transform duration-200 ${showEquality ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showEquality && (
                    <motion.div
                      className="px-5 pb-5"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label htmlFor="age_range" className="block text-sm font-medium text-muted mb-2">{txt.ageRange}</label>
                          <select
                            id="age_range"
                            value={formData.equality_data.age_range}
                            onChange={(e) =>
                              setFormData(prev => ({
                                ...prev,
                                equality_data: { ...prev.equality_data, age_range: e.target.value },
                              }))
                            }
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none appearance-none"
                          >
                            <option value="">{txt.selectAge}</option>
                            {ageRanges.map((age) => (
                              <option key={age} value={age}>{age}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="gender" className="block text-sm font-medium text-muted mb-2">{txt.gender}</label>
                          <select
                            id="gender"
                            value={formData.equality_data.gender}
                            onChange={(e) =>
                              setFormData(prev => ({
                                ...prev,
                                equality_data: { ...prev.equality_data, gender: e.target.value },
                              }))
                            }
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none appearance-none"
                          >
                            <option value="">{txt.selectGender}</option>
                            {genderOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="ethnic_background" className="block text-sm font-medium text-muted mb-2">{txt.ethnicBackground}</label>
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
                            placeholder={txt.ethnicPlaceholder}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/30 transition-all outline-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-start gap-3 px-1">
                <ShieldCheck size={18} className="text-muted/50 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted/70 leading-relaxed">{txt.privacyNote}</p>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2.5 hover:bg-secondary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20"
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
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
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  );
}
