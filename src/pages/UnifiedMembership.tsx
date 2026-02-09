import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Check, X, Shield, Info, ChevronDown, ChevronUp,
  Users, CheckCircle, Heart, Globe2, Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useMemberAuth } from '../contexts/MemberAuthContext';
import Layout from '../components/Layout';
import MembershipPaymentModal from '../components/member/MembershipPaymentModal';
import BusinessSupportSelector from '../components/BusinessSupportSelector';
import { membershipPlans } from '../data/membershipPlans';
import type { MembershipPlan } from '../data/membershipPlans';

const translations = {
  en: {
    title: 'Become a Member',
    subtitle: 'Join our community and access exclusive benefits, services, and events.',
    selectPlan: 'Select Plan',
    popular: 'POPULAR',
    flexible: 'Flexible',
    validInfo: 'All memberships valid from 1 January to 31 December',
    step1: 'Choose Plan',
    step2: 'Complete Details & Pay',
    step3: 'Get Member ID',
    secureNote: 'Secure payment powered by Stripe',
    termsTitle: 'Terms & Conditions',
    termsAgree: 'I have read and agree to the Terms & Conditions',
    termsRequired: 'You must agree to the terms to continue',
    term1: 'All memberships are valid from the date of payment until 31 December of the same year.',
    term2: 'Members must comply with the association\'s governing document and policies.',
    term3: 'Your personal data is protected under our data protection policy and GDPR.',
    term4: 'Membership fees are non-refundable once payment is processed.',
    term5: 'The association reserves the right to revoke membership for breach of conduct.',
    term6: 'Voting rights are only available to eligible membership types at the AGM.',
    compareTypes: 'Compare Types',
    hideComparison: 'Hide Comparison',
    features: 'Features',
    selectBusinessTier: 'Select Business Support Tier',
    businessTierRequired: 'Please select your support tier and amount before continuing.',
    continueWithSelection: 'Continue with Selection',
    whyJoin: 'Why Join Us?',
    whyJoinSubtitle: 'Be part of our community and benefit from our services',
    existingMember: 'Already a member?',
    loginLink: 'Sign in to your account',
    haveQuestions: 'Have Questions?',
  },
  ar: {
    title: 'انضم كعضو',
    subtitle: 'انضم إلى مجتمعنا واحصل على مزايا وخدمات وفعاليات حصرية.',
    selectPlan: 'اختر الخطة',
    popular: 'الأكثر شيوعاً',
    flexible: 'مرن',
    validInfo: 'جميع العضويات صالحة من 1 يناير إلى 31 ديسمبر',
    step1: 'اختر الخطة',
    step2: 'أكمل البيانات والدفع',
    step3: 'احصل على رقم العضوية',
    secureNote: 'دفع آمن مدعوم من Stripe',
    termsTitle: 'الشروط والأحكام',
    termsAgree: 'لقد قرأت وأوافق على الشروط والأحكام',
    termsRequired: 'يجب الموافقة على الشروط للمتابعة',
    term1: 'جميع العضويات صالحة من تاريخ الدفع حتى 31 ديسمبر من نفس السنة.',
    term2: 'يجب على الأعضاء الالتزام بالوثيقة التأسيسية وسياسات الجمعية.',
    term3: 'بياناتك الشخصية محمية بموجب سياسة حماية البيانات وقانون GDPR.',
    term4: 'رسوم العضوية غير قابلة للاسترداد بعد إتمام الدفع.',
    term5: 'تحتفظ الجمعية بحق إلغاء العضوية في حالة مخالفة قواعد السلوك.',
    term6: 'حقوق التصويت متاحة فقط لأنواع العضوية المؤهلة في الاجتماع العام السنوي.',
    compareTypes: 'مقارنة الأنواع',
    hideComparison: 'إخفاء المقارنة',
    features: 'الميزات',
    selectBusinessTier: 'اختر فئة دعم الأعمال',
    businessTierRequired: 'يرجى اختيار فئة الدعم والمبلغ قبل المتابعة.',
    continueWithSelection: 'متابعة بالاختيار',
    whyJoin: 'لماذا تنضم لنا؟',
    whyJoinSubtitle: 'كن جزءاً من مجتمعنا واستفد من خدماتنا',
    existingMember: 'عضو بالفعل؟',
    loginLink: 'سجل دخولك',
    haveQuestions: 'هل لديك أسئلة؟',
  },
};

