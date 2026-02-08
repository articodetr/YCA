import { CreditCard, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';

export default function MembershipCard() {
  const { language } = useLanguage();
  const { member } = useMemberAuth();

  const translations = {
    en: {
      memberCard: 'Membership Card',
      memberNumber: 'Member Number',
      memberSince: 'Member Since',
      expiresOn: 'Expires On',
      status: 'Status',
      daysRemaining: 'Days Remaining',
      active: 'Active',
      expiringSoon: 'Expiring Soon',
      expired: 'Expired',
      renewNow: 'Renew Now',
      membershipType: 'Membership Type',
      individual: 'Individual',
      family: 'Family',
      business: 'Business',
      student: 'Student',
    },
    ar: {
      memberCard: 'بطاقة العضوية',
      memberNumber: 'رقم العضوية',
      memberSince: 'عضو منذ',
      expiresOn: 'تنتهي في',
      status: 'الحالة',
      daysRemaining: 'الأيام المتبقية',
      active: 'نشط',
      expiringSoon: 'ينتهي قريباً',
      expired: 'منتهي',
      renewNow: 'جدد الآن',
      membershipType: 'نوع العضوية',
      individual: 'فردي',
      family: 'عائلي',
      business: 'أعمال',
      student: 'طالب',
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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysUntilExpiry();

  const getStatusInfo = () => {
    if (!daysRemaining) return { label: t.active, color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: CheckCircle };
    if (daysRemaining < 0) return { label: t.expired, color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle };
    if (daysRemaining <= 30) return { label: t.expiringSoon, color: 'text-amber-600', bgColor: 'bg-amber-100', icon: Clock };
    return { label: t.active, color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: CheckCircle };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  const getMembershipTypeLabel = () => {
    const types: Record<string, string> = {
      individual: t.individual,
      family: t.family,
      business: t.business,
      student: t.student,
    };
    return types[member.membership_type] || member.membership_type;
  };

  return (
    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl shadow-2xl overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-white text-2xl font-bold mb-1">{t.memberCard}</h3>
            <p className="text-emerald-100 text-sm">{getMembershipTypeLabel()}</p>
          </div>
          <CreditCard className="w-12 h-12 text-white opacity-50" />
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="text-emerald-100 text-sm mb-2">{t.memberNumber}</div>
          <div className="text-white text-4xl font-bold tracking-wider">
            {member.member_number}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-emerald-100 text-xs mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t.memberSince}
            </div>
            <div className="text-white font-semibold">
              {new Date(member.start_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-GB')}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-emerald-100 text-xs mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t.expiresOn}
            </div>
            <div className="text-white font-semibold">
              {member.expiry_date
                ? new Date(member.expiry_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-GB')
                : '-'
              }
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bgColor}`}>
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
            <span className={`font-semibold ${status.color}`}>{status.label}</span>
          </div>

          {daysRemaining !== null && daysRemaining > 0 && (
            <div className="text-white text-right">
              <div className="text-3xl font-bold">{daysRemaining}</div>
              <div className="text-emerald-100 text-xs">{t.daysRemaining}</div>
            </div>
          )}
        </div>

        {daysRemaining !== null && daysRemaining <= 90 && daysRemaining > 0 && (
          <button className="w-full mt-6 bg-white text-emerald-600 font-semibold py-3 px-6 rounded-lg hover:bg-emerald-50 transition-colors">
            {t.renewNow}
          </button>
        )}
      </div>

      <div className="bg-white/5 px-8 py-4">
        <div className="text-white text-sm">
          <span className="font-semibold">
            {member.first_name} {member.last_name}
          </span>
        </div>
      </div>
    </div>
  );
}
