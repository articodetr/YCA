import { useLanguage } from '../../contexts/LanguageContext';

interface Booking {
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
  created_at: string;
}

interface CalendarWeekViewProps {
  startDate: Date;
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
}

export default function CalendarWeekView({ startDate, bookings, onBookingClick }: CalendarWeekViewProps) {
  const { language } = useLanguage();

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  const workingHoursStart = 8;
  const workingHoursEnd = 18;
  const hours = Array.from(
    { length: workingHoursEnd - workingHoursStart + 1 },
    (_, i) => i + workingHoursStart
  );

  const getBookingsForDateTime = (date: Date, hour: number) => {
    const dateString = date.toISOString().split('T')[0];
    return bookings.filter((booking) => {
      const startHour = parseInt(booking.start_time.split(':')[0]);
      return booking.date === dateString && startHour === hour;
    });
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  const formatDayHeader = (date: Date) => {
    const dayName = date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', { weekday: 'short' });
    const dayNum = date.getDate();
    return { dayName, dayNum };
  };

  const getBookingColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending_payment':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'submitted':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'in_progress':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      case 'confirmed':
        return 'bg-emerald-500 hover:bg-emerald-600';
      case 'pending':
        return 'bg-amber-500 hover:bg-amber-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const hasBookingsForDay = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return bookings.some(b => b.date === dateString);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="p-3 border-r border-gray-200"></div>
            {weekDays.map((date, index) => {
              const { dayName, dayNum } = formatDayHeader(date);
              const hasDayBookings = hasBookingsForDay(date);
              return (
                <div
                  key={index}
                  className={`p-3 text-center border-r border-gray-200 last:border-r-0 relative ${
                    isToday(date) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="text-xs font-medium text-gray-600 mb-1">{dayName}</div>
                  <div
                    className={`text-lg font-bold ${
                      isToday(date) ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {dayNum}
                  </div>
                  {hasDayBookings && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" title="Has bookings" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-200 min-h-[60px] hover:bg-gray-50">
                <div className="p-2 border-r border-gray-200 bg-gray-50 flex items-start">
                  <span className="text-xs font-medium text-gray-600">{formatHour(hour)}</span>
                </div>
                {weekDays.map((date, dayIndex) => {
                  const dayBookings = getBookingsForDateTime(date, hour);
                  return (
                    <div
                      key={dayIndex}
                      className={`p-1 border-r border-gray-200 last:border-r-0 ${
                        isToday(date) ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      {dayBookings.length > 0 ? (
                        <div className="space-y-1">
                          {dayBookings.map((booking) => (
                            <button
                              key={booking.id}
                              onClick={() => onBookingClick(booking)}
                              className={`w-full text-left p-2 rounded text-white text-xs font-medium transition-colors ${getBookingColor(
                                booking.status
                              )}`}
                              title={language === 'ar' ? booking.applicant_name_ar : booking.applicant_name_en}
                            >
                              <div className="truncate">
                                {language === 'ar' ? booking.applicant_name_ar : booking.applicant_name_en}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
