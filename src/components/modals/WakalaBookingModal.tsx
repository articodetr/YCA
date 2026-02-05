import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, User, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Calendar from '../booking/Calendar';
import TimeSlotGrid from '../booking/TimeSlotGrid';
import BookingSummaryCard from '../booking/BookingSummaryCard';
import HelpCard from '../booking/HelpCard';

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

interface UserData {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  postcode?: string;
  city?: string;
}

interface WakalaBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: UserData | null;
  onSuccess?: () => void;
}

export default function WakalaBookingModal({ isOpen, onClose, userData, onSuccess }: WakalaBookingModalProps) {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
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
      title: 'New Wakala Booking',
      closeModal: 'Close',
      cancel: 'Cancel',
      selectSlot: 'Select Date & Time',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      personalInfo: 'Contact Details',
      contactDescription: 'Enter your contact information for this booking.',
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      serviceType: 'Service Type',
      specialRequests: 'Special Requests (Optional)',
      submit: 'Proceed to Payment',
      submitting: 'Processing...',
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
      selectDateTime: 'Please select date and time',
      fillAllFields: 'Please fill all required fields',
      selectServiceType: 'Select service type',
      agreeToTerms: 'I agree to the',
      termsOfService: 'Terms of Service',
      loadingData: 'Loading your information...',
      weekendError: 'We are closed on weekends. Please select a weekday.',
      closeConfirm: 'Are you sure you want to close? Your changes will be lost.',
    },
    ar: {
      title: 'حجز وكالة جديد',
      closeModal: 'إغلاق',
      cancel: 'إلغاء',
      selectSlot: 'اختيار التاريخ والوقت',
      selectDate: 'اختر التاريخ',
      selectTime: 'اختر الوقت',
      personalInfo: 'تفاصيل الاتصال',
      contactDescription: 'أدخل معلومات الاتصال الخاصة بك لهذا الحجز.',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      serviceType: 'نوع الخدمة',
      specialRequests: 'طلبات خاصة (اختياري)',
      submit: 'المتابعة للدفع',
      submitting: 'جاري المعالجة...',
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
      selectDateTime: 'الرجاء اختيار التاريخ والوقت',
      fillAllFields: 'الرجاء تعبئة جميع الحقول المطلوبة',
      selectServiceType: 'اختر نوع الخدمة',
      agreeToTerms: 'أوافق على',
      termsOfService: 'شروط الخدمة',
      loadingData: 'جاري تحميل معلوماتك...',
      weekendError: 'نحن مغلقون في عطلة نهاية الأسبوع. الرجاء اختيار يوم من أيام الأسبوع.',
      closeConfirm: 'هل تريد الإغلاق؟ سيتم فقدان التغييرات.',
    },
  };

  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      loadWakalaService();
      loadSettings();
      loadUserData();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      resetForm();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (wakalaService && selectedDate) {
      loadSlots();
    }
  }, [wakalaService, selectedDate]);

  const loadUserData = async () => {
    if (!user) return;

    setDataLoading(true);
    try {
      let fetchedData: UserData | null = null;

      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (memberData) {
        fetchedData = memberData;
      } else {
        const { data: appData, error: appError } = await supabase
          .from('membership_applications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (appData) {
          fetchedData = appData;
        }
      }

      if (fetchedData) {
        const fullName = fetchedData.full_name ||
          (fetchedData.first_name && fetchedData.last_name
            ? `${fetchedData.first_name} ${fetchedData.last_name}`
            : '');

        setFormData(prev => ({
          ...prev,
          fullName: fullName || prev.fullName,
          phone: fetchedData.phone || prev.phone,
          email: fetchedData.email || user.email || prev.email,
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setDataLoading(false);
    }
  };

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

    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setError(t.weekendError);
      setSlots([]);
      return;
    }

    setError('');

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
        onSuccess?.();
        navigate(`/member/payment?wakala_id=${application.id}&amount=${price}`);
      }, 2000);
    } catch (err: any) {
      console.error('Application error:', err);
      setError(err.message || t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    const hasData = formData.fullName || formData.phone || selectedDate || selectedSlot;
    if (hasData && !success) {
      if (window.confirm(t.closeConfirm)) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: user?.email || '',
      serviceType: '',
      specialRequests: '',
    });
    setSelectedDate(null);
    setSelectedSlot(null);
    setError('');
    setSuccess(false);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, formData, selectedDate, selectedSlot, success]);

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.successMessage}</h2>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.redirecting}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = selectedDate ? calculatePrice(selectedDate) : 50;
  const isFormComplete = formData.fullName && formData.phone && formData.email && formData.serviceType;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t.closeModal}
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {dataLoading && (
          <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
            <p className="text-sm text-blue-800">{t.loadingData}</p>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t.selectSlot}</h3>

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
                      {t.selectTime}
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

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-start gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{t.personalInfo}</h3>
                    <p className="text-sm text-gray-600 mt-1">{t.contactDescription}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={dataLoading}
                    />
                  </div>

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
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={dataLoading}
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
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={dataLoading}
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
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      required
                      disabled={dataLoading}
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
                      className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={dataLoading}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={dataLoading}
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

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
