import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, User, Phone, Mail, FileText, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Layout from '../../components/Layout';
import Calendar from '../../components/booking/Calendar';
import TimeSlotGrid from '../../components/booking/TimeSlotGrid';
import BookingSummaryCard from '../../components/booking/BookingSummaryCard';
import HelpCard from '../../components/booking/HelpCard';

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
      title: 'Confirm Reservation',
      subtitle: 'Select a date, choose a time, and complete your booking',
      selectSlot: 'Select a Slot',
      backToDate: 'Back to Date Selection',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      personalInfo: 'Contact Details',
      contactDescription: 'Enter the details on which you want to receive checkup information.',
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
      agreeToTerms: 'I agree to the',
      termsOfService: 'Terms of Service',
    },
    ar: {
      title: 'تأكيد الحجز',
      subtitle: 'اختر التاريخ والوقت وأكمل حجزك',
      selectSlot: 'اختيار الموعد',
      backToDate: 'العودة لاختيار التاريخ',
      selectDate: 'اختر التاريخ',
      selectTime: 'اختر الوقت',
      personalInfo: 'تفاصيل الاتصال',
      contactDescription: 'أدخل التفاصيل التي تريد استلام معلومات الموعد عليها.',
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
      agreeToTerms: 'أوافق على',
      termsOfService: 'شروط الخدمة',
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

  const currentPrice = selectedDate ? calculatePrice(selectedDate) : 50;
  const isFormComplete = formData.fullName && formData.phone && formData.email && formData.serviceType;

  return (
    <Layout>
      <div
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
        style={{
          background: 'linear-gradient(to bottom, rgb(219, 234, 254), rgb(255, 255, 255))',
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              #{selectedSlot ? 'XXX' : '---'} • {t.title}
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 max-w-6xl mx-auto">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedSlot(null);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h3 className="text-xl font-bold text-gray-900">{t.selectSlot}</h3>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      {t.selectDate}
                      {selectedDate && (
                        <span className="text-gray-500 font-normal">
                          {' - '}
                          {new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', {
                            month: 'long',
                            year: 'numeric'
                          }).format(selectedDate)}
                        </span>
                      )}
                    </h4>
                    <Calendar
                      selectedDate={selectedDate}
                      onDateSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                      maxDaysAhead={maxDaysAhead}
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        {t.selectTime} - 08:00 AM - 07:00 PM
                      </h4>
                      <TimeSlotGrid
                        selectedDate={selectedDate}
                        slots={slots}
                        selectedSlot={selectedSlot}
                        onSlotSelect={setSelectedSlot}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start gap-3 mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{t.personalInfo}</h3>
                      <p className="text-sm text-gray-500 mt-1">{t.contactDescription}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.phone} *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="1234-567-890"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.email} *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@gmail.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.fullName} *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.serviceType} *
                      </label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        required
                      >
                        <option value="">{t.selectServiceType}</option>
                        {Object.entries(t.serviceTypes).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.specialRequests}
                      </label>
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      {t.agreeToTerms}{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        {t.termsOfService}
                      </a>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <BookingSummaryCard
                  serviceName={wakalaService ? (language === 'ar' ? wakalaService.name_ar : wakalaService.name_en) : 'Wakala Services'}
                  selectedDate={selectedDate}
                  selectedTime={selectedSlot}
                  totalPrice={currentPrice}
                  serviceType={formData.serviceType}
                  isFormComplete={!!isFormComplete}
                  onSubmit={handleSubmit}
                  isSubmitting={loading}
                />

                <HelpCard />
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
