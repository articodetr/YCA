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
      selectTime: 'Select Time',
      noSlots: 'No available slots for this date',
      selectDate: 'Please select a date first'
    },
    ar: {
      selectTime: 'اختر الوقت',
      noSlots: 'لا توجد أوقات متاحة لهذا التاريخ',
      selectDate: 'الرجاء اختيار التاريخ أولاً'
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
      weekday: 'long',
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
    return (
      <div className="bg-gray-800 rounded-2xl p-6">
        <h3 className="text-white text-lg font-medium mb-4">{t.selectTime}</h3>
        <div className="text-center py-12 text-gray-400">
          {t.selectDate}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-6">
      <h3 className="text-white text-lg font-medium mb-2">{t.selectTime}</h3>
      <p className="text-gray-400 text-sm mb-6">{formatDateDisplay(selectedDate)}</p>

      {slots.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {t.noSlots}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onSlotSelect(slot)}
              disabled={!slot.isAvailable}
              className={`
                py-4 px-6 rounded-xl text-center transition-all font-medium
                ${selectedSlot?.id === slot.id
                  ? 'bg-teal-600 text-white border-2 border-teal-400'
                  : 'bg-gray-700 text-white border-2 border-transparent hover:border-gray-500'
                }
                ${!slot.isAvailable ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}
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