import type Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { normalizePlan } from '@bruce/auth';
import { db, schema } from '@bruce/db';

const { organizations } = schema;
import { logger } from '@bruce/logger';
import { getStripe, requireStripe } from './client.js';

export function constructStripeWebhookEvent(
  rawBody: string,
  signature: string,
  secret: string,
): Stripe.Event {
  const stripe = requireStripe();
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

function customerIdFromStripe(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string | null {
  if (!customer) return null;
  if (typeof customer === 'string') return customer;
  return customer.id;
}

export async function processStripeWebhook(event: Stripe.Event): Promise<void> {
  const stripe = getStripe();
  if (!stripe) {
    logger.warn({}, 'processStripeWebhook called but STRIPE_SECRET_KEY is missing');
    return;
  }

  switch (event.type) {
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = customerIdFromStripe(invoice.customer);
      if (!customerId) {
        logger.warn({ invoice_id: invoice.id }, 'invoice.paid without customer');
        return;
      }

      const subRef = invoice.subscription;
      const subId =
        typeof subRef === 'string' ? subRef : subRef && typeof subRef === 'object' ? subRef.id : null;
      if (!subId) {
        logger.info({ invoice_id: invoice.id }, 'invoice.paid without subscription; skipping plan update');
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(subId);
      const plan = normalizePlan(subscription.metadata?.plan ?? 'pro');

      const updated = await db
        .update(organizations)
        .set({ plan, updated_at: new Date() })
        .where(eq(organizations.stripe_customer_id, customerId))
        .returning({ id: organizations.id });

      if (updated.length === 0) {
        logger.warn({ customer_id: customerId }, 'invoice.paid: no organization for Stripe customer');
        return;
      }

      logger.info(
        { account_id: updated[0]!.id, plan, invoice_id: invoice.id },
        'Organization plan updated from invoice.paid',
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = customerIdFromStripe(subscription.customer);
      if (!customerId) return;

      const updated = await db
        .update(organizations)
        .set({ plan: 'free', updated_at: new Date() })
        .where(eq(organizations.stripe_customer_id, customerId))
        .returning({ id: organizations.id });

      if (updated.length === 0) {
        logger.warn({ customer_id: customerId }, 'subscription.deleted: no organization found');
        return;
      }

      logger.info({ account_id: updated[0]!.id }, 'Organization downgraded to free (subscription deleted)');
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = customerIdFromStripe(invoice.customer);
      if (!customerId) return;

      const [org] = await db
        .select({ id: organizations.id, name: organizations.name })
        .from(organizations)
        .where(eq(organizations.stripe_customer_id, customerId))
        .limit(1);

      if (!org) {
        logger.warn({ customer_id: customerId }, 'payment_failed: no organization found');
        return;
      }

      logger.warn(
        {
          account_id: org.id,
          invoice_id: invoice.id,
          hosted_invoice_url: invoice.hosted_invoice_url,
        },
        'Stripe invoice payment failed — notify customer and consider grace period',
      );
      break;
    }

    default:
      logger.debug({ type: event.type }, 'Stripe webhook ignored');
  }
}
