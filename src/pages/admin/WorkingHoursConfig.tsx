import { useState, useEffect } from 'react';
import { Settings, CalendarDays, CalendarRange, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import DateRangeCalendar from '../../components/admin/DateRangeCalendar';
import WorkingHoursModal from '../../components/admin/WorkingHoursModal';
import DefaultHoursEditor from '../../components/admin/DefaultHoursEditor';

interface WorkingHoursConfigProps {
  maxDaysAhead: number;
  selectedServiceId: string;
  onUpdate: () => void;
}

type EditMode = 'single' | 'range' | 'all';

export default function WorkingHoursConfig({ maxDaysAhead, onUpdate }: WorkingHoursConfigProps) {
  const { language } = useLanguage();
  const [editMode, setEditMode] = useState<EditMode>('single');
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

  const t = {
    en: {
      title: 'Working Hours Configuration',
      singleDay: 'Single Day',
      singleDesc: 'Edit one specific date',
      dateRange: 'Date Range',
      rangeDesc: 'Edit a period from-to',
      allDays: 'All Days (Default)',
      allDesc: 'Update the global default schedule',
      instructionSingle: 'Click on a date to configure its working hours.',
      instructionRange: 'Click a start date, then an end date to select a range.',
      editHours: 'Edit Working Hours',
      selectFirst: 'Select dates from the calendar above',
    },
    ar: {
      title: 'إعدادات ساعات العمل',
      singleDay: 'يوم واحد',
      singleDesc: 'تعديل تاريخ محدد',
      dateRange: 'فترة زمنية',
      rangeDesc: 'تعديل فترة من-إلى',
      allDays: 'جميع الأيام (افتراضي)',
      allDesc: 'تحديث الجدول الافتراضي العام',
      instructionSingle: 'اضغط على تاريخ لإعداد ساعات العمل.',
      instructionRange: 'اضغط على تاريخ البداية، ثم تاريخ النهاية لتحديد الفترة.',
      editHours: 'تعديل ساعات العمل',
      selectFirst: 'اختر التواريخ من التقويم أعلاه',
    },
  }[language];

  useEffect(() => {
    setSelectedRange({ start: null, end: null });
    setShowModal(false);
    setCalendarKey((prev) => prev + 1);
  }, [editMode]);

  const handleRangeSelect = (start: Date, end: Date) => {
    setSelectedRange({ start, end });
    if (editMode === 'single') {
      setShowModal(true);
    }
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

  const modes: { id: EditMode; label: string; desc: string; icon: typeof CalendarDays }[] = [
    { id: 'single', label: t.singleDay, desc: t.singleDesc, icon: CalendarDays },
    { id: 'range', label: t.dateRange, desc: t.rangeDesc, icon: CalendarRange },
    { id: 'all', label: t.allDays, desc: t.allDesc, icon: Globe },
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-teal-600" />
        <h3 className="text-base font-bold text-gray-900">{t.title}</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = editMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setEditMode(mode.id)}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all text-center ${
                isActive
                  ? 'border-teal-500 bg-teal-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
              <span className={`text-xs font-semibold leading-tight ${isActive ? 'text-teal-800' : 'text-gray-700'}`}>
                {mode.label}
              </span>
              <span className={`text-[10px] leading-tight ${isActive ? 'text-teal-600' : 'text-gray-400'}`}>
                {mode.desc}
              </span>
            </button>
          );
        })}
      </div>

      {editMode === 'all' ? (
        <DefaultHoursEditor maxDaysAhead={maxDaysAhead} onUpdate={onUpdate} />
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-4">
            {editMode === 'single' ? t.instructionSingle : t.instructionRange}
          </p>

          <DateRangeCalendar
            key={calendarKey}
            maxDaysAhead={maxDaysAhead}
            onRangeSelect={handleRangeSelect}
            selectedRange={selectedRange}
            singleClickMode={editMode === 'single'}
          />

          {editMode === 'range' && (
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
          )}

          {showModal && selectedRange.start && selectedRange.end && (
            <WorkingHoursModal
              startDate={selectedRange.start}
              endDate={selectedRange.end}
              onClose={() => setShowModal(false)}
              onSaved={handleSaved}
            />
          )}
        </>
      )}
    </div>
  );
}
