import { eq } from 'drizzle-orm';
import { db, schema } from '@bruce/db';

const { organizations } = schema;
import { logger } from '@bruce/logger';
import { BILLING_EVENTS } from './constants.js';
import { getStripe } from './client.js';

async function getStripeCustomerId(accountId: string): Promise<string | null> {
  const [row] = await db
    .select({ stripe_customer_id: organizations.stripe_customer_id })
    .from(organizations)
    .where(eq(organizations.id, accountId))
    .limit(1);

  return row?.stripe_customer_id ?? null;
}

async function recordMeterEvent(
  stripeCustomerId: string,
  eventName: string,
  value: number,
  context: Record<string, unknown>,
): Promise<void> {
  const stripe = getStripe();
  if (!stripe) {
    logger.debug({ eventName }, 'Stripe not configured; skipping meter event');
    return;
  }

  try {
    await stripe.billing.meterEvents.create({
      event_name: eventName,
      payload: {
        stripe_customer_id: stripeCustomerId,
        value: String(value),
      },
      timestamp: Math.floor(Date.now() / 1000),
    });
    logger.info({ ...context, event_name: eventName }, 'Billing meter event recorded');
  } catch (e) {
    logger.warn({ err: e, eventName, ...context }, 'Billing meter event failed');
  }
}

export async function meterOpportunityScan(accountId: string, opportunityId: string): Promise<void> {
  const customerId = await getStripeCustomerId(accountId);
  if (!customerId) return;

  await recordMeterEvent(customerId, BILLING_EVENTS.opportunity_scan, 1, {
    account_id: accountId,
    opportunity_id: opportunityId,
  });
}

export async function meterGTMCampaign(accountId: string, campaignId: string): Promise<void> {
  const customerId = await getStripeCustomerId(accountId);
  if (!customerId) return;

  await recordMeterEvent(customerId, BILLING_EVENTS.gtm_campaign, 1, {
    account_id: accountId,
    campaign_id: campaignId,
  });
}

export async function meterHealthCheck(accountId: string, ventureId: string): Promise<void> {
  const customerId = await getStripeCustomerId(accountId);
  if (!customerId) return;

  await recordMeterEvent(customerId, BILLING_EVENTS.health_check, 1, {
    account_id: accountId,
    venture_id: ventureId,
  });
}

export async function meterAiCredits(accountId: string, credits: number): Promise<void> {
  const customerId = await getStripeCustomerId(accountId);
  if (!customerId) return;

  await recordMeterEvent(customerId, BILLING_EVENTS.ai_credit_used, credits, {
    account_id: accountId,
  });
}
