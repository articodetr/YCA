import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, CheckCircle, Loader2, AlertCircle,
  CalendarClock, Shield, ArrowRight, LogOut,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { stripePromise } from '../../lib/stripe';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';

const MEMBERSHIP_PRICES: Record<string, number> = {
  individual: 20,
  family: 30,
  associate: 20,
  business_support: 0,
  organization: 50,
};

const translations = {
  en: {
    title: 'Renew Membership',
    subtitle: 'Your membership has expired. Renew to continue enjoying member benefits.',
    memberNumber: 'Member Number',
    membershipType: 'Membership Type',
    expiredOn: 'Expired On',
    renewalAmount: 'Renewal Amount',
    newExpiry: 'New Expiry Date',
    renewNow: 'Renew Now',
    processing: 'Processing payment...',
    success: 'Membership Renewed!',
    successMessage: 'Your membership has been renewed successfully.',
    goToDashboard: 'Go to Dashboard',
    paymentError: 'Payment failed. Please try again.',
    individual: 'Individual',
    family: 'Family',
    associate: 'Associate',
    business_support: 'Business Support',
    organization: 'Organization',
    perYear: '/year',
    logout: 'Sign Out',
    backToSite: 'Back to Site',
  },
  ar: {
    title: 'تجديد العضوية',
    subtitle: 'انتهت عضويتك. جدد عضويتك للاستمرار في الاستفادة من مزايا العضوية.',
    memberNumber: 'رقم العضوية',
    membershipType: 'نوع العضوية',
    expiredOn: 'انتهت في',
    renewalAmount: 'مبلغ التجديد',
    newExpiry: 'تاريخ الانتهاء الجديد',
    renewNow: 'جدد الآن',
    processing: 'جاري معالجة الدفع...',
    success: 'تم تجديد العضوية!',
    successMessage: 'تم تجديد عضويتك بنجاح.',
    goToDashboard: 'الذهاب إلى لوحة التحكم',
    paymentError: 'فشل الدفع. يرجى المحاولة مرة أخرى.',
    individual: 'فردي',
    family: 'عائلي',
    associate: 'منتسب',
    business_support: 'دعم الأعمال',
    organization: 'مؤسسة',
    perYear: '/سنة',
    logout: 'تسجيل الخروج',
    backToSite: 'العودة للموقع',
  },
};

function RenewalPaymentForm({ onSuccess, amount, t, isRTL }: {
  onSuccess: () => void;
  amount: number;
  t: typeof translations.en;
  isRTL: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || t.paymentError);
        setProcessing(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || t.paymentError);
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || t.paymentError);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t.processing}
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {t.renewNow} - {'\u00A3'}{amount}
          </>
        )}
      </button>
    </form>
  );
}

export default function MemberRenewal() {
  const { member, user, signOut, refreshMember } = useMemberAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  const t = translations[language];

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [renewed, setRenewed] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  if (!member || !user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      </Layout>
    );
  }

  const amount = member.membership_type === 'business_support'
    ? (member as any).custom_amount || 20
    : MEMBERSHIP_PRICES[member.membership_type] || 20;

  const newExpiryDate = `${new Date().getFullYear()}-12-31`;

  const typeLabels: Record<string, string> = {
    individual: t.individual,
    family: t.family,
    associate: t.associate,
    business_support: t.business_support,
    organization: t.organization,
  };

  const handleStartPayment = async () => {
    setLoadingPayment(true);
    setPaymentError('');

    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency: 'gbp',
            metadata: {
              type: 'membership_renewal',
              user_id: user.id,
              member_number: member.member_number,
              membership_type: member.membership_type,
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create payment');

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      setPaymentError(err.message || t.paymentError);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await supabase
        .from('members')
        .update({
          status: 'active',
          start_date: new Date().toISOString().split('T')[0],
          expiry_date: newExpiryDate,
        })
        .eq('id', member.id);

      await supabase.from('membership_renewals').insert({
        member_id: member.id,
        previous_expiry_date: member.expiry_date,
        new_expiry_date: newExpiryDate,
        payment_amount: amount,
        payment_date: new Date().toISOString(),
      });

      await refreshMember();
      setRenewed(true);
    } catch (err) {
      console.error('Error updating membership:', err);
      setRenewed(true);
    }
  };

  return (
    <Layout>
      <PageHeader title={t.title} description={t.subtitle} />

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <AnimatePresence mode="wait">
          {renewed ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.success}</h2>
                <p className="text-gray-600 mt-2">{t.successMessage}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-emerald-700">{t.memberNumber}</span>
                  <span className="text-sm font-bold text-emerald-900">{member.member_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-emerald-700">{t.newExpiry}</span>
                  <span className="text-sm font-bold text-emerald-900">
                    {new Date(newExpiryDate).toLocaleDateString(isRTL ? 'ar-GB' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/member/dashboard')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {t.goToDashboard}
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <CalendarClock className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-800">
                      {isRTL ? 'انتهت عضويتك' : 'Your Membership Has Expired'}
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      {isRTL
                        ? 'جدد عضويتك الآن للاستفادة من جميع المزايا.'
                        : 'Renew now to regain access to all member benefits.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-5">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-white/70" />
                    <div>
                      <p className="text-emerald-200 text-xs">{t.memberNumber}</p>
                      <p className="text-white font-bold text-lg tracking-wider">{member.member_number}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{t.membershipType}</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {typeLabels[member.membership_type] || member.membership_type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{t.expiredOn}</span>
                    <span className="text-sm font-semibold text-red-600">
                      {member.expiry_date
                        ? new Date(member.expiry_date).toLocaleDateString(isRTL ? 'ar-GB' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '-'}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">{t.renewalAmount}</span>
                    <span className="text-xl font-bold text-emerald-700">
                      {'\u00A3'}{amount}{t.perYear}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{t.newExpiry}</span>
                    <span className="text-sm font-semibold text-emerald-700">
                      {new Date(newExpiryDate).toLocaleDateString(isRTL ? 'ar-GB' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{paymentError}</p>
                </div>
              )}

              {!clientSecret ? (
                <button
                  onClick={handleStartPayment}
                  disabled={loadingPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.processing}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {t.renewNow} - {'\u00A3'}{amount}
                    </>
                  )}
                </button>
              ) : stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                  <RenewalPaymentForm
                    onSuccess={handlePaymentSuccess}
                    amount={amount}
                    t={t}
                    isRTL={isRTL}
                  />
                </Elements>
              ) : null}

              <div className="flex justify-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {t.backToSite}
                </button>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t.logout}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
