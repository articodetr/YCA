import { useState, useEffect } from 'react';
import { Users, Heart, Calendar, TrendingUp, UserCheck, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface Stats {
  totalDonations: number;
  totalDonationAmount: number;
  totalEvents: number;
  totalRegistrations: number;
  totalMemberships: number;
  totalSubscribers: number;
  recentDonations: any[];
  recentRegistrations: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalDonations: 0,
    totalDonationAmount: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    totalMemberships: 0,
    totalSubscribers: 0,
    recentDonations: [],
    recentRegistrations: [],
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
        recentDonationsRes,
        recentRegistrationsRes,
      ] = await Promise.all([
        supabase.from('donations').select('amount', { count: 'exact' }),
        supabase.from('events').select('*', { count: 'exact' }),
        supabase.from('event_registrations').select('*', { count: 'exact' }),
        supabase.from('membership_applications').select('*', { count: 'exact' }),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact' }),
        supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('event_registrations')
          .select('*, events(title)')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const totalAmount = donationsRes.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

      setStats({
        totalDonations: donationsRes.count || 0,
        totalDonationAmount: totalAmount,
        totalEvents: eventsRes.count || 0,
        totalRegistrations: registrationsRes.count || 0,
        totalMemberships: membershipsRes.count || 0,
        totalSubscribers: subscribersRes.count || 0,
        recentDonations: recentDonationsRes.data || [],
        recentRegistrations: recentRegistrationsRes.data || [],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Donations',
      value: `£${stats.totalDonationAmount.toLocaleString()}`,
      subtitle: `${stats.totalDonations} donations`,
      icon: Heart,
      color: 'bg-rose-500',
      link: '/admin/donations',
    },
    {
      title: 'Events',
      value: stats.totalEvents.toString(),
      subtitle: 'Active events',
      icon: Calendar,
      color: 'bg-blue-500',
      link: '/admin/events',
    },
    {
      title: 'Event Registrations',
      value: stats.totalRegistrations.toString(),
      subtitle: 'Total registrations',
      icon: Users,
      color: 'bg-emerald-500',
      link: '/admin/registrations',
    },
    {
      title: 'Memberships',
      value: stats.totalMemberships.toString(),
      subtitle: 'Applications',
      icon: UserCheck,
      color: 'bg-amber-500',
      link: '/admin/memberships',
    },
    {
      title: 'Newsletter Subscribers',
      value: stats.totalSubscribers.toString(),
      subtitle: 'Active subscribers',
      icon: Mail,
      color: 'bg-purple-500',
      link: '/admin/subscribers',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Donations</h2>
          </div>
          <div className="p-6">
            {stats.recentDonations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No donations yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {donation.full_name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        £{donation.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{donation.donation_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Event Registrations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
          </div>
          <div className="p-6">
            {stats.recentRegistrations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No registrations yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{registration.full_name}</p>
                      <p className="text-sm text-gray-500">
                        {registration.events?.title || 'Event'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(registration.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
