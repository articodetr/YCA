import { Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface TimeSlotGridProps {
  selectedDate: Date | null;
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
}

export default function TimeSlotGrid({ selectedDate, slots, selectedSlot, onSlotSelect }: TimeSlotGridProps) {
  const { language } = useLanguage();

  const t = {
    en: {
      selectTime: 'Available Time Slots',
      noSlots: 'No available slots for this date',
      selectDate: 'Please select a date first',
      availableFor: 'Available times for',
      mondayToThursday: 'Monday-Thursday hours: 10:00 AM - 2:15 PM',
      fridayHours: 'Friday hours: 9:00 AM - 11:45 AM',
      weekendClosed: 'Closed on weekends'
    },
    ar: {
      selectTime: 'الأوقات المتاحة',
      noSlots: 'لا توجد أوقات متاحة لهذا التاريخ',
      selectDate: 'الرجاء اختيار التاريخ أولاً',
      availableFor: 'الأوقات المتاحة ليوم',
      mondayToThursday: 'الاثنين-الخميس: 10:00 صباحاً - 2:15 مساءً',
      fridayHours: 'يوم الجمعة: 9:00 صباحاً - 11:45 صباحاً',
      weekendClosed: 'مغلق في عطلة نهاية الأسبوع'
    }
  }[language];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDateDisplay = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    if (language === 'ar') {
      return date.toLocaleDateString('ar-EG', options);
    }
    return date.toLocaleDateString('en-GB', options);
  };

  if (!selectedDate) {
    return null;
  }

  const dayOfWeek = selectedDate.getDay();
  const isFriday = dayOfWeek === 5;
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 4;

  return (
    <div>
      {(isFriday || isWeekday) && (
        <div className={`mb-4 p-3 rounded-lg border ${isFriday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 ${isFriday ? 'text-blue-600' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <p className={`text-sm font-medium ${isFriday ? 'text-blue-800' : 'text-gray-700'}`}>
              {isFriday ? t.fridayHours : t.mondayToThursday}
            </p>
          </div>
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