import { useState, useEffect } from 'react';
import { Calendar, Settings, List, Pencil, Check, X, AlertTriangle, Download } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import CalendarView from './CalendarView';
import WorkingHoursConfig from './WorkingHoursConfig';
import BookingsOverview from '../../components/admin/BookingsOverview';
import BookingsExportDialog from '../../components/admin/BookingsExportDialog';

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
}

type TabType = 'calendar' | 'config' | 'bookings';

export default function AvailabilityManagement() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [maxDaysAhead, setMaxDaysAhead] = useState(30);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);
  const [editingMaxDays, setEditingMaxDays] = useState(30);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [savingPeriod, setSavingPeriod] = useState(false);
  const [periodSuccess, setPeriodSuccess] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const t = {
    en: {
      title: 'Advisory Office - Availability',
      subtitle: 'Manage advisory office bookings calendar and working hours',
      calendarTab: 'Calendar',
      configTab: 'Working Hours',
      bookingsTab: 'Bookings List',
      maxDays: 'Booking Period',
      days: 'days ahead',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      confirmTitle: 'Confirm Booking Period Change',
      confirmMsg: 'Changing the booking period will affect how far ahead clients can book appointments.',
      confirmFrom: 'Current',
      confirmTo: 'New',
      confirmSave: 'Confirm & Save',
      confirmCancel: 'Cancel',
      saved: 'Saved successfully',
      export: 'Export',
    },
    ar: {
      title: 'المكتب الاستشاري - الأوقات المتاحة',
      subtitle: 'إدارة تقويم حجوزات المكتب الاستشاري وساعات العمل',
      calendarTab: 'التقويم',
      configTab: 'ساعات العمل',
      bookingsTab: 'قائمة الحجوزات',
      maxDays: 'فترة الحجز',
      days: 'يوم مسبقاً',
      edit: 'تعديل',
      save: 'حفظ',
      cancel: 'إلغاء',
      confirmTitle: 'تأكيد تغيير فترة الحجز',
      confirmMsg: 'تغيير فترة الحجز سيؤثر على مدى حجز المواعيد المتاح للعملاء.',
      confirmFrom: 'الحالي',
      confirmTo: 'الجديد',
      confirmSave: 'تأكيد وحفظ',
      confirmCancel: 'إلغاء',
      saved: 'تم الحفظ بنجاح',
      export: 'تصدير',
    },
  }[language];

  useEffect(() => {
    loadServices();
    loadSettings();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_services')
        .select('id, name_en, name_ar')
        .eq('is_active', true)
        .ilike('name_en', '%Advisory%');

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
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setMaxDaysAhead(data.max_booking_days_ahead);
        setEditingMaxDays(data.max_booking_days_ahead);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const startEditingPeriod = () => {
    setEditingMaxDays(maxDaysAhead);
    setIsEditingPeriod(true);
    setPeriodSuccess(false);
  };

  const cancelEditingPeriod = () => {
    setIsEditingPeriod(false);
    setEditingMaxDays(maxDaysAhead);
  };

  const requestSavePeriod = () => {
    if (editingMaxDays === maxDaysAhead) {
      setIsEditingPeriod(false);
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmSavePeriod = async () => {
    setSavingPeriod(true);
    try {
      const { error } = await supabase
        .from('booking_settings')
        .update({ max_booking_days_ahead: editingMaxDays, updated_at: new Date().toISOString() })
        .not('id', 'is', null);

      if (error) throw error;

      setMaxDaysAhead(editingMaxDays);
      setIsEditingPeriod(false);
      setShowConfirmDialog(false);
      setPeriodSuccess(true);
      handleUpdate();
      setTimeout(() => setPeriodSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving booking period:', error);
    } finally {
      setSavingPeriod(false);
    }
  };

  const tabs = [
    { id: 'calendar' as TabType, label: t.calendarTab, icon: Calendar },
    { id: 'config' as TabType, label: t.configTab, icon: Settings },
    { id: 'bookings' as TabType, label: t.bookingsTab, icon: List },
  ];

  const today = new Date().toISOString().split('T')[0];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + maxDaysAhead);

  return (
    <div className="w-full">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
        <p className="text-gray-600 text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-gray-900">
              {selectedService
                ? (language === 'ar' ? selectedService.name_ar : selectedService.name_en)
                : '...'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{t.maxDays}:</span>
            {isEditingPeriod ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={editingMaxDays}
                  onChange={(e) => setEditingMaxDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="365"
                  className="w-16 px-2 py-1 text-xs font-medium border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-xs text-gray-500">{t.days}</span>
                <button
                  onClick={requestSavePeriod}
                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelEditingPeriod}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-xs text-gray-700">{maxDaysAhead} {t.days}</span>
                <button
                  onClick={startEditingPeriod}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {periodSuccess && (
                  <span className="text-xs text-green-600 font-medium animate-pulse">{t.saved}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{t.confirmTitle}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t.confirmMsg}</p>
            <div className="flex items-center gap-4 mb-5 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 text-center">
                <div className="text-[10px] text-gray-500 mb-1">{t.confirmFrom}</div>
                <div className="text-lg font-bold text-gray-400 line-through">{maxDaysAhead}</div>
              </div>
              <div className="text-gray-300 text-lg">→</div>
              <div className="flex-1 text-center">
                <div className="text-[10px] text-gray-500 mb-1">{t.confirmTo}</div>
                <div className="text-lg font-bold text-blue-600">{editingMaxDays}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmSavePeriod}
                disabled={savingPeriod}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {savingPeriod
                  ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                  : t.confirmSave}
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                {t.confirmCancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportDialog && selectedService && (
        <BookingsExportDialog
          serviceId={selectedService.id}
          onClose={() => setShowExportDialog(false)}
        />
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
            <div className="ml-auto flex items-center px-2">
              <button
                onClick={() => setShowExportDialog(true)}
                disabled={!selectedService}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {t.export}
              </button>
            </div>
          </div>
        </div>

        <div className="p-3">
          {!selectedService ? (
            <div className="text-center py-6 text-sm text-gray-500">
              {language === 'ar' ? 'الرجاء اختيار خدمة' : 'Please select a service'}
            </div>
          ) : (
            <>
              {activeTab === 'calendar' && (
                <CalendarView key={refreshKey} selectedServiceId={selectedService.id} />
              )}
              {activeTab === 'config' && (
                <WorkingHoursConfig
                  maxDaysAhead={maxDaysAhead}
                  selectedServiceId={selectedService.id}
                  onUpdate={handleUpdate}
                />
              )}
              {activeTab === 'bookings' && (
                <BookingsOverview
                  serviceId={selectedService.id}
                  startDate={today}
                  endDate={endDate.toISOString().split('T')[0]}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
