import { requireStripe } from './client.js';

export async function createBillingPortalSession(params: {
  stripeCustomerId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = requireStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: params.stripeCustomerId,
    return_url: params.returnUrl,
  });
  if (!session.url) {
    throw new Error('Stripe Billing Portal session missing url');
  }
  return session.url;
}
