import { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';

const timeSlots = [
  '1:00 PM', '1:15 PM', '1:30 PM', '1:45 PM',
  '2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM',
  '3:00 PM', '3:15 PM', '5:00 PM', '5:15 PM'
];

export default function WakalaBooking() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceType: '',
    notes: ''
  });

  const translations = {
    en: {
      title: 'Book Wakala Appointment',
      subtitle: 'Select a date and time, then complete your application',
      selectDate: 'Select Date',
      selectTime: 'Select Time',
      availableTimes: 'Available Times for',
      personalInfo: 'Personal Information',
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      serviceType: 'Service Type',
      selectService: 'Select a service',
      services: {
        passport: 'Passport Renewal',
        visa: 'Visa Application',
        documents: 'Document Authentication',
        power: 'Power of Attorney',
        other: 'Other'
      },
      notes: 'Additional Notes (Optional)',
      submit: 'Book Appointment',
      success: 'Appointment Booked Successfully!',
      successMsg: 'We will contact you soon to confirm your appointment.',
      bookAnother: 'Book Another Appointment'
    },
    ar: {
      title: 'حجز موعد الوكالة',
      subtitle: 'اختر التاريخ والوقت، ثم أكمل المعلومات',
      selectDate: 'اختر التاريخ',
      selectTime: 'اختر الوقت',
      availableTimes: 'الأوقات المتاحة ليوم',
      personalInfo: 'المعلومات الشخصية',
      fullName: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      serviceType: 'نوع الخدمة',
      selectService: 'اختر نوع الخدمة',
      services: {
        passport: 'تجديد جواز السفر',
        visa: 'طلب تأشيرة',
        documents: 'توثيق المستندات',
        power: 'توكيل رسمي',
        other: 'أخرى'
      },
      notes: 'ملاحظات إضافية (اختياري)',
      submit: 'احجز الموعد',
      success: 'تم حجز الموعد بنجاح!',
      successMsg: 'سنتواصل معك قريباً لتأكيد الموعد.',
      bookAnother: 'احجز موعد آخر'
    }
  };

  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime && formData.fullName && formData.phone && formData.serviceType) {
      console.log('Booking:', { selectedDate, selectedTime, ...formData });
      setSubmitted(true);
    }
  };

  const resetForm = () => {
    setSelectedDate('');
    setSelectedTime('');
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      serviceType: '',
      notes: ''
    });
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{t.success}</h2>
              <p className="text-gray-600 mb-2">{t.successMsg}</p>
              <div className="bg-blue-50 rounded-xl p-6 my-6 text-left">
                <p className="text-sm text-gray-600 mb-2"><strong>{isRTL ? 'التاريخ:' : 'Date:'}</strong> {selectedDate}</p>
                <p className="text-sm text-gray-600 mb-2"><strong>{isRTL ? 'الوقت:' : 'Time:'}</strong> {selectedTime}</p>
                <p className="text-sm text-gray-600 mb-2"><strong>{isRTL ? 'الاسم:' : 'Name:'}</strong> {formData.fullName}</p>
                <p className="text-sm text-gray-600"><strong>{isRTL ? 'الهاتف:' : 'Phone:'}</strong> {formData.phone}</p>
              </div>
              <button
                onClick={resetForm}
                className="bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 transition-colors font-medium"
              >
                {t.bookAnother}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">{t.title}</h1>
            <p className="text-gray-600 text-lg">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8 space-y-8">
            {/* Date Selection */}
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Calendar className="w-5 h-5 text-teal-600" />
                {t.selectDate}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none text-lg"
                required
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <Clock className="w-5 h-5 text-teal-600" />
                  {t.availableTimes} {selectedDate}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 px-4 rounded-xl font-medium transition-all ${
                        selectedTime === time
                          ? 'bg-teal-600 text-white shadow-lg scale-105'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Information */}
            {selectedTime && (
              <div className="space-y-6 pt-6 border-t-2 border-gray-100">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <User className="w-5 h-5 text-teal-600" />
                  {t.personalInfo}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.fullName} *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.phone} *
                    </label>
                    <div className="relative">
                      <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.email}
                    </label>
                    <div className="relative">
                      <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.serviceType} *
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none"
                      required
                    >
                      <option value="">{t.selectService}</option>
                      <option value="passport">{t.services.passport}</option>
                      <option value="visa">{t.services.visa}</option>
                      <option value="documents">{t.services.documents}</option>
                      <option value="power">{t.services.power}</option>
                      <option value="other">{t.services.other}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {t.notes}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-600 text-white py-4 rounded-xl hover:bg-teal-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  {t.submit}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
