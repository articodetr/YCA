import { useState } from 'react';
import { CheckCircle, Building2, Calendar, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

interface BusinessSupportSelectorProps {
  onSelect: (data: {
    tier: string;
    amount: number;
    frequency: 'annual' | 'monthly' | 'one_time';
  }) => void;
}

export default function BusinessSupportSelector({ onSelect }: BusinessSupportSelectorProps) {
  const { language } = useLanguage();
  const [selectedTab, setSelectedTab] = useState<'annual' | 'monthly' | 'one_time'>('annual');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');

  const annualPackages = [
    {
      id: 'bronze',
      nameEn: 'Bronze Package',
      nameAr: 'باقة برونز',
      amount: 500,
      color: 'bg-amber-700',
      features: ['Recognition on website', 'Quarterly updates', 'Community gratitude']
    },
    {
      id: 'silver',
      nameEn: 'Silver Package',
      nameAr: 'باقة فضية',
      amount: 1500,
      color: 'bg-gray-400',
      features: ['All Bronze benefits', 'Logo on materials', 'Biannual reports', 'Event invitations']
    },
    {
      id: 'gold',
      nameEn: 'Gold Package',
      nameAr: 'باقة ذهبية',
      amount: 3000,
      color: 'bg-yellow-500',
      features: ['All Silver benefits', 'Premium logo placement', 'Monthly reports', 'VIP event access', 'Partnership opportunities']
    }
  ];

  const monthlyAmounts = [10, 25, 50, 100, 250];
  const oneTimeAmounts = [10, 25, 50, 100, 250];

  const handleSelection = (tier: string, amount: number, frequency: 'annual' | 'monthly' | 'one_time') => {
    setSelectedTier(tier);
    onSelect({ tier, amount, frequency });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-gray-100 p-1.5 sm:p-2 rounded-xl">
        {([
          { key: 'annual' as const, icon: Building2, labelEn: 'Annual', labelAr: 'سنوي' },
          { key: 'monthly' as const, icon: Calendar, labelEn: 'Monthly', labelAr: 'شهري' },
          { key: 'one_time' as const, icon: Gift, labelEn: 'One-Time', labelAr: 'مرة واحدة' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`flex flex-col items-center gap-1 sm:flex-row sm:gap-2 sm:justify-center px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              selectedTab === tab.key
                ? 'bg-white text-accent shadow-sm'
                : 'text-gray-500 hover:text-primary hover:bg-white/50'
            }`}
          >
            <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {selectedTab === 'annual' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
        >
          {annualPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handleSelection(pkg.id, pkg.amount, 'annual')}
              className={`text-left p-4 sm:p-5 md:p-6 rounded-xl border-2 transition-all ${
                selectedTier === pkg.id
                  ? 'border-accent bg-accent/5 shadow-lg sm:scale-105'
                  : 'border-gray-200 hover:border-accent/50 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 sm:block">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${pkg.color} rounded-lg flex items-center justify-center sm:mb-4 flex-shrink-0`}>
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="sm:hidden flex-1">
                  <h3 className="text-base font-bold text-primary">
                    {language === 'ar' ? pkg.nameAr : pkg.nameEn}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-accent">£{pkg.amount}</span>
                    <span className="text-sm text-gray-600">
                      {language === 'ar' ? '/سنوياً' : '/year'}
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="hidden sm:block text-xl font-bold text-primary mb-2">
                {language === 'ar' ? pkg.nameAr : pkg.nameEn}
              </h3>
              <div className="hidden sm:flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-accent">£{pkg.amount}</span>
                <span className="text-gray-600">
                  {language === 'ar' ? '/سنوياً' : '/year'}
                </span>
              </div>
              <ul className="space-y-1.5 sm:space-y-2 mt-3 sm:mt-0">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </motion.div>
      )}

      {selectedTab === 'monthly' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-6">
            <p className="text-gray-600">
              {language === 'ar'
                ? 'اختر مبلغاً شهرياً أو أدخل مبلغاً مخصصاً (الحد الأدنى £10)'
                : 'Choose a monthly amount or enter a custom amount (minimum £10)'}
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
            {monthlyAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setCustomAmount(String(amount));
                  handleSelection('monthly', amount, 'monthly');
                }}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  customAmount === String(amount)
                    ? 'border-accent bg-accent/5 shadow-lg'
                    : 'border-gray-200 hover:border-accent/50'
                }`}
              >
                <div className="text-lg sm:text-2xl font-bold text-accent">£{amount}</div>
                <div className="text-xs text-gray-600">
                  {language === 'ar' ? '/شهر' : '/month'}
                </div>
              </button>
            ))}
          </div>
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'مبلغ مخصص' : 'Custom Amount'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                <input
                  type="number"
                  min="10"
                  step="1"
                  value={customAmount}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const num = parseFloat(raw);
                    if (!raw) {
                      setCustomAmount('');
                      return;
                    }
                    const pounds = Number.isFinite(num) ? Math.round(num) : 0;
                    setCustomAmount(String(pounds));
                    if (pounds >= 10) {
                      handleSelection('monthly', pounds, 'monthly');
                    }
                  }}
                  placeholder="10"
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-accent focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  const num = parseFloat(customAmount);
                  const amount = Number.isFinite(num) ? Math.round(num) : 0;
                  if (amount >= 10) {
                    handleSelection('monthly', amount, 'monthly');
                  }
                }}
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-hover transition-colors font-semibold"
              >
                {language === 'ar' ? 'تأكيد' : 'Confirm'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {selectedTab === 'one_time' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-6">
            <p className="text-gray-600">
              {language === 'ar'
                ? 'قدم مساهمة لمرة واحدة لدعم عملنا'
                : 'Make a one-time contribution to support our work'}
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
            {oneTimeAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setCustomAmount(String(amount));
                  handleSelection('one_time', amount, 'one_time');
                }}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                  customAmount === String(amount)
                    ? 'border-accent bg-accent/5 shadow-lg'
                    : 'border-gray-200 hover:border-accent/50'
                }`}
              >
                <div className="text-lg sm:text-2xl font-bold text-accent">£{amount}</div>
              </button>
            ))}
          </div>
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {language === 'ar' ? 'مبلغ مخصص' : 'Custom Amount'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                <input
                  type="number"
                  min="10"
                  step="1"
                  value={customAmount}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const num = parseFloat(raw);
                    if (!raw) {
                      setCustomAmount('');
                      return;
                    }
                    const pounds = Number.isFinite(num) ? Math.round(num) : 0;
                    setCustomAmount(String(pounds));
                    if (pounds >= 10) {
                      handleSelection('one_time', pounds, 'one_time');
                    }
                  }}
                  placeholder="10"
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-accent focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  const num = parseFloat(customAmount);
                  const amount = Number.isFinite(num) ? Math.round(num) : 0;
                  if (amount >= 10) {
                    handleSelection('one_time', amount, 'one_time');
                  }
                }}
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-hover transition-colors font-semibold"
              >
                {language === 'ar' ? 'تأكيد' : 'Confirm'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
