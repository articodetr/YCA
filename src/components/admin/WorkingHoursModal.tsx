import { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Coffee, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

interface DayConfig {
  start_time: string;
  end_time: string;
  last_appointment_time: string;
  slot_interval_minutes: number;
  break_times: { start: string; end: string }[];
  is_holiday: boolean;
  holiday_reason_en: string;
  holiday_reason_ar: string;
}

interface WorkingHoursModalProps {
  startDate: Date;
  endDate: Date;
  onClose: () => void;
  onSaved: () => void;
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

function getDatesInRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function WorkingHoursModal({ startDate, endDate, onClose, onSaved }: WorkingHoursModalProps) {
  const { language } = useLanguage();
  const [config, setConfig] = useState<DayConfig>({
    start_time: '10:00:00',
    end_time: '14:30:00',
    last_appointment_time: '14:00:00',
    slot_interval_minutes: 30,
    break_times: [],
    is_holiday: false,
    holiday_reason_en: '',
    holiday_reason_ar: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  const isSingleDay = startDate.getTime() === endDate.getTime();
  const datesList = getDatesInRange(startDate, endDate);
  const dayCount = datesList.length;

  const t = {
    en: {
      title: 'Working Hours Settings',
      singleDay: 'Settings for',
      rangeDays: 'Settings for date range',
      daysCount: `${dayCount} day${dayCount > 1 ? 's' : ''}`,
      from: 'From',
      to: 'To',
      startTime: 'Start Time',
      endTime: 'End Time',
      lastAppointment: 'Last Appointment Time',
      slotInterval: 'Slot Interval (minutes)',
      breakTimes: 'Break Times',
      addBreak: 'Add Break',
      breakStart: 'Start',
      breakEnd: 'End',
      noBreaks: 'No break times configured',
      isHoliday: 'Mark as Holiday',
      holidayReasonEn: 'Holiday Reason (English)',
      holidayReasonAr: 'Holiday Reason (Arabic)',
      save: 'Save & Regenerate Slots',
      saving: 'Saving...',
      reset: 'Reset to Default',
      resetting: 'Resetting...',
      confirmReset: 'Remove custom settings for these dates and use default working hours?',
      affectedDates: `This will affect ${dayCount} date${dayCount > 1 ? 's' : ''}`,
    },
    ar: {
      title: 'إعدادات ساعات العمل',
      singleDay: 'إعدادات يوم',
      rangeDays: 'إعدادات نطاق التواريخ',
      daysCount: `${dayCount} يوم`,
      from: 'من',
      to: 'إلى',
      startTime: 'وقت البداية',
      endTime: 'وقت النهاية',
      lastAppointment: 'آخر موعد للحجز',
      slotInterval: 'فاصل الموعد (دقائق)',
      breakTimes: 'أوقات الراحة',
      addBreak: 'إضافة راحة',
      breakStart: 'بداية',
      breakEnd: 'نهاية',
      noBreaks: 'لم يتم تكوين أوقات راحة',
      isHoliday: 'تحديد كعطلة',
      holidayReasonEn: 'سبب العطلة (إنجليزي)',
      holidayReasonAr: 'سبب العطلة (عربي)',
      save: 'حفظ وإعادة توليد المواعيد',
      saving: 'جاري الحفظ...',
      reset: 'إعادة تعيين للافتراضي',
      resetting: 'جاري إعادة التعيين...',
      confirmReset: 'حذف الإعدادات المخصصة لهذه التواريخ واستخدام ساعات العمل الافتراضية؟',
      affectedDates: `سيتأثر ${dayCount} يوم`,
    },
  }[language];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const dateStr = startDate.toISOString().split('T')[0];
      const { data: specificConfig } = await supabase
        .from('day_specific_hours')
        .select('*')
        .eq('date', dateStr)
        .maybeSingle();

      if (specificConfig) {
        setConfig({
          start_time: specificConfig.start_time,
          end_time: specificConfig.end_time,
          last_appointment_time: specificConfig.last_appointment_time,
          slot_interval_minutes: specificConfig.slot_interval_minutes,
          break_times: specificConfig.break_times || [],
          is_holiday: specificConfig.is_holiday,
          holiday_reason_en: specificConfig.holiday_reason_en || '',
          holiday_reason_ar: specificConfig.holiday_reason_ar || '',
        });
      } else {
        const dayOfWeek = startDate.getDay() === 0 ? 7 : startDate.getDay();
        const { data: defaultConfig } = await supabase
          .from('working_hours_config')
          .select('*')
          .eq('day_of_week', dayOfWeek)
          .maybeSingle();

        if (defaultConfig) {
          setConfig({
            start_time: defaultConfig.start_time,
            end_time: defaultConfig.end_time,
            last_appointment_time: defaultConfig.last_appointment_time,
            slot_interval_minutes: defaultConfig.slot_interval_minutes,
            break_times: [],
            is_holiday: !defaultConfig.is_active,
            holiday_reason_en: '',
            holiday_reason_ar: '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    try {
      for (const dateStr of datesList) {
        const { data: existing } = await supabase
          .from('day_specific_hours')
          .select('id')
          .eq('date', dateStr)
          .maybeSingle();

        const payload = {
          start_time: config.start_time,
          end_time: config.end_time,
          last_appointment_time: config.last_appointment_time,
          slot_interval_minutes: config.slot_interval_minutes,
          break_times: config.break_times,
          is_holiday: config.is_holiday,
          holiday_reason_en: config.holiday_reason_en,
          holiday_reason_ar: config.holiday_reason_ar,
          updated_at: new Date().toISOString(),
        };

        if (existing) {
          await supabase.from('day_specific_hours').update(payload).eq('id', existing.id);
        } else {
          await supabase.from('day_specific_hours').insert({ ...payload, date: dateStr });
        }
      }

      const { data: services } = await supabase
        .from('booking_services')
        .select('id')
        .eq('is_active', true);

      for (const dateStr of datesList) {
        for (const service of (services || [])) {
          await supabase.rpc('regenerate_slots_for_date', {
            p_service_id: service.id,
            p_date: dateStr,
          });
        }
      }

      setSaveResult({
        success: true,
        message: language === 'ar' ? 'تم الحفظ بنجاح' : 'Saved successfully',
      });
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error saving config:', error);
      setSaveResult({
        success: false,
        message: language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'An error occurred while saving',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(t.confirmReset)) return;

    setResetting(true);
    setSaveResult(null);
    try {
      for (const dateStr of datesList) {
        await supabase.from('day_specific_hours').delete().eq('date', dateStr);
      }

      const { data: services } = await supabase
        .from('booking_services')
        .select('id')
        .eq('is_active', true);

      for (const dateStr of datesList) {
        for (const service of (services || [])) {
          await supabase.rpc('regenerate_slots_for_date', {
            p_service_id: service.id,
            p_date: dateStr,
          });
        }
      }

      setSaveResult({
        success: true,
        message: language === 'ar' ? 'تمت إعادة التعيين بنجاح' : 'Reset successfully',
      });
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error resetting config:', error);
      setSaveResult({
        success: false,
        message: language === 'ar' ? 'حدث خطأ أثناء إعادة التعيين' : 'An error occurred while resetting',
      });
    } finally {
      setResetting(false);
    }
  };

  const addBreakTime = () => {
    setConfig({
      ...config,
      break_times: [...config.break_times, { start: '12:00', end: '13:00' }],
    });
  };

  const removeBreakTime = (index: number) => {
    setConfig({
      ...config,
      break_times: config.break_times.filter((_, i) => i !== index),
    });
  };

  const updateBreakTime = (index: number, field: 'start' | 'end', value: string) => {
    const newBreaks = [...config.break_times];
    newBreaks[index][field] = value;
    setConfig({ ...config, break_times: newBreaks });
  };

  const formatDisplayDate = (date: Date) => {
    if (language === 'ar') {
      return `${date.getDate()} ${ARABIC_MONTHS[date.getMonth()]}`;
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-base font-bold text-gray-900">{t.title}</h3>
            <div className="text-xs text-gray-500 mt-0.5">
              {isSingleDay ? (
                <span>{t.singleDay} {formatDisplayDate(startDate)}</span>
              ) : (
                <span>
                  {t.from} {formatDisplayDate(startDate)} {t.to} {formatDisplayDate(endDate)} -- {t.daysCount}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
              <p className="text-sm text-gray-500">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={config.is_holiday}
                  onChange={(e) => setConfig({ ...config, is_holiday: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <label className="text-xs font-medium text-gray-900">{t.isHoliday}</label>
              </div>

              {config.is_holiday ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{t.holidayReasonEn}</label>
                    <input
                      type="text"
                      value={config.holiday_reason_en}
                      onChange={(e) => setConfig({ ...config, holiday_reason_en: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{t.holidayReasonAr}</label>
                    <input
                      type="text"
                      value={config.holiday_reason_ar}
                      onChange={(e) => setConfig({ ...config, holiday_reason_ar: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      dir="rtl"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">{t.startTime}</label>
                      <input
                        type="time"
                        value={config.start_time.substring(0, 5)}
                        onChange={(e) => setConfig({ ...config, start_time: e.target.value + ':00' })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">{t.endTime}</label>
                      <input
                        type="time"
                        value={config.end_time.substring(0, 5)}
                        onChange={(e) => setConfig({ ...config, end_time: e.target.value + ':00' })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">{t.lastAppointment}</label>
                      <input
                        type="time"
                        value={config.last_appointment_time.substring(0, 5)}
                        onChange={(e) => setConfig({ ...config, last_appointment_time: e.target.value + ':00' })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">{t.slotInterval}</label>
                      <input
                        type="number"
                        value={config.slot_interval_minutes}
                        onChange={(e) => setConfig({ ...config, slot_interval_minutes: parseInt(e.target.value) || 30 })}
                        min="15"
                        max="60"
                        step="15"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-orange-600" />
                        {t.breakTimes}
                      </h4>
                      <button
                        onClick={addBreakTime}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        {t.addBreak}
                      </button>
                    </div>

                    {config.break_times.length === 0 ? (
                      <div className="text-center py-3 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                        <AlertCircle className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                        <p className="text-xs">{t.noBreaks}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {config.break_times.map((breakTime, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-gray-600 mb-1">{t.breakStart}</label>
                                <input
                                  type="time"
                                  value={breakTime.start}
                                  onChange={(e) => updateBreakTime(index, 'start', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-gray-600 mb-1">{t.breakEnd}</label>
                                <input
                                  type="time"
                                  value={breakTime.end}
                                  onChange={(e) => updateBreakTime(index, 'end', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 text-xs"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => removeBreakTime(index)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {!loading && (
          <div className="p-4 border-t border-gray-200 space-y-2">
            {saveResult && (
              <div className={`text-center text-xs font-medium py-1.5 rounded-lg ${
                saveResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {saveResult.message}
              </div>
            )}

            <div className="text-center text-[10px] text-gray-400 mb-1">
              {t.affectedDates}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || resetting}
                className="flex-1 bg-teal-600 text-white py-2.5 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {t.saving}</>
                ) : (
                  <><Save className="w-4 h-4" /> {t.save}</>
                )}
              </button>
              <button
                onClick={handleReset}
                disabled={saving || resetting}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {t.resetting}</>
                ) : (
                  <><RotateCcw className="w-4 h-4" /> {t.reset}</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
