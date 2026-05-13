import { Hono } from 'hono';
import { constructStripeWebhookEvent, processStripeWebhook } from '@bruce/stripe-client';
import { logger } from '@bruce/logger';

export const stripeWebhookRoutes = new Hono();

stripeWebhookRoutes.post('/', async (c) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
  if (!secret) {
    logger.error({}, 'STRIPE_WEBHOOK_SECRET not configured');
    return c.json({ error: 'Webhook not configured' }, 503);
  }

  const rawBody = await c.req.text();
  const sig = c.req.header('stripe-signature');
  if (!sig) {
    return c.json({ error: 'Missing stripe-signature' }, 400);
  }

  try {
    const event = constructStripeWebhookEvent(rawBody, sig, secret);
    await processStripeWebhook(event);
  } catch (e) {
    logger.error({ err: e }, 'Stripe webhook verification or processing failed');
    return c.json({ error: 'Invalid webhook' }, 400);
  }

  return c.json({ received: true });
});
