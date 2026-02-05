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
      price: '£20',
      period: language === 'ar' ? 'سنوياً' : 'per year',
      descriptionEn: 'Available to Yemenis living in Birmingham, aged 18+.',
      descriptionAr: 'متاحة لليمنيين المقيمين في برمنغهام، من عمر 18 سنة فما فوق.',
      eligibilityEn: [
        'Available to Yemenis living in Birmingham, aged 18+',
        'By joining, you agree to comply with YCA Birmingham\'s governing document, core policies, including Safeguarding and Data Protection (UK GDPR) requirements',
        'Membership runs 1 January to 31 December (subscriptions made during the year still end on 31 December)'
      ],
      eligibilityAr: [
        'متاحة لليمنيين المقيمين في برمنغهام، من عمر 18 سنة فما فوق',
        'بالانضمام، فإنك توافق على الالتزام بوثيقة الحوكمة والسياسات الأساسية لجمعية الجالية اليمنية، بما في ذلك متطلبات حماية البيانات (UK GDPR)',
        'تمتد العضوية من 1 يناير إلى 31 ديسمبر (الاشتراكات خلال السنة تنتهي في 31 ديسمبر)'
      ],
      benefitsEn: [
        'Member rates on selected YCA services and administrative support',
        'Priority booking for advisory/consultancy services and limited-capacity activities',
        'Discounts on events, programmes, and courses where offered',
        'Access to member communications (updates and announcements)',
        'Access to partner discounts/offers provided by YCA Birmingham\'s contracted partners',
        'Attendance at the General Meeting/AGM and open community meetings'
      ],
      benefitsAr: [
        'أسعار خاصة للأعضاء على خدمات YCA المختارة والدعم الإداري',
        'أولوية الحجز للخدمات الاستشارية والأنشطة محدودة السعة',
        'خصومات على الفعاليات والبرامج والدورات حيث تُقدم',
        'الوصول لاتصالات الأعضاء (التحديثات والإعلانات)',
        'الوصول لخصومات/عروض الشركاء المقدمة من شركاء YCA المتعاقدين',
        'حضور الاجتماع العام السنوي والاجتماعات المجتمعية المفتوحة'
      ],
      governanceEn: 'Voting and eligibility to stand for election apply only to eligible members of Yemeni origin, in accordance with YCA Birmingham\'s governing arrangements.',
      governanceAr: 'حقوق التصويت والأهلية للترشح تنطبق فقط على الأعضاء المؤهلين من أصل يمني، وفقاً لترتيبات حوكمة جمعية الجالية اليمنية.'
    },
    {
      id: 'family',
      icon: Heart,
      nameEn: 'Family Membership',
      nameAr: 'عضوية عائلية',
      price: '£30',
      period: language === 'ar' ? 'سنوياً' : 'per year',
      descriptionEn: 'Covers parents/guardians and all family members under 18 living at the same address.',
      descriptionAr: 'تشمل الوالدين/الأوصياء وجميع أفراد الأسرة تحت 18 سنة المقيمين في نفس العنوان.',
      eligibilityEn: [
        'Covers parents/guardians and family members under 18 living at the same address',
        'Family members must be listed at registration (basic details only) and kept up to date',
        'By joining, you agree to comply with YCA Birmingham\'s governing document, core policies, including Safeguarding and Data Protection (UK GDPR) requirements',
        'Membership runs 1 January to 31 December (subscriptions made during the year still end on 31 December)'
      ],
      eligibilityAr: [
        'تشمل الوالدين/الأوصياء وأفراد الأسرة تحت 18 سنة المقيمين في نفس العنوان',
        'يجب إدراج أفراد الأسرة عند التسجيل (تفاصيل أساسية فقط) وتحديثها بانتظام',
        'بالانضمام، فإنك توافق على الالتزام بوثيقة الحوكمة والسياسات الأساسية لجمعية الجالية اليمنية',
        'تمتد العضوية من 1 يناير إلى 31 ديسمبر (الاشتراكات خلال السنة تنتهي في 31 ديسمبر)'
      ],
      benefitsEn: [
        'Member rates on selected YCA services and administrative support for the household',
        'Priority access to family-appropriate activities, programmes, and limited-capacity events',
        'Access to member communications and updates for the registered parent/guardian',
        'Access to partner discounts/offers provided by YCA Birmingham\'s contracted partners'
      ],
      benefitsAr: [
        'أسعار خاصة للأعضاء على خدمات YCA والدعم الإداري للأسرة',
        'أولوية الوصول للأنشطة المناسبة للعائلات والبرامج والفعاليات محدودة السعة',
        'الوصول لاتصالات الأعضاء والتحديثات للولي المسجل',
        'الوصول لخصومات/عروض الشركاء المقدمة من شركاء YCA المتعاقدين'
      ],
      governanceEn: 'Governance rights (e.g., voting and eligibility to stand for election) apply only to eligible adults and in accordance with YCA Birmingham\'s internal rules and governing arrangements.',
      governanceAr: 'حقوق الحوكمة (مثل التصويت والأهلية للترشح) تنطبق فقط على البالغين المؤهلين ووفقاً للقواعد الداخلية وترتيبات حوكمة الجمعية.'
    },
    {
      id: 'associate',
      icon: Globe2,
      nameEn: 'Associate Membership (منتسب)',
      nameAr: 'عضوية منتسب',
      price: '£20',
      period: language === 'ar' ? 'سنوياً' : 'per year',
      descriptionEn: 'Open to non-Yemenis and Yemenis living outside Birmingham.',
      descriptionAr: 'مفتوحة لغير اليمنيين واليمنيين المقيمين خارج برمنغهام.',
      eligibilityEn: [
        'Open to non-Yemenis (living in or outside Birmingham) and Yemenis living outside Birmingham, aged 18+',
        'By joining, you agree to comply with YCA Birmingham\'s governing document, core policies, including Safeguarding and Data Protection (UK GDPR) requirements',
        'Membership must remain active and in date to access member rates and any priority booking where offered',
        'Membership runs 1 January to 31 December (subscriptions made during the year still end on 31 December)'
      ],
      eligibilityAr: [
        'مفتوحة لغير اليمنيين (المقيمين داخل أو خارج برمنغهام) واليمنيين المقيمين خارج برمنغهام، من عمر 18 سنة فما فوق',
        'بالانضمام، فإنك توافق على الالتزام بوثيقة الحوكمة والسياسات الأساسية لجمعية الجالية اليمنية',
        'يجب أن تكون العضوية نشطة وسارية للوصول إلى أسعار الأعضاء وأولوية الحجز حيث تُقدم',
        'تمتد العضوية من 1 يناير إلى 31 ديسمبر (الاشتراكات خلال السنة تنتهي في 31 ديسمبر)'
      ],
      benefitsEn: [
        'Member rates on selected YCA services and administrative support (where applicable)',
        'Access to community activities, programmes, and events (subject to eligibility and capacity)',
        'Access to member communications (updates and announcements)',
        'Access to partner discounts/offers provided by YCA Birmingham\'s contracted partners'
      ],
      benefitsAr: [
        'أسعار خاصة للأعضاء على خدمات YCA المختارة والدعم الإداري (حيثما ينطبق)',
        'الوصول للأنشطة المجتمعية والبرامج والفعاليات (بناءً على الأهلية والسعة)',
        'الوصول لاتصالات الأعضاء (التحديثات والإعلانات)',
        'الوصول لخصومات/عروض الشركاء المقدمة من شركاء YCA المتعاقدين'
      ],
      governanceEn: 'No voting rights and not eligible to stand for election or hold governance roles within YCA Birmingham.',
      governanceAr: 'لا حقوق تصويت ولا أهلية للترشح أو شغل أدوار حوكمة داخل جمعية الجالية اليمنية في برمنغهام.'
    },
    {
      id: 'business_support',
      icon: Building2,
      nameEn: 'Business Support Membership',
      nameAr: 'عضوية دعم الأعمال',
      price: 'Flexible',
      period: language === 'ar' ? 'دعم مرن' : 'Support',
      descriptionEn: 'Support YCA Birmingham through annual packages, monthly support, or one-time contributions.',
      descriptionAr: 'ادعم جمعية الجالية اليمنية من خلال باقات سنوية أو دعم شهري أو مساهمات لمرة واحدة.',
      eligibilityEn: [
        'Annual Packages: Bronze (£500/year), Silver (£1,500/year), Gold (£3,000/year)',
        'Monthly Support (Flexible): Minimum £10/month. Suggested: £10 / £25 / £50 / £100 / £250 + Custom',
        'One-Time Support: £10 / £25 / £50 / £100 / £250 + Custom amount'
      ],
      eligibilityAr: [
        'الباقات السنوية: برونز (£500/سنوياً)، فضي (£1,500/سنوياً)، ذهبي (£3,000/سنوياً)',
        'الدعم الشهري (مرن): الحد الأدنى £10/شهرياً. مقترح: £10 / £25 / £50 / £100 / £250 + مبلغ مخصص',
        'الدعم لمرة واحدة: £10 / £25 / £50 / £100 / £250 + مبلغ مخصص'
      ],
      benefitsEn: [
        'Support YCA Birmingham\'s community programmes and services',
        'Business recognition opportunities (for annual package supporters)',
        'Flexible contribution options to suit your budget',
        'Regular updates on community impact'
      ],
      benefitsAr: [
        'دعم برامج وخدمات جمعية الجالية اليمنية',
        'فرص التقدير للشركات (لداعمي الباقات السنوية)',
        'خيارات مساهمة مرنة تناسب ميزانيتك',
        'تحديثات منتظمة حول الأثر المجتمعي'
      ],
      governanceEn: 'Business Support does not provide governance rights (no voting or standing for election).',
      governanceAr: 'دعم الأعمال لا يوفر حقوق الحوكمة (لا تصويت ولا ترشح للانتخابات).'
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

              <div className="space-y-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={20} className="text-accent" />
                    <h4 className="text-lg font-semibold text-primary">
                      {language === 'ar' ? 'الأهلية والشروط' : 'Eligibility & Conditions'}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {(language === 'ar' ? selectedMembership.eligibilityAr : selectedMembership.eligibilityEn).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={20} className="text-accent" />
                    <h4 className="text-lg font-semibold text-primary">
                      {language === 'ar' ? 'الفوائد' : 'Benefits'}
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {(language === 'ar' ? selectedMembership.benefitsAr : selectedMembership.benefitsEn).map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-sand/20 p-4 rounded-lg border border-primary/20">
                  <h4 className="text-sm font-semibold text-primary mb-2">
                    {language === 'ar' ? 'ملاحظة حوكمة' : 'Governance Note'}
                  </h4>
                  <p className="text-gray-700 text-sm">
                    {language === 'ar' ? selectedMembership.governanceAr : selectedMembership.governanceEn}
                  </p>
                </div>
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
