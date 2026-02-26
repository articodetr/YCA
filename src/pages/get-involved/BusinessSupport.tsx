import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Crown, Building2, ExternalLink, Check, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import MembershipPaymentModal from '../../components/member/MembershipPaymentModal';
import { membershipPlans } from '../../data/membershipPlans';

interface BusinessSupporter {
  id: string;
  business_name: string;
  tier: 'bronze' | 'silver' | 'gold';
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
}

type SupportFrequency = 'annual' | 'monthly' | 'one_time';

const TIER_AMOUNTS = { bronze: 500, silver: 1500, gold: 3000 };
const MONTHLY_AMOUNTS = [10, 25, 50, 100, 250];
const ONE_TIME_AMOUNTS = [10, 25, 50, 100, 250];

export default function BusinessSupport() {
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';

  const [supporters, setSupporters] = useState<BusinessSupporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSupportersSection, setShowSupportersSection] = useState(false);

  const [selectedTier, setSelectedTier] = useState<'bronze' | 'silver' | 'gold' | null>(null);
  const [activeTab, setActiveTab] = useState<SupportFrequency>('annual');
  const [flexAmount, setFlexAmount] = useState<number | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectionError, setSelectionError] = useState(false);

  const businessPlan = membershipPlans.find(p => p.id === 'business_support')!;

  const computedAmount = (): number => {
    if (activeTab === 'annual' && selectedTier) return TIER_AMOUNTS[selectedTier];
    if ((activeTab === 'monthly' || activeTab === 'one_time') && flexAmount) return flexAmount;
    return 0;
  };

  const computedTier = (): string => {
    if (activeTab === 'annual' && selectedTier) return selectedTier;
    if (activeTab === 'monthly') return 'monthly';
    if (activeTab === 'one_time') return 'one_time';
    return '';
  };

  const preSelectedBusinessSupport = computedAmount() > 0
    ? { tier: computedTier(), amount: computedAmount(), frequency: activeTab }
    : null;

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
    heroHeading: isAr ? 'ادعم مجتمعك من خلال عملك' : 'Support Your Community Through Your Business',
    heroDescription: isAr
      ? 'انضم إلى شبكة الشركات التي تدعم جمعية الجالية اليمنية في برمنغهام. دعمكم يساعدنا على تقديم خدمات حيوية وبرامج مجتمعية للجالية اليمنية والمجتمعات الأوسع في برمنغهام.'
      : 'Join our network of businesses supporting the Yemeni Community Association Birmingham. Your support helps us deliver vital services and community programmes to the Yemeni community and the wider Birmingham communities.',
    whySupport: isAr ? 'لماذا تدعم جمعية الجالية اليمنية؟' : 'Why Support YCA?',
    whySupportDesc: isAr
      ? 'دعمكم لا يُحدث فرقاً في حياة أفراد المجتمع فحسب، بل يُظهر أيضاً التزام شركتكم بالمسؤولية الاجتماعية والتنوع والشمول.'
      : "Your support not only makes a difference in the lives of community members, but also demonstrates your company's commitment to social responsibility, diversity, and inclusion.",
    chooseTier: isAr ? 'اختر مستوى الدعم' : 'Choose Your Support Tier',
    chooseTierDesc: isAr ? 'اختر الباقة المناسبة لعملك وأكمل الدفع مباشرة' : 'Select the package that suits your business and complete payment directly',
    perYear: isAr ? '/سنوياً' : '/year',
    bronze: isAr ? 'برونزي' : 'Bronze',
    silver: isAr ? 'فضي' : 'Silver',
    gold: isAr ? 'ذهبي' : 'Gold',
    annualTab: isAr ? 'الباقات السنوية' : 'Annual Packages',
    monthlyTab: isAr ? 'شهري' : 'Monthly',
    oneTimeTab: isAr ? 'مرة واحدة' : 'One-Time',
    monthlyDesc: isAr ? 'ادعمنا بتبرع شهري مرن يناسب ميزانيتكم' : 'Support us with a flexible monthly donation that suits your budget',
    oneTimeDesc: isAr ? 'قدّموا تبرعاً لمرة واحدة بأي مبلغ' : 'Make a one-time donation of any amount',
    selectAmount: isAr ? 'اختر المبلغ' : 'Select Amount',
    customAmount: isAr ? 'مبلغ مخصص' : 'Custom Amount',
    proceedToPay: isAr ? 'متابعة للدفع' : 'Proceed to Payment',
    selectionRequired: isAr
      ? activeTab === 'annual' ? 'يرجى اختيار باقة أولاً' : 'يرجى اختيار مبلغ أولاً'
      : activeTab === 'annual' ? 'Please select a package first' : 'Please select an amount first',
    securePayment: isAr ? 'دفع آمن عبر Stripe' : 'Secure payment via Stripe',
    yourSelection: isAr ? 'اختيارك' : 'Your Selection',
    currentSupporters: isAr ? 'داعمونا الحاليون' : 'Our Current Supporters',
    currentSupportersDesc: isAr
      ? 'نفخر بالشركات التي تدعم عملنا المجتمعي. شكراً لكم على مساهمتكم القيمة.'
      : 'We are proud of the businesses that support our community work. Thank you for your valuable contribution.',
    goldSupporters: isAr ? 'الداعمون الذهبيون' : 'Gold Supporters',
    silverSupporters: isAr ? 'الداعمون الفضيون' : 'Silver Supporters',
    bronzeSupporters: isAr ? 'الداعمون البرونزيون' : 'Bronze Supporters',
    noSupportersYet: isAr ? 'كن أول داعم في هذه الفئة!' : 'Be the first supporter in this tier!',
    visitWebsite: isAr ? 'زيارة الموقع' : 'Visit Website',
    viewSupporters: isAr ? 'عرض الداعمين الحاليين' : 'View Current Supporters',
    hideSupporters: isAr ? 'إخفاء الداعمين' : 'Hide Supporters',
    loading: isAr ? 'جاري التحميل...' : 'Loading...',
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
  };

  const annualTiers = [
    {
      id: 'bronze' as const,
      name: txt.bronze,
      price: '£500',
      amount: 500,
      icon: Award,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      borderColor: 'border-amber-300',
      selectedBorder: 'border-amber-500',
      selectedBg: 'bg-amber-50',
      benefits: txt.bronzeBenefits,
      popular: false,
    },
    {
      id: 'silver' as const,
      name: txt.silver,
      price: '£1,500',
      amount: 1500,
      icon: Star,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-500',
      borderColor: 'border-gray-300',
      selectedBorder: 'border-gray-500',
      selectedBg: 'bg-gray-50',
      benefits: txt.silverBenefits,
      popular: true,
    },
    {
      id: 'gold' as const,
      name: txt.gold,
      price: '£3,000',
      amount: 3000,
      icon: Crown,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-400',
      selectedBorder: 'border-yellow-500',
      selectedBg: 'bg-yellow-50',
      benefits: txt.goldBenefits,
      popular: false,
    },
  ];

  const handleAnnualTierSelect = (tierId: 'bronze' | 'silver' | 'gold') => {
    setSelectedTier(tierId);
    setSelectionError(false);
  };

  const handleFlexAmountSelect = (amount: number) => {
    setFlexAmount(amount);
    setCustomInput(String(amount));
    setSelectionError(false);
  };

  const handleCustomInput = (val: string) => {
    setCustomInput(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 10) {
      setFlexAmount(n);
      setSelectionError(false);
    } else {
      setFlexAmount(null);
    }
  };

  const handleTabChange = (tab: SupportFrequency) => {
    setActiveTab(tab);
    setSelectedTier(null);
    setFlexAmount(null);
    setCustomInput('');
    setSelectionError(false);
  };

  const handleProceedToPayment = () => {
    if (computedAmount() <= 0) {
      setSelectionError(true);
      return;
    }
    setModalOpen(true);
  };

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
                    alt={supporter.business_name}
                    className="w-16 h-16 object-contain rounded-lg bg-white p-2"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={28} className="text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-primary truncate">{supporter.business_name}</h4>
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
      <PageHeader
        title={txt.title}
        breadcrumbs={[
          { label: txt.breadcrumbGetInvolved, path: '/get-involved/membership' },
          { label: txt.title },
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

      <section className="py-20 bg-gradient-to-b from-sand/20 to-white" id="support-selector">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">
              {txt.chooseTier}
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">{txt.chooseTierDesc}</p>
          </motion.div>

          <div className="max-w-4xl mx-auto mb-10">
            <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-xl">
              {([
                { key: 'annual' as const, label: txt.annualTab },
                { key: 'monthly' as const, label: txt.monthlyTab },
                { key: 'one_time' as const, label: txt.oneTimeTab },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-primary hover:bg-white/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'annual' && (
              <motion.div
                key="annual"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-10"
              >
                {annualTiers.map((tier) => {
                  const Icon = tier.icon;
                  const isSelected = selectedTier === tier.id;
                  return (
                    <motion.div
                      key={tier.id}
                      className="relative"
                      whileHover={{ y: -6 }}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
                            {isAr ? 'الأكثر شيوعاً' : 'Popular'}
                          </span>
                        </div>
                      )}
                      <div
                        className={`bg-white rounded-xl border-2 p-8 h-full flex flex-col transition-all cursor-pointer ${
                          isSelected
                            ? `${tier.selectedBorder} ${tier.selectedBg} shadow-2xl`
                            : `${tier.borderColor} ${tier.popular ? 'shadow-2xl scale-105' : 'shadow-lg hover:shadow-2xl'}`
                        }`}
                        onClick={() => handleAnnualTierSelect(tier.id)}
                      >
                        {isSelected && (
                          <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
                            <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                              <Check size={16} className="text-white" />
                            </div>
                          </div>
                        )}
                        <div className={`w-16 h-16 ${tier.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <Icon size={32} className={tier.iconColor} />
                        </div>
                        <h3 className="text-2xl font-bold text-primary text-center mb-2">
                          {tier.name}
                        </h3>
                        <div className="text-center mb-6">
                          <span className="text-4xl font-bold text-emerald-600">{tier.price}</span>
                          <span className="text-muted text-sm">{txt.perYear}</span>
                        </div>
                        <ul className="space-y-3 flex-1 mb-8">
                          {tier.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <Award size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span className="text-muted">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAnnualTierSelect(tier.id);
                          }}
                          className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : tier.popular
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-primary/10 hover:bg-primary/20 text-primary'
                          }`}
                        >
                          {isSelected
                            ? (isAr ? 'تم الاختيار' : 'Selected')
                            : (isAr ? 'اختر هذه الباقة' : 'Select Package')}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {(activeTab === 'monthly' || activeTab === 'one_time') && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="max-w-2xl mx-auto mb-10"
              >
                <div className="bg-white rounded-2xl border-2 border-border p-8 shadow-lg">
                  <p className="text-center text-muted mb-6">
                    {activeTab === 'monthly' ? txt.monthlyDesc : txt.oneTimeDesc}
                  </p>
                  <p className="text-sm font-semibold text-gray-700 mb-4 text-center">{txt.selectAmount}</p>
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {(activeTab === 'monthly' ? MONTHLY_AMOUNTS : ONE_TIME_AMOUNTS).map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleFlexAmountSelect(amount)}
                        className={`py-3 rounded-lg border-2 font-bold text-sm transition-all ${
                          flexAmount === amount
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-600 shadow-md'
                            : 'border-gray-200 text-gray-700 hover:border-emerald-600/50'
                        }`}
                      >
                        £{amount}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{txt.customAmount}</label>
                    <div className="relative">
                      <span className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-500 font-medium`}>£</span>
                      <input
                        type="number"
                        min="10"
                        value={customInput}
                        onChange={(e) => handleCustomInput(e.target.value)}
                        placeholder="10"
                        className={`w-full ${isRTL ? 'pr-8 pl-4' : 'pl-8 pr-4'} py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-600 focus:outline-none text-sm`}
                      />
                    </div>
                  </div>
                  {flexAmount && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center"
                    >
                      <span className="text-emerald-700 font-semibold text-sm">
                        {isAr ? `المبلغ المختار: £${flexAmount}` : `Selected: £${flexAmount}`}
                        {activeTab === 'monthly' && (isAr ? ' / شهرياً' : ' / month')}
                      </span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="max-w-2xl mx-auto">
            {selectionError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center"
              >
                <p className="text-sm text-red-700">{txt.selectionRequired}</p>
              </motion.div>
            )}

            <div className="bg-white rounded-2xl border-2 border-border p-6 shadow-sm">
              {preSelectedBusinessSupport && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-emerald-600 font-medium mb-0.5">{txt.yourSelection}</p>
                      <p className="font-bold text-emerald-800">
                        {activeTab === 'annual' && selectedTier
                          ? annualTiers.find(t => t.id === selectedTier)?.name
                          : activeTab === 'monthly'
                          ? txt.monthlyTab
                          : txt.oneTimeTab}
                      </p>
                    </div>
                    <p className="text-3xl font-black text-emerald-600">£{computedAmount()}</p>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={computedAmount() <= 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {txt.proceedToPay}
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-400">
                <Shield size={13} />
                <span>{txt.securePayment}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <button
              onClick={() => setShowSupportersSection(!showSupportersSection)}
              className="inline-flex items-center gap-2 text-primary hover:text-accent font-semibold transition-colors text-lg"
            >
              {showSupportersSection ? txt.hideSupporters : txt.viewSupporters}
              {showSupportersSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </motion.div>

          <AnimatePresence>
            {showSupportersSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <motion.div
                  className="text-center mb-12"
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {modalOpen && (
        <MembershipPaymentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          membershipType={businessPlan}
          preSelectedBusinessSupport={preSelectedBusinessSupport}
        />
      )}
    </div>
  );
}
