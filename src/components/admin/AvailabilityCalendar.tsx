import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AvailabilityStats } from '../../lib/booking-utils';

interface AvailabilityCalendarProps {
  stats: AvailabilityStats[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
}

export default function AvailabilityCalendar({
  stats,
  selectedDate,
  onDateSelect,
  currentMonth,
  onMonthChange,
}: AvailabilityCalendarProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    onMonthChange(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    onMonthChange(newMonth);
  };

  const getStatsForDate = (day: number): AvailabilityStats | undefined => {
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return stats.find((s) => s.date === dateStr);
  };

  const getDateColor = (stat: AvailabilityStats | undefined) => {
    if (!stat) return 'bg-gray-50 text-gray-400 cursor-not-allowed';
    if (stat.is_blocked) return 'bg-red-100 text-red-800 border-red-300';
    if (stat.total_slots === 0) return 'bg-gray-100 text-gray-500 border-gray-300';

    const availabilityRatio = stat.available_slots / stat.total_slots;

    if (availabilityRatio > 0.6) {
      return 'bg-green-50 text-green-900 border-green-300 hover:bg-green-100';
    } else if (availabilityRatio > 0.3) {
      return 'bg-yellow-50 text-yellow-900 border-yellow-300 hover:bg-yellow-100';
    } else if (availabilityRatio > 0) {
      return 'bg-orange-50 text-orange-900 border-orange-300 hover:bg-orange-100';
    } else {
      return 'bg-red-50 text-red-900 border-red-300 hover:bg-red-100';
    }
  };

  const formatDateKey = (day: number) => {
    return `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={previousMonth}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 text-[10px] mb-2">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-green-200 rounded"></div>
            <span className="text-gray-600">High Availability</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-yellow-200 rounded"></div>
            <span className="text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-orange-200 rounded"></div>
            <span className="text-gray-600">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-red-200 rounded"></div>
            <span className="text-gray-600">Full/Blocked</span>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-semibold text-gray-600 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateKey = formatDateKey(day);
            const stat = getStatsForDate(day);
            const colorClass = getDateColor(stat);
            const isSelected = selectedDate === dateKey;
            const isTodayDate = isToday(day);

            return (
              <button
                key={day}
                onClick={() => stat && onDateSelect(dateKey)}
                disabled={!stat}
                className={`
                  aspect-square p-1 rounded-lg border-2 transition-all text-xs font-medium
                  ${colorClass}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                  ${isTodayDate ? 'font-bold' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className={`${isTodayDate ? 'text-sm' : ''}`}>{day}</div>
                  {stat && stat.total_slots > 0 && (
                    <div className="text-[10px] mt-0.5">
                      {stat.available_slots}/{stat.total_slots}
                    </div>
                  )}
                  {stat && stat.is_blocked && (
                    <div className="text-[10px]">🚫</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
