import { CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';

export default function MembershipCard() {
  const { language } = useLanguage();
  const { member } = useMemberAuth();

  const translations = {
    en: {
      active: 'Active',
      expiringSoon: 'Expiring Soon',
      expired: 'Expired',
      individual: 'Individual',
      family: 'Family',
      business: 'Business',
      student: 'Student',
      associate: 'Associate',
      business_support: 'Business Support',
    },
    ar: {
      active: 'نشط',
      expiringSoon: 'ينتهي قريباً',
      expired: 'منتهي',
      individual: 'فردي',
      family: 'عائلي',
      business: 'أعمال',
      student: 'طالب',
      associate: 'منتسب',
      business_support: 'دعم الأعمال',
    },
  };

  const t = translations[language];
  const isRTL = language === 'ar';

  if (!member) return null;

  const getDaysUntilExpiry = () => {
    if (!member.expiry_date) return null;
    const today = new Date();
    const expiry = new Date(member.expiry_date);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysUntilExpiry();

  const getStatusInfo = () => {
    if (!daysRemaining) return { label: t.active, color: 'text-emerald-300', icon: CheckCircle };
    if (daysRemaining < 0) return { label: t.expired, color: 'text-red-300', icon: AlertCircle };
    if (daysRemaining <= 30) return { label: t.expiringSoon, color: 'text-amber-300', icon: Clock };
    return { label: t.active, color: 'text-emerald-300', icon: CheckCircle };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  const getMembershipTypeLabel = () => {
    const types: Record<string, string> = {
      individual: t.individual,
      family: t.family,
      business: t.business,
      student: t.student,
      associate: t.associate,
      business_support: t.business_support,
    };
    return types[member.membership_type] || member.membership_type;
  };

  return (
    <div
      className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-xl shadow-lg overflow-hidden max-w-[260px]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <CreditCard className="w-5 h-5 text-white/50" />
          <div className={`flex items-center gap-1 ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            <span className="text-[10px] font-semibold">{status.label}</span>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-white font-bold text-sm leading-tight">
            {member.first_name} {member.last_name}
          </p>
          <p className="text-emerald-200 text-[11px] mt-0.5">{getMembershipTypeLabel()}</p>
        </div>

        <div className="bg-white/10 rounded-lg px-3 py-2">
          <p className="text-white text-lg font-bold tracking-widest leading-none">
            {member.member_number}
          </p>
        </div>
      </div>

      <div className="bg-white/5 px-4 py-2 flex items-center justify-between">
        <p className="text-emerald-200 text-[10px]">
          {member.expiry_date
            ? new Date(member.expiry_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-'}
        </p>
        <p className="text-emerald-200 text-[10px] font-medium">YCA</p>
      </div>
    </div>
  );
}
