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
  assigned_admin_id?: string;
  assigned_admin_name?: string;
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

const DEFAULT_HOURS = Array.from({ length: 10 }, (_, i) => i + 8);

const STATUS_COLORS: Record<string, { bg: string; hover: string; dot: string; labelEn: string; labelAr: string }> = {
  completed: { bg: 'bg-green-500', hover: 'hover:bg-green-600', dot: 'bg-green-500', labelEn: 'Completed', labelAr: 'مكتمل' },
  submitted: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', dot: 'bg-yellow-500', labelEn: 'Submitted', labelAr: 'مقدّم' },
  pending_payment: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', dot: 'bg-yellow-500', labelEn: 'Pending', labelAr: 'بانتظار الدفع' },
  in_progress: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', dot: 'bg-blue-500', labelEn: 'In Progress', labelAr: 'قيد المعالجة' },
  cancelled: { bg: 'bg-red-500', hover: 'hover:bg-red-600', dot: 'bg-red-500', labelEn: 'Cancelled', labelAr: 'ملغي' },
  no_show: { bg: 'bg-red-400', hover: 'hover:bg-red-500', dot: 'bg-red-400', labelEn: 'No Show', labelAr: 'لم يحضر' },
  incomplete: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', dot: 'bg-orange-500', labelEn: 'Incomplete', labelAr: 'لم يكتمل' },
};

const DEFAULT_COLOR = { bg: 'bg-gray-500', hover: 'hover:bg-gray-600', dot: 'bg-gray-500', labelEn: 'Other', labelAr: 'أخرى' };

export default function CalendarWeekView({ startDate, bookings, onBookingClick }: CalendarWeekViewProps) {
  const { language } = useLanguage();
  const [hours, setHours] = useState<number[]>(DEFAULT_HOURS);
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

        const { data: daySpecific } = await supabase
          .from('day_specific_hours')
          .select('*')
          .eq('date', dateString)
          .maybeSingle();

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
          const { data: defaultHours } = await supabase
            .from('working_hours_config')
            .select('*')
            .eq('day_of_week', dayOfWeek)
            .maybeSingle();

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

      if (minStartHour < 24 && maxEndHour > 0) {
        setHours(Array.from({ length: maxEndHour - minStartHour + 1 }, (_, i) => minStartHour + i));
      } else {
        setHours(DEFAULT_HOURS);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
      setHours(DEFAULT_HOURS);
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

  const isDayClosed = (date: Date): boolean => {
    const dateString = date.toISOString().split('T')[0];
    const dayHours = dayWorkingHours.get(dateString);
    return !dayHours || dayHours.isHoliday || dayHours.isInactive;
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
    const colors = STATUS_COLORS[status] || DEFAULT_COLOR;
    return `${colors.bg} ${colors.hover}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const usedStatuses = [...new Set(bookings.map((b) => b.status))];

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
              <div className="p-2 border-r border-gray-200"></div>
              {weekDays.map((date, index) => {
                const { dayName, dayNum } = formatDayHeader(date);
                const closed = isDayClosed(date);
                const dateString = date.toISOString().split('T')[0];
                const dayHours = dayWorkingHours.get(dateString);

                return (
                  <div
                    key={index}
                    className={`p-2 text-center border-r border-gray-200 last:border-r-0 ${
                      isToday(date) ? 'bg-blue-50' : ''
                    } ${closed ? 'bg-gray-100' : ''}`}
                  >
                    <div className="text-[10px] font-medium text-gray-600 mb-0.5">{dayName}</div>
                    <div
                      className={`text-sm font-bold ${
                        isToday(date) ? 'text-blue-600' : closed ? 'text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {dayNum}
                    </div>
                    {closed && (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {dayHours?.isHoliday
                          ? language === 'ar' ? 'عطلة' : 'Holiday'
                          : language === 'ar' ? 'مغلق' : 'Closed'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-gray-200 min-h-[50px]">
                  <div className="p-1.5 border-r border-gray-200 bg-gray-50 flex items-start">
                    <span className="text-xs font-semibold text-gray-700">{formatHour(hour)}</span>
                  </div>
                  {weekDays.map((date, dayIndex) => {
                    const dayBookings = getBookingsForDateTime(date, hour);
                    const isWorking = isHourWorkingForDay(date, hour);
                    const closed = isDayClosed(date);

                    return (
                      <div
                        key={dayIndex}
                        className={`p-1 border-r border-gray-200 last:border-r-0 ${
                          isToday(date) ? 'bg-blue-50/30' : ''
                        } ${closed ? 'bg-gray-50' : !isWorking ? 'bg-gray-100 bg-opacity-50' : 'hover:bg-gray-50'}`}
                      >
                        {dayBookings.length > 0 ? (
                          <div className="space-y-0.5">
                            {dayBookings.map((booking) => (
                              <button
                                key={booking.id}
                                onClick={() => onBookingClick(booking)}
                                className={`w-full text-left p-1.5 rounded text-white text-[10px] font-medium transition-colors ${getBookingColor(
                                  booking.status
                                )}`}
                                title={language === 'ar' ? booking.applicant_name_ar : booking.applicant_name_en}
                              >
                                <div className="truncate">
                                  {language === 'ar' ? booking.applicant_name_ar : booking.applicant_name_en}
                                </div>
                                {booking.assigned_admin_name && (
                                  <div className="truncate text-white/80 text-[10px] font-normal mt-0.5 flex items-center gap-0.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/50 flex-shrink-0" />
                                    {booking.assigned_admin_name}
                                  </div>
                                )}
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

      {usedStatuses.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-1">
          {usedStatuses.map((status) => {
            const config = STATUS_COLORS[status] || DEFAULT_COLOR;
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                <span className="text-[11px] text-gray-600">
                  {language === 'ar' ? config.labelAr : config.labelEn}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
