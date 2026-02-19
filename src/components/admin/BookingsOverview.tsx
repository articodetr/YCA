import { useState, useEffect } from 'react';
import { Calendar, User, Mail, Phone, Search, UserCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { formatTime } from '../../lib/booking-utils';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  full_name: string;
  email: string;
  phone: string;
  service_type: string;
  status: string;
  assigned_admin_name?: string;
  members?: {
    first_name: string;
    last_name: string;
  };
}

interface BookingClickData {
  id: string;
  applicant_name_en: string;
  applicant_name_ar: string;
  email: string;
  phone: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  service_name_en?: string;
  service_name_ar?: string;
  service_type?: string;
  advisory_reason?: string;
  services_provided?: string[] | null;
  created_at: string;
  assigned_admin_id?: string;
  assigned_admin_name?: string;
}

interface BookingsOverviewProps {
  serviceId: string;
  startDate: string;
  endDate: string;
  onBookingClick?: (booking: BookingClickData) => void;
  refreshKey?: number;
}

export default function BookingsOverview({
  serviceId,
  startDate,
  endDate,
  onBookingClick,
  refreshKey,
}: BookingsOverviewProps) {
  const { language } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceName, setServiceName] = useState<{ en: string; ar: string } | null>(null);

  const t = {
    en: {
      title: 'Upcoming Bookings',
      search: 'Search by name, email or phone...',
      allStatus: 'All Status',
      pending_payment: 'Pending Payment',
      submitted: 'Submitted',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      no_show: 'No Show',
      incomplete: 'Incomplete',
      showing: 'Showing',
      of: 'of',
      bookings: 'bookings',
      loading: 'Loading bookings...',
      noBookings: 'No bookings found',
    },
    ar: {
      title: 'الحجوزات القادمة',
      search: 'بحث بالاسم أو البريد أو الهاتف...',
      allStatus: 'جميع الحالات',
      pending_payment: 'بانتظار الدفع',
      submitted: 'مقدّم',
      in_progress: 'قيد المعالجة',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      no_show: 'لم يحضر',
      incomplete: 'لم يكتمل',
      showing: 'عرض',
      of: 'من',
      bookings: 'حجز',
      loading: 'جاري تحميل الحجوزات...',
      noBookings: 'لا توجد حجوزات',
    },
  }[language];

  useEffect(() => {
    loadBookings();
  }, [serviceId, startDate, endDate, refreshKey]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wakala_applications')
        .select(`
          *,
          members(first_name, last_name),
          availability_slots!inner(service_id),
          admins:assigned_admin_id(full_name)
        `)
        .neq('status', 'deleted_by_admin')
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .not('booking_date', 'is', null)
        .eq('availability_slots.service_id', serviceId)
        .order('booking_date')
        .order('start_time');

      if (error) throw error;

      const { data: svc } = await supabase
        .from('booking_services')
        .select('name_en, name_ar')
        .eq('id', serviceId)
        .maybeSingle();
      if (svc) setServiceName({ en: svc.name_en, ar: svc.name_ar });

      const formatted = (data || []).map((b: any) => ({
        ...b,
        assigned_admin_name: b.admins?.full_name || null,
      }));
      setBookings(formatted);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'incomplete':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string): string => {
    return (t as Record<string, string>)[status] || status.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(
      language === 'ar' ? 'ar-SA' : 'en-GB',
      { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
    );
  };

  return (
    <div>
      <div className="pb-3 border-b border-gray-200 mb-3">
        <h3 className="text-base font-semibold text-gray-900 mb-3">{t.title}</h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t.allStatus}</option>
            <option value="pending_payment">{t.pending_payment}</option>
            <option value="submitted">{t.submitted}</option>
            <option value="in_progress">{t.in_progress}</option>
            <option value="completed">{t.completed}</option>
            <option value="cancelled">{t.cancelled}</option>
            <option value="no_show">{t.no_show}</option>
            <option value="incomplete">{t.incomplete}</option>
          </select>
        </div>

        <div className="mt-2 text-xs text-gray-600">
          {t.showing} {filteredBookings.length} {t.of} {bookings.length} {t.bookings}
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">{t.loading}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm">{t.noBookings}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-3 hover:bg-gray-50 transition-colors ${onBookingClick ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (!onBookingClick) return;
                  onBookingClick({
                    id: booking.id,
                    applicant_name_en: booking.full_name || '',
                    applicant_name_ar: booking.full_name || '',
                    email: booking.email,
                    phone: booking.phone,
                    date: booking.booking_date,
                    start_time: booking.start_time,
                    end_time: booking.end_time,
                    status: booking.status,
                    notes: booking.special_requests ?? booking.additional_notes,
                    service_name_en: serviceName?.en,
                    service_name_ar: serviceName?.ar,
                    service_type: booking.service_type,
                    advisory_reason: booking.advisory_reason,
                    services_provided: booking.services_provided,
                    created_at: booking.created_at,
                    assigned_admin_id: booking.assigned_admin_id,
                    assigned_admin_name: booking.assigned_admin_name,
                  });
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {booking.full_name ||
                          (booking.members
                            ? `${booking.members.first_name} ${booking.members.last_name}`
                            : 'Unknown')}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-600">
                          {formatDate(booking.booking_date)}
                        </span>
                        <span className="text-gray-400 text-xs">|</span>
                        <span className="text-xs font-medium text-gray-700">
                          {formatTime(booking.start_time)} -{' '}
                          {formatTime(booking.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span>{booking.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span>{booking.phone}</span>
                  </div>
                  {booking.assigned_admin_name && (
                    <div className="flex items-center gap-1.5 text-teal-600 col-span-2">
                      <UserCheck className="w-3 h-3" />
                      <span>{booking.assigned_admin_name}</span>
                    </div>
                  )}
                  {!booking.assigned_admin_name && booking.service_type && (
                    <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                      <User className="w-3 h-3" />
                      <span className="capitalize">
                        {booking.service_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
