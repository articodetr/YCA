import { Users, CheckCircle, Building2, Globe2, Heart, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';

export default function Membership() {
  const { t, language } = useLanguage();
  const [selectedType, setSelectedType] = useState<'individual' | 'family' | 'associate' | 'business_support'>('individual');

  const membershipTypes = [
    {
      id: 'individual',
      icon: Users,
      nameEn: 'Individual Membership',
      nameAr: 'عضوية فردية',
      price: '£15',
      period: language === 'ar' ? 'سنوياً' : 'per year',
      descriptionEn: 'For individuals who support YCA Birmingham\'s aims and values.',
      descriptionAr: 'للأفراد الذين يدعمون أهداف وقيم جمعية الجالية اليمنية في برمنغهام.',
      termsEn: [
        'Available to individuals who support YCA Birmingham\'s aims and values',
        'Access to member communications and community opportunities',
        'Voting/eligibility rights apply in line with YCA Birmingham governance rules'
      ],
      termsAr: [
        'متاحة للأفراد الذين يدعمون أهداف وقيم جمعية الجالية اليمنية',
        'الوصول إلى اتصالات الأعضاء والفرص المجتمعية',
        'تطبق حقوق التصويت والأهلية وفقاً لقواعد حوكمة الجمعية'
      ],
      benefits: [
        'Access to all community programmes',
        'Voting rights in AGM',
        'Regular newsletters and updates',
        'Networking opportunities'
      ]
    },
    {
      id: 'family',
      icon: Heart,
      nameEn: 'Family Membership',
      nameAr: 'عضوية عائلية',
      price: '£25',
      period: language === 'ar' ? 'سنوياً' : 'per year',
      descriptionEn: 'Covers all family members living at the same address.',
      descriptionAr: 'تشمل جميع أفراد الأسرة الذين يعيشون في نفس العنوان.',
      termsEn: [
        'Covers family members living at the same address',
        'Includes membership access for listed family members',
        'Governance rights (e.g., voting) apply only to eligible adults, in line with internal rules'
      ],
      termsAr: [
        'تشمل أفراد الأسرة الذين يعيشون في نفس العنوان',
        'يتضمن حق الوصول للعضوية لأفراد الأسرة المدرجين',
        'حقوق الحوكمة (مثل التصويت) تنطبق فقط على البالغين المؤهلين وفقاً للقواعد الداخلية'
      ],
      benefits: [
        'All individual benefits',
        'Coverage for entire family',
        'Shared access to events',
        'Family-oriented programmes'
      ]
    },
    {
      id: 'associate',
      icon: Globe2,
      nameEn: 'Associate Membership - منتسب',
      nameAr: 'عضوية منتسب',
      price: '£20',
      period: language === 'ar' ? 'سنوياً' : 'per year',
      descriptionEn: 'For non-Yemenis and Yemenis living outside Birmingham.',
      descriptionAr: 'لغير اليمنيين واليمنيين المقيمين خارج برمنغهام.',
      termsEn: [
        'For non-Yemenis and Yemenis living outside Birmingham',
        'Can participate in community activities and receive updates',
        'No voting rights and not eligible to stand for election'
      ],
      termsAr: [
        'لغير اليمنيين واليمنيين المقيمين خارج برمنغهام',
        'يمكن المشاركة في الأنشطة المجتمعية وتلقي التحديثات',
        'لا توجد حقوق تصويت وغير مؤهل للترشح للانتخابات'
      ],
      benefits: [
        'Community activities access',
        'Regular updates',
        'No voting rights',
        'Not eligible for elections'
      ]
    },
    {
      id: 'business_support',
      icon: Building2,
      nameEn: 'Business Support Membership',
      nameAr: 'عضوية دعم الأعمال',
      price: '£10+',
      period: language === 'ar' ? 'شهرياً' : 'per month',
      descriptionEn: 'For businesses/individuals wishing to support YCA Birmingham regularly.',
      descriptionAr: 'للشركات/الأفراد الذين يرغبون في دعم الجمعية بشكل منتظم.',
      termsEn: [
        'For businesses/individuals wishing to support YCA Birmingham regularly',
        'Monthly contribution from £10, with option to increase',
        'Does not provide governance rights (no voting/standing)'
      ],
      termsAr: [
        'للشركات/الأفراد الذين يرغبون في دعم الجمعية بشكل منتظم',
        'مساهمة شهرية تبدأ من £10، مع خيار الزيادة',
        'لا يوفر حقوق الحوكمة (لا تصويت/لا ترشح)'
      ],
      benefits: [
        'Support community regularly',
        'Flexible monthly amount',
        'Business recognition',
        'No governance rights'
      ]
    }
  ];

  const selectedMembership = membershipTypes.find(m => m.id === selectedType) || membershipTypes[0];

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
          image="https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=1920"
        />

        {/* Membership Types Grid */}
        <section className="py-20 bg-gradient-to-b from-white to-sand/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-4xl font-bold text-primary mb-4">
                {language === 'ar' ? 'أنواع العضوية' : 'Membership Types'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {language === 'ar'
                  ? 'اختر نوع العضوية الذي يناسبك وانضم إلى مجتمعنا'
                  : 'Choose the membership type that suits you and join our community'}
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
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
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="relative"
                  >
                    <button
                      onClick={() => setSelectedType(type.id as any)}
                      className={`w-full h-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-accent bg-accent/5 shadow-xl'
                          : 'border-gray-200 bg-white hover:border-accent/50 hover:shadow-lg'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                        isSelected ? 'bg-accent text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        <Icon size={28} />
                      </div>

                      <h3 className="text-xl font-bold text-primary mb-2">
                        {language === 'ar' ? type.nameAr : type.nameEn}
                      </h3>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-3xl font-bold text-accent">{type.price}</span>
                        <span className="text-gray-600">{type.period}</span>
                      </div>

                      <p className="text-gray-600 text-sm">
                        {language === 'ar' ? type.descriptionAr : type.descriptionEn}
                      </p>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-3 -right-3 w-8 h-8 bg-accent rounded-full flex items-center justify-center"
                        >
                          <CheckCircle size={20} className="text-white" />
                        </motion.div>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Selected Membership Details */}
            <motion.div
              key={selectedType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  {(() => {
                    const Icon = selectedMembership.icon;
                    return <Icon size={32} className="text-accent" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary">
                    {language === 'ar' ? selectedMembership.nameAr : selectedMembership.nameEn}
                  </h3>
                  <p className="text-gray-600">
                    {selectedMembership.price} {selectedMembership.period}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={20} className="text-accent" />
                  <h4 className="text-lg font-semibold text-primary">
                    {language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'}
                  </h4>
                </div>
                <ul className="space-y-2">
                  {(language === 'ar' ? selectedMembership.termsAr : selectedMembership.termsEn).map((term, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{term}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={`/member/membership/apply?type=${selectedType}`}
                    className="flex-1 bg-accent hover:bg-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors text-center"
                  >
                    {language === 'ar' ? 'قدم الآن' : t('membership.applyNow')}
                  </Link>
                  <Link
                    to="/contact"
                    className="flex-1 bg-white hover:bg-gray-50 text-primary border-2 border-primary px-8 py-4 rounded-lg font-semibold text-lg transition-colors text-center"
                  >
                    {t('nav.contact')}
                  </Link>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      {language === 'ar' ? 'أو' : 'OR'}
                    </span>
                  </div>
                </div>

                <Link
                  to="/member/login"
                  className="w-full bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-center"
                >
                  {language === 'ar' ? 'تسجيل الدخول كعضو حالي' : 'Login as Existing Member'}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-4xl font-bold text-primary mb-4">
                {t('membership.benefits')}
              </h2>
              <p className="text-xl text-gray-600">
                {language === 'ar'
                  ? 'لماذا تنضم إلى جمعية الجالية اليمنية؟'
                  : 'Why Join YCA Birmingham?'}
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { title: 'Community Access', titleAr: 'الوصول للمجتمع', desc: 'Full access to all YCA programmes', descAr: 'الوصول الكامل لجميع برامج الجمعية' },
                { title: 'Voice & Vote', titleAr: 'الصوت والتصويت', desc: 'Participate in decisions', descAr: 'المشاركة في القرارات' },
                { title: 'Events Priority', titleAr: 'أولوية الفعاليات', desc: 'Priority booking for events', descAr: 'حجز ذو أولوية للفعاليات' },
                { title: 'Networking', titleAr: 'التواصل', desc: 'Connect with community', descAr: 'التواصل مع المجتمع' },
                { title: 'Updates', titleAr: 'التحديثات', desc: 'Regular newsletters', descAr: 'نشرات إخبارية منتظمة' },
                { title: 'Support', titleAr: 'الدعم', desc: 'Access to advisory services', descAr: 'الوصول لخدمات الاستشارة' }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  className="bg-gradient-to-br from-white to-sand/30 p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle size={24} className="text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">
                    {language === 'ar' ? benefit.titleAr : benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'ar' ? benefit.descAr : benefit.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
