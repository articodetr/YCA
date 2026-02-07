import { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Coffee, AlertCircle, Loader2, Check, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

interface DayRow {
  id: string;
  day_of_week: number;
  day_name_en: string;
  day_name_ar: string;
  start_time: string;
  end_time: string;
  last_appointment_time: string;
  slot_interval_minutes: number;
  is_active: boolean;
}

interface DefaultHoursEditorProps {
  maxDaysAhead: number;
  onUpdate: () => void;
}

export default function DefaultHoursEditor({ maxDaysAhead, onUpdate }: DefaultHoursEditorProps) {
  const { language } = useLanguage();
  const [days, setDays] = useState<DayRow[]>([]);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);
  const [clearOverrides, setClearOverrides] = useState(false);

  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('14:30');
  const [lastAppointment, setLastAppointment] = useState('14:00');
  const [slotInterval, setSlotInterval] = useState(30);
  const [breakTimes, setBreakTimes] = useState<{ start: string; end: string }[]>([]);

  const t = {
    en: {
      selectDays: 'Select days to update',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      newSchedule: 'New Schedule',
      startTime: 'Start Time',
      endTime: 'End Time',
      lastAppointment: 'Last Appointment',
      slotInterval: 'Slot Interval (min)',
      breakTimes: 'Break Times',
      addBreak: 'Add Break',
      breakStart: 'Start',
      breakEnd: 'End',
      noBreaks: 'No break times configured',
      save: 'Save & Regenerate Slots',
      saving: 'Saving...',
      clearOverrides: 'Also clear date-specific overrides and regenerate all upcoming slots',
      clearOverridesHint: 'This will remove any custom hours set for individual dates in the booking period',
      selectAtLeastOne: 'Select at least one day to update',
      saved: 'Default hours updated successfully',
      error: 'An error occurred while saving',
      currentSchedule: 'Current default schedule',
      closed: 'Closed',
      breakOutOfRange: 'Break must be within working hours',
      lastAppointmentOutOfRange: 'Last appointment must be within working hours',
    },
    ar: {
      selectDays: 'اختر الأيام للتحديث',
      selectAll: 'تحديد الكل',
      deselectAll: 'إلغاء تحديد الكل',
      newSchedule: 'الجدول الجديد',
      startTime: 'وقت البداية',
      endTime: 'وقت النهاية',
      lastAppointment: 'آخر موعد',
      slotInterval: 'فاصل الموعد (دقائق)',
      breakTimes: 'أوقات الراحة',
      addBreak: 'إضافة راحة',
      breakStart: 'بداية',
      breakEnd: 'نهاية',
      noBreaks: 'لم يتم تكوين أوقات راحة',
      save: 'حفظ وإعادة توليد المواعيد',
      saving: 'جاري الحفظ...',
      clearOverrides: 'حذف الإعدادات المخصصة للتواريخ وإعادة توليد جميع المواعيد القادمة',
      clearOverridesHint: 'سيتم حذف أي ساعات مخصصة تم تعيينها لتواريخ فردية في فترة الحجز',
      selectAtLeastOne: 'اختر يوماً واحداً على الأقل للتحديث',
      saved: 'تم تحديث ساعات العمل الافتراضية بنجاح',
      error: 'حدث خطأ أثناء الحفظ',
      currentSchedule: 'الجدول الافتراضي الحالي',
      closed: 'مغلق',
      breakOutOfRange: 'يجب أن تكون الراحة ضمن ساعات العمل',
      lastAppointmentOutOfRange: 'يجب أن يكون آخر موعد ضمن ساعات العمل',
    },
  }[language];

  useEffect(() => {
    loadDays();
  }, []);

  const loadDays = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('working_hours_config')
        .select('*')
        .order('day_of_week');

      if (error) throw error;
      if (data) setDays(data);
    } catch (error) {
      console.error('Error loading days:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayOfWeek: number) => {
    const next = new Set(selectedDays);
    if (next.has(dayOfWeek)) {
      next.delete(dayOfWeek);
    } else {
      next.add(dayOfWeek);
    }
    setSelectedDays(next);
  };

  const selectAllDays = () => {
    setSelectedDays(new Set(days.map((d) => d.day_of_week)));
  };

  const deselectAllDays = () => {
    setSelectedDays(new Set());
  };

  const addBreak = () => {
    setBreakTimes([...breakTimes, { start: '12:00', end: '13:00' }]);
  };

  const removeBreak = (index: number) => {
    setBreakTimes(breakTimes.filter((_, i) => i !== index));
  };

  const updateBreak = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...breakTimes];
    updated[index][field] = value;
    setBreakTimes(updated);
  };

  const isLastAppointmentValid = lastAppointment >= startTime && lastAppointment <= endTime;

  const breakErrors = breakTimes.map((bt) =>
    bt.start < startTime || bt.end > endTime || bt.start >= bt.end
  );

  const hasValidationErrors = !isLastAppointmentValid || breakErrors.some(Boolean);

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    if (lastAppointment < value) setLastAppointment(value);
  };

  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
    if (lastAppointment > value) setLastAppointment(value);
  };

  const handleSave = async () => {
    if (selectedDays.size === 0) {
      setSaveResult({ success: false, message: t.selectAtLeastOne });
      return;
    }
    if (hasValidationErrors) {
      setSaveResult({
        success: false,
        message: !isLastAppointmentValid ? t.lastAppointmentOutOfRange : t.breakOutOfRange,
      });
      return;
    }

    setSaving(true);
    setSaveResult(null);

    try {
      for (const dayOfWeek of selectedDays) {
        const { error } = await supabase
          .from('working_hours_config')
          .update({
            start_time: startTime + ':00',
            end_time: endTime + ':00',
            last_appointment_time: lastAppointment + ':00',
            slot_interval_minutes: slotInterval,
            updated_at: new Date().toISOString(),
          })
          .eq('day_of_week', dayOfWeek);

        if (error) throw error;
      }

      if (clearOverrides) {
        const todayStr = new Date().toISOString().split('T')[0];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + maxDaysAhead);
        const futureDateStr = futureDate.toISOString().split('T')[0];

        await supabase
          .from('day_specific_hours')
          .delete()
          .gte('date', todayStr)
          .lte('date', futureDateStr);
      }

      const todayStr = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + maxDaysAhead);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const { data: services } = await supabase
        .from('booking_services')
        .select('id')
        .eq('is_active', true);

      const current = new Date();
      current.setHours(0, 0, 0, 0);
      const end = new Date(futureDateStr);

      while (current <= end) {
        const jsDay = current.getDay();
        const dbDay = jsDay === 0 ? 7 : jsDay;

        if (selectedDays.has(dbDay) || clearOverrides) {
          const dateStr = current.toISOString().split('T')[0];
          for (const service of services || []) {
            await supabase.rpc('regenerate_slots_for_date', {
              p_service_id: service.id,
              p_date: dateStr,
            });
          }
        }
        current.setDate(current.getDate() + 1);
      }

      setSaveResult({ success: true, message: t.saved });
      loadDays();
      onUpdate();
      setTimeout(() => setSaveResult(null), 4000);
    } catch (error) {
      console.error('Error saving default hours:', error);
      setSaveResult({ success: false, message: t.error });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">{t.selectDays}</h4>
          <div className="flex gap-2">
            <button
              onClick={selectAllDays}
              className="text-[11px] text-teal-600 hover:text-teal-800 font-medium"
            >
              {t.selectAll}
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={deselectAllDays}
              className="text-[11px] text-gray-500 hover:text-gray-700 font-medium"
            >
              {t.deselectAll}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {days.map((day) => {
            const isSelected = selectedDays.has(day.day_of_week);
            const dayName = language === 'ar' ? day.day_name_ar : day.day_name_en;
            const timeDisplay = day.is_active
              ? `${day.start_time.substring(0, 5)} - ${day.end_time.substring(0, 5)}`
              : t.closed;

            return (
              <button
                key={day.day_of_week}
                onClick={() => toggleDay(day.day_of_week)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-teal-600' : 'border-2 border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-teal-900' : 'text-gray-700'}`}>
                    {dayName}
                  </span>
                </div>
                <span className={`text-xs ${day.is_active ? 'text-gray-500' : 'text-red-500'}`}>
                  {timeDisplay}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDays.size > 0 && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">{t.newSchedule}</h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">{t.startTime}</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">{t.endTime}</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">{t.lastAppointment}</label>
              <input
                type="time"
                value={lastAppointment}
                min={startTime}
                max={endTime}
                onChange={(e) => setLastAppointment(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  !isLastAppointmentValid ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {!isLastAppointmentValid && (
                <p className="text-[10px] text-red-600 mt-1">{t.lastAppointmentOutOfRange}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">{t.slotInterval}</label>
              <input
                type="number"
                value={slotInterval}
                onChange={(e) => setSlotInterval(parseInt(e.target.value) || 30)}
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
                onClick={addBreak}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs"
              >
                <Plus className="w-3 h-3" />
                {t.addBreak}
              </button>
            </div>

            {breakTimes.length === 0 ? (
              <div className="text-center py-3 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <AlertCircle className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <p className="text-xs">{t.noBreaks}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {breakTimes.map((bt, index) => {
                  const hasError = breakErrors[index];
                  return (
                    <div key={index} className={`flex items-center gap-2 p-2 rounded-lg border ${
                      hasError ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-gray-600 mb-1">{t.breakStart}</label>
                            <input
                              type="time"
                              value={bt.start}
                              min={startTime}
                              max={endTime}
                              onChange={(e) => updateBreak(index, 'start', e.target.value)}
                              className={`w-full px-2 py-1.5 border rounded focus:ring-2 focus:ring-teal-500 text-xs ${
                                hasError ? 'border-red-400' : 'border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-600 mb-1">{t.breakEnd}</label>
                            <input
                              type="time"
                              value={bt.end}
                              min={startTime}
                              max={endTime}
                              onChange={(e) => updateBreak(index, 'end', e.target.value)}
                              className={`w-full px-2 py-1.5 border rounded focus:ring-2 focus:ring-teal-500 text-xs ${
                                hasError ? 'border-red-400' : 'border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                        {hasError && (
                          <p className="text-[10px] text-red-600 mt-1">{t.breakOutOfRange}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeBreak(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={clearOverrides}
                onChange={(e) => setClearOverrides(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-teal-600 rounded focus:ring-teal-500"
              />
              <div>
                <span className="text-xs font-medium text-gray-900 block">{t.clearOverrides}</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">{t.clearOverridesHint}</span>
              </div>
            </label>
          </div>

          {saveResult && (
            <div className={`text-center text-xs font-medium py-2 rounded-lg ${
              saveResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {saveResult.message}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || hasValidationErrors}
            className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t.saving}</>
            ) : (
              <><Save className="w-4 h-4" /> {t.save}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
