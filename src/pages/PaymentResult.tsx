import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowLeft, Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const status = searchParams.get('status') || 'success';
  const type = searchParams.get('type') || '';
  const ref = searchParams.get('ref') || '';
  const redirectUrl = searchParams.get('redirect') || '/';

  const [showRedirect, setShowRedirect] = useState(false);

  const t = language === 'ar'
    ? {
        successTitle: 'تم الدفع بنجاح!',
        successMsg: 'شكرا لك. تمت معالجة عملية الدفع بنجاح.',
        failedTitle: 'فشل الدفع',
        failedMsg: 'لم يتم اكمال عملية الدفع. يرجى المحاولة مرة اخرى.',
        bookingRef: 'مرجع الحجز',
        donation: 'تبرع',
        membership: 'عضوية',
        wakala: 'وكالة',
        event: 'فعالية',
        backHome: 'العودة للرئيسية',
        tryAgain: 'المحاولة مرة اخرى',
        backToDashboard: 'العودة للوحة التحكم',
        redirecting: 'جاري التحويل...',
      }
    : {
        successTitle: 'Payment Successful!',
        successMsg: 'Thank you. Your payment has been processed successfully.',
        failedTitle: 'Payment Failed',
        failedMsg: 'Your payment could not be completed. Please try again.',
        bookingRef: 'Booking Reference',
        donation: 'Donation',
        membership: 'Membership',
        wakala: 'Wakala Service',
        event: 'Event Registration',
        backHome: 'Back to Home',
        tryAgain: 'Try Again',
        backToDashboard: 'Back to Dashboard',
        redirecting: 'Redirecting...',
      };

  const typeLabel =
    type === 'donation'
      ? t.donation
      : type === 'membership'
        ? t.membership
        : type === 'wakala'
          ? t.wakala
          : type === 'event'
            ? t.event
            : '';

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => setShowRedirect(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const isSuccess = status === 'success';

  return (
    <Layout>
      <div
        className="min-h-[70vh] flex items-center justify-center px-4 py-20"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            {isSuccess ? (
              <CheckCircle className="w-20 h-20 text-emerald-600 mx-auto mb-6" />
            ) : (
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            )}
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {isSuccess ? t.successTitle : t.failedTitle}
          </h1>

          <p className="text-gray-600 mb-6">
            {isSuccess ? t.successMsg : t.failedMsg}
          </p>

          {typeLabel && (
            <p className="text-sm text-gray-500 mb-2">{typeLabel}</p>
          )}

          {ref && isSuccess && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">{t.bookingRef}</p>
              <span className="text-xl font-mono font-bold text-emerald-700 tracking-wider">
                {ref}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-3 mt-6">
            {isSuccess ? (
              <>
                {showRedirect && (
                  <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.redirecting}
                  </p>
                )}
                <Link
                  to={redirectUrl}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  {redirectUrl.includes('dashboard')
                    ? t.backToDashboard
                    : t.backHome}
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => window.history.back()}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {t.tryAgain}
                </button>
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-medium py-2"
                >
                  <Home className="w-5 h-5" />
                  {t.backHome}
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
