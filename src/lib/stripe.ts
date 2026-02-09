import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('Stripe publishable key is not set. Payment functionality will not work.');
}

export const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;
