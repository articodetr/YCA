import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, User, Phone, Mail, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Layout from '../../components/Layout';
import Calendar from '../../components/booking/Calendar';
import TimeSlotGrid from '../../components/booking/TimeSlotGrid';

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
}

export default function WakalaApplication() {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [wakalaService, setWakalaService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [maxDaysAhead, setMaxDaysAhead] = useState(30);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: user?.email || '',
    serviceType: '',
    specialRequests: '',
  });

  const translations = {
    en: {
      title: 'Book Wakala Appointment',
      subtitle: 'Select a date, choose a time, and complete your booking',
      selectDate: 'Select Appointment Date',
      personalInfo: 'Your Information',
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      serviceType: 'Service Type',
      specialRequests: 'Special Requests (Optional)',
      submit: 'Submit Booking',
      submitting: 'Submitting...',
      successMessage: 'Booking submitted successfully!',
      redirecting: 'Redirecting to payment...',
      errorMessage: 'Failed to submit booking. Please try again.',
      serviceTypes: {
        passport_renewal: 'Passport Renewal',
        visa_application: 'Visa Application',
        document_authentication: 'Document Authentication',
        power_of_attorney: 'Power of Attorney',
        other: 'Other',
      },
      loginRequired: 'Please login or create a membership to apply for Wakala services',
      loginButton: 'Go to Login',
      selectDateTime: 'Please select date and time',
      fillAllFields: 'Please fill all required fields',
      selectServiceType: 'Select service type',
    },
    ar: {
      title: 'حجز موعد وكالة',
      subtitle: 'اختر التاريخ والوقت وأكمل حجزك',
      selectDate: 'اختر تاريخ الموعد',
      personalInfo: 'معلوماتك',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      serviceType: 'نوع الخدمة',
      specialRequests: 'طلبات خاصة (اختياري)',
      submit: 'إرسال الحجز',
      submitting: 'جاري الإرسال...',
      successMessage: 'تم إرسال الحجز بنجاح!',
      redirecting: 'جاري التحويل للدفع...',
      errorMessage: 'فشل إرسال الحجز. يرجى المحاولة مرة أخرى.',
      serviceTypes: {
        passport_renewal: 'تجديد جواز السفر',
        visa_application: 'طلب تأشيرة',
        document_authentication: 'توثيق المستندات',
        power_of_attorney: 'توكيل رسمي',
        other: 'أخرى',
      },
      loginRequired: 'يرجى تسجيل الدخول أو إنشاء عضوية للتقدم بطلب خدمات الوكالة',
      loginButton: 'الذهاب لتسجيل الدخول',
      selectDateTime: 'الرجاء اختيار التاريخ والوقت',
      fillAllFields: 'الرجاء تعبئة جميع الحقول المطلوبة',
      selectServiceType: 'اختر نوع الخدمة',
    },
  };

  const t = translations[language];

  useEffect(() => {
    loadWakalaService();
    loadSettings();
  }, []);

  useEffect(() => {
    if (wakalaService && selectedDate) {
      loadSlots();
    }
  }, [wakalaService, selectedDate]);

  const loadWakalaService = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_services')
        .select('*')
        .eq('name_en', 'Wakala Services')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (data) setWakalaService(data);
    } catch (error) {
      console.error('Error loading service:', error);
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
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadSlots = async () => {
    if (!wakalaService || !selectedDate) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('service_id', wakalaService.id)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const calculatePrice = (appointmentDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilAppointment = Math.ceil((appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const baseFee = 50;
    if (daysUntilAppointment >= 10) {
      return baseFee;
    } else if (daysUntilAppointment >= 7) {
      return baseFee * 1.5;
    } else if (daysUntilAppointment >= 5) {
      return baseFee * 2;
    } else {
      return baseFee * 3;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedDate || !selectedSlot) {
      setError(t.selectDateTime);
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.email || !formData.serviceType) {
      setError(t.fillAllFields);
      return;
    }

    if (!wakalaService) return;

    setLoading(true);

    try {
      const price = calculatePrice(selectedDate);
      const dateStr = selectedDate.toISOString().split('T')[0];

      const applicationData = {
        user_id: user?.id,
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        requested_date: dateStr,
        service_type: formData.serviceType,
        special_requests: formData.specialRequests,
        slot_id: selectedSlot.id,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        fee_amount: price,
        payment_status: 'pending',
      };

      const { data: application, error: appError } = await supabase
        .from('wakala_applications')
        .insert([applicationData])
        .select()
        .maybeSingle();

      if (appError) throw appError;

      await supabase
        .from('availability_slots')
        .update({ is_available: false })
        .eq('id', selectedSlot.id);

      setSuccess(true);
      setTimeout(() => {
        navigate(`/member/payment?wakala_id=${application.id}&amount=${price}`);
      }, 2000);
    } catch (err: any) {
      console.error('Application error:', err);
      setError(err.message || t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-2xl p-8 max-w-md shadow-lg" dir={isRTL ? 'rtl' : 'ltr'}>
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.loginRequired}</h2>
            <button
              onClick={() => navigate('/member/login')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {t.loginButton}
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
          <div className="text-center" dir={isRTL ? 'rtl' : 'ltr'}>
            <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.successMessage}</h2>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.redirecting}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-gray-600 text-lg">{t.subtitle}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
              maxDaysAhead={maxDaysAhead}
            />

            {selectedDate && (
              <TimeSlotGrid
                selectedDate={selectedDate}
                slots={slots}
                selectedSlot={selectedSlot}
                onSlotSelect={setSelectedSlot}
              />
            )}

            {selectedDate && selectedSlot && (
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <User className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">{t.personalInfo}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.fullName} *
                    </label>
                    <div className="relative">
                      <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.phone} *
                    </label>
                    <div className="relative">
                      <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.email} *
                    </label>
                    <div className="relative">
                      <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.serviceType} *
                    </label>
                    <div className="relative">
                      <FileText className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10`} />
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none`}
                        required
                      >
                        <option value="">{t.selectServiceType}</option>
                        {Object.entries(t.serviceTypes).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.specialRequests}
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t.submitting}
                      </>
                    ) : (
                      t.submit
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
