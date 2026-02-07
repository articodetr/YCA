import { Link } from 'react-router-dom';
import { CheckCircle, Copy, Calendar, Clock, Mail, ArrowRight, Home, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { BookingResult } from './BookPage';

interface BookingConfirmationProps {
  result: BookingResult;
  onNewBooking: () => void;
}

const translations = {
  en: {
    title: 'Booking Confirmed!',
    subtitle: 'Your appointment has been successfully booked',
    referenceLabel: 'Booking Reference',
    copyRef: 'Copy',
    copied: 'Copied!',
    detailsTitle: 'Booking Details',
    service: 'Service',
    date: 'Date',
    time: 'Time',
    name: 'Name',
    email: 'Email',
    fee: 'Fee',
    free: 'Free',
    advisory: 'Advisory Bureau',
    wakala: 'Wakala Service',
    keepRef: 'Please save your reference number. You will need it to track your booking status.',
    emailSent: 'A confirmation will be sent to',
    trackBooking: 'Track Your Booking',
    newBooking: 'Book Another Appointment',
    goHome: 'Go to Homepage',
    memberCTA: 'Become a member and get your first wakala free!',
    joinNow: 'Join Now',
  },
  ar: {
    title: 'تم تأكيد الحجز!',
    subtitle: 'تم حجز موعدك بنجاح',
    referenceLabel: 'الرقم المرجعي',
    copyRef: 'نسخ',
    copied: 'تم النسخ!',
    detailsTitle: 'تفاصيل الحجز',
    service: 'الخدمة',
    date: 'التاريخ',
    time: 'الوقت',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    fee: 'الرسوم',
    free: 'مجاناً',
    advisory: 'المكتب الاستشاري',
    wakala: 'خدمة الوكالة',
    keepRef: 'يرجى حفظ الرقم المرجعي. ستحتاجه لتتبع حالة حجزك.',
    emailSent: 'سيتم إرسال التأكيد إلى',
    trackBooking: 'تتبع حجزك',
    newBooking: 'حجز موعد جديد',
    goHome: 'الصفحة الرئيسية',
    memberCTA: 'انضم كعضو واحصل على أول وكالة مجاناً!',
    joinNow: 'انضم الآن',
  },
};

export default function BookingConfirmation({ result, onNewBooking }: BookingConfirmationProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = translations[language];
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const serviceName = result.serviceType === 'advisory' ? t.advisory : t.wakala;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{t.title}</h1>
          <p className="text-lg text-gray-600">{t.subtitle}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-[#1b2b45] to-[#253d5e] p-6 text-center">
            <p className="text-sm text-gray-300 mb-2">{t.referenceLabel}</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-wider">
                {result.bookingReference}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title={t.copyRef}
              >
                <Copy className="w-5 h-5 text-white" />
              </button>
            </div>
            {copied && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-emerald-300 mt-2">
                {t.copied}
              </motion.p>
            )}
          </div>

          <div className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-lg mb-4">{t.detailsTitle}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">{t.service}</span>
                <span className="font-medium text-gray-900">{serviceName}</span>
              </div>
              {result.date && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm flex items-center gap-1.5"><Calendar className="w-4 h-4" />{t.date}</span>
                  <span className="font-medium text-gray-900">{formatDate(result.date)}</span>
                </div>
              )}
              {result.startTime && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm flex items-center gap-1.5"><Clock className="w-4 h-4" />{t.time}</span>
                  <span className="font-medium text-gray-900">{formatTime(result.startTime)} - {formatTime(result.endTime)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm">{t.name}</span>
                <span className="font-medium text-gray-900">{result.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 text-sm flex items-center gap-1.5"><Mail className="w-4 h-4" />{t.email}</span>
                <span className="font-medium text-gray-900">{result.email}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 text-sm">{t.fee}</span>
                <span className="font-bold text-emerald-600 text-lg">
                  {result.fee === 0 ? t.free : `\u00A3${result.fee}`}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
        >
          <p className="text-sm text-amber-800 font-medium">{t.keepRef}</p>
          <p className="text-sm text-amber-700 mt-1">{t.emailSent} <span className="font-semibold">{result.email}</span></p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link to="/book/track" className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1b2b45] hover:bg-[#253d5e] text-white rounded-xl transition-colors font-semibold">
            <Search className="w-5 h-5" />
            {t.trackBooking}
          </Link>
          <button onClick={onNewBooking} className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl transition-colors font-semibold">
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            {t.newBooking}
          </button>
          <Link to="/" className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl transition-colors font-semibold">
            <Home className="w-5 h-5" />
            {t.goHome}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
