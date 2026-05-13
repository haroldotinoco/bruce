import Stripe from 'stripe';

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  if (!client) {
    client = new Stripe(key, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }
  return client;
}

export function requireStripe(): Stripe {
  const s = getStripe();
  if (!s) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return s;
}
