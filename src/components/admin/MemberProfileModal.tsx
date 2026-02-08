import { useState, useEffect } from 'react';
import {
  X, Download, Loader2, User, Calendar, FileText,
  Phone, Mail, MapPin, Building2, CreditCard, Clock,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MembershipApp {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string;
  address: string;
  city: string | null;
  postcode: string | null;
  membership_type: string;
  status: string;
  payment_status: string | null;
  organization_name: string | null;
  business_support_tier: string | null;
  custom_amount: number | null;
  payment_frequency: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  how_did_you_hear: string | null;
  interests: string | null;
  created_at: string;
}

interface MemberRecord {
  id: string;
  member_number: string;
  status: string;
  start_date: string;
  expiry_date: string;
  membership_type: string;
}

interface WakalaBooking {
  id: string;
  booking_reference: string | null;
  booking_date: string | null;
  start_time: string | null;
  end_time: string | null;
  wakala_type: string | null;
  status: string;
  fee_amount: number | null;
  payment_status: string | null;
  applicant_name: string | null;
  created_at: string;
}

interface EventReg {
  id: string;
  full_name: string;
  number_of_attendees: number;
  ticket_type: string | null;
  amount_paid: number | null;
  payment_status: string | null;
  status: string;
  booking_reference: string | null;
  created_at: string;
  events: { title: string } | null;
}

interface MemberPayment {
  id: string;
  payment_type: string | null;
  amount: number | null;
  currency: string | null;
  payment_method: string | null;
  status: string | null;
  payment_date: string | null;
  receipt_url: string | null;
  created_at: string;
}

interface Props {
  membership: MembershipApp;
  onClose: () => void;
}

export default function MemberProfileModal({ membership, onClose }: Props) {
  const [memberRecord, setMemberRecord] = useState<MemberRecord | null>(null);
  const [wakalaBookings, setWakalaBookings] = useState<WakalaBooking[]>([]);
  const [eventRegs, setEventRegs] = useState<EventReg[]>([]);
  const [payments, setPayments] = useState<MemberPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    wakala: true,
    events: true,
    payments: true,
  });

  const fullName = membership.full_name
    || (membership.first_name && membership.last_name
      ? `${membership.first_name} ${membership.last_name}`
      : membership.first_name || membership.last_name || 'N/A');

  useEffect(() => {
    fetchAllData();
  }, [membership.email]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [memberRes, wakalaRes, eventsRes] = await Promise.all([
        supabase
          .from('members')
          .select('id, member_number, status, start_date, expiry_date, membership_type')
          .eq('email', membership.email)
          .maybeSingle(),
        supabase
          .from('wakala_applications')
          .select('id, booking_reference, booking_date, start_time, end_time, wakala_type, status, fee_amount, payment_status, applicant_name, created_at')
          .eq('email', membership.email)
          .order('created_at', { ascending: false }),
        supabase
          .from('event_registrations')
          .select('id, full_name, number_of_attendees, ticket_type, amount_paid, payment_status, status, booking_reference, created_at, events(title)')
          .eq('email', membership.email)
          .order('created_at', { ascending: false }),
      ]);

      if (memberRes.data) {
        setMemberRecord(memberRes.data);
        const { data: payData } = await supabase
          .from('member_payments')
          .select('id, payment_type, amount, currency, payment_method, status, payment_date, receipt_url, created_at')
          .eq('member_id', memberRes.data.id)
          .order('created_at', { ascending: false });
        setPayments(payData || []);
      }

      setWakalaBookings(wakalaRes.data || []);
      setEventRegs(eventsRes.data || []);
    } catch (err) {
      console.error('Error fetching member data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getAmountDisplay = (): string => {
    if (membership.membership_type === 'business_support' && membership.custom_amount) {
      const freq = membership.payment_frequency === 'annual' ? '/year' : membership.payment_frequency === 'monthly' ? '/month' : '';
      return `\u00A3${membership.custom_amount}${freq}`;
    }
    const prices: Record<string, number> = { individual: 20, family: 30, associate: 20, organization: 50 };
    return membership.membership_type in prices ? `\u00A3${prices[membership.membership_type]}/year` : '-';
  };

  const statusBadge = (status: string, type: 'membership' | 'payment' | 'booking' = 'membership') => {
    const styles: Record<string, Record<string, string>> = {
      membership: {
        approved: 'bg-emerald-100 text-emerald-700',
        rejected: 'bg-red-100 text-red-700',
        pending: 'bg-amber-100 text-amber-700',
        active: 'bg-emerald-100 text-emerald-700',
        expired: 'bg-red-100 text-red-700',
        suspended: 'bg-gray-100 text-gray-600',
      },
      payment: {
        completed: 'bg-emerald-100 text-emerald-700',
        paid: 'bg-emerald-100 text-emerald-700',
        failed: 'bg-red-100 text-red-700',
        pending: 'bg-gray-100 text-gray-600',
        refunded: 'bg-blue-100 text-blue-700',
      },
      booking: {
        submitted: 'bg-blue-100 text-blue-700',
        in_progress: 'bg-amber-100 text-amber-700',
        completed: 'bg-emerald-100 text-emerald-700',
        cancelled: 'bg-red-100 text-red-700',
        confirmed: 'bg-emerald-100 text-emerald-700',
        attended: 'bg-teal-100 text-teal-700',
        no_show: 'bg-gray-100 text-gray-600',
      },
    };
    const s = styles[type]?.[status] || 'bg-gray-100 text-gray-600';
    return (
      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${s}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const exportCSV = () => {
    const lines: string[] = [];
    const esc = (v: string | number | null | undefined) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };

    lines.push('--- PERSONAL INFORMATION ---');
    lines.push('Field,Value');
    lines.push(`Name,${esc(fullName)}`);
    lines.push(`Email,${esc(membership.email)}`);
    lines.push(`Phone,${esc(membership.phone)}`);
    lines.push(`Address,${esc(membership.address)}`);
    lines.push(`City,${esc(membership.city)}`);
    lines.push(`Postcode,${esc(membership.postcode)}`);
    lines.push(`Membership Type,${esc(membership.membership_type)}`);
    lines.push(`Status,${esc(membership.status)}`);
    lines.push(`Payment Status,${esc(membership.payment_status || 'pending')}`);
    lines.push(`Amount,${esc(getAmountDisplay())}`);
    if (membership.business_support_tier) lines.push(`Support Tier,${esc(membership.business_support_tier)}`);
    if (membership.organization_name) lines.push(`Organization,${esc(membership.organization_name)}`);
    if (membership.emergency_contact_name) lines.push(`Emergency Contact,${esc(membership.emergency_contact_name)}`);
    if (membership.emergency_contact_phone) lines.push(`Emergency Phone,${esc(membership.emergency_contact_phone)}`);
    if (membership.how_did_you_hear) lines.push(`How Did You Hear,${esc(membership.how_did_you_hear)}`);
    if (membership.interests) lines.push(`Interests,${esc(membership.interests)}`);
    lines.push(`Applied On,${esc(new Date(membership.created_at).toLocaleDateString())}`);

    if (memberRecord) {
      lines.push('');
      lines.push(`Member Number,${esc(memberRecord.member_number)}`);
      lines.push(`Member Status,${esc(memberRecord.status)}`);
      lines.push(`Start Date,${esc(memberRecord.start_date)}`);
      lines.push(`Expiry Date,${esc(memberRecord.expiry_date)}`);
    }

    if (wakalaBookings.length > 0) {
      lines.push('');
      lines.push('--- WAKALA BOOKINGS ---');
      lines.push('Reference,Date,Time,Type,Status,Fee,Payment Status');
      for (const w of wakalaBookings) {
        lines.push([
          esc(w.booking_reference), esc(w.booking_date),
          w.start_time && w.end_time ? esc(`${w.start_time}-${w.end_time}`) : '',
          esc(w.wakala_type), esc(w.status), w.fee_amount != null ? esc(`\u00A3${w.fee_amount}`) : '',
          esc(w.payment_status),
        ].join(','));
      }
    }

    if (eventRegs.length > 0) {
      lines.push('');
      lines.push('--- EVENT REGISTRATIONS ---');
      lines.push('Event,Attendees,Ticket,Amount,Payment,Status,Reference,Date');
      for (const e of eventRegs) {
        lines.push([
          esc(e.events?.title), esc(e.number_of_attendees), esc(e.ticket_type),
          e.amount_paid != null ? esc(`\u00A3${e.amount_paid}`) : '',
          esc(e.payment_status), esc(e.status), esc(e.booking_reference),
          esc(new Date(e.created_at).toLocaleDateString()),
        ].join(','));
      }
    }

    if (payments.length > 0) {
      lines.push('');
      lines.push('--- PAYMENT HISTORY ---');
      lines.push('Type,Amount,Method,Status,Date');
      for (const p of payments) {
        lines.push([
          esc(p.payment_type),
          p.amount != null ? esc(`${p.currency || '\u00A3'}${p.amount}`) : '',
          esc(p.payment_method), esc(p.status),
          p.payment_date ? esc(new Date(p.payment_date).toLocaleDateString()) : '',
        ].join(','));
      }
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = fullName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    a.download = `member-${safeName}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SectionHeader = ({ title, count, sectionKey, icon: Icon }: {
    title: string; count?: number; sectionKey: string; icon: React.ElementType;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">{title}</span>
        {count !== undefined && (
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{count}</span>
        )}
      </div>
      {expandedSections[sectionKey] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
    </button>
  );

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value || '-'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{fullName}</h2>
              <p className="text-sm text-gray-500">{membership.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <SectionHeader title="Personal Information" sectionKey="personal" icon={User} />
            {expandedSections.personal && (
              <div className="px-4 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {statusBadge(membership.status)}
                  {statusBadge(membership.payment_status || 'pending', 'payment')}
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 capitalize">
                    {membership.membership_type.replace('_', ' ')}
                  </span>
                </div>

                {memberRecord && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-emerald-600 font-medium">Member No.</p>
                        <p className="text-sm font-bold text-emerald-800">{memberRecord.member_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-medium">Status</p>
                        <p className="text-sm font-semibold text-emerald-800 capitalize">{memberRecord.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-medium">Start Date</p>
                        <p className="text-sm text-emerald-800">{new Date(memberRecord.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600 font-medium">Expiry Date</p>
                        <p className="text-sm text-emerald-800">{new Date(memberRecord.expiry_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                    <InfoRow label="Phone" value={membership.phone} />
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                    <InfoRow label="Email" value={membership.email} />
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                    <InfoRow label="Address" value={[membership.address, membership.city, membership.postcode].filter(Boolean).join(', ')} />
                  </div>
                  <div className="flex items-start gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                    <InfoRow label="Amount" value={getAmountDisplay()} />
                  </div>
                  {membership.business_support_tier && (
                    <InfoRow label="Support Tier" value={membership.business_support_tier} />
                  )}
                  {membership.organization_name && (
                    <div className="flex items-start gap-2">
                      <Building2 className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                      <InfoRow label="Organization" value={membership.organization_name} />
                    </div>
                  )}
                  {membership.emergency_contact_name && (
                    <InfoRow
                      label="Emergency Contact"
                      value={`${membership.emergency_contact_name}${membership.emergency_contact_phone ? ` - ${membership.emergency_contact_phone}` : ''}`}
                    />
                  )}
                  {membership.how_did_you_hear && (
                    <InfoRow label="How Did You Hear" value={membership.how_did_you_hear} />
                  )}
                  <div className="flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400 mt-1 shrink-0" />
                    <InfoRow label="Applied On" value={new Date(membership.created_at).toLocaleString()} />
                  </div>
                </div>

                {membership.interests && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Interests</p>
                    <p className="text-sm text-gray-900 mt-0.5">{membership.interests}</p>
                  </div>
                )}
              </div>
            )}

            <SectionHeader title="Wakala Bookings" count={wakalaBookings.length} sectionKey="wakala" icon={FileText} />
            {expandedSections.wakala && (
              <div className="px-1">
                {wakalaBookings.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No wakala bookings found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Ref</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Date</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Time</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Type</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Fee</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {wakalaBookings.map(w => (
                          <tr key={w.id} className="hover:bg-gray-50">
                            <td className="py-2 px-2 text-gray-900 font-medium">{w.booking_reference || '-'}</td>
                            <td className="py-2 px-2 text-gray-600">{w.booking_date ? new Date(w.booking_date).toLocaleDateString() : '-'}</td>
                            <td className="py-2 px-2 text-gray-600">
                              {w.start_time && w.end_time ? `${w.start_time.slice(0, 5)} - ${w.end_time.slice(0, 5)}` : '-'}
                            </td>
                            <td className="py-2 px-2 text-gray-600 capitalize">{w.wakala_type?.replace('_', ' ') || '-'}</td>
                            <td className="py-2 px-2 text-gray-900 font-medium">{w.fee_amount != null ? `\u00A3${w.fee_amount}` : '-'}</td>
                            <td className="py-2 px-2">{statusBadge(w.status, 'booking')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <SectionHeader title="Event Registrations" count={eventRegs.length} sectionKey="events" icon={Calendar} />
            {expandedSections.events && (
              <div className="px-1">
                {eventRegs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No event registrations found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Event</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Attendees</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Ticket</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Amount</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Status</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {eventRegs.map(e => (
                          <tr key={e.id} className="hover:bg-gray-50">
                            <td className="py-2 px-2 text-gray-900 font-medium">{e.events?.title || '-'}</td>
                            <td className="py-2 px-2 text-gray-600">{e.number_of_attendees}</td>
                            <td className="py-2 px-2 text-gray-600 capitalize">{e.ticket_type || '-'}</td>
                            <td className="py-2 px-2 text-gray-900 font-medium">{e.amount_paid != null ? `\u00A3${e.amount_paid}` : '-'}</td>
                            <td className="py-2 px-2">{statusBadge(e.status, 'booking')}</td>
                            <td className="py-2 px-2 text-gray-600">{new Date(e.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <SectionHeader title="Payment History" count={payments.length} sectionKey="payments" icon={CreditCard} />
            {expandedSections.payments && (
              <div className="px-1">
                {payments.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No payment records found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Type</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Amount</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Method</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Status</th>
                          <th className="py-2 px-2 text-left text-xs font-medium text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {payments.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="py-2 px-2 text-gray-900 capitalize">{p.payment_type || '-'}</td>
                            <td className="py-2 px-2 text-gray-900 font-medium">
                              {p.amount != null ? `${p.currency || '\u00A3'}${p.amount}` : '-'}
                            </td>
                            <td className="py-2 px-2 text-gray-600 capitalize">{p.payment_method || '-'}</td>
                            <td className="py-2 px-2">{statusBadge(p.status || 'pending', 'payment')}</td>
                            <td className="py-2 px-2 text-gray-600">
                              {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
