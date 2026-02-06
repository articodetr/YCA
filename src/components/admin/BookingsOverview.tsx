import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, Search } from 'lucide-react';
import { getBookingsForDateRange, formatTime } from '../../lib/booking-utils';

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
  members?: {
    first_name: string;
    last_name: string;
  };
}

interface BookingsOverviewProps {
  serviceId: string;
  startDate: string;
  endDate: string;
}

export default function BookingsOverview({
  serviceId,
  startDate,
  endDate,
}: BookingsOverviewProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadBookings();
  }, [serviceId, startDate, endDate]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await getBookingsForDateRange(serviceId, startDate, endDate);
      setBookings(data);
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
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Upcoming Bookings</h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="mt-2 text-xs text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="p-3 hover:bg-gray-50 transition-colors">
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
                        <span className="text-gray-400 text-xs">•</span>
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
                  {booking.service_type && (
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
