import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Search, Filter, SkipForward, SkipBack, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import CalendarDayView from '../../components/admin/CalendarDayView';
import CalendarWeekView from '../../components/admin/CalendarWeekView';
import CalendarMonthView from '../../components/admin/CalendarMonthView';
import BookingDetailsModal from '../../components/admin/BookingDetailsModal';
import UpcomingBookingsSidebar from '../../components/admin/UpcomingBookingsSidebar';
import BookingStatCards from '../../components/admin/BookingStatCards';

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
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const t = {
    en: {
      title: 'Booking Calendar',
      today: 'Today',
      back: 'Back',
      next: 'Next',
      day: 'Day',
      week: 'Week',
      month: 'Month',
      loading: 'Loading bookings...',
      noBookings: 'No bookings for this period',
      search: 'Search by name, email or phone...',
      filters: 'Filters',
      status: 'Status',
      allStatuses: 'All Statuses',
      nextBooking: 'Next',
      previousBooking: 'Previous',
      clearSearch: 'Clear',
    },
    ar: {
      title: 'تقويم الحجوزات',
      today: 'اليوم',
      back: 'السابق',
      next: 'التالي',
      day: 'يومي',
      week: 'أسبوعي',
      month: 'شهري',
      loading: 'جاري تحميل الحجوزات...',
      noBookings: 'لا توجد حجوزات لهذه الفترة',
      search: 'البحث بالاسم، البريد أو الهاتف...',
      filters: 'الفلاتر',
      status: 'الحالة',
      allStatuses: 'جميع الحالات',
      nextBooking: 'التالي',
      previousBooking: 'السابق',
      clearSearch: 'مسح',
    },
  }[language];

  useEffect(() => {
    loadBookings();
  }, [currentDate, viewType, selectedServiceId]);

  useEffect(() => {
    applyFilters();
  }, [allBookings, searchTerm, statusFilter]);

  const applyFilters = () => {
    let filtered = [...allBookings];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.applicant_name_en?.toLowerCase().includes(term) ||
          b.email?.toLowerCase().includes(term) ||
          b.phone?.includes(term)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    setBookings(filtered);
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      let startDate: string;
      let endDate: string;

      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const weekBeforeMonth = new Date(monthStart);
      weekBeforeMonth.setDate(monthStart.getDate() - 7);

      const weekAfterMonth = new Date(monthEnd);
      weekAfterMonth.setDate(monthEnd.getDate() + 7);

      startDate = weekBeforeMonth.toISOString().split('T')[0];
      endDate = weekAfterMonth.toISOString().split('T')[0];

      // Get slots for the selected service first
      const { data: slots, error: slotsError } = await supabase
        .from('availability_slots')
        .select('id')
        .eq('service_id', selectedServiceId)
        .gte('slot_date', startDate)
        .lte('slot_date', endDate);

      if (slotsError) throw slotsError;

      const slotIds = slots?.map(s => s.id) || [];

      // Get bookings that reference these slots
      const { data: bookingsData, error } = await supabase
        .from('wakala_applications')
        .select('*')
        .in('slot_id', slotIds.length > 0 ? slotIds : ['00000000-0000-0000-0000-000000000000'])
        .not('booking_date', 'is', null)
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      console.log('Bookings loaded:', bookingsData?.length || 0, 'bookings');

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
        status: booking.status || booking.payment_status || 'pending',
        notes: booking.additional_notes || booking.special_requests,
        service_name_en: service?.name_en,
        service_name_ar: service?.name_ar,
        created_at: booking.created_at,
      }));

      setAllBookings(formattedBookings);
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

  const jumpToNextBooking = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureBookings = allBookings
      .filter((b) => {
        const bookingDate = new Date(b.date + 'T00:00:00');
        return bookingDate >= today;
      })
      .sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.start_time.localeCompare(b.start_time);
      });

    if (futureBookings.length > 0) {
      const nextBooking = futureBookings[0];
      setCurrentDate(new Date(nextBooking.date + 'T00:00:00'));
      setViewType('day');
    }
  };

  const jumpToPreviousBooking = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastBookings = allBookings
      .filter((b) => {
        const bookingDate = new Date(b.date + 'T00:00:00');
        return bookingDate < today;
      })
      .sort((a, b) => {
        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return b.start_time.localeCompare(a.start_time);
      });

    if (pastBookings.length > 0) {
      const prevBooking = pastBookings[0];
      setCurrentDate(new Date(prevBooking.date + 'T00:00:00'));
      setViewType('day');
    }
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setViewType('day');
  };

  return (
    <div className="space-y-6">
      <BookingStatCards bookings={allBookings} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
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
                  <div className="h-6 w-px bg-gray-300 mx-2" />
                  <button
                    onClick={jumpToPreviousBooking}
                    className="p-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    title={t.previousBooking}
                  >
                    <SkipBack className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={jumpToNextBooking}
                    className="p-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    title={t.nextBooking}
                  >
                    <SkipForward className="w-5 h-5 text-blue-600" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-bold text-gray-900">{formatDateHeader()}</h2>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewType('day')}
                    className={`px-3 py-2 rounded-md font-medium transition-colors text-sm ${
                      viewType === 'day'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.day}
                  </button>
                  <button
                    onClick={() => setViewType('week')}
                    className={`px-3 py-2 rounded-md font-medium transition-colors text-sm ${
                      viewType === 'week'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.week}
                  </button>
                  <button
                    onClick={() => setViewType('month')}
                    className={`px-3 py-2 rounded-md font-medium transition-colors text-sm ${
                      viewType === 'month'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.month}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t.search}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">{t.allStatuses}</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="submitted">Submitted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  {(searchTerm || statusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                    >
                      {t.clearSearch}
                    </button>
                  )}
                </div>
              </div>

              {(searchTerm || statusFilter !== 'all') && (
                <div className="text-sm text-gray-600">
                  Showing {bookings.length} of {allBookings.length} bookings
                </div>
              )}
            </div>

            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">{t.loading}</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t.noBookings}</p>
              </div>
            ) : viewType === 'day' ? (
              <CalendarDayView
                date={currentDate}
                bookings={bookings}
                onBookingClick={setSelectedBooking}
              />
            ) : viewType === 'week' ? (
              <CalendarWeekView
                startDate={getWeekStart()}
                bookings={bookings}
                onBookingClick={setSelectedBooking}
              />
            ) : (
              <CalendarMonthView
                currentDate={currentDate}
                bookings={bookings}
                onDateClick={handleDateClick}
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <UpcomingBookingsSidebar
            bookings={allBookings}
            onJumpToDate={handleDateClick}
            onBookingClick={setSelectedBooking}
          />
        </div>
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
