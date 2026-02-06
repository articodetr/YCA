import { Calendar, Clock, User, ArrowRight, TrendingUp } from 'lucide-react';
import { formatTimeRange } from '../../lib/booking-utils';

interface Booking {
  id: string;
  applicant_name_en: string;
  email: string;
  phone: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface UpcomingBookingsSidebarProps {
  bookings: Booking[];
  onJumpToDate: (date: Date) => void;
  onBookingClick: (booking: Booking) => void;
}

export default function UpcomingBookingsSidebar({
  bookings,
  onJumpToDate,
  onBookingClick
}: UpcomingBookingsSidebarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings
    .filter(b => {
      const bookingDate = new Date(b.date + 'T00:00:00');
      return bookingDate >= today;
    })
    .sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    })
    .slice(0, 10);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending_payment: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      submitted: { color: 'bg-blue-100 text-blue-800', text: 'Submitted' },
      in_progress: { color: 'bg-purple-100 text-purple-800', text: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;

    return date.toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Upcoming Bookings</h3>
        </div>
        <p className="text-xs text-gray-600">Next {upcomingBookings.length} appointments</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm">No upcoming bookings</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => onBookingClick(booking)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm truncate">
                        {booking.applicant_name_en}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">{formatDate(booking.date)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onJumpToDate(new Date(booking.date + 'T00:00:00'));
                    }}
                    className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                    title="Jump to date"
                  >
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-700 font-medium">
                    {formatTimeRange(booking.start_time, booking.end_time)}
                  </span>
                </div>

                {getStatusBadge(booking.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
