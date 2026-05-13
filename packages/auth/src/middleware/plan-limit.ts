import { createMiddleware } from 'hono/factory';
import { count, eq } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';
import { normalizePlan, PLAN_LIMITS, type PlanLimitKey } from '../plan-limits.js';
import { arePlanLimitsDisabled } from '../plan-flag.js';
import { getAuth } from './hono.js';

const { ventures, organizations } = schema;

export function enforcePlanLimits(limitKey: PlanLimitKey) {
  return createMiddleware(async (c, next) => {
    if (arePlanLimitsDisabled()) {
      await next();
      return;
    }

    const auth = getAuth(c);
    const accountId = auth.accountId;

    try {
      const { plan, current } = await withAccountContext(accountId, async (tx) => {
        const [org] = await tx
          .select({ plan: organizations.plan })
          .from(organizations)
          .where(eq(organizations.id, accountId))
          .limit(1);

        const tier = normalizePlan(org?.plan);

        if (limitKey === 'max_ventures') {
          const [row] = await tx
            .select({ c: count() })
            .from(ventures)
            .where(eq(ventures.account_id, accountId));
          return { plan: tier, current: Number(row?.c ?? 0) };
        }

        return { plan: tier, current: 0 };
      });

      const limit = PLAN_LIMITS[plan][limitKey];

      if (current >= limit) {
        logger.warn({ accountId, plan, limitKey, current, limit }, 'Plan limit exceeded');
        return c.json(
          {
            error: `Plan limit exceeded: ${limitKey}`,
            limit,
            current,
          },
          402
        );
      }

      await next();
      return;
    } catch (error) {
      logger.error({ error, accountId }, 'Plan limit check failed');
      return c.json({ error: 'Plan limit check failed' }, 500);
    }
  });
}
