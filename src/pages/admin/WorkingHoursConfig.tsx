import { useState } from 'react';
import { Settings } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import DateRangeCalendar from '../../components/admin/DateRangeCalendar';
import WorkingHoursModal from '../../components/admin/WorkingHoursModal';

interface WorkingHoursConfigProps {
  maxDaysAhead: number;
  selectedServiceId: string;
  onUpdate: () => void;
}

export default function WorkingHoursConfig({ maxDaysAhead, onUpdate }: WorkingHoursConfigProps) {
  const { language } = useLanguage();
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

  const t = {
    en: {
      title: 'Working Hours Configuration',
      instruction: 'Select a date or date range from the calendar, then click the button below to configure working hours.',
      editHours: 'Edit Working Hours',
      selectFirst: 'Select dates from the calendar above',
    },
    ar: {
      title: 'إعدادات ساعات العمل',
      instruction: 'اختر تاريخاً أو نطاق تواريخ من التقويم، ثم اضغط الزر أدناه لإعداد ساعات العمل.',
      editHours: 'تعديل ساعات العمل',
      selectFirst: 'اختر التواريخ من التقويم أعلاه',
    },
  }[language];

  const handleRangeSelect = (start: Date, end: Date) => {
    setSelectedRange({ start, end });
  };

  const handleOpenModal = () => {
    if (selectedRange.start && selectedRange.end) {
      setShowModal(true);
    }
  };

  const handleSaved = () => {
    setCalendarKey((prev) => prev + 1);
    setSelectedRange({ start: null, end: null });
    onUpdate();
  };

  const hasSelection = selectedRange.start !== null;

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-teal-600" />
        <h3 className="text-base font-bold text-gray-900">{t.title}</h3>
      </div>

      <p className="text-xs text-gray-500 mb-4">{t.instruction}</p>

      <DateRangeCalendar
        key={calendarKey}
        maxDaysAhead={maxDaysAhead}
        onRangeSelect={handleRangeSelect}
        selectedRange={selectedRange}
      />

      <div className="mt-4">
        <button
          onClick={handleOpenModal}
          disabled={!hasSelection}
          className={`w-full py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            hasSelection
              ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Settings className="w-4 h-4" />
          {hasSelection ? t.editHours : t.selectFirst}
        </button>
      </div>

      {showModal && selectedRange.start && selectedRange.end && (
        <WorkingHoursModal
          startDate={selectedRange.start}
          endDate={selectedRange.end}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
