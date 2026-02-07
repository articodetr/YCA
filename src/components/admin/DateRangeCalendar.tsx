import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

interface DateRangeCalendarProps {
  maxDaysAhead: number;
  onRangeSelect: (startDate: Date, endDate: Date) => void;
  selectedRange: { start: Date | null; end: Date | null };
}

interface DayMeta {
  hasCustomHours: boolean;
  isHoliday: boolean;
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export default function DateRangeCalendar({ maxDaysAhead, onRangeSelect, selectedRange }: DateRangeCalendarProps) {
  const { language } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [clickState, setClickState] = useState<'first' | 'second'>('first');
  const [tempStart, setTempStart] = useState<Date | null>(selectedRange.start);
  const [dayMetaMap, setDayMetaMap] = useState<Map<string, DayMeta>>(new Map());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDaysAhead);

  useEffect(() => {
    loadMonthMeta();
  }, [currentMonth]);

  useEffect(() => {
    if (selectedRange.start) {
      setTempStart(selectedRange.start);
      setClickState(selectedRange.end ? 'first' : 'second');
    }
  }, [selectedRange]);

  const loadMonthMeta = async () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
    const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

    try {
      const { data } = await supabase
        .from('day_specific_hours')
        .select('date, is_holiday')
        .gte('date', firstDay)
        .lte('date', lastDay);

      const map = new Map<string, DayMeta>();
      (data || []).forEach((row: any) => {
        map.set(row.date, {
          hasCustomHours: true,
          isHoliday: row.is_holiday,
        });
      });
      setDayMetaMap(map);
    } catch {
      setDayMetaMap(new Map());
    }
  };

  const getDaysInMonth = () => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const getFirstDayOffset = () => {
    const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const isDateInRange = (date: Date): boolean => {
    const start = selectedRange.start;
    const end = selectedRange.end;
    if (!start || !end) return false;
    const d = date.getTime();
    return d > start.getTime() && d < end.getTime();
  };

  const isRangeStart = (date: Date): boolean => {
    return !!selectedRange.start && date.getTime() === selectedRange.start.getTime();
  };

  const isRangeEnd = (date: Date): boolean => {
    return !!selectedRange.end && date.getTime() === selectedRange.end.getTime();
  };

  const isDateDisabled = (date: Date): boolean => {
    return date < today || date > maxDate;
  };

  const handleDayClick = (day: number) => {
    const clicked = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    clicked.setHours(0, 0, 0, 0);

    if (isDateDisabled(clicked)) return;

    if (clickState === 'first') {
      setTempStart(clicked);
      setClickState('second');
      onRangeSelect(clicked, clicked);
    } else {
      if (!tempStart) return;
      const start = clicked < tempStart ? clicked : tempStart;
      const end = clicked < tempStart ? tempStart : clicked;
      onRangeSelect(start, end);
      setClickState('first');
    }
  };

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatMonthYear = () => {
    if (language === 'ar') {
      return `${ARABIC_MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    }
    return currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  };

  const formatSelectedDate = (date: Date | null) => {
    if (!date) return '---';
    if (language === 'ar') {
      const day = String(date.getDate()).padStart(2, '0');
      const month = ARABIC_MONTHS[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    }
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const weekDayLabels = language === 'ar'
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const daysInMonth = getDaysInMonth();
  const firstDayOffset = getFirstDayOffset();

  const isRTL = language === 'ar';

  return (
    <div className="select-none">
      <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 mb-4 text-center">
        <div className="text-xs text-teal-700">
          <span>{language === 'ar' ? 'من' : 'From'}: </span>
          <span className="font-semibold">{formatSelectedDate(selectedRange.start)}</span>
        </div>
        <div className="text-xs text-teal-700 mt-0.5">
          <span>{language === 'ar' ? 'إلى' : 'To'}: </span>
          <span className="font-semibold">{formatSelectedDate(selectedRange.end)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={isRTL ? goToNextMonth : goToPrevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-sm font-bold text-teal-700">{formatMonthYear()}</span>
        <button
          onClick={isRTL ? goToPrevMonth : goToNextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className={`grid grid-cols-7 gap-0 mb-1 ${isRTL ? 'direction-rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {weekDayLabels.map((label) => (
          <div key={label} className="text-center text-[10px] font-medium text-gray-500 py-1.5">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0" dir={isRTL ? 'rtl' : 'ltr'}>
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          date.setHours(0, 0, 0, 0);

          const dateStr = date.toISOString().split('T')[0];
          const meta = dayMetaMap.get(dateStr);
          const disabled = isDateDisabled(date);
          const inRange = isDateInRange(date);
          const rangeStart = isRangeStart(date);
          const rangeEnd = isRangeEnd(date);
          const isSingleSelect = rangeStart && rangeEnd;
          const isEndpoint = rangeStart || rangeEnd;
          const isCurrentDay = date.getTime() === today.getTime();

          return (
            <div
              key={day}
              className={`relative h-10 flex items-center justify-center
                ${inRange ? 'bg-teal-100' : ''}
                ${rangeStart && !isSingleSelect ? (isRTL ? 'rounded-r-full bg-teal-100' : 'rounded-l-full bg-teal-100') : ''}
                ${rangeEnd && !isSingleSelect ? (isRTL ? 'rounded-l-full bg-teal-100' : 'rounded-r-full bg-teal-100') : ''}
              `}
            >
              <button
                onClick={() => handleDayClick(day)}
                disabled={disabled}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-all relative
                  ${disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                  ${isEndpoint && !disabled ? 'bg-teal-600 text-white shadow-sm' : ''}
                  ${inRange && !isEndpoint && !disabled ? 'text-teal-800' : ''}
                  ${!inRange && !isEndpoint && !disabled ? 'text-gray-700 hover:bg-gray-100' : ''}
                  ${isCurrentDay && !isEndpoint ? 'ring-2 ring-teal-400 ring-offset-1' : ''}
                `}
              >
                {day}
                {meta && !disabled && (
                  <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                    meta.isHoliday ? 'bg-red-400' : 'bg-teal-400'
                  }`} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {clickState === 'second' && (
        <div className="mt-3 text-center">
          <span className="text-xs text-teal-600 font-medium animate-pulse">
            {language === 'ar' ? 'اضغط على تاريخ النهاية' : 'Click the end date'}
          </span>
        </div>
      )}
    </div>
  );
}
