import { motion } from 'framer-motion';
import { Users, Heart, Globe2, Building2, ArrowRight, Check, X, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Layout from '../../components/Layout';

const membershipTypes = [
  {
    id: 'individual',
    icon: Users,
    nameEn: 'Individual',
    nameAr: 'فردية',
    price: 20,
    priceLabel: '£20',
    period: { en: '/year', ar: '/سنوياً' },
    descEn: 'For Yemenis in Birmingham, 18+',
    descAr: 'لليمنيين في برمنغهام، 18+',
    popular: true,
    features: [
      { en: 'Member rates on services', ar: 'أسعار خاصة للخدمات', included: true },
      { en: 'Priority booking', ar: 'حجز ذو أولوية', included: true },
      { en: 'Event discounts', ar: 'خصومات الفعاليات', included: true },
      { en: 'Partner offers', ar: 'عروض الشركاء', included: true },
      { en: 'Voting rights', ar: 'حقوق التصويت', included: true },
      { en: 'Family coverage', ar: 'تغطية العائلة', included: false },
    ],
  },
  {
    id: 'family',
    icon: Heart,
    nameEn: 'Family',
    nameAr: 'عائلية',
    price: 30,
    priceLabel: '£30',
    period: { en: '/year', ar: '/سنوياً' },
    descEn: 'Parents & children under 18',
    descAr: 'الوالدين والأطفال تحت 18',
    popular: false,
    features: [
      { en: 'Member rates on services', ar: 'أسعار خاصة للخدمات', included: true },
      { en: 'Priority booking', ar: 'حجز ذو أولوية', included: true },
      { en: 'Event discounts', ar: 'خصومات الفعاليات', included: true },
      { en: 'Partner offers', ar: 'عروض الشركاء', included: true },
      { en: 'Voting rights', ar: 'حقوق التصويت', included: true },
      { en: 'Family coverage', ar: 'تغطية العائلة', included: true },
    ],
  },
  {
    id: 'associate',
    icon: Globe2,
    nameEn: 'Associate',
    nameAr: 'منتسب',
    price: 20,
    priceLabel: '£20',
    period: { en: '/year', ar: '/سنوياً' },
    descEn: 'Non-Yemenis & Yemenis outside Birmingham',
    descAr: 'غير اليمنيين واليمنيين خارج برمنغهام',
    popular: false,
    features: [
      { en: 'Member rates on services', ar: 'أسعار خاصة للخدمات', included: true },
      { en: 'Priority booking', ar: 'حجز ذو أولوية', included: false },
      { en: 'Event discounts', ar: 'خصومات الفعاليات', included: true },
      { en: 'Partner offers', ar: 'عروض الشركاء', included: true },
      { en: 'Voting rights', ar: 'حقوق التصويت', included: false },
      { en: 'Family coverage', ar: 'تغطية العائلة', included: false },
    ],
  },
  {
    id: 'business_support',
    icon: Building2,
    nameEn: 'Business Support',
    nameAr: 'دعم الأعمال',
    price: 0,
    priceLabel: '',
    period: { en: '', ar: '' },
    descEn: 'Support our community work',
    descAr: 'ادعم عملنا المجتمعي',
    popular: false,
    features: [
      { en: 'Business recognition', ar: 'تقدير الأعمال', included: true },
      { en: 'Logo on website', ar: 'الشعار على الموقع', included: true },
      { en: 'Event sponsorship', ar: 'رعاية الفعاليات', included: true },
      { en: 'Priority booking', ar: 'حجز ذو أولوية', included: false },
      { en: 'Voting rights', ar: 'حقوق التصويت', included: false },
      { en: 'Family coverage', ar: 'تغطية العائلة', included: false },
    ],
  },
];

const translations = {
  en: {
    title: 'Choose Your Membership',
    subtitle: 'Welcome! To complete your registration, please select a membership plan that suits you.',
    selectPlan: 'Select Plan',
    popular: 'POPULAR',
    flexible: 'Flexible',
    validInfo: 'All memberships valid from 1 January to 31 December',
    step1: 'Choose Plan',
    step2: 'Complete Details',
    step3: 'Make Payment',
    step4: 'Get Member ID',
    secureNote: 'Secure payment powered by Stripe',
  },
  ar: {
    title: 'اختر عضويتك',
    subtitle: 'مرحباً! لإكمال التسجيل، يرجى اختيار خطة العضوية المناسبة لك.',
    selectPlan: 'اختر الخطة',
    popular: 'الأكثر شيوعاً',
    flexible: 'مرن',
    validInfo: 'جميع العضويات صالحة من 1 يناير إلى 31 ديسمبر',
    step1: 'اختر الخطة',
    step2: 'أكمل البيانات',
    step3: 'ادفع الرسوم',
    step4: 'احصل على رقم العضوية',
    secureNote: 'دفع آمن مدعوم من Stripe',
  },
};

export default function ChooseMembership() {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  const t = translations[language];

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '';

  const handleSelect = (typeId: string) => {
    navigate(`/member/membership/apply?type=${typeId}&oauth=true`);
  };

  const steps = [t.step1, t.step2, t.step3, t.step4];

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
            className="flex items-center justify-center gap-2 sm:gap-4 mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-gray-600 text-center whitespace-nowrap">
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
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {membershipTypes.map((type) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
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
                    type.popular
                      ? 'border-emerald-500 shadow-lg'
                      : 'border-gray-200 hover:border-emerald-300 hover:shadow-lg'
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
                          <span className="text-2xl font-bold text-emerald-600">
                            {language === 'ar' ? 'مرن' : 'Flexible'}
                          </span>
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
                            {feature.included ? (
                              <Check size={16} className="text-emerald-500 flex-shrink-0" />
                            ) : (
                              <X size={16} className="text-gray-300 flex-shrink-0" />
                            )}
                            <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                              {language === 'ar' ? feature.ar : feature.en}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <button
                        onClick={() => handleSelect(type.id)}
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
        </div>
      </div>
    </Layout>
  );
}
