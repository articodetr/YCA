import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

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
  const [hours, setHours] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingHoursInfo, setWorkingHoursInfo] = useState<string>('');

  useEffect(() => {
    fetchWorkingHours();
  }, [date]);

  const fetchWorkingHours = async () => {
    setLoading(true);
    try {
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();

      // First check for day-specific hours
      const { data: daySpecific } = await supabase
        .from('day_specific_hours')
        .select('*')
        .eq('date', dateString)
        .single();

      if (daySpecific) {
        if (daySpecific.is_holiday) {
          // Holiday - show no hours
          setHours([]);
          const holidayReason = language === 'ar'
            ? (daySpecific.holiday_reason_ar || daySpecific.holiday_reason_en)
            : (daySpecific.holiday_reason_en || daySpecific.holiday_reason_ar);
          setWorkingHoursInfo(language === 'ar' ? `عطلة: ${holidayReason}` : `Holiday: ${holidayReason}`);
        } else {
          // Use day-specific hours
          const startHour = parseInt(daySpecific.start_time.split(':')[0]);
          const endHour = parseInt(daySpecific.end_time.split(':')[0]);
          const hoursArray = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
          setHours(hoursArray);
          setWorkingHoursInfo(
            language === 'ar'
              ? `ساعات العمل: ${daySpecific.start_time.substring(0, 5)} - ${daySpecific.end_time.substring(0, 5)}`
              : `Working Hours: ${daySpecific.start_time.substring(0, 5)} - ${daySpecific.end_time.substring(0, 5)}`
          );
        }
      } else {
        // Use default working hours for the day of week
        const { data: defaultHours } = await supabase
          .from('working_hours_config')
          .select('*')
          .eq('day_of_week', dayOfWeek)
          .single();

        if (defaultHours && defaultHours.is_active) {
          const startHour = parseInt(defaultHours.start_time.split(':')[0]);
          const endHour = parseInt(defaultHours.end_time.split(':')[0]);
          const hoursArray = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
          setHours(hoursArray);
          setWorkingHoursInfo(
            language === 'ar'
              ? `ساعات العمل: ${defaultHours.start_time.substring(0, 5)} - ${defaultHours.end_time.substring(0, 5)}`
              : `Working Hours: ${defaultHours.start_time.substring(0, 5)} - ${defaultHours.end_time.substring(0, 5)}`
          );
        } else {
          // Day is not active - show no hours
          setHours([]);
          setWorkingHoursInfo(language === 'ar' ? 'يوم غير نشط' : 'Day not active');
        }
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
      // Fallback to showing all hours
      setHours(Array.from({ length: 24 }, (_, i) => i));
      setWorkingHoursInfo('');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    );
  }

  if (hours.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-600 text-lg font-medium mb-2">{workingHoursInfo}</p>
        <p className="text-gray-500 text-sm">
          {language === 'ar' ? 'لا توجد ساعات عمل لهذا اليوم' : 'No working hours for this day'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {workingHoursInfo && (
        <div className="bg-blue-50 border-b border-blue-200 px-3 py-1.5">
          <p className="text-xs font-medium text-blue-900">{workingHoursInfo}</p>
        </div>
      )}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        <div className="divide-y divide-gray-200">
          {hours.map((hour) => {
            const hourBookings = getBookingsForHour(hour);
            return (
              <div key={hour} className="flex min-h-[60px] hover:bg-gray-50 transition-colors">
                <div className="w-20 flex-shrink-0 p-2 border-r border-gray-200 bg-gray-50">
                  <span className="text-xs font-semibold text-gray-700">{formatHour(hour)}</span>
                </div>
                <div className="flex-1 p-1.5">
                  {hourBookings.length > 0 ? (
                    <div className="space-y-1">
                      {hourBookings.map((booking) => (
                        <button
                          key={booking.id}
                          onClick={() => onBookingClick(booking)}
                          className={`w-full text-left p-2 rounded border transition-all ${getBookingColor(
                            booking.status
                          )}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs truncate">
                                {language === 'ar' ? booking.applicant_name_ar : booking.applicant_name_en}
                              </p>
                              {booking.service_name_en && (
                                <p className="text-[10px] mt-0.5 opacity-75 truncate">
                                  {language === 'ar' ? booking.service_name_ar : booking.service_name_en}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] font-medium whitespace-nowrap" dir="ltr">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
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
