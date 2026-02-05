import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import Calendar from '../components/booking/Calendar';
import TimeSlotGrid from '../components/booking/TimeSlotGrid';
import BookingSummaryCard from '../components/booking/BookingSummaryCard';
import PageTransition from '../components/PageTransition';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  duration_minutes: number;
}

export default function Booking() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [locationType, setLocationType] = useState<'office' | 'online'>('office');
  const [maxDaysAhead, setMaxDaysAhead] = useState(30);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const t = {
    en: {
      title: 'Book an Appointment',
      subtitle: 'Select a date and time, then confirm your details.',
      selectService: 'Select Service',
      selectSlot: 'Select a Slot',
      contactDetails: 'Contact Details',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      notes: 'Additional Notes (Optional)',
      location: 'Appointment Location',
      office: 'Birmingham Office',
      online: 'Online',
      submit: 'Confirm Booking',
      success: 'Booking confirmed successfully!',
      error: 'Failed to create booking. Please try again.',
      back: 'Back'
    },
    ar: {
      title: 'حجز موعد',
      subtitle: 'اختر التاريخ والوقت، ثم أكد بياناتك.',
      selectService: 'اختر الخدمة',
      selectSlot: 'اختيار الموعد',
      contactDetails: 'بيانات الاتصال',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      notes: 'ملاحظات إضافية (اختياري)',
      location: 'موقع الموعد',
      office: 'مكتب برمنجهام',
      online: 'عبر الإنترنت',
      submit: 'تأكيد الحجز',
      success: 'تم تأكيد الحجز بنجاح!',
      error: 'فشل إنشاء الحجز. الرجاء المحاولة مرة أخرى.',
      back: 'رجوع'
    }
  }[language];

  useEffect(() => {
    loadServices();
    loadSettings();
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
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        setServices(data);
        setSelectedService(data[0]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
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

  const loadSlots = async () => {
    if (!selectedService || !selectedDate) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('service_id', selectedService.id)
        .eq('date', dateStr)
        .eq('is_available', true)
        .eq('is_blocked_by_admin', false);

      if (error) throw error;

      const formattedSlots: TimeSlot[] = (data || []).map(slot => ({
        id: slot.id,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isAvailable: slot.is_available
      }));

      setSlots(formattedSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
      setSlots([]);
    }
  };

  const handleContinue = () => {
    setShowContactForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedDate || !selectedSlot) return;

    setSubmitting(true);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const { error } = await supabase
        .from('bookings')
        .insert({
          service_id: selectedService.id,
          slot_id: selectedSlot.id,
          date: dateStr,
          start_time: selectedSlot.startTime,
          end_time: selectedSlot.endTime,
          client_name: formData.name,
          client_email: formData.email,
          client_phone: formData.phone,
          location_type: locationType,
          notes: formData.notes || null,
          status: 'pending'
        });

      if (error) throw error;

      await supabase
        .from('availability_slots')
        .update({ is_available: false })
        .eq('id', selectedSlot.id);

      alert(t.success);
      navigate('/');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(t.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (showContactForm) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowContactForm(false)}
              className="mb-6 text-white hover:text-teal-400 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {t.back}
            </button>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.contactDetails}</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.location}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setLocationType('office')}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        locationType === 'office'
                          ? 'bg-teal-50 border-teal-600 text-teal-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {t.office}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType('online')}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                        locationType === 'online'
                          ? 'bg-teal-50 border-teal-600 text-teal-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {t.online}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.notes}
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {language === 'ar' ? 'جاري التأكيد...' : 'Confirming...'}
                    </>
                  ) : (
                    t.submit
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">{t.title}</h1>
            <p className="text-gray-400 text-lg">{t.subtitle}</p>
          </div>

          <div className="mb-8">
            <label className="block text-white font-medium mb-3">{t.selectService}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setSelectedSlot(null);
                  }}
                  className={`p-4 rounded-xl border-2 font-medium transition-all ${
                    selectedService?.id === service.id
                      ? 'bg-teal-600 border-teal-400 text-white'
                      : 'bg-gray-800 border-gray-700 text-white hover:border-gray-600'
                  }`}
                >
                  {language === 'ar' ? service.name_ar : service.name_en}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedSlot(null);
                }}
                maxDaysAhead={maxDaysAhead}
              />

              <TimeSlotGrid
                selectedDate={selectedDate}
                slots={slots}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
              />
            </div>

            <div className="lg:col-span-1">
              <BookingSummaryCard
                service={selectedService}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                locationType={locationType}
                onContinue={handleContinue}
              />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}