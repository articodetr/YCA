import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, FileText, Upload, X, AlertCircle, User, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Layout from '../../components/Layout';
import Calendar from '../../components/booking/Calendar';
import TimeSlotGrid from '../../components/booking/TimeSlotGrid';
import BookingSummaryCard from '../../components/booking/BookingSummaryCard';

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
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [wakalaService, setWakalaService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [maxDaysAhead, setMaxDaysAhead] = useState(30);

  const [formData, setFormData] = useState({
    fullName: '',
    passportNumber: '',
    nationality: '',
    phone: '',
    email: user?.email || '',
    dateOfBirth: '',
    serviceType: '',
    specialRequests: '',
    passportCopies: [] as File[],
  });

  const translations = {
    en: {
      title: 'Book Wakala Appointment',
      subtitle: 'Select a date and time, then complete your application',
      step1: 'Select Date & Time',
      step2: 'Personal Information',
      step3: 'Service Details',
      step4: 'Upload Documents',
      personalInfo: 'Personal Information',
      serviceDetails: 'Service Details',
      documents: 'Required Documents',
      fullName: 'Full Name',
      passportNumber: 'Passport Number',
      nationality: 'Nationality',
      phone: 'Phone Number',
      email: 'Email Address',
      dateOfBirth: 'Date of Birth',
      serviceType: 'Service Type',
      specialRequests: 'Special Requests (Optional)',
      passportCopies: 'Passport Copies',
      uploadInstructions: 'Upload clear copies of all passports (up to 5 files)',
      dragDrop: 'Drag and drop files here, or click to select',
      remove: 'Remove',
      back: 'Back',
      continue: 'Continue',
      submit: 'Submit Application',
      submitting: 'Submitting...',
      successMessage: 'Application submitted successfully!',
      redirecting: 'Redirecting to payment...',
      errorMessage: 'Failed to submit application. Please try again.',
      uploadError: 'Failed to upload files. Please try again.',
      serviceTypes: {
        passport_renewal: 'Passport Renewal',
        visa_application: 'Visa Application',
        document_authentication: 'Document Authentication',
        power_of_attorney: 'Power of Attorney',
        other: 'Other',
      },
      pricingNote: 'Price will be calculated based on the number of days before your appointment',
      minDaysWarning: 'Minimum 5 days required for booking',
      loginRequired: 'Please login or create a membership to apply for Wakala services',
      loginButton: 'Go to Login',
      selectDateTime: 'Please select date and time',
      fillAllFields: 'Please fill all required fields',
      uploadPassports: 'Please upload passport copies',
    },
    ar: {
      title: 'حجز موعد وكالة',
      subtitle: 'اختر التاريخ والوقت، ثم أكمل طلبك',
      step1: 'اختيار التاريخ والوقت',
      step2: 'المعلومات الشخصية',
      step3: 'تفاصيل الخدمة',
      step4: 'تحميل المستندات',
      personalInfo: 'المعلومات الشخصية',
      serviceDetails: 'تفاصيل الخدمة',
      documents: 'المستندات المطلوبة',
      fullName: 'الاسم الكامل',
      passportNumber: 'رقم جواز السفر',
      nationality: 'الجنسية',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      dateOfBirth: 'تاريخ الميلاد',
      serviceType: 'نوع الخدمة',
      specialRequests: 'طلبات خاصة (اختياري)',
      passportCopies: 'صور جوازات السفر',
      uploadInstructions: 'قم بتحميل صور واضحة لجميع جوازات السفر (حتى 5 ملفات)',
      dragDrop: 'اسحب وأفلت الملفات هنا، أو انقر للاختيار',
      remove: 'إزالة',
      back: 'رجوع',
      continue: 'متابعة',
      submit: 'إرسال الطلب',
      submitting: 'جاري الإرسال...',
      successMessage: 'تم إرسال الطلب بنجاح!',
      redirecting: 'جاري التحويل للدفع...',
      errorMessage: 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.',
      uploadError: 'فشل تحميل الملفات. يرجى المحاولة مرة أخرى.',
      serviceTypes: {
        passport_renewal: 'تجديد جواز السفر',
        visa_application: 'طلب تأشيرة',
        document_authentication: 'توثيق المستندات',
        power_of_attorney: 'توكيل رسمي',
        other: 'أخرى',
      },
      pricingNote: 'سيتم حساب السعر بناءً على عدد الأيام قبل موعدك',
      minDaysWarning: 'الحد الأدنى 5 أيام للحجز',
      loginRequired: 'يرجى تسجيل الدخول أو إنشاء عضوية للتقدم بطلب خدمات الوكالة',
      loginButton: 'الذهاب لتسجيل الدخول',
      selectDateTime: 'الرجاء اختيار التاريخ والوقت',
      fillAllFields: 'الرجاء تعبئة جميع الحقول المطلوبة',
      uploadPassports: 'الرجاء تحميل صور جوازات السفر',
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.passportCopies.length + files.length > 5) {
      setError(language === 'ar' ? 'الحد الأقصى 5 ملفات' : 'Maximum 5 files allowed');
      return;
    }
    setFormData(prev => ({
      ...prev,
      passportCopies: [...prev.passportCopies, ...files],
    }));
    setError('');
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      passportCopies: prev.passportCopies.filter((_, i) => i !== index),
    }));
  };

  const uploadFiles = async (applicationId: string) => {
    const uploadPromises = formData.passportCopies.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${applicationId}/${Date.now()}_${index}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('wakala-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      return fileName;
    });

    return await Promise.all(uploadPromises);
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

  const validateStep = (step: number): boolean => {
    setError('');

    if (step === 1) {
      if (!selectedDate || !selectedSlot) {
        setError(t.selectDateTime);
        return false;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntilAppointment = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilAppointment < 5) {
        setError(t.minDaysWarning);
        return false;
      }
    }

    if (step === 2) {
      if (!formData.fullName || !formData.passportNumber || !formData.nationality ||
          !formData.dateOfBirth || !formData.phone || !formData.email) {
        setError(t.fillAllFields);
        return false;
      }
    }

    if (step === 3) {
      if (!formData.serviceType) {
        setError(t.fillAllFields);
        return false;
      }
    }

    if (step === 4) {
      if (formData.passportCopies.length === 0) {
        setError(t.uploadPassports);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    if (!selectedDate || !selectedSlot || !wakalaService) return;

    setLoading(true);
    setUploadingFiles(true);

    try {
      const price = calculatePrice(selectedDate);
      const dateStr = selectedDate.toISOString().split('T')[0];

      const applicationData = {
        user_id: user?.id,
        full_name: formData.fullName,
        passport_number: formData.passportNumber,
        nationality: formData.nationality,
        phone: formData.phone,
        email: formData.email,
        date_of_birth: formData.dateOfBirth,
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

      const fileUrls = await uploadFiles(application.id);

      const { error: updateError } = await supabase
        .from('wakala_applications')
        .update({ passport_copies: fileUrls })
        .eq('id', application.id);

      if (updateError) throw updateError;

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
      setUploadingFiles(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center bg-gray-800 rounded-2xl p-8 max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">{t.loginRequired}</h2>
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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center" dir={isRTL ? 'rtl' : 'ltr'}>
            <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">{t.successMessage}</h2>
            <p className="text-gray-400 flex items-center justify-center gap-2">
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
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">{t.title}</h1>
            <p className="text-gray-400 text-lg">{t.subtitle}</p>
          </div>

          <div className="mb-8 bg-amber-900/30 border border-amber-700 rounded-lg p-4">
            <p className="text-sm text-amber-200">{t.pricingNote}</p>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && <div className={`w-12 h-1 ${currentStep > step ? 'bg-teal-600' : 'bg-gray-700'}`} />}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {currentStep === 1 && (
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
                  service={wakalaService}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  locationType="office"
                  onContinue={handleNext}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-teal-600" />
                  {t.personalInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.passportNumber} *
                    </label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.nationality} *
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.dateOfBirth} *
                    </label>
                    <div className="relative">
                      <CalendarIcon className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.phone} *
                    </label>
                    <div className="relative">
                      <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.email} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between gap-4">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    {t.continue}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <CalendarIcon className="w-6 h-6 text-teal-600" />
                  {t.serviceDetails}
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.serviceType} *
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                      required
                    >
                      <option value="">{language === 'ar' ? 'اختر نوع الخدمة' : 'Select service type'}</option>
                      {Object.entries(t.serviceTypes).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.specialRequests}
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between gap-4">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    {t.continue}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-2xl p-8">
                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-teal-600" />
                  {t.documents}
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">{t.uploadInstructions}</p>

                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-teal-600 transition-colors bg-gray-700/50">
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*,.pdf"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploadingFiles}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-300">{t.dragDrop}</p>
                    </label>
                  </div>

                  {formData.passportCopies.length > 0 && (
                    <div className="space-y-2">
                      {formData.passportCopies.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-300">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-between gap-4">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || uploadingFiles}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}