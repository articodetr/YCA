import { useState } from 'react';
import { Loader2, AlertCircle, Wallet, ArrowLeft } from 'lucide-react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

export interface ServiceFormPayload {
  table: 'translation_requests' | 'other_legal_requests' | 'wakala_applications';
  data: Record<string, unknown>;
}

interface ServiceCheckoutFormProps {
  amount: number;
  serviceLabel: string;
  formPayload: ServiceFormPayload;
  onSuccess: (id: string, bookingReference: string) => void;
  onBack: () => void;
}

export default function ServiceCheckoutForm({
  amount,
  serviceLabel,
  formPayload,
  onSuccess,
  onBack,
}: ServiceCheckoutFormProps) {
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
    saving: 'جاري حفظ الطلب...',
    payNow: 'ادفع الآن',
    backToForm: 'العودة للنموذج',
    paymentSuccess: 'تم الدفع بنجاح',
    savingRecord: 'جاري تسجيل طلبك...',
  } : {
    amount: 'Amount',
    paymentType: 'Payment Type',
    processing: 'Processing payment...',
    saving: 'Saving your request...',
    payNow: 'Pay Now',
    backToForm: 'Back to Form',
    paymentSuccess: 'Payment successful',
    savingRecord: 'Saving your request...',
  };

  const buildInsertPayload = (paymentIntentId: string) => {
    const base = { ...formPayload.data, payment_status: 'paid', status: 'submitted' };

    if (formPayload.table === 'wakala_applications') {
      delete base.payment_id;
      delete base.payment_intent_id;
    } else {
      base.payment_intent_id = paymentIntentId;
    }

    return base;
  };

  const createRecordViaFunction = async (paymentIntentId: string): Promise<{ id: string; booking_reference: string }> => {
    const insertData = buildInsertPayload(paymentIntentId);

    const { data: result, error: fnError } = await supabase.functions.invoke('create-service-request', {
      body: { table: formPayload.table, data: insertData },
    });

    if (fnError) throw new Error(fnError.message || 'Failed to save request');
    if (!result?.id) throw new Error('No record returned from service');
    return { id: result.id, booking_reference: result.booking_reference || '' };
  };

  const createRecordDirect = async (paymentIntentId: string): Promise<{ id: string; booking_reference: string }> => {
    const insertData = buildInsertPayload(paymentIntentId);

    const { data: record, error: dbError } = await supabase
      .from(formPayload.table)
      .insert(insertData)
      .select('id, booking_reference')
      .single();

    if (dbError) throw new Error(dbError.message || 'Failed to save request');
    if (!record) throw new Error('No record returned');
    return { id: record.id, booking_reference: record.booking_reference || '' };
  };

  const createRecord = async (paymentIntentId: string): Promise<{ id: string; booking_reference: string }> => {
    try {
      return await createRecordViaFunction(paymentIntentId);
    } catch (fnErr) {
      console.warn('Edge function unavailable, falling back to direct insert:', fnErr);
      return await createRecordDirect(paymentIntentId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) throw submitError;

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/member/dashboard` },
        redirect: 'if_required',
      });

      if (confirmError) throw confirmError;

      if (paymentIntent?.status === 'succeeded') {
        const record = await createRecord(paymentIntent.id);
        onSuccess(record.id, record.booking_reference);
      }
    } catch (err: unknown) {
      console.error('Payment/booking error:', err);
      const stripeErr = err as { message?: string; code?: string };
      const message = stripeErr?.message || (isRTL ? 'فشل الدفع. يرجى المحاولة مرة أخرى.' : 'Payment failed. Please try again.');
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">{t.paymentType}:</span>
          <span className="font-semibold text-gray-900">{serviceLabel}</span>
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

      <PaymentElement
        options={{
          layout: {
            type: 'accordion',
            defaultCollapsed: false,
            radios: true,
            spacedAccordionItems: true,
          },
        }}
      />

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
              <Wallet className="w-5 h-5" />
              {t.payNow}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
