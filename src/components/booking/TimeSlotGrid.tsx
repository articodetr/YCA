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
      availableFor: 'Available times for'
    },
    ar: {
      selectTime: 'الأوقات المتاحة',
      noSlots: 'لا توجد أوقات متاحة لهذا التاريخ',
      selectDate: 'الرجاء اختيار التاريخ أولاً',
      availableFor: 'الأوقات المتاحة ليوم'
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

  return (
    <div>
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