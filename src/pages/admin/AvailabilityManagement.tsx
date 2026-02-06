import { useState, useEffect } from 'react';
import { Calendar, Settings, List } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import CalendarView from './CalendarView';
import WorkingHoursConfig from './WorkingHoursConfig';
import BookingsOverview from '../../components/admin/BookingsOverview';

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

  const t = {
    en: {
      title: 'Availability Management',
      subtitle: 'Manage bookings calendar and working hours configuration',
      selectService: 'Select Service',
      calendarTab: 'Calendar',
      configTab: 'Working Hours',
      bookingsTab: 'Bookings List',
      maxDays: 'Booking Period',
      days: 'days ahead',
    },
    ar: {
      title: 'إدارة الأوقات المتاحة',
      subtitle: 'إدارة تقويم الحجوزات وإعدادات ساعات العمل',
      selectService: 'اختر الخدمة',
      calendarTab: 'التقويم',
      configTab: 'ساعات العمل',
      bookingsTab: 'قائمة الحجوزات',
      maxDays: 'فترة الحجز',
      days: 'يوم مسبقاً',
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

  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const tabs = [
    {
      id: 'calendar' as TabType,
      label: t.calendarTab,
      icon: Calendar,
    },
    {
      id: 'config' as TabType,
      label: t.configTab,
      icon: Settings,
    },
    {
      id: 'bookings' as TabType,
      label: t.bookingsTab,
      icon: List,
    },
  ];

  const today = new Date().toISOString().split('T')[0];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + maxDaysAhead);

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 text-sm mt-1">{t.subtitle}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {t.selectService}
              </label>
              <select
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const service = services.find((s) => s.id === e.target.value);
                  setSelectedService(service || null);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {language === 'ar' ? service.name_ar : service.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {t.maxDays}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={maxDaysAhead}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
                <span className="text-xs text-gray-600 whitespace-nowrap">{t.days}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
            </div>
          </div>

          <div className="p-4">
            {!selectedService ? (
              <div className="text-center py-8 text-sm text-gray-500">
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
    </AdminLayout>
  );
}
