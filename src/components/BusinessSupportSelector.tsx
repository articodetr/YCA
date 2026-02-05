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
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('annual')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            selectedTab === 'annual'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 size={20} />
            <span>{language === 'ar' ? 'باقات سنوية' : 'Annual Packages'}</span>
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('monthly')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            selectedTab === 'monthly'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            <span>{language === 'ar' ? 'دعم شهري' : 'Monthly Support'}</span>
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('one_time')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            selectedTab === 'one_time'
              ? 'text-accent border-b-2 border-accent'
              : 'text-gray-600 hover:text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Gift size={20} />
            <span>{language === 'ar' ? 'دعم لمرة واحدة' : 'One-Time Support'}</span>
          </div>
        </button>
      </div>

      {selectedTab === 'annual' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {annualPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handleSelection(pkg.id, pkg.amount, 'annual')}
              className={`text-left p-6 rounded-xl border-2 transition-all ${
                selectedTier === pkg.id
                  ? 'border-accent bg-accent/5 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-accent/50 hover:shadow-md'
              }`}
            >
              <div className={`w-12 h-12 ${pkg.color} rounded-lg flex items-center justify-center mb-4`}>
                <Building2 size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">
                {language === 'ar' ? pkg.nameAr : pkg.nameEn}
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-accent">£{pkg.amount}</span>
                <span className="text-gray-600">
                  {language === 'ar' ? '/سنوياً' : '/year'}
                </span>
              </div>
              <ul className="space-y-2">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-accent flex-shrink-0 mt-0.5" />
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
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {monthlyAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleSelection('monthly', amount, 'monthly')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTier === 'monthly' && customAmount === String(amount)
                    ? 'border-accent bg-accent/5 shadow-lg'
                    : 'border-gray-200 hover:border-accent/50'
                }`}
              >
                <div className="text-2xl font-bold text-accent">£{amount}</div>
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
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    const amount = parseFloat(e.target.value);
                    if (amount >= 10) {
                      handleSelection('monthly', amount, 'monthly');
                    }
                  }}
                  placeholder="10"
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-accent focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  const amount = parseFloat(customAmount);
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
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {oneTimeAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleSelection('one_time', amount, 'one_time')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTier === 'one_time' && customAmount === String(amount)
                    ? 'border-accent bg-accent/5 shadow-lg'
                    : 'border-gray-200 hover:border-accent/50'
                }`}
              >
                <div className="text-2xl font-bold text-accent">£{amount}</div>
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
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    const amount = parseFloat(e.target.value);
                    if (amount >= 10) {
                      handleSelection('one_time', amount, 'one_time');
                    }
                  }}
                  placeholder="10"
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-accent focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  const amount = parseFloat(customAmount);
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
