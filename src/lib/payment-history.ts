import { supabase } from './supabase';

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentType = 'donation' | 'membership' | 'wakala' | 'event' | 'translation' | 'legal';

export interface PaymentItem {
  id: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  created_at: string;
  title: string;
  ref?: string;
}

function normalizeDonationStatus(raw: string | null | undefined): PaymentStatus {
  switch (raw) {
    case 'succeeded': return 'paid';
    case 'refunded': return 'refunded';
    case 'failed': return 'failed';
    default: return 'pending';
  }
}

function normalizeMembershipStatus(raw: string | null | undefined): PaymentStatus {
  switch (raw) {
    case 'completed':
    case 'paid': return 'paid';
    case 'failed': return 'failed';
    default: return 'pending';
  }
}

function normalizeGenericStatus(raw: string | null | undefined): PaymentStatus {
  switch (raw) {
    case 'paid':
    case 'completed':
    case 'succeeded': return 'paid';
    case 'failed': return 'failed';
    case 'refunded': return 'refunded';
    default: return 'pending';
  }
}

function membershipTypeLabel(type: string | null | undefined, language: string): string {
  const labels: Record<string, { en: string; ar: string }> = {
    individual: { en: 'Individual Membership', ar: 'عضوية فردية' },
    family: { en: 'Family Membership', ar: 'عضوية عائلية' },
    youth: { en: 'Youth Membership', ar: 'عضوية شباب' },
    associate: { en: 'Associate Membership', ar: 'عضوية مشاركة' },
    student: { en: 'Student Membership', ar: 'عضوية طالب' },
    organization: { en: 'Organisation Membership', ar: 'عضوية منظمة' },
    business_support: { en: 'Business Support Membership', ar: 'عضوية دعم الأعمال' },
  };
  const key = type || '';
  const entry = labels[key];
  if (!entry) return language === 'ar' ? 'عضوية' : 'Membership';
  return language === 'ar' ? entry.ar : entry.en;
}

const MEMBERSHIP_FEES: Record<string, number> = {
  individual: 20,
  family: 40,
  youth: 10,
  associate: 15,
  student: 10,
  organization: 100,
  business_support: 0,
};

export async function fetchPaymentHistory(
  email: string,
  userId: string,
  language: 'en' | 'ar' = 'en'
): Promise<PaymentItem[]> {
  const [donationsRes, membershipRes, wakalaRes, eventRes, translationRes, legalRes] = await Promise.all([
    supabase
      .from('donations')
      .select('id, amount, payment_status, payment_intent_id, donation_type, created_at')
      .eq('email', email)
      .order('created_at', { ascending: false }),

    supabase
      .from('membership_applications')
      .select('id, membership_type, payment_status, custom_amount, created_at')
      .eq('user_id', userId)
      .neq('status', 'deleted_by_admin')
      .order('created_at', { ascending: false }),

    supabase
      .from('wakala_applications')
      .select('id, fee_amount, payment_status, service_type, booking_reference, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    supabase
      .from('event_registrations')
      .select('id, total_amount, amount_paid, payment_status, booking_reference, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    supabase
      .from('translation_requests')
      .select('id, amount_due, payment_status, booking_reference, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    supabase
      .from('other_legal_requests')
      .select('id, amount_due, payment_status, booking_reference, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  const items: PaymentItem[] = [];

  for (const row of donationsRes.data || []) {
    const donationLabel = language === 'ar'
      ? (row.donation_type === 'monthly' ? 'تبرع شهري' : 'تبرع')
      : (row.donation_type === 'monthly' ? 'Monthly Donation' : 'Donation');
    items.push({
      id: `donation_${row.id}`,
      type: 'donation',
      amount: Number(row.amount) || 0,
      status: normalizeDonationStatus(row.payment_status),
      created_at: row.created_at,
      title: donationLabel,
      ref: row.payment_intent_id || undefined,
    });
  }

  for (const row of membershipRes.data || []) {
    const membershipType = row.membership_type as string | null;
    const amount = membershipType === 'business_support'
      ? (Number(row.custom_amount) || 0)
      : (MEMBERSHIP_FEES[membershipType || ''] ?? 0);
    items.push({
      id: `membership_${row.id}`,
      type: 'membership',
      amount,
      status: normalizeMembershipStatus(row.payment_status),
      created_at: row.created_at,
      title: membershipTypeLabel(membershipType, language),
    });
  }

  for (const row of wakalaRes.data || []) {
    const wakalaLabel = language === 'ar' ? 'خدمة الوكالة' : 'Wakala Service';
    items.push({
      id: `wakala_${row.id}`,
      type: 'wakala',
      amount: Number(row.fee_amount) || 0,
      status: normalizeGenericStatus(row.payment_status),
      created_at: row.created_at,
      title: wakalaLabel,
      ref: row.booking_reference || undefined,
    });
  }

  for (const row of eventRes.data || []) {
    const eventLabel = language === 'ar' ? 'تسجيل فعالية' : 'Event Registration';
    const amount = Number(row.total_amount) || Number(row.amount_paid) || 0;
    items.push({
      id: `event_${row.id}`,
      type: 'event',
      amount,
      status: normalizeGenericStatus(row.payment_status),
      created_at: row.created_at,
      title: eventLabel,
      ref: row.booking_reference || undefined,
    });
  }

  for (const row of translationRes.data || []) {
    const translationLabel = language === 'ar' ? 'طلب ترجمة' : 'Translation Request';
    items.push({
      id: `translation_${row.id}`,
      type: 'translation',
      amount: Number(row.amount_due) || 0,
      status: normalizeGenericStatus(row.payment_status),
      created_at: row.created_at,
      title: translationLabel,
      ref: row.booking_reference || undefined,
    });
  }

  for (const row of legalRes.data || []) {
    const legalLabel = language === 'ar' ? 'خدمة قانونية' : 'Legal Service';
    items.push({
      id: `legal_${row.id}`,
      type: 'legal',
      amount: Number(row.amount_due) || 0,
      status: normalizeGenericStatus(row.payment_status),
      created_at: row.created_at,
      title: legalLabel,
      ref: row.booking_reference || undefined,
    });
  }

  return items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
