import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar as CalendarIcon, Clock, Loader2, Settings, RefreshCw, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { getWorkingHoursConfig, updateWorkingHours, generateSlotsForDateRange, type WorkingHoursConfig } from '../../lib/booking-utils';

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
}

interface TimeSlot {
  id?: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_blocked_by_admin: boolean;
}

export default function AvailabilityManagement() {
  const { language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxDaysAhead, setMaxDaysAhead] = useState(30);
  const [workingHours, setWorkingHours] = useState<WorkingHoursConfig[]>([]);
  const [showWorkingHours, setShowWorkingHours] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState(false);

  const [newSlot, setNewSlot] = useState({
    start_time: '',
    end_time: ''
  });

  const t = {
    en: {
      title: 'Availability Management',
      selectService: 'Select Service',
      selectDate: 'Select Date',
      maxDays: 'Maximum Days Ahead',
      currentSlots: 'Time Slots',
      addSlot: 'Add Time Slot',
      startTime: 'Start Time',
      endTime: 'End Time',
      add: 'Add',
      delete: 'Delete',
      noSlots: 'No time slots for this date',
      available: 'Available',
      blocked: 'Blocked',
      toggleBlock: 'Toggle Block',
      saveSettings: 'Save Settings',
      settingsSaved: 'Settings saved successfully!',
      slotAdded: 'Time slot added successfully!',
      slotDeleted: 'Time slot deleted successfully!',
      error: 'An error occurred'
    },
    ar: {
      title: 'إدارة الأوقات المتاحة',
      selectService: 'اختر الخدمة',
      selectDate: 'اختر التاريخ',
      maxDays: 'الحد الأقصى للأيام المسبقة',
      currentSlots: 'الأوقات المتاحة',
      addSlot: 'إضافة وقت',
      startTime: 'وقت البدء',
      endTime: 'وقت الانتهاء',
      add: 'إضافة',
      delete: 'حذف',
      noSlots: 'لا توجد أوقات لهذا التاريخ',
      available: 'متاح',
      blocked: 'محظور',
      toggleBlock: 'تبديل الحظر',
      saveSettings: 'حفظ الإعدادات',
      settingsSaved: 'تم حفظ الإعدادات بنجاح!',
      slotAdded: 'تمت إضافة الوقت بنجاح!',
      slotDeleted: 'تم حذف الوقت بنجاح!',
      error: 'حدث خطأ'
    }
  }[language];

  useEffect(() => {
    loadServices();
    loadSettings();
    loadWorkingHours();
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      loadSlots();
    }
  }, [selectedService, selectedDate]);

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

  const handleUpdateWorkingHours = async (dayOfWeek: number, field: string, value: any) => {
    const updatedHours = workingHours.map(wh =>
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
          is_active: wh.is_active
        });
      }
      alert(language === 'ar' ? 'تم حفظ ساعات العمل بنجاح!' : 'Working hours saved successfully!');
      loadWorkingHours();
    } catch (error) {
      console.error('Error saving working hours:', error);
      alert(t.error);
    }
  };

  const handleGenerateAutoSlots = async () => {
    if (!selectedService) {
      alert(language === 'ar' ? 'الرجاء اختيار خدمة' : 'Please select a service');
      return;
    }

    if (!confirm(language === 'ar'
      ? `هل تريد توليد الأوقات تلقائياً للأيام ${maxDaysAhead} القادمة؟`
      : `Generate slots automatically for the next ${maxDaysAhead} days?`)) {
      return;
    }

    setGeneratingSlots(true);
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + maxDaysAhead);

      const slotsCreated = await generateSlotsForDateRange(
        selectedService.id,
        today.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      alert(language === 'ar'
        ? `تم توليد ${slotsCreated} موعد بنجاح!`
        : `Successfully generated ${slotsCreated} slots!`);

      if (selectedDate) {
        loadSlots();
      }
    } catch (error) {
      console.error('Error generating slots:', error);
      alert(t.error);
    } finally {
      setGeneratingSlots(false);
    }
  };

  const loadSlots = async () => {
    if (!selectedService || !selectedDate) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('service_id', selectedService.id)
        .eq('date', selectedDate)
        .order('start_time');

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!selectedService || !selectedDate || !newSlot.start_time || !newSlot.end_time) {
      alert('Please fill all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('availability_slots')
        .insert({
          service_id: selectedService.id,
          date: selectedDate,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          is_available: true,
          is_blocked_by_admin: false
        });

      if (error) throw error;

      alert(t.slotAdded);
      setNewSlot({ start_time: '', end_time: '' });
      loadSlots();
    } catch (error) {
      console.error('Error adding slot:', error);
      alert(t.error);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      alert(t.slotDeleted);
      loadSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert(t.error);
    }
  };

  const handleToggleBlock = async (slot: TimeSlot) => {
    try {
      const { error } = await supabase
        .from('availability_slots')
        .update({ is_blocked_by_admin: !slot.is_blocked_by_admin })
        .eq('id', slot.id);

      if (error) throw error;
      loadSlots();
    } catch (error) {
      console.error('Error toggling block:', error);
      alert(t.error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from('booking_settings')
        .update({ max_booking_days_ahead: maxDaysAhead })
        .eq('id', (await supabase.from('booking_settings').select('id').single()).data?.id);

      if (error) throw error;
      alert(t.settingsSaved);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t.error);
    }
  };

  const generateTimeSlots = async () => {
    if (!selectedService || !selectedDate) return;

    const times = [];
    for (let hour = 9; hour < 17; hour++) {
      times.push({
        start_time: `${hour.toString().padStart(2, '0')}:00`,
        end_time: `${hour.toString().padStart(2, '0')}:30`
      });
      times.push({
        start_time: `${hour.toString().padStart(2, '0')}:30`,
        end_time: `${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }

    try {
      const slotsToInsert = times.map(time => ({
        service_id: selectedService.id,
        date: selectedDate,
        start_time: time.start_time,
        end_time: time.end_time,
        is_available: true,
        is_blocked_by_admin: false
      }));

      const { error } = await supabase
        .from('availability_slots')
        .insert(slotsToInsert);

      if (error) throw error;
      alert('Time slots generated successfully!');
      loadSlots();
    } catch (error) {
      console.error('Error generating slots:', error);
      alert(t.error);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.title}</h1>

        <div className="mb-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-teal-600" />
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'ar' ? 'إعدادات ساعات العمل' : 'Working Hours Configuration'}
              </h2>
            </div>
            <button
              onClick={() => setShowWorkingHours(!showWorkingHours)}
              className="px-4 py-2 bg-white text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium"
            >
              {showWorkingHours ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'عرض' : 'Show')}
            </button>
          </div>

          {showWorkingHours && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4">
                <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-semibold text-gray-600">
                  <div>{language === 'ar' ? 'اليوم' : 'Day'}</div>
                  <div>{language === 'ar' ? 'نشط' : 'Active'}</div>
                  <div>{language === 'ar' ? 'بداية' : 'Start'}</div>
                  <div>{language === 'ar' ? 'نهاية' : 'End'}</div>
                  <div>{language === 'ar' ? 'آخر موعد' : 'Last Apt'}</div>
                  <div>{language === 'ar' ? 'فاصل (دقيقة)' : 'Interval (min)'}</div>
                  <div></div>
                </div>

                {workingHours.map((wh) => (
                  <div key={wh.day_of_week} className="grid grid-cols-7 gap-2 items-center py-3 border-t border-gray-100">
                    <div className="font-medium text-gray-900">
                      {language === 'ar' ? wh.day_name_ar : wh.day_name_en}
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={wh.is_active}
                        onChange={(e) => handleUpdateWorkingHours(wh.day_of_week, 'is_active', e.target.checked)}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <input
                        type="time"
                        value={wh.start_time.substring(0, 5)}
                        onChange={(e) => handleUpdateWorkingHours(wh.day_of_week, 'start_time', e.target.value + ':00')}
                        disabled={!wh.is_active}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <input
                        type="time"
                        value={wh.end_time.substring(0, 5)}
                        onChange={(e) => handleUpdateWorkingHours(wh.day_of_week, 'end_time', e.target.value + ':00')}
                        disabled={!wh.is_active}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <input
                        type="time"
                        value={wh.last_appointment_time.substring(0, 5)}
                        onChange={(e) => handleUpdateWorkingHours(wh.day_of_week, 'last_appointment_time', e.target.value + ':00')}
                        disabled={!wh.is_active}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={wh.slot_interval_minutes}
                        onChange={(e) => handleUpdateWorkingHours(wh.day_of_week, 'slot_interval_minutes', parseInt(e.target.value))}
                        disabled={!wh.is_active}
                        min="15"
                        max="60"
                        step="15"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                      />
                    </div>
                    <div></div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveWorkingHours}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {language === 'ar' ? 'حفظ ساعات العمل' : 'Save Working Hours'}
                </button>
                <button
                  onClick={handleGenerateAutoSlots}
                  disabled={generatingSlots || !selectedService}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingSlots ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5" />
                  )}
                  {language === 'ar' ? 'توليد الأوقات تلقائياً' : 'Generate Slots Automatically'}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>{language === 'ar' ? 'ملاحظة:' : 'Note:'}</strong>{' '}
                  {language === 'ar'
                    ? 'بعد حفظ ساعات العمل، اضغط على "توليد الأوقات تلقائياً" لإنشاء جميع الأوقات المتاحة للأيام القادمة حسب الإعدادات.'
                    : 'After saving working hours, click "Generate Slots Automatically" to create all available time slots for upcoming days based on your settings.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectService}
                  </label>
                  <select
                    value={selectedService?.id || ''}
                    onChange={(e) => {
                      const service = services.find(s => s.id === e.target.value);
                      setSelectedService(service || null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  >
                    {services.map(service => (
                      <option key={service.id} value={service.id}>
                        {language === 'ar' ? service.name_ar : service.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectDate}
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={generateTimeSlots}
                disabled={!selectedService || !selectedDate}
                className="w-full mb-6 bg-teal-100 text-teal-700 py-2 rounded-lg hover:bg-teal-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Generate Default Slots (9AM - 5PM)
              </button>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.addSlot}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.startTime}
                  </label>
                  <input
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.endTime}
                  </label>
                  <input
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddSlot}
                    className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {t.add}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.currentSlots}</h3>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-center text-gray-400 py-12">{t.noSlots}</p>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                        slot.is_blocked_by_admin
                          ? 'bg-red-50 border-red-200'
                          : slot.is_available
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {slot.start_time} - {slot.end_time}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          slot.is_blocked_by_admin
                            ? 'bg-red-100 text-red-700'
                            : slot.is_available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {slot.is_blocked_by_admin ? t.blocked : slot.is_available ? t.available : 'Booked'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleBlock(slot)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        >
                          {t.toggleBlock}
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>

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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  {t.saveSettings}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}