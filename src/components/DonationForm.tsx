import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Mail, Phone, User, MessageSquare, Check, AlertCircle, Loader2, Heart } from 'lucide-react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';
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

export default function DonationForm() {
  const stripe = useStripe();
  const elements = useElements();

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardComplete, setCardComplete] = useState(false);

  const presetAmounts = [10, 25, 50, 100, 250];

  const handleAmountSelect = (amount: number) => {
    setFormData({ ...formData, amount, customAmount: amount.toString() });
  };

  const handleCustomAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData({ ...formData, customAmount: value, amount: numValue });
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

    if (!cardComplete) {
      newErrors.card = 'Please enter complete card details';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !stripe || !elements) {
      return;
    }

    setPaymentStatus({ status: 'processing', message: '' });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: formData.amount,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            donationType: formData.donationType,
            message: formData.message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.fullName,
              email: formData.email,
              phone: formData.phone,
            },
          },
        }
      );

      if (stripeError) {
        if (data.donationId) {
          await supabase
            .from('donations')
            .update({ payment_status: 'failed' })
            .eq('id', data.donationId);
        }
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent?.status === 'succeeded') {
        if (data.donationId) {
          await supabase
            .from('donations')
            .update({ payment_status: 'succeeded' })
            .eq('id', data.donationId);
        }

        setPaymentStatus({
          status: 'success',
          message: `Thank you for your £${formData.amount} donation!`,
        });

        setFormData({
          amount: 0,
          customAmount: '',
          donationType: 'one-time',
          fullName: '',
          email: '',
          phone: '',
          message: '',
        });

        cardElement.clear();
      }
    } catch (error) {
      setPaymentStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1a4d2e',
        '::placeholder': {
          color: '#666666',
        },
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
      invalid: {
        color: '#dc2626',
      },
    },
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
        <p className="text-muted">
          Your generous support helps us continue serving the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
                  £{amount}
                </motion.button>
              );
            })}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">
              £
            </span>
            <input
              type="number"
              placeholder="Enter custom amount"
              value={formData.customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:outline-none text-lg shadow-md hover:shadow-lg transition-all bg-white"
              min="1"
              step="0.01"
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
            <label className="block text-sm font-semibold text-primary mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
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
            <label className="block text-sm font-semibold text-primary mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
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
            <label className="block text-sm font-semibold text-primary mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
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
            <label className="block text-sm font-semibold text-primary mb-2">
              Message (Optional)
            </label>
            <div className="relative">
              <MessageSquare
                size={20}
                className="absolute left-3 top-4 text-muted"
              />
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

        <div>
          <label className="block text-sm font-semibold text-primary mb-3 flex items-center gap-2">
            <CreditCard size={20} />
            Card Details *
          </label>
          <div className="border-2 border-gray-200 rounded-2xl p-4 focus-within:border-teal-500 transition-colors shadow-md hover:shadow-lg bg-white">
            <CardElement
              options={cardElementOptions}
              onChange={(e) => setCardComplete(e.complete)}
            />
          </div>
          {errors.card && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.card}
            </p>
          )}
          <p className="text-xs text-muted mt-2">
            Test card: 4242 4242 4242 4242 | Any future expiry | Any 3-digit CVV
          </p>
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
          type="submit"
          disabled={paymentStatus.status === 'processing' || !stripe}
          className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-secondary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          whileHover={paymentStatus.status !== 'processing' ? { scale: 1.02 } : {}}
          whileTap={paymentStatus.status !== 'processing' ? { scale: 0.98 } : {}}
        >
          {paymentStatus.status === 'processing' ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Donate £{formData.amount > 0 ? formData.amount.toFixed(2) : '0.00'}
            </>
          )}
        </motion.button>

        <p className="text-xs text-center text-muted">
          Your payment is processed securely by Stripe. We never store your card details.
        </p>
      </form>
    </motion.div>
  );
}
