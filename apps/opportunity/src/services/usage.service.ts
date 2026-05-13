import { and, count, eq, gte } from 'drizzle-orm';
import { arePlanLimitsDisabled, effectivePlanLimits, normalizePlan, PLAN_LIMITS } from '@bruce/auth';
import { schema, withAccountContext } from '@bruce/db';

const { scans, organizations } = schema;

function startOfUtcMonth(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

export async function countScansThisMonth(accountId: string): Promise<number> {
  return await withAccountContext(accountId, async (tx) => {
    const [row] = await tx
      .select({ c: count() })
      .from(scans)
      .where(and(eq(scans.account_id, accountId), gte(scans.created_at, startOfUtcMonth())));
    return Number(row?.c ?? 0);
  });
}

export async function getPlanTier(accountId: string): Promise<keyof typeof PLAN_LIMITS> {
  return await withAccountContext(accountId, async (tx) => {
    const [org] = await tx
      .select({ plan: organizations.plan })
      .from(organizations)
      .where(eq(organizations.id, accountId))
      .limit(1);
    return normalizePlan(org?.plan);
  });
}

export async function assertScanQuota(accountId: string): Promise<void> {
  if (arePlanLimitsDisabled()) return;
  const tier = await getPlanTier(accountId);
  const limit = PLAN_LIMITS[tier].max_opportunities_per_month;
  const used = await countScansThisMonth(accountId);
  if (used >= limit) {
    throw new Error(`Plan limit exceeded: max_opportunities_per_month (${used}/${limit})`);
  }
}

/**
 * Effective plan limits for display in `/usage`. Honours the global
 * `BRUCE_DISABLE_PLAN_LIMITS` / `ENABLE_BILLING` flag so the dashboard can
 * show "Unlimited" when enforcement is off.
 */
export function getEffectiveLimitsForUsage(tier: keyof typeof PLAN_LIMITS) {
  return effectivePlanLimits(tier);
}
