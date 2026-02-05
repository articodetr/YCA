import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, FileText, Upload, X, AlertCircle, User, Calendar, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';

export default function WakalaApplication() {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    passportNumber: '',
    nationality: '',
    phone: '',
    email: user?.email || '',
    dateOfBirth: '',
    requestedDate: '',
    serviceType: '',
    specialRequests: '',
    passportCopies: [] as File[],
  });

  const translations = {
    en: {
      title: 'Wakala Service Application',
      subtitle: 'Book your Wakala service appointment',
      personalInfo: 'Personal Information',
      serviceDetails: 'Service Details',
      documents: 'Required Documents',
      fullName: 'Full Name',
      passportNumber: 'Passport Number',
      nationality: 'Nationality',
      phone: 'Phone Number',
      email: 'Email Address',
      dateOfBirth: 'Date of Birth',
      requestedDate: 'Requested Appointment Date',
      serviceType: 'Service Type',
      specialRequests: 'Special Requests (Optional)',
      passportCopies: 'Passport Copies',
      uploadInstructions: 'Upload clear copies of all passports (up to 5 files)',
      dragDrop: 'Drag and drop files here, or click to select',
      remove: 'Remove',
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
      pricingNote: 'Price will be calculated based on the number of days before your appointment (minimum 10 days required)',
      loginRequired: 'Please login or create a membership to apply for Wakala services',
      loginButton: 'Go to Login',
    },
    ar: {
      title: 'طلب خدمة وكالة',
      subtitle: 'احجز موعد خدمة الوكالة',
      personalInfo: 'المعلومات الشخصية',
      serviceDetails: 'تفاصيل الخدمة',
      documents: 'المستندات المطلوبة',
      fullName: 'الاسم الكامل',
      passportNumber: 'رقم جواز السفر',
      nationality: 'الجنسية',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      dateOfBirth: 'تاريخ الميلاد',
      requestedDate: 'تاريخ الموعد المطلوب',
      serviceType: 'نوع الخدمة',
      specialRequests: 'طلبات خاصة (اختياري)',
      passportCopies: 'صور جوازات السفر',
      uploadInstructions: 'قم بتحميل صور واضحة لجميع جوازات السفر (حتى 5 ملفات)',
      dragDrop: 'اسحب وأفلت الملفات هنا، أو انقر للاختيار',
      remove: 'إزالة',
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
      pricingNote: 'سيتم حساب السعر بناءً على عدد الأيام قبل موعدك (الحد الأدنى 10 أيام مطلوبة)',
      loginRequired: 'يرجى تسجيل الدخول أو إنشاء عضوية للتقدم بطلب خدمات الوكالة',
      loginButton: 'الذهاب لتسجيل الدخول',
    },
  };

  const t = translations[language];

  if (!user) {
    return (
      <Layout>
        <PageHeader title={t.title} subtitle={t.subtitle} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <AlertCircle className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.loginRequired}</h2>
          <button
            onClick={() => navigate('/member/login')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            {t.loginButton}
          </button>
        </div>
      </Layout>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.passportCopies.length + files.length > 5) {
      setError('Maximum 5 files allowed');
      return;
    }
    setFormData(prev => ({
      ...prev,
      passportCopies: [...prev.passportCopies, ...files],
    }));
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

  const calculatePrice = (requestedDate: string) => {
    const today = new Date();
    const appointmentDate = new Date(requestedDate);
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

    const appointmentDate = new Date(formData.requestedDate);
    const today = new Date();
    const daysUntilAppointment = Math.ceil((appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilAppointment < 5) {
      setError(language === 'ar' ? 'الحد الأدنى 5 أيام للحجز' : 'Minimum 5 days required for booking');
      return;
    }

    if (formData.passportCopies.length === 0) {
      setError(language === 'ar' ? 'يرجى تحميل صور جوازات السفر' : 'Please upload passport copies');
      return;
    }

    setLoading(true);
    setUploadingFiles(true);

    try {
      const price = calculatePrice(formData.requestedDate);

      const applicationData = {
        user_id: user.id,
        full_name: formData.fullName,
        passport_number: formData.passportNumber,
        nationality: formData.nationality,
        phone: formData.phone,
        email: formData.email,
        date_of_birth: formData.dateOfBirth,
        requested_date: formData.requestedDate,
        service_type: formData.serviceType,
        special_requests: formData.specialRequests,
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

  if (success) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center" dir={isRTL ? 'rtl' : 'ltr'}>
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
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
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">{t.pricingNote}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                {t.personalInfo}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.passportNumber} *
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.nationality} *
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.dateOfBirth} *
                  </label>
                  <div className="relative">
                    <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
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
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
                      required
                    />
                  </div>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {t.serviceDetails}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.requestedDate} *
                  </label>
                  <input
                    type="date"
                    name="requestedDate"
                    value={formData.requestedDate}
                    onChange={handleInputChange}
                    min={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select service type</option>
                    {Object.entries(t.serviceTypes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.specialRequests}
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t.documents}
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{t.uploadInstructions}</p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
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
                    <p className="text-gray-600">{t.dragDrop}</p>
                  </label>
                </div>

                {formData.passportCopies.length > 0 && (
                  <div className="space-y-2">
                    {formData.passportCopies.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingFiles}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </form>
        </div>
      </div>
    </Layout>
  );
}
