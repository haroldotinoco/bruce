import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { createBillingPortalSession } from '@bruce/stripe-client';
import { db, schema } from '@bruce/db';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';

const { organizations } = schema;

export const billingRoutes = new Hono();

billingRoutes.post('/portal', async (c) => {
  const { accountId } = requireAuth(c);

  try {
    const [org] = await db
      .select({ stripe_customer_id: organizations.stripe_customer_id })
      .from(organizations)
      .where(eq(organizations.id, accountId))
      .limit(1);

    if (!org?.stripe_customer_id) {
      return c.json({ error: 'No billing account found' }, 404);
    }

    const base = process.env.APP_URL ?? 'http://localhost:3000';
    const returnUrl = `${base.replace(/\/$/, '')}/billing`;

    const url = await createBillingPortalSession({
      stripeCustomerId: org.stripe_customer_id,
      returnUrl,
    });

    return c.json({ url });
  } catch (error) {
    logger.error({ err: error, accountId }, 'Failed to create billing portal session');
    return c.json({ error: 'Failed to create portal session' }, 500);
  }
});
