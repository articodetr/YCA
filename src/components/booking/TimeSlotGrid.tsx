import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CalendarDays } from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface WorkingHoursInfo {
  startTime: string;
  endTime: string;
  breakTimes: { start: string; end: string }[];
}

interface TimeSlotGridProps {
  selectedDate: Date | null;
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  workingHours?: WorkingHoursInfo | null;
  recentlyBookedSlotIds?: Set<string>;
}

export default function TimeSlotGrid({ selectedDate, slots, selectedSlot, onSlotSelect, workingHours, recentlyBookedSlotIds }: TimeSlotGridProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [fadingOutIds, setFadingOutIds] = useState<Set<string>>(new Set());
  const prevSlotsRef = useRef<Map<string, boolean>>(new Map());

  const t = {
    en: {
      noSlots: 'No available slots for this date',
      hoursLabel: 'Working hours',
      breakLabel: 'Break',
      justBooked: 'Just booked',
      tryDifferentDate: 'Try selecting a different date to find available times.',
    },
    ar: {
      noSlots: 'لا توجد أوقات متاحة لهذا التاريخ',
      hoursLabel: 'ساعات العمل',
      breakLabel: 'استراحة',
      justBooked: 'تم الحجز',
      tryDifferentDate: 'حاول اختيار تاريخ آخر للعثور على أوقات متاحة.',
    }
  }[language];

  useEffect(() => {
    const newFading = new Set<string>();
    slots.forEach(slot => {
      const wasAvailable = prevSlotsRef.current.get(slot.id);
      if (wasAvailable === true && !slot.isAvailable) {
        newFading.add(slot.id);
      }
    });

    if (newFading.size > 0) {
      setFadingOutIds(prev => new Set([...prev, ...newFading]));
      setTimeout(() => {
        setFadingOutIds(prev => {
          const next = new Set(prev);
          newFading.forEach(id => next.delete(id));
          return next;
        });
      }, 3000);
    }

    const newMap = new Map<string, boolean>();
    slots.forEach(s => newMap.set(s.id, s.isAvailable));
    prevSlotsRef.current = newMap;
  }, [slots]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatTimeAr = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'مساءً' : 'صباحاً';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long' });
  };

  if (!selectedDate) {
    return null;
  }

  const availableSlots = slots.filter(s => s.isAvailable);
  const justBookedSlots = slots.filter(s =>
    !s.isAvailable && (fadingOutIds.has(s.id) || recentlyBookedSlotIds?.has(s.id))
  );
  const visibleSlots = [...availableSlots, ...justBookedSlots].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {workingHours && (
        <div className="mb-4 p-3 rounded-lg border bg-gray-50 border-gray-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              {getDayName(selectedDate)} {t.hoursLabel}:{' '}
              {language === 'ar'
                ? `${formatTimeAr(workingHours.startTime)} - ${formatTimeAr(workingHours.endTime)}`
                : `${formatTime(workingHours.startTime)} - ${formatTime(workingHours.endTime)}`
              }
            </p>
          </div>
          {workingHours.breakTimes.length > 0 && (
            <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block w-3 h-3 bg-orange-200 rounded-full"></span>
              {workingHours.breakTimes.map((b, i) => (
                <span key={i}>
                  {t.breakLabel}:{' '}
                  {language === 'ar'
                    ? `${formatTimeAr(b.start)} - ${formatTimeAr(b.end)}`
                    : `${formatTime(b.start)} - ${formatTime(b.end)}`
                  }
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {visibleSlots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t.noSlots}</p>
          <p className="text-sm text-gray-400 mt-1">{t.tryDifferentDate}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3">
          {visibleSlots.map((slot) => {
            const isJustBooked = !slot.isAvailable && (fadingOutIds.has(slot.id) || recentlyBookedSlotIds?.has(slot.id));
            const isSelected = selectedSlot?.id === slot.id;

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => slot.isAvailable && onSlotSelect(slot)}
                disabled={!slot.isAvailable}
                className={`
                  relative py-2 sm:py-2.5 md:py-3 px-1 sm:px-2 md:px-3 rounded-lg text-center font-medium text-xs sm:text-sm border-2
                  transition-all duration-300 ease-in-out
                  ${isJustBooked
                    ? 'bg-red-50 text-red-400 border-red-200 opacity-60 cursor-not-allowed scale-95'
                    : isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                      : slot.isAvailable
                        ? 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-[1.02]'
                        : 'opacity-40 cursor-not-allowed bg-gray-100 border-gray-200'
                  }
                `}
              >
                <div className={`text-xs sm:text-sm font-semibold ${isJustBooked ? 'line-through' : ''}`}>
                  {formatTime(slot.startTime)}
                </div>
                {isJustBooked && (
                  <div className="text-[9px] sm:text-[10px] font-bold text-red-500 mt-0.5 animate-pulse">
                    {t.justBooked}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
