import { useState, useEffect } from 'react';
import {
  Users,
  Heart,
  Calendar,
  UserCheck,
  Mail,
  Loader2,
  ArrowUpRight,
  FileText,
  Newspaper,
  MessageSquare,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface Stats {
  totalDonations: number;
  totalDonationAmount: number;
  totalEvents: number;
  totalRegistrations: number;
  totalMemberships: number;
  totalSubscribers: number;
  totalContacts: number;
  totalWakala: number;
  pendingMemberships: number;
  pendingWakala: number;
  recentDonations: any[];
  recentRegistrations: any[];
  recentContacts: any[];
  expiringMembers: any[];
  expiredMembers: number;
  urgentExpiry: number;
}

const quickActions = [
  { label: 'Events', path: '/admin/events', icon: Calendar, color: 'bg-blue-500' },
  { label: 'News', path: '/admin/news', icon: Newspaper, color: 'bg-amber-500' },
  { label: 'Memberships', path: '/admin/memberships', icon: UserCheck, color: 'bg-emerald-500' },
  { label: 'Messages', path: '/admin/contacts', icon: MessageSquare, color: 'bg-cyan-500' },
  { label: 'Donations', path: '/admin/donations', icon: Heart, color: 'bg-rose-500' },
  { label: 'Wakala', path: '/admin/wakala', icon: FileText, color: 'bg-teal-500' },
];

export default function Dashboard() {
  const { adminData } = useAdminAuth();
  const [stats, setStats] = useState<Stats>({
    totalDonations: 0,
    totalDonationAmount: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    totalMemberships: 0,
    totalSubscribers: 0,
    totalContacts: 0,
    totalWakala: 0,
    pendingMemberships: 0,
    pendingWakala: 0,
    recentDonations: [],
    recentRegistrations: [],
    recentContacts: [],
    expiringMembers: [],
    expiredMembers: 0,
    urgentExpiry: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [
        donationsRes,
        eventsRes,
        registrationsRes,
        membershipsRes,
        subscribersRes,
        contactsRes,
        wakalaRes,
        pendingMembershipsRes,
        pendingWakalaRes,
        recentDonationsRes,
        recentRegistrationsRes,
        recentContactsRes,
        expiringMembersRes,
        expiredMembersRes,
        urgentExpiryRes,
      ] = await Promise.all([
        supabase.from('donations').select('amount', { count: 'exact' }),
        supabase.from('events').select('*', { count: 'exact' }),
        supabase.from('event_registrations').select('*', { count: 'exact' }),
        supabase.from('membership_applications').select('*', { count: 'exact' }),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact' }),
        supabase.from('contact_submissions').select('*', { count: 'exact' }),
        supabase.from('wakala_applications').select('*', { count: 'exact' }),
        supabase.from('membership_applications').select('*', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('wakala_applications').select('*', { count: 'exact' }).eq('status', 'submitted'),
        supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('event_registrations').select('*, events(title)').order('created_at', { ascending: false }).limit(5),
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }).limit(4),
        supabase.from('expiring_memberships').select('*').order('days_until_expiry', { ascending: true }).limit(5),
        supabase.from('expiring_memberships').select('*', { count: 'exact' }).eq('expiry_status', 'expired'),
        supabase.from('expiring_memberships').select('*', { count: 'exact' }).eq('expiry_status', 'urgent'),
      ]);

      const totalAmount = donationsRes.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

      setStats({
        totalDonations: donationsRes.count || 0,
        totalDonationAmount: totalAmount,
        totalEvents: eventsRes.count || 0,
        totalRegistrations: registrationsRes.count || 0,
        totalMemberships: membershipsRes.count || 0,
        totalSubscribers: subscribersRes.count || 0,
        totalContacts: contactsRes.count || 0,
        totalWakala: wakalaRes.count || 0,
        pendingMemberships: pendingMembershipsRes.count || 0,
        pendingWakala: pendingWakalaRes.count || 0,
        recentDonations: recentDonationsRes.data || [],
        recentRegistrations: recentRegistrationsRes.data || [],
        recentContacts: recentContactsRes.data || [],
        expiringMembers: expiringMembersRes.data || [],
        expiredMembers: expiredMembersRes.count || 0,
        urgentExpiry: urgentExpiryRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Donations',
      value: `\u00A3${stats.totalDonationAmount.toLocaleString()}`,
      subtitle: `${stats.totalDonations} donations`,
      icon: Heart,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      link: '/admin/donations',
    },
    {
      title: 'Memberships',
      value: stats.totalMemberships.toString(),
      subtitle: stats.pendingMemberships > 0 ? `${stats.pendingMemberships} pending` : 'Applications',
      icon: UserCheck,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      link: '/admin/memberships',
      badge: stats.pendingMemberships > 0 ? stats.pendingMemberships : undefined,
    },
    {
      title: 'Events',
      value: stats.totalEvents.toString(),
      subtitle: `${stats.totalRegistrations} registrations`,
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      link: '/admin/events',
    },
    {
      title: 'Wakala',
      value: stats.totalWakala.toString(),
      subtitle: stats.pendingWakala > 0 ? `${stats.pendingWakala} pending` : 'Applications',
      icon: FileText,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      link: '/admin/wakala',
      badge: stats.pendingWakala > 0 ? stats.pendingWakala : undefined,
    },
    {
      title: 'Subscribers',
      value: stats.totalSubscribers.toString(),
      subtitle: 'Newsletter',
      icon: Mail,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      link: '/admin/subscribers',
    },
    {
      title: 'Messages',
      value: stats.totalContacts.toString(),
      subtitle: 'Contact messages',
      icon: MessageSquare,
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      link: '/admin/contacts',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {adminData?.full_name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Here is what is happening across your site today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="relative bg-white rounded-xl p-4 border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
            >
              {card.badge && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {card.badge}
                </span>
              )}
              <div className={`${card.iconBg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <p className="text-xl font-bold text-slate-900 leading-tight">{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.subtitle}</p>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 absolute top-4 right-4 transition-colors" />
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200 group"
              >
                <div className={`${action.color} w-9 h-9 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors text-center">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {(stats.expiringMembers.length > 0 || stats.expiredMembers > 0) && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 overflow-hidden">
          <div className="px-5 py-4 bg-white/50 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Membership Expiry Alerts</h2>
                <p className="text-xs text-slate-600">
                  {stats.expiredMembers > 0 && `${stats.expiredMembers} expired`}
                  {stats.expiredMembers > 0 && stats.urgentExpiry > 0 && ', '}
                  {stats.urgentExpiry > 0 && `${stats.urgentExpiry} expiring soon`}
                </p>
              </div>
            </div>
            <Link
              to="/admin/membership-expiry"
              className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-amber-100">
            {stats.expiringMembers.map((member) => (
              <div key={member.id} className="px-5 py-3 flex items-center justify-between hover:bg-white/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {member.first_name} {member.last_name}
                    <span className="text-slate-500 ml-2 text-xs">({member.member_number})</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {member.email}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      member.days_until_expiry < 0 ? 'text-red-600' :
                      member.days_until_expiry <= 7 ? 'text-red-600' :
                      member.days_until_expiry <= 30 ? 'text-amber-600' : 'text-slate-600'
                    }`}>
                      {member.days_until_expiry < 0 ? 'Expired' : `${member.days_until_expiry} days`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(member.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {member.days_until_expiry < 0 ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                      Expired
                    </span>
                  ) : member.days_until_expiry <= 7 ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                      Urgent
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                      Soon
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Donations</h2>
            <Link to="/admin/donations" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentDonations.length === 0 ? (
              <div className="py-10 text-center">
                <Heart className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No donations yet</p>
              </div>
            ) : (
              stats.recentDonations.map((donation) => (
                <div key={donation.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {donation.full_name || 'Anonymous'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatRelativeTime(donation.created_at)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 ml-3 flex-shrink-0">
                    {'\u00A3'}{donation.amount?.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Registrations</h2>
            <Link to="/admin/registrations" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentRegistrations.length === 0 ? (
              <div className="py-10 text-center">
                <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No registrations yet</p>
              </div>
            ) : (
              stats.recentRegistrations.map((reg) => (
                <div key={reg.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{reg.full_name}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {reg.events?.title || 'Event'}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 ml-3 flex-shrink-0">
                    {formatRelativeTime(reg.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Messages</h2>
            <Link to="/admin/contacts" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.recentContacts.length === 0 ? (
              <div className="py-10 text-center">
                <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No messages yet</p>
              </div>
            ) : (
              stats.recentContacts.map((contact) => (
                <div key={contact.id} className="px-5 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-slate-800 truncate">{contact.name}</p>
                    <span className="text-[11px] text-slate-400 ml-3 flex-shrink-0">
                      {formatRelativeTime(contact.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{contact.subject}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
