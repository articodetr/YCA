import { Calendar, CalendarDays, CalendarRange, TrendingUp } from 'lucide-react';

interface Booking {
  date: string;
  status: string;
}

interface BookingStatCardsProps {
  bookings: Booking[];
  onFilterByPeriod?: (period: 'today' | 'week' | 'month') => void;
}

export default function BookingStatCards({ bookings, onFilterByPeriod }: BookingStatCardsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getWeekStart = () => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay());
    return date;
  };

  const getMonthStart = () => {
    return new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const todayBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date + 'T00:00:00');
    return bookingDate.getTime() === today.getTime();
  });

  const weekBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date + 'T00:00:00');
    const weekStart = getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return bookingDate >= weekStart && bookingDate <= weekEnd;
  });

  const monthBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date + 'T00:00:00');
    const monthStart = getMonthStart();
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return bookingDate >= monthStart && bookingDate <= monthEnd;
  });

  const cards = [
    {
      title: 'Today',
      count: todayBookings.length,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      period: 'today' as const,
    },
    {
      title: 'This Week',
      count: weekBookings.length,
      icon: CalendarDays,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      period: 'week' as const,
    },
    {
      title: 'This Month',
      count: monthBookings.length,
      icon: CalendarRange,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      period: 'month' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.title}
            onClick={() => onFilterByPeriod?.(card.period)}
            className={`${card.bgColor} rounded-xl border-2 border-transparent hover:border-gray-300 transition-all p-6 text-left group hover:shadow-md`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color} shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className={`w-5 h-5 ${card.textColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {card.count}
              </p>
              <p className="text-xs text-gray-500">
                {card.count === 1 ? 'booking' : 'bookings'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
