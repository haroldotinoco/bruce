import { Hono } from 'hono';
import { getStripe } from '@bruce/stripe-client';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';

export const adminRevenueRoutes = new Hono();

function isBruceAdmin(userId: string): boolean {
  const raw = process.env.BRUCE_ADMIN_USER_IDS ?? '';
  const ids = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return ids.includes(userId);
}

adminRevenueRoutes.get('/metrics', async (c) => {
  const { userId } = requireAuth(c);
  if (!isBruceAdmin(userId)) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const stripe = getStripe();
  if (!stripe) {
    return c.json({ error: 'Stripe not configured' }, 503);
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      status: 'active',
    });

    const invoices = await stripe.invoices.list({
      limit: 100,
      status: 'paid',
    });

    let mrrCents = 0;
    for (const sub of subscriptions.data) {
      const item = sub.items.data[0];
      const recurring = item?.price?.recurring;
      if (recurring && item.price?.unit_amount != null) {
        const monthly =
          recurring.interval === 'year'
            ? (item.price.unit_amount ?? 0) / 12
            : item.price.unit_amount ?? 0;
        mrrCents += monthly;
      }
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const cancelledSubs = await stripe.subscriptions.list({
      limit: 100,
      status: 'canceled',
      created: { gte: Math.floor(startOfMonth.getTime() / 1000) },
    });

    const active = subscriptions.data.length;
    const churnDenom = active + cancelledSubs.data.length;
    const monthly_churn_rate =
      churnDenom > 0 ? (cancelledSubs.data.length / churnDenom) * 100 : 0;

    return c.json({
      mrr: mrrCents / 100,
      mrr_cents: mrrCents,
      active_subscriptions: active,
      monthly_churn_rate,
      cancelled_this_month: cancelledSubs.data.length,
      recent_paid_invoices: invoices.data.length,
    });
  } catch (error) {
    logger.error({ err: error }, 'admin revenue metrics failed');
    return c.json({ error: 'Failed to load Stripe metrics' }, 500);
  }
});
