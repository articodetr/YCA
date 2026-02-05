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
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-teal-100 rounded-lg">
          <Clock className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="text-gray-900 text-lg font-semibold">{t.selectTime}</h3>
          <p className="text-gray-600 text-sm">{t.availableFor} {formatDateDisplay(selectedDate)}</p>
        </div>
      </div>

      {slots.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t.noSlots}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onSlotSelect(slot)}
              disabled={!slot.isAvailable}
              className={`
                py-4 px-4 rounded-xl text-center transition-all font-medium border-2
                ${selectedSlot?.id === slot.id
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                }
                ${!slot.isAvailable ? 'opacity-40 cursor-not-allowed bg-gray-100' : ''}
              `}
            >
              {formatTime(slot.startTime)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}