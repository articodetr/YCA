import { supabase } from './supabase';

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentType = 'donation' | 'membership' | 'wakala' | 'event';

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

export async function fetchPaymentHistory(
  email: string,
  userId: string,
  language: 'en' | 'ar' = 'en'
): Promise<PaymentItem[]> {
  const [donationsRes, membershipRes, wakalaRes, eventRes] = await Promise.all([
    supabase
      .from('donations')
      .select('id, amount, payment_status, payment_intent_id, donation_type, created_at')
      .eq('email', email)
      .order('created_at', { ascending: false }),

    supabase
      .from('membership_applications')
      .select('id, membership_type, payment_status, payment_intent_id, created_at')
      .or(`email.eq.${email},user_id.eq.${userId}`)
      .neq('status', 'deleted_by_admin')
      .order('created_at', { ascending: false }),

    supabase
      .from('wakala_applications')
      .select('id, fee_amount, payment_status, service_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    supabase
      .from('event_registrations')
      .select('id, total_amount, amount_paid, payment_status, booking_reference, created_at')
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
    items.push({
      id: `membership_${row.id}`,
      type: 'membership',
      amount: 0,
      status: normalizeMembershipStatus(row.payment_status),
      created_at: row.created_at,
      title: membershipTypeLabel(row.membership_type, language),
      ref: row.payment_intent_id || undefined,
    });
  }

  for (const row of wakalaRes.data || []) {
    const wakalaLabel = language === 'ar' ? 'خدمة وكالة' : 'Wakala Service';
    items.push({
      id: `wakala_${row.id}`,
      type: 'wakala',
      amount: Number(row.fee_amount) || 0,
      status: normalizeGenericStatus(row.payment_status),
      created_at: row.created_at,
      title: wakalaLabel,
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

  return items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
