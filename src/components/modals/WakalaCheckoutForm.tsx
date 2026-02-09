import { useState } from 'react';
import { Loader2, AlertCircle, CreditCard, ArrowLeft } from 'lucide-react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

export interface WakalaFormPayload {
  user_id: string | null;
  full_name: string;
  phone: string;
  email: string;
  service_type: string;
  special_requests: string;
  fee_amount: number;
  applicant_name: string;
  agent_name: string;
  wakala_type: string;
  wakala_format: string;
  membership_status: string;
  is_first_wakala: boolean;
  applicant_passport_url: string | null;
  attorney_passport_url: string | null;
  witness_passports_url: string | null;
  membership_number?: string;
  booking_date?: string;
  requested_date?: string;
  slot_id?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
}

interface WakalaCheckoutFormProps {
  amount: number;
  formPayload: WakalaFormPayload;
  onSuccess: (applicationId: string, bookingReference: string) => void;
  onBack: () => void;
}

export default function WakalaCheckoutForm({ amount, formPayload, onSuccess, onBack }: WakalaCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const t = language === 'ar' ? {
    amount: 'المبلغ',
    paymentType: 'نوع الدفع',
    processing: 'جاري معالجة الدفع...',
    payNow: 'ادفع الآن',
    wakalaService: 'خدمة الوكالة',
    backToForm: 'العودة للنموذج',
  } : {
    amount: 'Amount',
    paymentType: 'Payment Type',
    processing: 'Processing payment...',
    payNow: 'Pay Now',
    wakalaService: 'Wakala Service',
    backToForm: 'Back to Form',
  };

  const createApplication = async (): Promise<{ id: string; booking_reference: string }> => {
    const { data, error: dbError } = await supabase
      .from('wakala_applications')
      .insert([{
        ...formPayload,
        payment_status: 'paid',
        status: 'submitted',
      }])
      .select('id, booking_reference')
      .maybeSingle();

    if (dbError) throw dbError;
    return { id: data.id, booking_reference: data.booking_reference || '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) throw submitError;

      sessionStorage.setItem('pending_wakala_form_data', JSON.stringify(formPayload));

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/member/dashboard` },
        redirect: 'if_required',
      });

      if (confirmError) throw confirmError;

      if (paymentIntent?.status === 'succeeded') {
        sessionStorage.removeItem('pending_wakala_form_data');
        const app = await createApplication();
        onSuccess(app.id, app.booking_reference);
      }
    } catch (err: any) {
      setError(err.message || (isRTL ? 'فشل الدفع. يرجى المحاولة مرة أخرى.' : 'Payment failed. Please try again.'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">{t.paymentType}:</span>
          <span className="font-semibold text-gray-900">{t.wakalaService}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t.amount}:</span>
          <span className="font-bold text-2xl text-emerald-600">{'\u00A3'}{amount}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <PaymentElement />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          {t.backToForm}
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t.processing}
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              {t.payNow}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
