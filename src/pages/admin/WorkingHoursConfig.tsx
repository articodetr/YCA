import { useState, useEffect } from 'react';
import { Calendar, Save, Trash2, Plus, Clock, Coffee, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

interface DayConfig {
  date: string;
  start_time: string;
  end_time: string;
  last_appointment_time: string;
  slot_interval_minutes: number;
  break_times: { start: string; end: string }[];
  is_holiday: boolean;
  holiday_reason_en: string;
  holiday_reason_ar: string;
}

interface WorkingHoursConfigProps {
  maxDaysAhead: number;
  selectedServiceId: string;
  onUpdate: () => void;
}

export default function WorkingHoursConfig({ maxDaysAhead, selectedServiceId, onUpdate }: WorkingHoursConfigProps) {
  const { language } = useLanguage();
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayConfig, setDayConfig] = useState<DayConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const t = {
    en: {
      title: 'Working Hours Configuration',
      selectDate: 'Select a date to configure',
      availableDays: 'Available Days',
      dateConfig: 'Date Configuration',
      startTime: 'Start Time',
      endTime: 'End Time',
      lastAppointment: 'Last Appointment Time',
      slotInterval: 'Slot Interval (minutes)',
      breakTimes: 'Break Times',
      addBreak: 'Add Break Period',
      removeBreak: 'Remove',
      isHoliday: 'Mark as Holiday',
      holidayReasonEn: 'Holiday Reason (English)',
      holidayReasonAr: 'Holiday Reason (Arabic)',
      save: 'Save & Regenerate Slots',
      reset: 'Reset to Default',
      saving: 'Saving...',
      success: 'Configuration saved successfully!',
      error: 'An error occurred',
      confirmReset: 'Are you sure you want to reset this date to default working hours?',
      breakStart: 'Break Start',
      breakEnd: 'Break End',
      noBreaks: 'No break times configured',
      selectDatePrompt: 'Select a date from the calendar to configure working hours',
    },
    ar: {
      title: 'إعدادات ساعات العمل',
      selectDate: 'اختر تاريخاً للإعداد',
      availableDays: 'الأيام المتاحة',
      dateConfig: 'إعدادات التاريخ',
      startTime: 'وقت البداية',
      endTime: 'وقت النهاية',
      lastAppointment: 'آخر موعد',
      slotInterval: 'فاصل الموعد (دقائق)',
      breakTimes: 'أوقات الراحة',
      addBreak: 'إضافة فترة راحة',
      removeBreak: 'حذف',
      isHoliday: 'تحديد كعطلة',
      holidayReasonEn: 'سبب العطلة (إنجليزي)',
      holidayReasonAr: 'سبب العطلة (عربي)',
      save: 'حفظ وإعادة توليد المواعيد',
      reset: 'إعادة تعيين للافتراضي',
      saving: 'جاري الحفظ...',
      success: 'تم حفظ الإعدادات بنجاح!',
      error: 'حدث خطأ',
      confirmReset: 'هل أنت متأكد من إعادة تعيين هذا التاريخ لساعات العمل الافتراضية؟',
      breakStart: 'بداية الراحة',
      breakEnd: 'نهاية الراحة',
      noBreaks: 'لم يتم تكوين أوقات راحة',
      selectDatePrompt: 'اختر تاريخاً من التقويم لإعداد ساعات العمل',
    },
  }[language];

  useEffect(() => {
    generateAvailableDates();
  }, [maxDaysAhead]);

  useEffect(() => {
    if (selectedDate) {
      loadDayConfig(selectedDate);
    }
  }, [selectedDate]);

  const generateAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    for (let i = 0; i < maxDaysAhead; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    setAvailableDates(dates);
  };

  const loadDayConfig = async (date: Date) => {
    setLoading(true);
    try {
      const dateString = date.toISOString().split('T')[0];

      const { data: specificConfig } = await supabase
        .from('day_specific_hours')
        .select('*')
        .eq('date', dateString)
        .maybeSingle();

      if (specificConfig) {
        setDayConfig({
          date: dateString,
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
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
        const { data: defaultConfig } = await supabase
          .from('working_hours_config')
          .select('*')
          .eq('day_of_week', dayOfWeek)
          .single();

        if (defaultConfig) {
          setDayConfig({
            date: dateString,
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
      console.error('Error loading day config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!dayConfig || !selectedDate) return;

    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('day_specific_hours')
        .select('id')
        .eq('date', dayConfig.date)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('day_specific_hours')
          .update({
            start_time: dayConfig.start_time,
            end_time: dayConfig.end_time,
            last_appointment_time: dayConfig.last_appointment_time,
            slot_interval_minutes: dayConfig.slot_interval_minutes,
            break_times: dayConfig.break_times,
            is_holiday: dayConfig.is_holiday,
            holiday_reason_en: dayConfig.holiday_reason_en,
            holiday_reason_ar: dayConfig.holiday_reason_ar,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase.from('day_specific_hours').insert({
          date: dayConfig.date,
          start_time: dayConfig.start_time,
          end_time: dayConfig.end_time,
          last_appointment_time: dayConfig.last_appointment_time,
          slot_interval_minutes: dayConfig.slot_interval_minutes,
          break_times: dayConfig.break_times,
          is_holiday: dayConfig.is_holiday,
          holiday_reason_en: dayConfig.holiday_reason_en,
          holiday_reason_ar: dayConfig.holiday_reason_ar,
        });
      }

      const { data, error } = await supabase.rpc('regenerate_slots_for_date', {
        p_service_id: selectedServiceId,
        p_date: dayConfig.date,
      });

      if (error) throw error;

      alert(t.success);
      onUpdate();
    } catch (error) {
      console.error('Error saving config:', error);
      alert(t.error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedDate || !confirm(t.confirmReset)) return;

    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      await supabase.from('day_specific_hours').delete().eq('date', dateString);

      await supabase.rpc('regenerate_slots_for_date', {
        p_service_id: selectedServiceId,
        p_date: dateString,
      });

      alert(t.success);
      loadDayConfig(selectedDate);
      onUpdate();
    } catch (error) {
      console.error('Error resetting config:', error);
      alert(t.error);
    }
  };

  const addBreakTime = () => {
    if (!dayConfig) return;
    setDayConfig({
      ...dayConfig,
      break_times: [...dayConfig.break_times, { start: '12:00', end: '13:00' }],
    });
  };

  const removeBreakTime = (index: number) => {
    if (!dayConfig) return;
    setDayConfig({
      ...dayConfig,
      break_times: dayConfig.break_times.filter((_, i) => i !== index),
    });
  };

  const updateBreakTime = (index: number, field: 'start' | 'end', value: string) => {
    if (!dayConfig) return;
    const newBreakTimes = [...dayConfig.break_times];
    newBreakTimes[index][field] = value;
    setDayConfig({
      ...dayConfig,
      break_times: newBreakTimes,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 lg:border-r border-gray-200">
        <div className="p-3 lg:pr-4">
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            {t.availableDays}
          </h3>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {availableDates.map((date) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`w-full text-left p-2 text-sm rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900'
                  } ${isToday(date) ? 'ring-2 ring-green-500 ring-offset-1' : ''}`}
                >
                  <div className="font-medium">{formatDate(date)}</div>
                  {isToday(date) && (
                    <div className="text-[10px] text-green-600 mt-0.5">
                      {language === 'ar' ? 'اليوم' : 'Today'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        {loading ? (
          <div className="p-4 lg:pl-4 text-center">
            <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : selectedDate && dayConfig ? (
          <div className="p-4 lg:pl-4">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              {t.dateConfig}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={dayConfig.is_holiday}
                  onChange={(e) => setDayConfig({ ...dayConfig, is_holiday: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <label className="text-xs font-medium text-gray-900">{t.isHoliday}</label>
              </div>

              {dayConfig.is_holiday ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      {t.holidayReasonEn}
                    </label>
                    <input
                      type="text"
                      value={dayConfig.holiday_reason_en}
                      onChange={(e) =>
                        setDayConfig({ ...dayConfig, holiday_reason_en: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      {t.holidayReasonAr}
                    </label>
                    <input
                      type="text"
                      value={dayConfig.holiday_reason_ar}
                      onChange={(e) =>
                        setDayConfig({ ...dayConfig, holiday_reason_ar: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      dir="rtl"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        {t.startTime}
                      </label>
                      <input
                        type="time"
                        value={dayConfig.start_time.substring(0, 5)}
                        onChange={(e) =>
                          setDayConfig({ ...dayConfig, start_time: e.target.value + ':00' })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        {t.endTime}
                      </label>
                      <input
                        type="time"
                        value={dayConfig.end_time.substring(0, 5)}
                        onChange={(e) =>
                          setDayConfig({ ...dayConfig, end_time: e.target.value + ':00' })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        {t.lastAppointment}
                      </label>
                      <input
                        type="time"
                        value={dayConfig.last_appointment_time.substring(0, 5)}
                        onChange={(e) =>
                          setDayConfig({
                            ...dayConfig,
                            last_appointment_time: e.target.value + ':00',
                          })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        {t.slotInterval}
                      </label>
                      <input
                        type="number"
                        value={dayConfig.slot_interval_minutes}
                        onChange={(e) =>
                          setDayConfig({
                            ...dayConfig,
                            slot_interval_minutes: parseInt(e.target.value),
                          })
                        }
                        min="15"
                        max="60"
                        step="15"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        {t.addBreak}
                      </button>
                    </div>

                    {dayConfig.break_times.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                        <AlertCircle className="w-6 h-6 mx-auto mb-1.5 text-gray-400" />
                        <p className="text-xs">{t.noBreaks}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayConfig.break_times.map((breakTime, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg"
                          >
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-gray-600 mb-1">
                                  {t.breakStart}
                                </label>
                                <input
                                  type="time"
                                  value={breakTime.start}
                                  onChange={(e) => updateBreakTime(index, 'start', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-gray-600 mb-1">
                                  {t.breakEnd}
                                </label>
                                <input
                                  type="time"
                                  value={breakTime.end}
                                  onChange={(e) => updateBreakTime(index, 'end', e.target.value)}
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-xs"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => removeBreakTime(index)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t.removeBreak}
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

              <div className="flex gap-2 pt-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t.saving : t.save}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.reset}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 lg:pl-4 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">{t.selectDatePrompt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
