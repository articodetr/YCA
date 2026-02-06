import { useLanguage } from '../../contexts/LanguageContext';

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
}

export default function TimeSlotGrid({ selectedDate, slots, selectedSlot, onSlotSelect, workingHours }: TimeSlotGridProps) {
  const { language } = useLanguage();

  const t = {
    en: {
      noSlots: 'No available slots for this date',
      hoursLabel: 'Working hours',
      breakLabel: 'Break',
    },
    ar: {
      noSlots: 'لا توجد أوقات متاحة لهذا التاريخ',
      hoursLabel: 'ساعات العمل',
      breakLabel: 'استراحة',
    }
  }[language];

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

  return (
    <div>
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

      {slots.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          {t.noSlots}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {slots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSlotSelect(slot)}
              disabled={!slot.isAvailable}
              className={`
                py-3 px-3 rounded-lg text-center transition-all font-medium text-sm border-2
                ${selectedSlot?.id === slot.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                }
                ${!slot.isAvailable ? 'opacity-40 cursor-not-allowed bg-gray-100' : ''}
              `}
            >
              <div className="font-semibold">{formatTime(slot.startTime)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}