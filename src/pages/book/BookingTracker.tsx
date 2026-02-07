import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Loader2, AlertCircle, Calendar, Clock, CheckCircle,
  XCircle, Hourglass, ChevronLeft, FileText, Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';

const translations = {
  en: {
    title: 'Track Your Booking',
    subtitle: 'Enter your booking reference or email to check your appointment status',
    refLabel: 'Booking Reference',
    refPlaceholder: 'e.g. YCA-2025-0001',
    emailLabel: 'Or Email Address',
    emailPlaceholder: 'your@email.com',
    searchButton: 'Search',
    searching: 'Searching...',
    noResults: 'No bookings found',
    noResultsDesc: 'Please check your reference number or email and try again.',
    backToBook: 'Book an Appointment',
    status: 'Status',
    reference: 'Reference',
    service: 'Service',
    date: 'Date',
    time: 'Time',
    fee: 'Fee',
    free: 'Free',
    advisory: 'Advisory Bureau',
    wakala: 'Wakala Service',
    statuses: {
      submitted: 'Submitted',
      pending_payment: 'Pending Payment',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      approved: 'Approved',
      rejected: 'Rejected',
    } as Record<string, string>,
    yourBookings: 'Your Bookings',
    fillField: 'Please enter a reference number or email address',
  },
  ar: {
    title: 'تتبع حجزك',
    subtitle: 'أدخل الرقم المرجعي أو بريدك الإلكتروني للتحقق من حالة موعدك',
    refLabel: 'الرقم المرجعي',
    refPlaceholder: 'مثال: YCA-2025-0001',
    emailLabel: 'أو البريد الإلكتروني',
    emailPlaceholder: 'your@email.com',
    searchButton: 'بحث',
    searching: 'جاري البحث...',
    noResults: 'لم يتم العثور على حجوزات',
    noResultsDesc: 'يرجى التحقق من الرقم المرجعي أو البريد الإلكتروني والمحاولة مرة أخرى.',
    backToBook: 'حجز موعد',
    status: 'الحالة',
    reference: 'المرجع',
    service: 'الخدمة',
    date: 'التاريخ',
    time: 'الوقت',
    fee: 'الرسوم',
    free: 'مجاناً',
    advisory: 'المكتب الاستشاري',
    wakala: 'خدمة الوكالة',
    statuses: {
      submitted: 'مُقدّم',
      pending_payment: 'بانتظار الدفع',
      in_progress: 'قيد المعالجة',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      approved: 'تمت الموافقة',
      rejected: 'مرفوض',
    } as Record<string, string>,
    yourBookings: 'حجوزاتك',
    fillField: 'يرجى إدخال الرقم المرجعي أو البريد الإلكتروني',
  },
};

interface BookingRecord {
  id: string;
  booking_reference: string;
  full_name: string;
  email: string;
  service_type: string;
  booking_date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  fee_amount: number;
  created_at: string;
}

export default function BookingTracker() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = translations[language];

  const [refInput, setRefInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<BookingRecord[] | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!refInput.trim() && !emailInput.trim()) {
      setError(t.fillField);
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      let query = supabase
        .from('wakala_applications')
        .select('id, booking_reference, full_name, email, service_type, booking_date, start_time, end_time, status, fee_amount, created_at')
        .order('created_at', { ascending: false });

      if (refInput.trim()) {
        query = query.eq('booking_reference', refInput.trim().toUpperCase());
      } else if (emailInput.trim()) {
        query = query.eq('email', emailInput.trim().toLowerCase());
      }

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      setResults(data || []);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'submitted': case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_payment': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled': case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Hourglass className="w-4 h-4" />;
    }
  };

  const getServiceInfo = (serviceType: string) => {
    if (serviceType.startsWith('advisory')) {
      return { name: t.advisory, icon: Building2, color: 'emerald' };
    }
    return { name: t.wakala, icon: FileText, color: 'blue' };
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="relative bg-gradient-to-br from-[#1b2b45] via-[#1e3a5c] to-[#0f2439] py-14 sm:py-18">
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t.title}</h1>
            <p className="text-gray-300 max-w-xl mx-auto">{t.subtitle}</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 pb-16">
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.refLabel}</label>
                <input
                  type="text"
                  value={refInput}
                  onChange={e => { setRefInput(e.target.value); if (e.target.value) setEmailInput(''); }}
                  placeholder={t.refPlaceholder}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-sm text-gray-400">{t.emailLabel}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => { setEmailInput(e.target.value); if (e.target.value) setRefInput(''); }}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-6 py-3.5 bg-[#1b2b45] hover:bg-[#253d5e] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {t.searching}</> : <><Search className="w-5 h-5" /> {t.searchButton}</>}
            </button>
          </motion.form>

          <AnimatePresence>
            {results !== null && results.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8 text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t.noResults}</h3>
                <p className="text-gray-600 mb-6">{t.noResultsDesc}</p>
                <Link to="/book" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium">
                  {t.backToBook}
                </Link>
              </motion.div>
            )}

            {results !== null && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900">{t.yourBookings}</h3>
                {results.map((booking, idx) => {
                  const serviceInfo = getServiceInfo(booking.service_type);
                  const ServiceIcon = serviceInfo.icon;
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="bg-white rounded-xl shadow-md border border-gray-200 p-5"
                    >
                      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            serviceInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <ServiceIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{serviceInfo.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{booking.booking_reference}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusStyle(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {t.statuses[booking.status] || booking.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        {booking.booking_date && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(booking.booking_date)}
                          </div>
                        )}
                        {booking.start_time && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {formatTime(booking.start_time)}
                            {booking.end_time && ` - ${formatTime(booking.end_time)}`}
                          </div>
                        )}
                        <div className="text-gray-600">
                          <span className="text-gray-400 text-xs">{t.fee}: </span>
                          <span className="font-semibold">{booking.fee_amount === 0 ? t.free : `\u00A3${booking.fee_amount}`}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center">
            <Link to="/book" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ChevronLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              {t.backToBook}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
