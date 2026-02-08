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
      { en: 'Member rates on services', ar: 'أسعار خاصة للخدمات', included: true },
      { en: 'Priority booking', ar: 'حجز ذو أولوية', included: true },
      { en: 'Event discounts', ar: 'خصومات الفعاليات', included: true },
      { en: 'Partner offers', ar: 'عروض الشركاء', included: true },
      { en: 'Voting rights', ar: 'حقوق التصويت', included: true },
      { en: 'Family coverage', ar: 'تغطية العائلة', included: false },
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
    descEn: 'Parents & children under 18',
    descAr: 'الوالدين والأطفال تحت 18',
    popular: false,
    features: [
      { en: 'Member rates on services', ar: 'أسعار خاصة للخدمات', included: true },
      { en: 'Priority booking', ar: 'حجز ذو أولوية', included: true },
      { en: 'Event discounts', ar: 'خصومات الفعاليات', included: true },
      { en: 'Partner offers', ar: 'عروض الشركاء', included: true },
      { en: 'Voting rights', ar: 'حقوق التصويت', included: true },
      { en: 'Family coverage', ar: 'تغطية العائلة', included: true },
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
    descAr: 'غير اليمنيين واليمنيين خارج برمنغهام',
    popular: false,
    features: [
      { en: 'Member rates on services', ar: 'أسعار خاصة للخدمات', included: true },
      { en: 'Priority booking', ar: 'حجز ذو أولوية', included: false },
      { en: 'Event discounts', ar: 'خصومات الفعاليات', included: true },
      { en: 'Partner offers', ar: 'عروض الشركاء', included: true },
      { en: 'Voting rights', ar: 'حقوق التصويت', included: false },
      { en: 'Family coverage', ar: 'تغطية العائلة', included: false },
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
    descAr: 'ادعم عملنا المجتمعي',
    popular: false,
    features: [
      { en: 'Business recognition', ar: 'تقدير الأعمال', included: true },
      { en: 'Logo on website', ar: 'الشعار على الموقع', included: true },
      { en: 'Event sponsorship', ar: 'رعاية الفعاليات', included: true },
      { en: 'Priority booking', ar: 'حجز ذو أولوية', included: false },
      { en: 'Voting rights', ar: 'حقوق التصويت', included: false },
      { en: 'Family coverage', ar: 'تغطية العائلة', included: false },
    ],
  },
];
