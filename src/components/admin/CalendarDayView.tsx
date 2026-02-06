import { useLanguage } from '../../contexts/LanguageContext';

interface Booking {
  id: string;
  applicant_name_en: string;
  applicant_name_ar: string;
  email: string;
  phone: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  service_name_en?: string;
  service_name_ar?: string;
  created_at: string;
}

interface CalendarDayViewProps {
  date: Date;
  bookings: Booking[];
  onBookingClick: (booking: Booking) => void;
}

export default function CalendarDayView({ date, bookings, onBookingClick }: CalendarDayViewProps) {
  const { language } = useLanguage();

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getBookingsForHour = (hour: number) => {
    return bookings.filter((booking) => {
      const startHour = parseInt(booking.start_time.split(':')[0]);
      return startHour === hour;
    });
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  const getBookingColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 border-green-300 text-green-900 hover:bg-green-200';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900 hover:bg-yellow-200';
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-900 hover:bg-red-200';
      case 'completed':
        return 'bg-blue-100 border-blue-300 text-blue-900 hover:bg-blue-200';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200';
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        <div className="divide-y divide-gray-200">
          {hours.map((hour) => {
            const hourBookings = getBookingsForHour(hour);
            return (
              <div key={hour} className="flex min-h-[80px] hover:bg-gray-50 transition-colors">
                <div className="w-24 flex-shrink-0 p-3 border-r border-gray-200 bg-gray-50">
                  <span className="text-sm font-medium text-gray-600">{formatHour(hour)}</span>
                </div>
                <div className="flex-1 p-2">
                  {hourBookings.length > 0 ? (
                    <div className="space-y-2">
                      {hourBookings.map((booking) => (
                        <button
                          key={booking.id}
                          onClick={() => onBookingClick(booking)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${getBookingColor(
                            booking.status
                          )}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">
                                {language === 'ar' ? booking.applicant_name_ar : booking.applicant_name_en}
                              </p>
                              {booking.service_name_en && (
                                <p className="text-xs mt-1 opacity-75 truncate">
                                  {language === 'ar' ? booking.service_name_ar : booking.service_name_en}
                                </p>
                              )}
                            </div>
                            <span className="text-xs font-medium whitespace-nowrap" dir="ltr">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      {language === 'ar' ? 'لا توجد حجوزات' : 'No bookings'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
