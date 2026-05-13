import { Hono } from 'hono';
import { arePlanLimitsDisabled } from '@bruce/auth';
import { requireAuth } from '../middleware/auth-local.js';
import {
  countScansThisMonth,
  getEffectiveLimitsForUsage,
  getPlanTier,
} from '../services/usage.service.js';

export const usageRoutes = new Hono();

usageRoutes.get('/', async (c) => {
  const { accountId } = requireAuth(c);
  const tier = await getPlanTier(accountId);
  const used = await countScansThisMonth(accountId);
  const limits = getEffectiveLimitsForUsage(tier);
  const unlimited = arePlanLimitsDisabled();

  return c.json({
    plan: tier,
    unlimited,
    scans_this_month: used,
    scans_limit_month: limits.max_opportunities_per_month,
    max_ai_credits_per_month: limits.max_ai_credits_per_month,
  });
});
