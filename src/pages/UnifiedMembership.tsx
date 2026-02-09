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
import PageHeader from '../components/PageHeader';
import MembershipPaymentModal from '../components/member/MembershipPaymentModal';
import BusinessSupportSelector from '../components/BusinessSupportSelector';
import { membershipPlans } from '../data/membershipPlans';
import type { MembershipPlan } from '../data/membershipPlans';
import { fadeInUp, staggerContainer, staggerItem } from '../lib/animations';

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
      <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <PageHeader
          title={t.title}
          description={t.subtitle}
          pageKey="membership"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {displayName && (
            <motion.p
              className="text-center text-base text-accent font-medium mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {isRTL ? `مرحباً، ${displayName}` : `Welcome, ${displayName}`}
            </motion.p>
          )}

          <motion.div
            className="flex items-center justify-center gap-4 sm:gap-8 mb-16"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 sm:gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                    i + 1 <= currentStep
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-muted'
                  }`}>
                    {i + 1 < currentStep ? <Check size={18} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium text-center whitespace-nowrap transition-colors ${
                    i + 1 <= currentStep ? 'text-accent' : 'text-muted'
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

          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-semibold transition-colors"
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
                className="max-w-6xl mx-auto mb-14 overflow-x-auto"
              >
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className={`${isRTL ? 'text-right' : 'text-left'} py-4 px-4 text-primary font-bold`}>{t.features}</th>
                        {membershipPlans.map(type => (
                          <th key={type.id} className="text-center py-4 px-4">
                            <div className="font-bold text-primary">{language === 'ar' ? type.nameAr : type.nameEn}</div>
                            <div className="text-accent font-bold text-xl mt-1">
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
                        <tr key={idx} className="border-b border-gray-50">
                          <td className={`py-3 px-4 text-muted ${isRTL ? 'text-right' : 'text-left'}`}>
                            {language === 'ar' ? feature.ar : feature.en}
                          </td>
                          {membershipPlans.map(type => (
                            <td key={type.id} className="text-center py-3 px-4">
                              {type.features[idx]?.included
                                ? <CheckCircle className="inline text-accent" size={20} />
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
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {membershipPlans.map((type) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.id}
                  variants={staggerItem}
                  className="relative"
                >
                  {type.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-accent text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide">
                        {t.popular}
                      </span>
                    </div>
                  )}
                  <div className={`h-full flex flex-col bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    type.popular
                      ? 'border-accent shadow-[0_0_24px_-6px_rgba(13,148,136,0.15)]'
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                  }`}>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5 ${
                        type.popular ? 'bg-accent/10 text-accent' : 'bg-gray-50 text-muted'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-primary text-center mb-1">
                        {language === 'ar' ? type.nameAr : type.nameEn}
                      </h3>
                      <div className="text-center mb-4">
                        {type.id === 'business_support' ? (
                          <span className="text-2xl font-bold text-primary">{t.flexible}</span>
                        ) : (
                          <>
                            <span className="text-3xl font-bold text-primary">{type.priceLabel}</span>
                            <span className="text-muted text-sm ml-0.5">{type.period[language]}</span>
                          </>
                        )}
                      </div>
                      <p className="text-muted text-sm text-center mb-6">
                        {language === 'ar' ? type.descAr : type.descEn}
                      </p>
                      <div className="space-y-2.5 flex-1">
                        {type.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-sm">
                            {feature.included
                              ? <CheckCircle size={16} className="text-accent flex-shrink-0" />
                              : <X size={16} className="text-gray-300 flex-shrink-0" />}
                            <span className={feature.included ? 'text-primary' : 'text-gray-400'}>
                              {language === 'ar' ? feature.ar : feature.en}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <button
                        onClick={() => handleSelect(type)}
                        className={`w-full py-3 rounded-xl font-semibold transition-all text-sm ${
                          type.popular
                            ? 'bg-accent hover:bg-accent/90 text-white'
                            : 'border border-gray-200 hover:border-accent hover:text-accent text-primary'
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
                className="max-w-2xl mx-auto mt-12"
              >
                <div className={`bg-white rounded-2xl border p-8 ${
                  businessSelectorError ? 'border-red-300' : 'border-gray-100'
                }`}>
                  <h3 className="text-xl font-bold text-primary mb-6 text-center">{t.selectBusinessTier}</h3>
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
                    className="w-full mt-6 bg-accent hover:bg-accent/90 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            className="max-w-3xl mx-auto mt-14"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <div className={`bg-gray-50 rounded-2xl p-6 transition-colors ${
              showTermsError && !termsAccepted ? 'ring-2 ring-red-300' : ''
            }`}>
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <Shield size={20} className="text-accent" />
                {t.termsTitle}
              </h3>
              <div className="bg-white rounded-xl p-4 mb-5 max-h-48 overflow-y-auto border border-gray-100">
                <ul className="space-y-2.5 text-sm text-muted">
                  {[t.term1, t.term2, t.term3, t.term4, t.term5, t.term6].map((term, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-accent font-bold mt-0.5">{i + 1}.</span>
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
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer"
                />
                <span className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
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
            transition={{ delay: 0.4 }}
          >
            <p className="text-sm text-muted">{t.validInfo}</p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Shield size={14} />
              <span>{t.secureNote}</span>
            </div>
          </motion.div>

          <section className="mt-24">
            <motion.div
              className="text-center mb-14"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">{t.whyJoin}</h2>
              <p className="text-lg text-muted">{t.whyJoinSubtitle}</p>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {benefits.map((benefit, index) => {
                const BenefitIcon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    variants={staggerItem}
                    className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
                  >
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                      <BenefitIcon size={24} className="text-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2">
                      {language === 'ar' ? benefit.titleAr : benefit.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">
                      {language === 'ar' ? benefit.descAr : benefit.desc}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          <motion.div
            className="max-w-xl mx-auto mt-20 text-center space-y-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-muted">
              {t.existingMember}{' '}
              <a href="/member/login" className="text-accent hover:text-accent/80 font-semibold transition-colors">
                {t.loginLink}
              </a>
            </p>
            <a
              href="/contact"
              className="inline-block border border-gray-200 hover:border-accent hover:text-accent text-primary px-8 py-3 rounded-xl font-semibold transition-colors"
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
