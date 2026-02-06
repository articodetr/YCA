import { Calendar } from 'lucide-react';

interface Booking {
  id: string;
  date: string;
  status: string;
}

interface CalendarMonthViewProps {
  currentDate: Date;
  bookings: Booking[];
  onDateClick: (date: Date) => void;
}

export default function CalendarMonthView({
  currentDate,
  bookings,
  onDateClick
}: CalendarMonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getBookingsForDate = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return bookings.filter(b => b.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-500';
      case 'submitted':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="grid grid-cols-7 gap-px bg-gray-200 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="bg-gray-50 p-3 text-center text-sm font-semibold text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="bg-gray-50 min-h-24" />;
          }

          const dayBookings = getBookingsForDate(day);
          const hasBookings = dayBookings.length > 0;

          return (
            <button
              key={day}
              onClick={() => onDateClick(new Date(year, month, day))}
              className={`bg-white p-3 min-h-24 hover:bg-blue-50 transition-colors text-left relative ${
                isToday(day) ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              <div
                className={`text-sm font-medium mb-2 ${
                  isToday(day)
                    ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center'
                    : 'text-gray-900'
                }`}
              >
                {day}
              </div>

              {hasBookings && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-gray-600">
                    {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dayBookings.slice(0, 3).map((booking) => (
                      <div
                        key={booking.id}
                        className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)}`}
                        title={booking.status}
                      />
                    ))}
                    {dayBookings.length > 3 && (
                      <span className="text-xs text-gray-500">+{dayBookings.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-700">Pending Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-700">Submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-700">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
