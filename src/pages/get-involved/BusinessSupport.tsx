import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Crown, Building2, ArrowRight, ArrowLeft, ExternalLink, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface BusinessSupporter {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold';
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function BusinessSupport() {
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';
  const DirectionalArrow = isRTL ? ArrowLeft : ArrowRight;

  const [supporters, setSupporters] = useState<BusinessSupporter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        const { data, error } = await supabase
          .from('business_supporters')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSupporters(data || []);
      } catch (error) {
        console.error('Error fetching business supporters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupporters();
  }, []);

  const goldSupporters = supporters.filter(s => s.tier === 'gold');
  const silverSupporters = supporters.filter(s => s.tier === 'silver');
  const bronzeSupporters = supporters.filter(s => s.tier === 'bronze');

  const txt = {
    title: isAr ? 'دعم الأعمال' : 'Business Support',
    breadcrumbGetInvolved: isAr ? 'شارك معنا' : 'Get Involved',
    breadcrumbBusinessSupport: isAr ? 'دعم الأعمال' : 'Business Support',
    heroHeading: isAr
      ? 'ادعم مجتمعك من خلال عملك'
      : 'Support Your Community Through Your Business',
    heroDescription: isAr
      ? 'انضم إلى شبكة الشركات التي تدعم جمعية الجالية اليمنية في برمنغهام. دعمكم يساعدنا على تقديم خدمات حيوية وبرامج مجتمعية للجالية اليمنية والمجتمعات الأوسع في برمنغهام.'
      : 'Join our network of businesses supporting the Yemeni Community Association Birmingham. Your support helps us deliver vital services and community programmes to the Yemeni community and the wider Birmingham communities.',
    whySupport: isAr ? 'لماذا تدعم جمعية الجالية اليمنية؟' : 'Why Support YCA?',
    whySupportDesc: isAr
      ? 'دعمكم لا يُحدث فرقاً في حياة أفراد المجتمع فحسب، بل يُظهر أيضاً التزام شركتكم بالمسؤولية الاجتماعية والتنوع والشمول.'
      : 'Your support not only makes a difference in the lives of community members, but also demonstrates your company\'s commitment to social responsibility, diversity, and inclusion.',
    chooseTier: isAr ? 'اختر مستوى الدعم' : 'Choose Your Support Tier',
    perYear: isAr ? '/سنوياً' : '/year',
    bronze: isAr ? 'برونزي' : 'Bronze',
    silver: isAr ? 'فضي' : 'Silver',
    gold: isAr ? 'ذهبي' : 'Gold',
    monthlyRecurring: isAr ? 'تبرع شهري متكرر' : 'Monthly Recurring',
    oneTimeDonation: isAr ? 'تبرع لمرة واحدة' : 'One-Time Donation',
    monthlyDesc: isAr
      ? 'ادعمنا بتبرع شهري مرن يناسب ميزانيتكم. كل مساهمة تُحدث فرقاً.'
      : 'Support us with a flexible monthly donation that suits your budget. Every contribution makes a difference.',
    oneTimeDesc: isAr
      ? 'قدّموا تبرعاً لمرة واحدة بأي مبلغ لدعم عملنا المجتمعي.'
      : 'Make a one-time donation of any amount to support our community work.',
    getInTouch: isAr ? 'تواصل معنا' : 'Get In Touch',
    donateNow: isAr ? 'تبرع الآن' : 'Donate Now',
    bronzeBenefits: [
      isAr ? 'شعار الشركة على الموقع الإلكتروني' : 'Logo on website',
      isAr ? 'شهادة شراكة' : 'Certificate of partnership',
      isAr ? 'ذكر على وسائل التواصل الاجتماعي' : 'Social media mention',
    ],
    silverBenefits: [
      isAr ? 'جميع مزايا البرونزي' : 'All Bronze benefits',
      isAr ? 'موضع مميز على الموقع' : 'Featured placement',
      isAr ? 'فرص رعاية الفعاليات' : 'Event sponsorship opportunities',
      isAr ? 'ظهور في النشرة الإخبارية الفصلية' : 'Quarterly newsletter feature',
    ],
    goldBenefits: [
      isAr ? 'جميع مزايا الفضي' : 'All Silver benefits',
      isAr ? 'موضع متميز للشعار' : 'Premium logo placement',
      isAr ? 'شراكة مسماة' : 'Named partnership',
      isAr ? 'وصول VIP للفعاليات' : 'VIP event access',
      isAr ? 'ظهور في التقرير السنوي' : 'Annual report feature',
    ],
    currentSupporters: isAr ? 'داعمونا الحاليون' : 'Our Current Supporters',
    currentSupportersDesc: isAr
      ? 'نفخر بالشركات التي تدعم عملنا المجتمعي. شكراً لكم على مساهمتكم القيمة.'
      : 'We are proud of the businesses that support our community work. Thank you for your valuable contribution.',
    goldSupporters: isAr ? 'الداعمون الذهبيون' : 'Gold Supporters',
    silverSupporters: isAr ? 'الداعمون الفضيون' : 'Silver Supporters',
    bronzeSupporters: isAr ? 'الداعمون البرونزيون' : 'Bronze Supporters',
    noSupportersYet: isAr
      ? 'كن أول داعم في هذه الفئة!'
      : 'Be the first supporter in this tier!',
    visitWebsite: isAr ? 'زيارة الموقع' : 'Visit Website',
    ctaHeading: isAr ? 'هل أنت مستعد لدعم مجتمعك؟' : 'Ready to Support Your Community?',
    ctaDescription: isAr
      ? 'تواصل مع فريقنا لمعرفة المزيد عن فرص دعم الأعمال وكيف يمكن لشركتك أن تُحدث فرقاً.'
      : 'Get in touch with our team to learn more about business support opportunities and how your company can make a difference.',
    contactUs: isAr ? 'تواصل معنا' : 'Contact Us',
    individualMembership: isAr ? 'العضوية الفردية' : 'Individual Membership',
    forIndividuals: isAr
      ? 'هل تبحث عن عضوية فردية بدلاً من ذلك؟'
      : 'Looking for individual membership instead?',
    loading: isAr ? 'جاري التحميل...' : 'Loading...',
    flexibleAmount: isAr ? 'مبلغ مرن' : 'Flexible Amount',
    anyAmount: isAr ? 'أي مبلغ' : 'Any Amount',
  };

  const tiers = [
    {
      name: txt.bronze,
      price: '£500',
      icon: Award,
      color: 'from-amber-700 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      borderColor: 'border-amber-300',
      benefits: txt.bronzeBenefits,
      popular: false,
    },
    {
      name: txt.silver,
      price: '£1,500',
      icon: Star,
      color: 'from-gray-400 to-gray-500',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-500',
      borderColor: 'border-gray-300',
      benefits: txt.silverBenefits,
      popular: true,
    },
    {
      name: txt.gold,
      price: '£3,000',
      icon: Crown,
      color: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-400',
      benefits: txt.goldBenefits,
      popular: false,
    },
  ];

  const renderSupporterGroup = (
    title: string,
    groupSupporters: BusinessSupporter[],
    icon: React.ReactNode,
    bgClass: string
  ) => (
    <motion.div
      className="mb-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="text-2xl font-bold text-primary">{title}</h3>
      </div>
      {groupSupporters.length > 0 ? (
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {groupSupporters.map((supporter) => (
            <motion.div
              key={supporter.id}
              className={`${bgClass} rounded-xl p-6 border hover:shadow-lg transition-all`}
              variants={staggerItem}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center gap-4">
                {supporter.logo_url ? (
                  <img
                    src={supporter.logo_url}
                    alt={supporter.name}
                    className="w-16 h-16 object-contain rounded-lg bg-white p-2"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={28} className="text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-primary truncate">{supporter.name}</h4>
                  {supporter.website_url && (
                    <a
                      href={supporter.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-accent hover:text-hover transition-colors mt-1"
                    >
                      {txt.visitWebsite}
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="text-muted italic">{txt.noSupportersYet}</p>
      )}
    </motion.div>
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="pt-20">
        <PageHeader
          title={txt.title}
          breadcrumbs={[
            { label: txt.breadcrumbGetInvolved, path: '/get-involved/membership' },
            { label: txt.breadcrumbBusinessSupport },
          ]}
          pageKey="business-support"
        />

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                {txt.heroHeading}
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-8">
                {txt.heroDescription}
              </p>
            </motion.div>

            <motion.div
              className="max-w-3xl mx-auto bg-sand p-8 rounded-xl text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <Building2 size={40} className="text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-primary mb-4">{txt.whySupport}</h3>
              <p className="text-muted leading-relaxed">{txt.whySupportDesc}</p>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-sand/20 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                {txt.chooseTier}
              </h2>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {tiers.map((tier) => {
                const Icon = tier.icon;
                return (
                  <motion.div
                    key={tier.name}
                    className="relative"
                    variants={staggerItem}
                    whileHover={{ y: -8 }}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="bg-accent text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
                          {isAr ? 'الأكثر شيوعاً' : 'Popular'}
                        </span>
                      </div>
                    )}
                    <div
                      className={`bg-white rounded-xl border-2 ${tier.borderColor} p-8 h-full flex flex-col ${
                        tier.popular ? 'shadow-2xl scale-105' : 'shadow-lg'
                      }`}
                    >
                      <div className={`w-16 h-16 ${tier.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon size={32} className={tier.iconColor} />
                      </div>
                      <h3 className="text-2xl font-bold text-primary text-center mb-2">
                        {tier.name}
                      </h3>
                      <div className="text-center mb-6">
                        <span className="text-4xl font-bold text-accent">{tier.price}</span>
                        <span className="text-muted text-sm">{txt.perYear}</span>
                      </div>
                      <ul className="space-y-3 flex-1 mb-8">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Award size={18} className="text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-muted">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/contact"
                        className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                          tier.popular
                            ? 'bg-accent hover:bg-hover text-white'
                            : 'bg-primary/10 hover:bg-primary/20 text-primary'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {txt.getInTouch}
                          <DirectionalArrow size={18} />
                        </span>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                className="bg-white rounded-xl border-2 border-border p-8 text-center"
                variants={staggerItem}
                whileHover={{ y: -4 }}
              >
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart size={28} className="text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{txt.monthlyRecurring}</h3>
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-accent">{txt.flexibleAmount}</span>
                </div>
                <p className="text-muted text-sm mb-6">{txt.monthlyDesc}</p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {txt.getInTouch}
                  <DirectionalArrow size={18} />
                </Link>
              </motion.div>

              <motion.div
                className="bg-white rounded-xl border-2 border-border p-8 text-center"
                variants={staggerItem}
                whileHover={{ y: -4 }}
              >
                <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 size={28} className="text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-2">{txt.oneTimeDonation}</h3>
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-accent">{txt.anyAmount}</span>
                </div>
                <p className="text-muted text-sm mb-6">{txt.oneTimeDesc}</p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {txt.donateNow}
                  <DirectionalArrow size={18} />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                {txt.currentSupporters}
              </h2>
              <p className="text-lg text-muted max-w-3xl mx-auto">
                {txt.currentSupportersDesc}
              </p>
            </motion.div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted">{txt.loading}</p>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto">
                {renderSupporterGroup(
                  txt.goldSupporters,
                  goldSupporters,
                  <Crown size={28} className="text-yellow-600" />,
                  'bg-yellow-50 border-yellow-200'
                )}
                {renderSupporterGroup(
                  txt.silverSupporters,
                  silverSupporters,
                  <Star size={28} className="text-gray-500" />,
                  'bg-gray-50 border-gray-200'
                )}
                {renderSupporterGroup(
                  txt.bronzeSupporters,
                  bronzeSupporters,
                  <Award size={28} className="text-amber-700" />,
                  'bg-amber-50 border-amber-200'
                )}
              </div>
            )}
          </div>
        </section>

        <section className="py-20 bg-primary">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {txt.ctaHeading}
              </h2>
              <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
                {txt.ctaDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 bg-accent hover:bg-hover text-white px-8 py-4 rounded-lg font-semibold transition-colors"
                  >
                    {txt.contactUs}
                    <DirectionalArrow size={20} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/membership"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-lg font-semibold transition-colors"
                  >
                    {txt.individualMembership}
                    <DirectionalArrow size={20} />
                  </Link>
                </motion.div>
              </div>
              <p className="text-white/60 text-sm mt-6">{txt.forIndividuals}</p>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
