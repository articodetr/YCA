import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import CalendarDayView from '../../components/admin/CalendarDayView';
import CalendarWeekView from '../../components/admin/CalendarWeekView';
import BookingDetailsModal from '../../components/admin/BookingDetailsModal';

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

interface CalendarViewProps {
  selectedServiceId: string;
}

export default function CalendarView({ selectedServiceId }: CalendarViewProps) {
  const { language } = useLanguage();
  const [viewType, setViewType] = useState<'day' | 'week'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  const t = {
    en: {
      title: 'Booking Calendar',
      today: 'Today',
      back: 'Back',
      next: 'Next',
      day: 'Day',
      week: 'Week',
      loading: 'Loading bookings...',
      noBookings: 'No bookings for this period',
    },
    ar: {
      title: 'تقويم الحجوزات',
      today: 'اليوم',
      back: 'السابق',
      next: 'التالي',
      day: 'يومي',
      week: 'أسبوعي',
      loading: 'جاري تحميل الحجوزات...',
      noBookings: 'لا توجد حجوزات لهذه الفترة',
    },
  }[language];

  useEffect(() => {
    loadBookings();
  }, [currentDate, viewType, selectedServiceId]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      let startDate: string;
      let endDate: string;

      if (viewType === 'day') {
        startDate = currentDate.toISOString().split('T')[0];
        endDate = startDate;
      } else {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        startDate = weekStart.toISOString().split('T')[0];
        endDate = weekEnd.toISOString().split('T')[0];
      }

      const { data: bookingsData, error } = await supabase
        .from('wakala_applications')
        .select(`
          id,
          full_name,
          email,
          phone,
          booking_date,
          start_time,
          end_time,
          status,
          additional_notes,
          created_at,
          availability_slots!inner (
            service_id
          )
        `)
        .eq('availability_slots.service_id', selectedServiceId)
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .not('booking_date', 'is', null)
        .neq('status', 'cancelled')
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      const { data: service } = await supabase
        .from('booking_services')
        .select('name_en, name_ar')
        .eq('id', selectedServiceId)
        .single();

      const formattedBookings: Booking[] = (bookingsData || []).map((booking: any) => ({
        id: booking.id,
        applicant_name_en: booking.full_name,
        applicant_name_ar: booking.full_name,
        email: booking.email,
        phone: booking.phone,
        date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
        notes: booking.additional_notes,
        service_name_en: service?.name_en,
        service_name_ar: service?.name_ar,
        created_at: booking.created_at,
      }));

      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'day') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'day') {
      newDate.setDate(currentDate.getDate() + 1);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const formatDateHeader = () => {
    if (viewType === 'day') {
      return currentDate.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startStr = weekStart.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', {
        month: 'short',
        day: 'numeric',
      });
      const endStr = weekEnd.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', {
        month: 'short',
        day: 'numeric',
      });

      return `${startStr} - ${endStr}`;
    }
  };

  const getWeekStart = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    return weekStart;
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), day);
    setCurrentDate(selected);
    setShowDatePicker(false);
  };

  const toggleDatePicker = () => {
    if (!showDatePicker) {
      setPickerMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    }
    setShowDatePicker(!showDatePicker);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isToday = (day: number) => {
    const now = new Date();
    return day === now.getDate() &&
      pickerMonth.getMonth() === now.getMonth() &&
      pickerMonth.getFullYear() === now.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === currentDate.getDate() &&
      pickerMonth.getMonth() === currentDate.getMonth() &&
      pickerMonth.getFullYear() === currentDate.getFullYear();
  };

  const weekDayNames = language === 'ar'
    ? ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-3">
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              {t.today}
            </button>
            <button
              onClick={goToPrevious}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="relative" ref={datePickerRef}>
            <button
              onClick={toggleDatePicker}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <CalendarIcon className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">{formatDateHeader()}</h2>
              <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>

            {showDatePicker && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-80">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1))}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="font-semibold text-gray-900">
                    {pickerMonth.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1))}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {weekDayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: getFirstDayOfMonth(pickerMonth) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: getDaysInMonth(pickerMonth) }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                        ${isSelected(day)
                          ? 'bg-blue-600 text-white'
                          : isToday(day)
                            ? 'bg-blue-50 text-blue-700 font-bold ring-1 ring-blue-300'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center">
                  <button
                    onClick={() => {
                      setCurrentDate(new Date());
                      setShowDatePicker(false);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t.today}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('day')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewType === 'day'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.day}
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewType === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.week}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">{t.loading}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t.noBookings}</p>
          </div>
        ) : viewType === 'day' ? (
          <CalendarDayView
            date={currentDate}
            bookings={bookings}
            onBookingClick={setSelectedBooking}
          />
        ) : (
          <CalendarWeekView
            startDate={getWeekStart()}
            bookings={bookings}
            onBookingClick={setSelectedBooking}
          />
        )}
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