const benefits = [
  { icon: Users, title: 'Community Access', titleAr: 'الوصول للمجتمع', desc: 'Access all programmes and services', descAr: 'الوصول لجميع البرامج والخدمات' },
  { icon: CheckCircle, title: 'Priority Booking', titleAr: 'حجز ذو أولوية', desc: 'Book advisory services first', descAr: 'احجز الخدمات الاستشارية أولاً' },
  { icon: Heart, title: 'Special Discounts', titleAr: 'خصومات خاصة', desc: 'Member rates on events', descAr: 'أسعار خاصة على الفعاليات' },
  { icon: Globe2, title: 'Partner Offers', titleAr: 'عروض الشركاء', desc: 'Exclusive partner discounts', descAr: 'خصومات حصرية من الشركاء' },
  { icon: Info, title: 'Stay Informed', titleAr: 'ابق على اطلاع', desc: 'Regular updates & newsletters', descAr: 'تحديثات ونشرات منتظمة' },
  { icon: Building2, title: 'Voice & Vote', titleAr: 'صوتك ورأيك', desc: 'Participate in AGM meetings', descAr: 'شارك في الاجتماعات العامة' },
];

export default function UnifiedMembership() {
  const { language } = useLanguage();
  const { user, isPaidMember } = useMemberAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  const t = translations[language];

  const [selectedType, setSelectedType] = useState<MembershipPlan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStepFromModal, setActiveStepFromModal] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [businessSupport, setBusinessSupport] = useState<{ tier: string; amount: number; frequency: string } | null>(null);
  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [businessSelectorError, setBusinessSelectorError] = useState(false);

  useEffect(() => {
    if (isPaidMember) {
      navigate('/member/dashboard', { replace: true });
    }
  }, [isPaidMember, navigate]);

  useEffect(() => {
    if (!user || isPaidMember || modalOpen) return;

    const saved = sessionStorage.getItem('pendingMembershipSelection');
    if (!saved) return;

    try {
      const { planId, businessSupport: savedBS, timestamp } = JSON.parse(saved);

      if (Date.now() - timestamp > 30 * 60 * 1000) {
        sessionStorage.removeItem('pendingMembershipSelection');
        return;
      }

      const plan = membershipPlans.find(p => p.id === planId);
      if (!plan) {
        sessionStorage.removeItem('pendingMembershipSelection');
        return;
      }

      sessionStorage.removeItem('pendingMembershipSelection');
      setSelectedType(plan);
      setTermsAccepted(true);
      if (savedBS) {
        setBusinessSupport(savedBS);
      }
      setModalOpen(true);
    } catch {
      sessionStorage.removeItem('pendingMembershipSelection');
    }
  }, [user, isPaidMember]);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '';

  const handleSelect = (type: MembershipPlan) => {
    if (!termsAccepted) {
      setShowTermsError(true);
      document.getElementById('terms-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    sessionStorage.setItem('pendingMembershipSelection', JSON.stringify({
      planId: type.id,
      businessSupport: null,
      timestamp: Date.now(),
    }));

    if (type.id === 'business_support') {
      setSelectedType(type);
      setShowBusinessSelector(true);
      setBusinessSelectorError(false);
      document.getElementById('business-selector')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setSelectedType(type);
    setModalOpen(true);
  };

  const handleBusinessContinue = () => {
    if (!businessSupport || businessSupport.amount <= 0) {
      setBusinessSelectorError(true);
      return;
    }
    sessionStorage.setItem('pendingMembershipSelection', JSON.stringify({
      planId: 'business_support',
      businessSupport,
      timestamp: Date.now(),
    }));
    setModalOpen(true);
  };

  const currentStep = modalOpen ? activeStepFromModal : 1;
  const steps = [t.step1, t.step2, t.step3];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-sand/30 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">

          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {displayName && (
              <p className="text-lg text-emerald-700 font-medium mb-2">
                {isRTL ? `مرحباً، ${displayName}` : `Welcome, ${displayName}`}
              </p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">{t.title}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-3 sm:gap-6 mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                    i + 1 <= currentStep ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {i + 1 < currentStep ? <Check size={18} /> : i + 1}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-medium text-center whitespace-nowrap transition-colors ${
                    i + 1 <= currentStep ? 'text-emerald-700' : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className={`text-gray-300 flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} size={16} />
                )}
              </div>
            ))}
          </motion.div>

          <motion.div className="text-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
            >
              {showComparison ? t.hideComparison : t.compareTypes}
              {showComparison ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </motion.div>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="max-w-6xl mx-auto mb-12 overflow-x-auto"
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className={`${isRTL ? 'text-right' : 'text-left'} py-4 px-4 text-primary font-bold`}>{t.features}</th>
                        {membershipPlans.map(type => (
                          <th key={type.id} className="text-center py-4 px-4">
                            <div className="font-bold text-primary">{language === 'ar' ? type.nameAr : type.nameEn}</div>
                            <div className="text-emerald-600 font-bold text-xl mt-1">
                              {type.id === 'business_support'
                                ? (language === 'ar' ? 'مرن' : 'Flexible')
                                : `${type.priceLabel}${type.period[language]}`}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {membershipPlans[0].features.map((feature, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className={`py-3 px-4 text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {language === 'ar' ? feature.ar : feature.en}
                          </td>
                          {membershipPlans.map(type => (
                            <td key={type.id} className="text-center py-3 px-4">
                              {type.features[idx]?.included
                                ? <Check className="inline text-emerald-600" size={20} />
                                : <X className="inline text-gray-300" size={20} />}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {membershipPlans.map((type) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="relative"
                >
                  {type.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        {t.popular}
                      </span>
                    </div>
                  )}
                  <div className={`h-full flex flex-col bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                    type.popular ? 'border-emerald-500 shadow-lg' : 'border-gray-200 hover:border-emerald-300 hover:shadow-lg'
                  }`}>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        type.popular ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon size={28} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                        {language === 'ar' ? type.nameAr : type.nameEn}
                      </h3>
                      <div className="text-center mb-3">
                        {type.id === 'business_support' ? (
                          <span className="text-2xl font-bold text-emerald-600">{t.flexible}</span>
                        ) : (
                          <>
                            <span className="text-3xl font-bold text-emerald-600">{type.priceLabel}</span>
                            <span className="text-gray-500 text-sm">{type.period[language]}</span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm text-center mb-5">
                        {language === 'ar' ? type.descAr : type.descEn}
                      </p>
                      <div className="space-y-2 flex-1">
                        {type.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {feature.included
                              ? <Check size={16} className="text-emerald-500 flex-shrink-0" />
                              : <X size={16} className="text-gray-300 flex-shrink-0" />}
                            <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                              {language === 'ar' ? feature.ar : feature.en}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <button
                        onClick={() => handleSelect(type)}
                        className={`w-full py-3 rounded-lg font-semibold transition-all text-sm ${
                          type.popular
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            : 'bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-700'
                        }`}
                      >
                        {t.selectPlan}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <AnimatePresence>
            {showBusinessSelector && selectedType?.id === 'business_support' && (
              <motion.div
                id="business-selector"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto mt-10"
              >
                <div className={`bg-white rounded-2xl shadow-lg border-2 p-6 ${
                  businessSelectorError ? 'border-red-300' : 'border-emerald-200'
                }`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{t.selectBusinessTier}</h3>
                  <BusinessSupportSelector
                    onSelect={(data) => {
                      setBusinessSupport(data);
                      setBusinessSelectorError(false);
                    }}
                  />
                  {businessSelectorError && (
                    <p className="text-sm text-red-600 mt-3 text-center">{t.businessTierRequired}</p>
                  )}
                  <button
                    onClick={handleBusinessContinue}
                    disabled={!businessSupport || businessSupport.amount <= 0}
                    className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {t.continueWithSelection}
                    <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            id="terms-section"
            className="max-w-3xl mx-auto mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-colors ${
              showTermsError && !termsAccepted ? 'border-red-300' : 'border-gray-200'
            }`}>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-emerald-600" />
                {t.termsTitle}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 max-h-48 overflow-y-auto">
                <ul className="space-y-2.5 text-sm text-gray-700">
                  {[t.term1, t.term2, t.term3, t.term4, t.term5, t.term6].map((term, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-0.5">{i + 1}.</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (e.target.checked) setShowTermsError(false);
                  }}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">
                  {t.termsAgree}
                </span>
              </label>
              {showTermsError && !termsAccepted && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1.5">
                  <Info size={14} />
                  {t.termsRequired}
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            className="text-center mt-10 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-gray-500">{t.validInfo}</p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield size={14} />
              <span>{t.secureNote}</span>
            </div>
          </motion.div>

          <section className="mt-20">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">{t.whyJoin}</h2>
              <p className="text-lg text-gray-600">{t.whyJoinSubtitle}</p>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all hover:border-emerald-200"
                  >
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                      <Icon size={24} className="text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {language === 'ar' ? benefit.titleAr : benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {language === 'ar' ? benefit.descAr : benefit.desc}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          <motion.div
            className="max-w-xl mx-auto mt-16 text-center space-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-600">
              {t.existingMember}{' '}
              <a href="/member/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                {t.loginLink}
              </a>
            </p>
            <a
              href="/contact"
              className="inline-block bg-white hover:bg-gray-50 text-primary border-2 border-gray-200 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {t.haveQuestions}
            </a>
          </motion.div>
        </div>
      </div>

      {selectedType && (
        <MembershipPaymentModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setActiveStepFromModal(1);
            sessionStorage.removeItem('pendingMembershipSelection');
          }}
          membershipType={selectedType}
          onStepChange={setActiveStepFromModal}
          preSelectedBusinessSupport={
            selectedType.id === 'business_support' ? businessSupport : undefined
          }
        />
      )}
    </Layout>
  );
}
