import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  Check,
  AlertCircle,
  Loader2,
  Heart,
  ArrowRight,
  ChevronLeft,
  Wallet,
} from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { fadeInUp, scaleIn } from '../lib/animations';

interface FormData {
  amount: number;
  customAmount: string;
  donationType: 'one-time' | 'monthly';
  fullName: string;
  email: string;
  phone: string;
  message: string;
}

interface PaymentStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string;
}

interface Props {
  onSuccess?: () => void;
}

function PaymentStep({
  formData,
  onSuccess,
  onBack,
  onError,
}: {
  formData: FormData;
  onSuccess: (message: string) => void;
  onBack: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-result?type=donation`,
          payment_method_data: {
            billing_details: {
              name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess(`Thank you for your £${formData.amount} donation!`);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">Choose Payment Method</h3>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Donation Amount</p>
          <p className="text-2xl font-bold text-primary">
            {'£'}
            {formData.amount.toFixed(2)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {formData.donationType === 'monthly' ? 'Monthly' : 'One-time'}
          </p>
          <p className="text-sm font-medium text-gray-700">{formData.fullName}</p>
        </div>
      </div>

      <div className="rounded-xl border-2 border-gray-200 p-4 bg-white">
        <PaymentElement
          onChange={(e) => setPaymentReady(e.complete)}
          options={{
            layout: {
              type: 'accordion',
              defaultCollapsed: false,
              radios: true,
              spacedAccordionItems: true,
            },
          }}
        />
      </div>

      <motion.button
        type="submit"
        disabled={processing || !stripe || !paymentReady}
        className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-secondary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        whileHover={!processing ? { scale: 1.02 } : {}}
        whileTap={!processing ? { scale: 0.98 } : {}}
      >
        {processing ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Wallet size={20} />
            Donate {'£'}
            {formData.amount.toFixed(2)}
          </>
        )}
      </motion.button>

      <p className="text-xs text-center text-muted">
        Your payment is processed securely by Stripe. We never store your payment details.
      </p>
    </form>
  );
}

export default function DonationForm({ onSuccess }: Props = {}) {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [formData, setFormData] = useState<FormData>({
    amount: 0,
    customAmount: '',
    donationType: 'one-time',
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'idle',
    message: '',
  });

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creatingIntent, setCreatingIntent] = useState(false);

  const presetAmounts = [10, 25, 50, 100, 250];

  const handleAmountSelect = (amount: number) => {
    setFormData({ ...formData, amount, customAmount: amount.toString() });
  };

  const handleCustomAmountChange = (value: string) => {
    // We accept whole pounds only (no pence)
    if (value === '') {
      setFormData({ ...formData, customAmount: '', amount: 0 });
      return;
    }

    const numValue = parseFloat(value);
    if (!Number.isFinite(numValue)) {
      setFormData({ ...formData, customAmount: '', amount: 0 });
      return;
    }

    const pounds = Math.max(0, Math.round(numValue));
    setFormData({ ...formData, customAmount: String(pounds), amount: pounds });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Please select or enter a donation amount';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = async () => {
    if (!validateForm()) return;

    setCreatingIntent(true);
    setPaymentStatus({ status: 'idle', message: '' });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: formData.amount,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            donationType: formData.donationType, // one-time | monthly (as type only)
            message: formData.message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.clientSecret) {
        throw new Error(data.error || 'Failed to set up payment');
      }

      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch (error) {
      setPaymentStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = (message: string) => {
    setPaymentStatus({ status: 'success', message });
    setFormData({
      amount: 0,
      customAmount: '',
      donationType: 'one-time',
      fullName: '',
      email: '',
      phone: '',
      message: '',
    });
    setClientSecret(null);
    setStep('details');

    if (onSuccess) {
      setTimeout(() => onSuccess(), 2000);
    }
  };

  const handlePaymentError = (message: string) => {
    setPaymentStatus({ status: 'error', message });
  };

  if (paymentStatus.status === 'success') {
    return (
      <motion.div
        className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={scaleIn}
      >
        <div className="text-center">
          <motion.div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Check size={40} className="text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-primary mb-4">Donation Successful!</h2>
          <p className="text-lg text-muted mb-6">{paymentStatus.message}</p>
          <p className="text-secondary mb-8">
            A confirmation email has been sent to your email address. Your support makes a real
            difference in our community.
          </p>
          <motion.button
            onClick={() => setPaymentStatus({ status: 'idle', message: '' })}
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Make Another Donation
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (step === 'payment' && clientSecret && stripePromise) {
    return (
      <motion.div
        className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Elements
          key={clientSecret}
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#1a4d2e',
                borderRadius: '12px',
              },
            },
            loader: 'auto',
          }}
        >
          <PaymentStep
            formData={formData}
            onSuccess={handlePaymentSuccess}
            onBack={() => {
              setStep('details');
              setClientSecret(null);
            }}
            onError={handlePaymentError}
          />
        </Elements>

        <AnimatePresence>
          {paymentStatus.status === 'error' && (
            <motion.div
              className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Payment Failed</p>
                <p className="text-sm text-red-700">{paymentStatus.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      <div className="text-center mb-8">
        <motion.div
          className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Heart size={32} className="text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold text-primary mb-2">Make a Donation</h2>
        <p className="text-muted">Your generous support helps us continue serving the community</p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex gap-4 mb-4">
            <motion.button
              type="button"
              onClick={() => setFormData({ ...formData, donationType: 'one-time' })}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all ${
                formData.donationType === 'one-time'
                  ? 'bg-white text-primary shadow-lg border-2 border-emerald-500'
                  : 'bg-white text-muted shadow-md border-2 border-gray-200 hover:border-emerald-300'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Heart className="inline-block mr-2" size={20} />
              One-Time
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setFormData({ ...formData, donationType: 'monthly' })}
              className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all ${
                formData.donationType === 'monthly'
                  ? 'bg-white text-primary shadow-lg border-2 border-blue-500'
                  : 'bg-white text-muted shadow-md border-2 border-gray-200 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Heart className="inline-block mr-2" size={20} />
              Monthly
            </motion.button>
          </div>

          <div className="grid grid-cols-5 gap-3 mb-4">
            {presetAmounts.map((amount, index) => {
              const colors = [
                { bg: 'bg-white', text: 'text-primary', border: 'border-emerald-500', hover: 'hover:border-emerald-300' },
                { bg: 'bg-white', text: 'text-primary', border: 'border-blue-500', hover: 'hover:border-blue-300' },
                { bg: 'bg-white', text: 'text-primary', border: 'border-amber-500', hover: 'hover:border-amber-300' },
                { bg: 'bg-white', text: 'text-primary', border: 'border-rose-500', hover: 'hover:border-rose-300' },
                { bg: 'bg-white', text: 'text-primary', border: 'border-teal-500', hover: 'hover:border-teal-300' },
              ];
              const color = colors[index % colors.length];
              const isSelected = formData.amount === amount && formData.customAmount === amount.toString();

              return (
                <motion.button
                  key={amount}
                  type="button"
                  onClick={() => handleAmountSelect(amount)}
                  className={`py-4 px-4 rounded-2xl font-bold text-lg transition-all ${color.bg} ${
                    isSelected
                      ? `${color.text} shadow-xl border-2 ${color.border}`
                      : `text-muted shadow-lg border-2 border-gray-200 ${color.hover}`
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {'£'}
                  {amount}
                </motion.button>
              );
            })}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">
              {'£'}
            </span>
            <input
              type="number"
              placeholder="Enter custom amount"
              value={formData.customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none text-lg shadow-md hover:shadow-lg transition-all bg-white"
              min="1"
              step="1"
            />
          </div>

          {errors.amount && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <AlertCircle size={16} />
              {errors.amount}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Full Name *</label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none shadow-md hover:shadow-lg transition-all bg-white"
                placeholder="John Smith"
              />
            </div>
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Email Address *</label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none shadow-md hover:shadow-lg transition-all bg-white"
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Phone Number *</label>
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-amber-500 focus:outline-none shadow-md hover:shadow-lg transition-all bg-white"
                placeholder="07123 456789"
              />
            </div>
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-2">Message (Optional)</label>
            <div className="relative">
              <MessageSquare size={20} className="absolute left-3 top-4 text-muted" />
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-rose-500 focus:outline-none resize-none shadow-md hover:shadow-lg transition-all bg-white"
                placeholder="Add a message..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {paymentStatus.status === 'error' && (
            <motion.div
              className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Payment Failed</p>
                <p className="text-sm text-red-700">{paymentStatus.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={handleContinueToPayment}
          disabled={creatingIntent}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-secondary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          whileHover={!creatingIntent ? { scale: 1.02 } : {}}
          whileTap={!creatingIntent ? { scale: 0.98 } : {}}
        >
          {creatingIntent ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Setting up payment...
            </>
          ) : (
            <>
              Continue to Payment
              <ArrowRight size={20} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
