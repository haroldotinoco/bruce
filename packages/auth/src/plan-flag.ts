import { logger } from '@bruce/logger';
import { PLAN_LIMITS, type PlanTier, type PlanLimitKey } from './plan-limits.js';

const TRUTHY = new Set(['1', 'true', 'yes', 'on']);
const FALSY = new Set(['0', 'false', 'no', 'off']);

let warned = false;

/**
 * Returns true when plan/quota enforcement should be bypassed platform-wide.
 *
 * Reads (in order):
 *  - `BRUCE_DISABLE_PLAN_LIMITS`   (canonical, truthy disables)
 *  - `ENABLE_BILLING`              (legacy, explicitly falsy disables)
 *
 * Useful for local dev, internal instances, and demos where you don't want
 * Free-tier caps (1 venture, 5 scans/mo, etc.) to get in the way.
 */
export function arePlanLimitsDisabled(): boolean {
  const explicit = (process.env.BRUCE_DISABLE_PLAN_LIMITS ?? '').trim().toLowerCase();
  if (TRUTHY.has(explicit)) return maybeWarn(true, 'BRUCE_DISABLE_PLAN_LIMITS');
  if (FALSY.has(explicit)) return false;

  const billing = (process.env.ENABLE_BILLING ?? '').trim().toLowerCase();
  if (FALSY.has(billing)) return maybeWarn(true, 'ENABLE_BILLING=false');

  return false;
}

function maybeWarn(disabled: boolean, source: string): boolean {
  if (disabled && !warned) {
    warned = true;
    logger.warn(
      { source },
      '⚠️  Plan limits disabled platform-wide — all accounts have unlimited ventures, scans and credits.'
    );
  }
  return disabled;
}

/**
 * Large but finite sentinel so JSON serialisation + dashboards keep working.
 * Picked so math (percentages, deltas) doesn't explode visually.
 */
export const UNLIMITED_SENTINEL = 1_000_000;

/**
 * Resolve the *effective* plan limits, honouring the global disable flag.
 * When limits are disabled, every key is set to `UNLIMITED_SENTINEL`.
 */
export function effectivePlanLimits(tier: PlanTier): Record<PlanLimitKey, number> {
  if (arePlanLimitsDisabled()) {
    return {
      max_ventures: UNLIMITED_SENTINEL,
      max_opportunities_per_month: UNLIMITED_SENTINEL,
      max_ai_credits_per_month: UNLIMITED_SENTINEL,
    };
  }
  return { ...PLAN_LIMITS[tier] };
}
