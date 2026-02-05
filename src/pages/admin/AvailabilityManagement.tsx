import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import AvailabilityCalendar from '../../components/admin/AvailabilityCalendar';
import DayDetailsPanel from '../../components/admin/DayDetailsPanel';
import BookingsOverview from '../../components/admin/BookingsOverview';
import {
  getWorkingHoursConfig,
  updateWorkingHours,
  regenerateSlotsBulk,
  getAvailabilityStats,
  type WorkingHoursConfig,
  type AvailabilityStats,
} from '../../lib/booking-utils';

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
}

export default function AvailabilityManagement() {
  const { language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [maxDaysAhead, setMaxDaysAhead] = useState(30);
  const [workingHours, setWorkingHours] = useState<WorkingHoursConfig[]>([]);
  const [showWorkingHours, setShowWorkingHours] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availabilityStats, setAvailabilityStats] = useState<AvailabilityStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [regeneratingAll, setRegeneratingAll] = useState(false);

  const t = {
    en: {
      title: 'Availability Management',
      selectService: 'Select Service',
      maxDays: 'Maximum Days Ahead',
      workingHours: 'Working Hours Configuration',
      saveWorkingHours: 'Save Working Hours',
      regenerateAll: 'Regenerate All Days',
      regenerating: 'Regenerating...',
      show: 'Show',
      hide: 'Hide',
      day: 'Day',
      active: 'Active',
      start: 'Start',
      end: 'End',
      lastApt: 'Last Apt',
      interval: 'Interval (min)',
      saveAndRegenerate: 'Save & Regenerate',
      settingsSaved: 'Settings saved successfully!',
      note: 'Note:',
      noteText:
        'After updating working hours, click "Save & Regenerate" to apply changes to future dates. Existing bookings will be preserved.',
      confirmRegenerate:
        'This will regenerate all time slots for the next {{days}} days based on your working hours. Existing bookings will be preserved. Continue?',
      regenerateSuccess: 'Successfully regenerated {{created}} slots. {{preserved}} bookings preserved.',
      saveSettings: 'Save Settings',
    },
    ar: {
      title: 'إدارة الأوقات المتاحة',
      selectService: 'اختر الخدمة',
      maxDays: 'الحد الأقصى للأيام المسبقة',
      workingHours: 'إعدادات ساعات العمل',
      saveWorkingHours: 'حفظ ساعات العمل',
      regenerateAll: 'إعادة توليد جميع الأيام',
      regenerating: 'جاري إعادة التوليد...',
      show: 'عرض',
      hide: 'إخفاء',
      day: 'اليوم',
      active: 'نشط',
      start: 'بداية',
      end: 'نهاية',
      lastApt: 'آخر موعد',
      interval: 'فاصل (دقيقة)',
      saveAndRegenerate: 'حفظ وإعادة التوليد',
      settingsSaved: 'تم حفظ الإعدادات بنجاح!',
      note: 'ملاحظة:',
      noteText:
        'بعد تحديث ساعات العمل، اضغط على "حفظ وإعادة التوليد" لتطبيق التغييرات على التواريخ القادمة. سيتم الحفاظ على الحجوزات الموجودة.',
      confirmRegenerate:
        'سيتم إعادة توليد جميع الأوقات للأيام {{days}} القادمة بناءً على ساعات العمل. سيتم الحفاظ على الحجوزات الموجودة. هل تريد المتابعة؟',
      regenerateSuccess:
        'تم إعادة توليد {{created}} وقت بنجاح. تم الحفاظ على {{preserved}} حجز.',
      saveSettings: 'حفظ الإعدادات',
    },
  }[language];

  useEffect(() => {
    loadServices();
    loadSettings();
    loadWorkingHours();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadAvailabilityStats();
    }
  }, [selectedService, currentMonth, maxDaysAhead]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_services')
        .select('id, name_en, name_ar')
        .eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        setServices(data);
        setSelectedService(data[0]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_settings')
        .select('max_booking_days_ahead')
        .single();

      if (error) throw error;
      if (data) {
        setMaxDaysAhead(data.max_booking_days_ahead);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadWorkingHours = async () => {
    const hours = await getWorkingHoursConfig();
    setWorkingHours(hours);
  };

  const loadAvailabilityStats = async () => {
    if (!selectedService) return;

    setLoading(true);
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + maxDaysAhead);

      const stats = await getAvailabilityStats(
        selectedService.id,
        today.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      setAvailabilityStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkingHours = (dayOfWeek: number, field: string, value: any) => {
    const updatedHours = workingHours.map((wh) =>
      wh.day_of_week === dayOfWeek ? { ...wh, [field]: value } : wh
    );
    setWorkingHours(updatedHours);
  };

  const handleSaveWorkingHours = async () => {
    try {
      for (const wh of workingHours) {
        await updateWorkingHours(wh.day_of_week, {
          start_time: wh.start_time,
          end_time: wh.end_time,
          last_appointment_time: wh.last_appointment_time,
          slot_interval_minutes: wh.slot_interval_minutes,
          is_active: wh.is_active,
        });
      }
      alert(t.settingsSaved);
      await loadWorkingHours();
    } catch (error) {
      console.error('Error saving working hours:', error);
      alert(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleSaveAndRegenerate = async () => {
    if (!selectedService) return;

    const confirmMessage = t.confirmRegenerate.replace('{{days}}', maxDaysAhead.toString());
    if (!confirm(confirmMessage)) return;

    setRegeneratingAll(true);
    try {
      await handleSaveWorkingHours();

      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + maxDaysAhead);

      const result = await regenerateSlotsBulk(
        selectedService.id,
        today.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (result) {
        const message = t.regenerateSuccess
          .replace('{{created}}', result.total_slots_created.toString())
          .replace('{{preserved}}', result.total_slots_preserved.toString());
        alert(message);
        await loadAvailabilityStats();
      }
    } catch (error) {
      console.error('Error regenerating slots:', error);
      alert(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setRegeneratingAll(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('booking_settings')
        .select('id')
        .single();

      if (settings) {
        const { error } = await supabase
          .from('booking_settings')
          .update({ max_booking_days_ahead: maxDaysAhead })
          .eq('id', settings.id);

        if (error) throw error;
        alert(t.settingsSaved);
        await loadAvailabilityStats();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const getSelectedDateStats = () => {
    if (!selectedDate) return undefined;
    return availabilityStats.find((s) => s.date === selectedDate);
  };

  const today = new Date().toISOString().split('T')[0];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + maxDaysAhead);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">
            {language === 'ar'
              ? 'إدارة ساعات العمل والأوقات المتاحة والحجوزات'
              : 'Manage working hours, availability slots, and bookings'}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.selectService}
          </label>
          <select
            value={selectedService?.id || ''}
            onChange={(e) => {
              const service = services.find((s) => s.id === e.target.value);
              setSelectedService(service || null);
              setSelectedDate(null);
            }}
            className="max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {language === 'ar' ? service.name_ar : service.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">{t.workingHours}</h2>
                </div>
                <button
                  onClick={() => setShowWorkingHours(!showWorkingHours)}
                  className="px-3 py-1 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  {showWorkingHours ? t.hide : t.show}
                </button>
              </div>

              {showWorkingHours && (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-4">
                      {workingHours.map((wh) => (
                        <div
                          key={wh.day_of_week}
                          className="pb-4 border-b border-gray-200 last:border-0"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <input
                              type="checkbox"
                              checked={wh.is_active}
                              onChange={(e) =>
                                handleUpdateWorkingHours(
                                  wh.day_of_week,
                                  'is_active',
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="font-semibold text-gray-900">
                              {language === 'ar' ? wh.day_name_ar : wh.day_name_en}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600">{t.start}</label>
                                <input
                                  type="time"
                                  value={wh.start_time.substring(0, 5)}
                                  onChange={(e) =>
                                    handleUpdateWorkingHours(
                                      wh.day_of_week,
                                      'start_time',
                                      e.target.value + ':00'
                                    )
                                  }
                                  disabled={!wh.is_active}
                                  className="w-full mt-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">{t.end}</label>
                                <input
                                  type="time"
                                  value={wh.end_time.substring(0, 5)}
                                  onChange={(e) =>
                                    handleUpdateWorkingHours(
                                      wh.day_of_week,
                                      'end_time',
                                      e.target.value + ':00'
                                    )
                                  }
                                  disabled={!wh.is_active}
                                  className="w-full mt-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600">{t.lastApt}</label>
                                <input
                                  type="time"
                                  value={wh.last_appointment_time.substring(0, 5)}
                                  onChange={(e) =>
                                    handleUpdateWorkingHours(
                                      wh.day_of_week,
                                      'last_appointment_time',
                                      e.target.value + ':00'
                                    )
                                  }
                                  disabled={!wh.is_active}
                                  className="w-full mt-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">{t.interval}</label>
                                <input
                                  type="number"
                                  value={wh.slot_interval_minutes}
                                  onChange={(e) =>
                                    handleUpdateWorkingHours(
                                      wh.day_of_week,
                                      'slot_interval_minutes',
                                      parseInt(e.target.value)
                                    )
                                  }
                                  disabled={!wh.is_active}
                                  min="15"
                                  max="60"
                                  step="15"
                                  className="w-full mt-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleSaveWorkingHours}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {t.saveWorkingHours}
                    </button>
                    <button
                      onClick={handleSaveAndRegenerate}
                      disabled={regeneratingAll || !selectedService}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {regeneratingAll ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {regeneratingAll ? t.regenerating : t.saveAndRegenerate}
                    </button>
                  </div>

                  <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                    <p className="text-xs text-blue-900">
                      <strong>{t.note}</strong> {t.noteText}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'ar' ? 'الإعدادات' : 'Settings'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.maxDays}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={maxDaysAhead}
                    onChange={(e) => setMaxDaysAhead(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {t.saveSettings}
                </button>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-gray-600 mt-3">
                  {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </p>
              </div>
            ) : (
              <AvailabilityCalendar
                stats={availabilityStats}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
              />
            )}
          </div>

          <div className="xl:col-span-1 space-y-6">
            {selectedService && selectedDate ? (
              <DayDetailsPanel
                date={selectedDate}
                serviceId={selectedService.id}
                stats={getSelectedDateStats()}
                onClose={() => setSelectedDate(null)}
                onUpdate={loadAvailabilityStats}
              />
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-600">
                  {language === 'ar'
                    ? 'اختر تاريخاً من التقويم لعرض التفاصيل'
                    : 'Select a date from the calendar to view details'}
                </p>
              </div>
            )}

            {selectedService && (
              <BookingsOverview
                serviceId={selectedService.id}
                startDate={today}
                endDate={endDate.toISOString().split('T')[0]}
              />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
