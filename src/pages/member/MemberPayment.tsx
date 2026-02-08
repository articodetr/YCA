import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { supabase } from '../../lib/supabase';
import { stripePromise } from '../../lib/stripe';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';

interface CheckoutFormProps {
  amount: number;
  type: string;
  applicationId: string | null;
  wakalaId: string | null;
}

function CheckoutForm({ amount, type, applicationId, wakalaId }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const { refreshMember } = useMemberAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const translations = {
    en: {
      amount: 'Amount',
      paymentType: 'Payment Type',
      processing: 'Processing payment...',
      pay: 'Pay Now',
      success: 'Payment successful!',
      redirecting: 'Redirecting to dashboard...',
      error: 'Payment failed. Please try again.',
      membership: 'Membership',
      wakala: 'Wakala Service',
    },
    ar: {
      amount: 'المبلغ',
      paymentType: 'نوع الدفع',
      processing: 'جاري معالجة الدفع...',
      pay: 'ادفع الآن',
      success: 'تم الدفع بنجاح!',
      redirecting: 'جاري التحويل للوحة التحكم...',
      error: 'فشل الدفع. يرجى المحاولة مرة أخرى.',
      membership: 'العضوية',
      wakala: 'خدمة الوكالة',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/member/dashboard`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent?.status === 'succeeded') {
        if (applicationId) {
          await supabase
            .from('membership_applications')
            .update({ payment_status: 'paid' })
            .eq('id', applicationId);
        }
        if (wakalaId) {
          await supabase
            .from('wakala_applications')
            .update({ payment_status: 'paid', status: 'submitted' })
            .eq('id', wakalaId);
        }

        await refreshMember();
      }

      setSuccess(true);
      setTimeout(async () => {
        await refreshMember();
        navigate('/member/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || t.error);
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h2>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t.redirecting}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">{t.paymentType}:</span>
          <span className="font-semibold text-gray-900">
            {type === 'membership' ? t.membership : t.wakala}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t.amount}:</span>
          <span className="font-bold text-2xl text-emerald-600">£{amount}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t.processing}
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {t.pay}
          </>
        )}
      </button>
    </form>
  );
}

export default function MemberPayment() {
  const [searchParams] = useSearchParams();
  const { user } = useMemberAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const amount = parseFloat(searchParams.get('amount') || '0');
  const applicationId = searchParams.get('application_id');
  const wakalaId = searchParams.get('wakala_id');
  const type = wakalaId ? 'wakala' : 'membership';

  const translations = {
    en: {
      title: 'Payment',
      subtitle: 'Complete your payment',
      loading: 'Setting up payment...',
      error: 'Failed to initialize payment. Please try again.',
      loginRequired: 'Please login to continue',
    },
    ar: {
      title: 'الدفع',
      subtitle: 'أكمل عملية الدفع',
      loading: 'جاري تجهيز الدفع...',
      error: 'فشل في تهيئة الدفع. يرجى المحاولة مرة أخرى.',
      loginRequired: 'يرجى تسجيل الدخول للمتابعة',
    },
  };

  const t = translations[language];
  const isRTL = language === 'ar';

  useEffect(() => {
    if (!user) {
      navigate('/member/login');
      return;
    }

    if (!amount || amount <= 0) {
      setError(language === 'ar' ? 'مبلغ غير صالح' : 'Invalid amount');
      setLoading(false);
      return;
    }

    createPaymentIntent();
  }, [user, amount]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency: 'gbp',
            metadata: {
              user_id: user?.id,
              application_id: applicationId,
              wakala_id: wakalaId,
              type,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      if (!data.clientSecret) {
        throw new Error('No client secret returned from server');
      }

      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error('Payment intent error:', err);
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">{t.loginRequired}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600">{t.loading}</p>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <p className="text-red-800 mb-4">{error}</p>
              <button
                onClick={() => navigate('/member/dashboard')}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {isRTL ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
              </button>
            </div>
          )}

          {clientSecret && !loading && !error && (
            <Elements
              key={clientSecret}
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#059669',
                  },
                },
              }}
            >
              <CheckoutForm amount={amount} type={type} applicationId={applicationId} wakalaId={wakalaId} />
            </Elements>
          )}
        </div>
      </div>
    </Layout>
  );
}
