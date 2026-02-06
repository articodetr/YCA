import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

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

interface DayWorkingHours {
  date: string;
  startHour: number;
  endHour: number;
  isHoliday: boolean;
  isInactive: boolean;
}

export default function CalendarWeekView({ startDate, bookings, onBookingClick }: CalendarWeekViewProps) {
  const { language } = useLanguage();
  const [hours, setHours] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayWorkingHours, setDayWorkingHours] = useState<Map<string, DayWorkingHours>>(new Map());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  useEffect(() => {
    fetchWorkingHours();
  }, [startDate]);

  const fetchWorkingHours = async () => {
    setLoading(true);
    try {
      const dayHoursMap = new Map<string, DayWorkingHours>();
      let minStartHour = 24;
      let maxEndHour = 0;

      for (const date of weekDays) {
        const dateString = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();

        // Check for day-specific hours first
        const { data: daySpecific } = await supabase
          .from('day_specific_hours')
          .select('*')
          .eq('date', dateString)
          .single();

        if (daySpecific) {
          if (daySpecific.is_holiday) {
            dayHoursMap.set(dateString, {
              date: dateString,
              startHour: 0,
              endHour: 0,
              isHoliday: true,
              isInactive: false,
            });
          } else {
            const startHour = parseInt(daySpecific.start_time.split(':')[0]);
            const endHour = parseInt(daySpecific.end_time.split(':')[0]);
            dayHoursMap.set(dateString, {
              date: dateString,
              startHour,
              endHour,
              isHoliday: false,
              isInactive: false,
            });
            minStartHour = Math.min(minStartHour, startHour);
            maxEndHour = Math.max(maxEndHour, endHour);
          }
        } else {
          // Use default working hours
          const { data: defaultHours } = await supabase
            .from('working_hours_config')
            .select('*')
            .eq('day_of_week', dayOfWeek)
            .single();

          if (defaultHours && defaultHours.is_active) {
            const startHour = parseInt(defaultHours.start_time.split(':')[0]);
            const endHour = parseInt(defaultHours.end_time.split(':')[0]);
            dayHoursMap.set(dateString, {
              date: dateString,
              startHour,
              endHour,
              isHoliday: false,
              isInactive: false,
            });
            minStartHour = Math.min(minStartHour, startHour);
            maxEndHour = Math.max(maxEndHour, endHour);
          } else {
            dayHoursMap.set(dateString, {
              date: dateString,
              startHour: 0,
              endHour: 0,
              isHoliday: false,
              isInactive: true,
            });
          }
        }
      }

      setDayWorkingHours(dayHoursMap);

      // Set the overall hour range
      if (minStartHour < 24 && maxEndHour > 0) {
        const hoursArray = Array.from({ length: maxEndHour - minStartHour + 1 }, (_, i) => minStartHour + i);
        setHours(hoursArray);
      } else {
        setHours([]);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
      // Fallback to showing all hours
      setHours(Array.from({ length: 24 }, (_, i) => i));
    } finally {
      setLoading(false);
    }
  };

  const isHourWorkingForDay = (date: Date, hour: number): boolean => {
    const dateString = date.toISOString().split('T')[0];
    const dayHours = dayWorkingHours.get(dateString);
    if (!dayHours || dayHours.isHoliday || dayHours.isInactive) return false;
    return hour >= dayHours.startHour && hour <= dayHours.endHour;
  };

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
      case 'confirmed':
        return 'bg-green-500 hover:bg-green-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      case 'completed':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
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
        <p className="text-gray-600 text-lg font-medium">
          {language === 'ar' ? 'لا توجد ساعات عمل لهذا الأسبوع' : 'No working hours for this week'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="p-3 border-r border-gray-200"></div>
            {weekDays.map((date, index) => {
              const { dayName, dayNum } = formatDayHeader(date);
              const dateString = date.toISOString().split('T')[0];
              const dayHours = dayWorkingHours.get(dateString);
              const isDayInactive = dayHours?.isInactive || dayHours?.isHoliday;

              return (
                <div
                  key={index}
                  className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                    isToday(date) ? 'bg-blue-50' : ''
                  } ${isDayInactive ? 'bg-gray-100' : ''}`}
                >
                  <div className="text-xs font-medium text-gray-600 mb-1">{dayName}</div>
                  <div
                    className={`text-lg font-bold ${
                      isToday(date) ? 'text-blue-600' : isDayInactive ? 'text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    {dayNum}
                  </div>
                  {isDayInactive && (
                    <div className="text-xs text-gray-500 mt-1">
                      {dayHours?.isHoliday
                        ? language === 'ar' ? 'عطلة' : 'Holiday'
                        : language === 'ar' ? 'غير نشط' : 'Closed'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-200 min-h-[80px]">
                <div className="p-3 border-r border-gray-200 bg-gray-50 flex items-start">
                  <span className="text-sm font-semibold text-gray-700">{formatHour(hour)}</span>
                </div>
                {weekDays.map((date, dayIndex) => {
                  const dayBookings = getBookingsForDateTime(date, hour);
                  const isWorking = isHourWorkingForDay(date, hour);

                  return (
                    <div
                      key={dayIndex}
                      className={`p-2 border-r border-gray-200 last:border-r-0 ${
                        isToday(date) ? 'bg-blue-50/30' : ''
                      } ${!isWorking ? 'bg-gray-100 bg-opacity-50' : 'hover:bg-gray-50'}`}
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
