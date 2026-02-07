import { useState, useEffect } from 'react';
import { Calendar, Settings, List } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
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
      title: 'Advisory Office - Availability',
      subtitle: 'Manage advisory office bookings calendar and working hours',
      calendarTab: 'Calendar',
      configTab: 'Working Hours',
      bookingsTab: 'Bookings List',
      maxDays: 'Booking Period',
      days: 'days ahead',
    },
    ar: {
      title: 'المكتب الاستشاري - الأوقات المتاحة',
      subtitle: 'إدارة تقويم حجوزات المكتب الاستشاري وساعات العمل',
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
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{t.maxDays}:</span>
              <span className="font-medium text-gray-700">{maxDaysAhead} {t.days}</span>
            </div>
          </div>
        </div>

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
