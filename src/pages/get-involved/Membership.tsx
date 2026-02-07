import { Users, CheckCircle, Building2, Globe2, Heart, Info, ArrowRight, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem } from '../../lib/animations';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

export default function Membership() {
  const { t, language, isRTL } = useLanguage();
  const [selectedType, setSelectedType] = useState<'individual' | 'family' | 'associate' | 'business_support'>('individual');
  const [showComparison, setShowComparison] = useState(false);

  const membershipTypes = [
    {
      id: 'individual',
      icon: Users,
      nameEn: 'Individual',
      nameAr: 'فردية',
      price: '£20',
      period: language === 'ar' ? '/سنوياً' : '/year',
      shortDescEn: 'For Yemenis in Birmingham, 18+',
      shortDescAr: 'لليمنيين في برمنغهام، 18+',
      popular: true,
      features: [
        { en: 'Member rates on services', ar: 'أسعار خاصة للخدمات', included: true },
        { en: 'Priority booking', ar: 'حجز ذو أولوية', included: true },
        { en: 'Event discounts', ar: 'خصومات الفعاليات', included: true },
        { en: 'Partner offers', ar: 'عروض الشركاء', included: true },
        { en: 'Voting rights', ar: 'حقوق التصويت', included: true },
        { en: 'Family coverage', ar: 'تغطية العائلة', included: false }
      ]
    },
    {
      id: 'family',
      icon: Heart,
      nameEn: 'Family',
      nameAr: 'عائلية',
      price: '£30',
      period: language === 'ar' ? '/سنوياً' : '/year',
      shortDescEn: 'Parents & children under 18',
      shortDescAr: 'الوالدين والأطفال تحت 18',
      popular: false,
      features: [
        { en: 'Member rates on services', ar: 'أسعار خاصة للخدمات', included: true },
        { en: 'Priority booking', ar: 'حجز ذو أولوية', included: true },
        { en: 'Event discounts', ar: 'خصومات الفعاليات', included: true },
        { en: 'Partner offers', ar: 'عروض الشركاء', included: true },
        { en: 'Voting rights', ar: 'حقوق التصويت', included: true },
        { en: 'Family coverage', ar: 'تغطية العائلة', included: true }
      ]
    },
    {
      id: 'associate',
      icon: Globe2,
      nameEn: 'Associate',
      nameAr: 'منتسب',
      price: '£20',
      period: language === 'ar' ? '/سنوياً' : '/year',
      shortDescEn: 'Non-Yemenis & Yemenis outside Birmingham',
      shortDescAr: 'غير اليمنيين واليمنيين خارج برمنغهام',
      popular: false,
      features: [
        { en: 'Member rates on services', ar: 'أسعار خاصة للخدمات', included: true },
        { en: 'Priority booking', ar: 'حجز ذو أولوية', included: false },
        { en: 'Event discounts', ar: 'خصومات الفعاليات', included: true },
        { en: 'Partner offers', ar: 'عروض الشركاء', included: true },
        { en: 'Voting rights', ar: 'حقوق التصويت', included: false },
        { en: 'Family coverage', ar: 'تغطية العائلة', included: false }
      ]
    },
    {
      id: 'business_support',
      icon: Building2,
      nameEn: 'Business Support',
      nameAr: 'دعم الأعمال',
      price: language === 'ar' ? 'مرن' : 'Flexible',
      period: '',
      shortDescEn: 'Support our community work',
      shortDescAr: 'ادعم عملنا المجتمعي',
      popular: false,
      features: [
        { en: 'Member rates on services', ar: 'أسعار خاصة للخدمات', included: false },
        { en: 'Priority booking', ar: 'حجز ذو أولوية', included: false },
        { en: 'Event discounts', ar: 'خصومات الفعاليات', included: false },
        { en: 'Partner offers', ar: 'عروض الشركاء', included: false },
        { en: 'Voting rights', ar: 'حقوق التصويت', included: false },
        { en: 'Business recognition', ar: 'تقدير الأعمال', included: true }
      ]
    }
  ];

  const selectedMembership = membershipTypes.find(m => m.id === selectedType) || membershipTypes[0];

  const processSteps = [
    { en: 'Choose Type', ar: 'اختر النوع' },
    { en: 'Fill Form', ar: 'املأ النموذج' },
    { en: 'Pay Fee', ar: 'ادفع الرسوم' },
    { en: 'Get Access', ar: 'احصل على الوصول' }
  ];

  return (
    <div>
      <div className="pt-20">
        <PageHeader
          title={t('membership.title')}
          description=""
          breadcrumbs={[
            { label: t('nav.getInvolved'), path: '/get-involved/membership' },
            { label: t('nav.getInvolved.membership') }
          ]}
          pageKey="membership"
        />

        {/* Process Steps */}
        <section className="py-12 bg-gradient-to-b from-white to-sand/20">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {processSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 flex-1">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-accent text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm font-semibold text-center text-primary">
                        {language === 'ar' ? step.ar : step.en}
                      </span>
                    </div>
                    {index < processSteps.length - 1 && (
                      <ArrowRight className={`hidden md:block text-gray-300 ${isRTL ? 'rotate-180' : ''}`} size={24} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Membership Types - Simplified Cards */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                {language === 'ar' ? 'اختر نوع العضوية' : 'Choose Your Membership'}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {language === 'ar'
                  ? 'جميع العضويات صالحة من 1 يناير إلى 31 ديسمبر'
                  : 'All memberships valid from 1 January to 31 December'}
              </p>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="text-accent hover:text-hover font-semibold underline"
              >
                {showComparison
                  ? (language === 'ar' ? 'إخفاء المقارنة' : 'Hide Comparison')
                  : (language === 'ar' ? 'مقارنة الأنواع' : 'Compare Types')}
              </button>
            </motion.div>

            {/* Comparison Table */}
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
                        <th className="text-left py-4 px-4 text-primary font-bold">
                          {language === 'ar' ? 'الميزات' : 'Features'}
                        </th>
                        {membershipTypes.map(type => (
                          <th key={type.id} className="text-center py-4 px-4">
                            <div className="font-bold text-primary">
                              {language === 'ar' ? type.nameAr : type.nameEn}
                            </div>
                            <div className="text-accent font-bold text-xl mt-1">
                              {type.price}{type.period}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {membershipTypes[0].features.map((feature, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-700">
                            {language === 'ar' ? feature.ar : feature.en}
                          </td>
                          {membershipTypes.map(type => {
                            const typeFeature = type.features[idx];
                            return (
                              <td key={type.id} className="text-center py-3 px-4">
                                {typeFeature?.included ? (
                                  <Check className="inline text-green-600" size={20} />
                                ) : (
                                  <X className="inline text-gray-300" size={20} />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Membership Cards */}
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {membershipTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;

                return (
                  <motion.div
                    key={type.id}
                    variants={staggerItem}
                    whileHover={{ y: -8 }}
                    className="relative"
                  >
                    {type.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="bg-accent text-white px-3 py-1 rounded-full text-xs font-bold">
                          {language === 'ar' ? 'الأكثر شيوعاً' : 'POPULAR'}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedType(type.id as any)}
                      className={`w-full h-full p-6 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-accent bg-accent/5 shadow-2xl scale-105'
                          : 'border-gray-200 bg-white hover:border-accent/30 hover:shadow-lg'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto ${
                        isSelected ? 'bg-accent text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        <Icon size={28} />
                      </div>

                      <h3 className="text-xl font-bold text-primary mb-2 text-center">
                        {language === 'ar' ? type.nameAr : type.nameEn}
                      </h3>

                      <div className="text-center mb-3">
                        <span className="text-3xl font-bold text-accent">{type.price}</span>
                        <span className="text-gray-600 text-sm">{type.period}</span>
                      </div>

                      <p className="text-gray-600 text-sm text-center min-h-[40px]">
                        {language === 'ar' ? type.shortDescAr : type.shortDescEn}
                      </p>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Link
                          to="/member/signup"
                          className={`block w-full py-2.5 rounded-lg font-semibold transition-colors ${
                            isSelected
                              ? 'bg-accent hover:bg-hover text-white'
                              : 'bg-primary/10 hover:bg-primary/20 text-primary'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {language === 'ar' ? 'قدم الآن' : 'Apply Now'}
                        </Link>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Quick Info */}
            <motion.div
              className="max-w-4xl mx-auto mt-12 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="bg-sand/20 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Info className="text-accent flex-shrink-0 mt-1" size={24} />
                  <div className="text-left">
                    <h4 className="font-bold text-primary mb-2">
                      {language === 'ar' ? 'معلومات مهمة' : 'Important Information'}
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>
                        {language === 'ar'
                          ? '• جميع العضويات صالحة من 1 يناير إلى 31 ديسمبر'
                          : '• All memberships valid from 1 January to 31 December'}
                      </li>
                      <li>
                        {language === 'ar'
                          ? '• الاشتراكات خلال السنة تنتهي في 31 ديسمبر'
                          : '• Subscriptions made during the year still end on 31 December'}
                      </li>
                      <li>
                        {language === 'ar'
                          ? '• يجب الموافقة على سياسات الحوكمة وحماية البيانات'
                          : '• Must comply with governing document and data protection policies'}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/member/login"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {language === 'ar' ? 'عضو حالي؟ سجل الدخول' : 'Existing Member? Login'}
                </Link>
                <Link
                  to="/contact"
                  className="bg-white hover:bg-gray-50 text-primary border-2 border-primary px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  {language === 'ar' ? 'هل لديك أسئلة؟' : 'Have Questions?'}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Benefits - Simplified */}
        <section className="py-16 bg-gradient-to-b from-sand/20 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
                {language === 'ar' ? 'لماذا تنضم لنا؟' : 'Why Join Us?'}
              </h2>
              <p className="text-lg text-gray-600">
                {language === 'ar'
                  ? 'كن جزءاً من مجتمعنا واستفد من خدماتنا'
                  : 'Be part of our community and benefit from our services'}
              </p>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Users,
                  title: 'Community Access',
                  titleAr: 'الوصول للمجتمع',
                  desc: 'Access all programmes and services',
                  descAr: 'الوصول لجميع البرامج والخدمات'
                },
                {
                  icon: CheckCircle,
                  title: 'Priority Booking',
                  titleAr: 'حجز ذو أولوية',
                  desc: 'Book advisory services first',
                  descAr: 'احجز الخدمات الاستشارية أولاً'
                },
                {
                  icon: Heart,
                  title: 'Special Discounts',
                  titleAr: 'خصومات خاصة',
                  desc: 'Member rates on events',
                  descAr: 'أسعار خاصة على الفعاليات'
                },
                {
                  icon: Globe2,
                  title: 'Partner Offers',
                  titleAr: 'عروض الشركاء',
                  desc: 'Exclusive partner discounts',
                  descAr: 'خصومات حصرية من الشركاء'
                },
                {
                  icon: Info,
                  title: 'Stay Informed',
                  titleAr: 'ابق على اطلاع',
                  desc: 'Regular updates & newsletters',
                  descAr: 'تحديثات ونشرات منتظمة'
                },
                {
                  icon: Building2,
                  title: 'Voice & Vote',
                  titleAr: 'صوتك ورأيك',
                  desc: 'Participate in AGM meetings',
                  descAr: 'شارك في الاجتماعات العامة'
                }
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    variants={staggerItem}
                    className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all hover:border-accent/30"
                  >
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon size={24} className="text-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2">
                      {language === 'ar' ? benefit.titleAr : benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {language === 'ar' ? benefit.descAr : benefit.desc}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
