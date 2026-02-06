import { useLanguage } from '../../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { Clock, DollarSign, FileText, CheckCircle } from 'lucide-react';

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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const workingHoursStart = 8;
  const workingHoursEnd = 18;
  const hours = Array.from(
    { length: workingHoursEnd - workingHoursStart + 1 },
    (_, i) => i + workingHoursStart
  );

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
      case 'pending_payment':
        return 'bg-yellow-100 border-yellow-400 text-yellow-900 hover:bg-yellow-200';
      case 'submitted':
        return 'bg-blue-100 border-blue-400 text-blue-900 hover:bg-blue-200';
      case 'in_progress':
        return 'bg-purple-100 border-purple-400 text-purple-900 hover:bg-purple-200';
      case 'completed':
        return 'bg-green-100 border-green-400 text-green-900 hover:bg-green-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 border-red-400 text-red-900 hover:bg-red-200';
      case 'confirmed':
        return 'bg-emerald-100 border-emerald-400 text-emerald-900 hover:bg-emerald-200';
      case 'pending':
        return 'bg-amber-100 border-amber-400 text-amber-900 hover:bg-amber-200';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-900 hover:bg-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending_payment':
        return DollarSign;
      case 'submitted':
        return FileText;
      case 'in_progress':
        return Clock;
      case 'completed':
        return CheckCircle;
      default:
        return null;
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const isToday = () => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getCurrentTimePosition = () => {
    if (!isToday()) return null;
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = workingHoursStart * 60;
    const endMinutes = workingHoursEnd * 60;

    if (minutes < startMinutes || minutes > endMinutes) return null;

    const relativeMinutes = minutes - startMinutes;
    const totalMinutes = (workingHoursEnd - workingHoursStart) * 60;
    return (relativeMinutes / totalMinutes) * 100;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
        <div className="divide-y divide-gray-200 relative">
          {hours.map((hour) => {
            const hourBookings = getBookingsForHour(hour);
            return (
              <div key={hour} className="flex min-h-[80px] hover:bg-gray-50 transition-colors relative">
                <div className="w-24 flex-shrink-0 p-3 border-r border-gray-200 bg-gray-50">
                  <span className="text-sm font-medium text-gray-600">{formatHour(hour)}</span>
                </div>
                <div className="flex-1 p-2">
                  {hourBookings.length > 0 ? (
                    <div className="space-y-2">
                      {hourBookings.map((booking) => {
                        const StatusIcon = getStatusIcon(booking.status);
                        return (
                          <button
                            key={booking.id}
                            onClick={() => onBookingClick(booking)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all shadow-sm hover:shadow-md ${getBookingColor(
                              booking.status
                            )}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {StatusIcon && <StatusIcon className="w-4 h-4 flex-shrink-0" />}
                                  <p className="font-semibold text-sm truncate">
                                    {language === 'ar' ? booking.applicant_name_ar : booking.applicant_name_en}
                                  </p>
                                </div>
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
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          {isToday() && getCurrentTimePosition() !== null && (
            <div
              className="absolute left-0 right-0 pointer-events-none z-10"
              style={{ top: `${getCurrentTimePosition()}%` }}
            >
              <div className="flex items-center">
                <div className="w-24 flex items-center justify-end pr-2">
                  <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </div>
                </div>
                <div className="flex-1 h-0.5 bg-red-500 relative">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
