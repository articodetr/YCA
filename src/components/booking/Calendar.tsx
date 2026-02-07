import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  maxDaysAhead: number;
  unavailableDates?: string[];
  fullyBookedDates?: string[];
  slotCounts?: Record<string, number>;
  autoSelectNearest?: boolean;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  maxDaysAhead,
  unavailableDates = [],
  fullyBookedDates = [],
  slotCounts = {},
  autoSelectNearest = false,
}: CalendarProps) {
  const { language } = useLanguage();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [showWarning, setShowWarning] = React.useState(false);
  const hasAutoSelected = React.useRef(false);

  const t = {
    en: {
      warning: "We don't accept bookings this far in advance",
      notAvailable: 'Not available',
      closed: 'Closed',
      full: 'Full',
      slotsLeft: 'slots left',
    },
    ar: {
      warning: 'لا نقبل الحجوزات بهذا القدر من التقدم',
      notAvailable: 'غير متاح',
      closed: 'مغلق',
      full: 'ممتلئ',
      slotsLeft: 'متبقي',
    },
  }[language];

  const monthNames = {
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  }[language];

  const dayNames = {
    en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    ar: ['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح'],
  }[language];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDaysAhead);

  const isDateTooFar = (date: Date) => date > maxDate;
  const isDatePast = (date: Date) => date < today;
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isDateUnavailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return unavailableDates.includes(dateStr);
  };

  const isDateFullyBooked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return fullyBookedDates.includes(dateStr);
  };

  const getSlotCount = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return slotCounts[dateStr] ?? -1;
  };

  React.useEffect(() => {
    if (!autoSelectNearest || hasAutoSelected.current || selectedDate) return;
    if (Object.keys(slotCounts).length === 0 && unavailableDates.length === 0) return;

    const candidate = new Date(today);
    for (let i = 0; i <= maxDaysAhead; i++) {
      const d = new Date(candidate);
      d.setDate(candidate.getDate() + i);
      if (isWeekend(d) || isDateUnavailable(d) || isDateFullyBooked(d) || isDateTooFar(d)) continue;
      const count = getSlotCount(d);
      if (count > 0 || count === -1) {
        hasAutoSelected.current = true;
        setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
        onDateSelect(d);
        return;
      }
    }
  }, [slotCounts, unavailableDates, fullyBookedDates, autoSelectNearest]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    return { daysInMonth, startingDayOfWeek };
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    const lastDayOfNewMonth = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0);
    if (isDateTooFar(lastDayOfNewMonth)) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    const firstDayOfNewMonth = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
    if (isDateTooFar(firstDayOfNewMonth)) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (isDatePast(date) || isDateTooFar(date) || isDateUnavailable(date) || isWeekend(date) || isDateFullyBooked(date)) {
      return;
    }
    onDateSelect(date);
  };

  const renderDays = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -startingDayOfWeek + i + 1);
      days.push(
        <div key={`prev-${i}`} className="aspect-square flex items-center justify-center text-gray-300 text-sm">
          {prevMonthDate.getDate()}
        </div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isPast = isDatePast(date);
      const isTooFar = isDateTooFar(date);
      const isUnavailable = isDateUnavailable(date);
      const isWeekendDay = isWeekend(date);
      const isFullyBooked = isDateFullyBooked(date);
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isToday = today.toDateString() === date.toDateString();
      const isDisabled = isPast || isTooFar || isUnavailable || isWeekendDay || isFullyBooked;

      const count = getSlotCount(date);
      const showCount = !isDisabled && !isPast && !isTooFar && count >= 0;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          disabled={isDisabled}
          title={
            isFullyBooked ? t.full :
            isWeekendDay ? t.closed :
            isUnavailable ? t.notAvailable :
            showCount ? `${count} ${t.slotsLeft}` :
            undefined
          }
          className={`
            aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all font-semibold relative
            ${isSelected ? 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-300' : ''}
            ${isToday && !isSelected ? 'bg-blue-50 text-blue-600 border-2 border-blue-300' : ''}
            ${isFullyBooked ? 'bg-amber-50 border border-amber-300 text-amber-500 cursor-not-allowed' : ''}
            ${isWeekendDay && !isFullyBooked ? 'bg-red-50 border border-red-200 text-red-400 cursor-not-allowed' : ''}
            ${isUnavailable && !isWeekendDay && !isFullyBooked ? 'bg-red-50 border border-red-200 text-red-400 cursor-not-allowed' : ''}
            ${isDisabled && !isWeekendDay && !isUnavailable && !isFullyBooked ? 'text-gray-300 cursor-not-allowed bg-gray-50' : ''}
            ${!isSelected && !isToday && !isDisabled ? 'text-gray-700 hover:bg-blue-50 hover:border-blue-300 border border-gray-200' : ''}
          `}
        >
          <span className={isFullyBooked ? 'text-[11px]' : ''}>{day}</span>
          {isFullyBooked && (
            <span className="text-[8px] font-bold text-amber-600 leading-none mt-0.5">{t.full}</span>
          )}
          {showCount && !isSelected && (
            <span className={`text-[8px] font-bold leading-none mt-0.5 ${
              count <= 2 ? 'text-red-500' : count <= 5 ? 'text-amber-500' : 'text-emerald-600'
            }`}>
              {count}
            </span>
          )}
          {showCount && isSelected && (
            <span className="text-[8px] font-bold text-blue-100 leading-none mt-0.5">
              {count}
            </span>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h4 className="text-base font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div key={index} className="text-center text-gray-500 text-[11px] font-semibold uppercase py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>

      {showWarning && (
        <div className="mt-4 bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2">
          <div className="bg-amber-100 rounded-full p-1 flex-shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-amber-900 text-xs">{t.warning}</p>
        </div>
      )}
    </div>
  );
}
