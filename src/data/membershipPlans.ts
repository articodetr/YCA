import { Users, Heart, Globe2, Building2 } from 'lucide-react';

export interface MembershipFeature {
  en: string;
  ar: string;
  included: boolean;
}

export interface MembershipPlan {
  id: string;
  icon: typeof Users;
  nameEn: string;
  nameAr: string;
  price: number;
  priceLabel: string;
  period: { en: string; ar: string };
  descEn: string;
  descAr: string;
  popular: boolean;
  features: MembershipFeature[];
}

export const membershipPlans: MembershipPlan[] = [
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
      { en: 'Member rates on services', ar: 'أسعار أعضاء للخدمات', included: true },
      { en: 'Priority booking', ar: 'أولوية الحجز', included: true },
      { en: 'Discounts on events & programmes', ar: 'خصومات فعاليات وبرامج', included: true },
      { en: 'Partner offers (where available)', ar: 'عروض الشركاء (إن وجدت)', included: true },
      { en: 'AGM attendance (eligible)', ar: 'حضور AGM (للمؤهلين)', included: true },
      { en: 'Family coverage', ar: 'تشمل العائلة', included: false },
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
    descEn: 'Parents/guardians + under-18s (same address)',
    descAr: 'ولي أمر + تحت 18 (نفس العنوان)',
    popular: false,
    features: [
      { en: 'Member rates on services', ar: 'أسعار أعضاء للخدمات', included: true },
      { en: 'Priority booking', ar: 'أولوية الحجز', included: true },
      { en: 'Discounts on events & programmes', ar: 'خصومات فعاليات وبرامج', included: true },
      { en: 'Partner offers (where available)', ar: 'عروض الشركاء (إن وجدت)', included: true },
      { en: 'Family coverage (under 18)', ar: 'تشمل الأسرة (تحت 18)', included: true },
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
    descAr: 'غير يمنيين + يمنيون خارج برمنغهام',
    popular: false,
    features: [
      { en: 'Member rates on services', ar: 'أسعار أعضاء للخدمات', included: true },
      { en: 'Discounts on events & programmes', ar: 'خصومات فعاليات وبرامج', included: true },
      { en: 'Partner offers (where available)', ar: 'عروض الشركاء (إن وجدت)', included: true },
      { en: 'No voting/governance rights', ar: 'لا تصويت/حوكمة', included: false },
      { en: 'Priority booking', ar: 'أولوية الحجز', included: false },
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
    descAr: 'دعم العمل المجتمعي',
    popular: false,
    features: [
      { en: 'Recognition on website (name/logo)', ar: 'إدراج الاسم/الشعار بالموقع', included: true },
      { en: 'Supporter certificate', ar: 'شهادة داعم', included: true },
      { en: 'Impact updates', ar: 'تحديثات الأثر', included: true },
      { en: 'Bronze/Silver/Gold options', ar: 'باقات Bronze/Silver/Gold', included: true },
      { en: 'No voting/governance rights', ar: 'بدون تصويت/حوكمة', included: false },
    ],
  },
];
