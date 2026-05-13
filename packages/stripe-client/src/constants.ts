import type { PlanTier } from '@bruce/auth';

/**
 * Map Bruce plan tiers to Stripe product IDs (set in Stripe Dashboard + env).
 */
export function planToStripeProductId(tier: PlanTier): string | undefined {
  const envMap: Record<PlanTier, string | undefined> = {
    free: process.env.STRIPE_PRODUCT_FREE,
    pro: process.env.STRIPE_PRODUCT_PRO,
    enterprise: process.env.STRIPE_PRODUCT_ENTERPRISE,
  };
  return envMap[tier];
}

/** Default placeholders when env is unset (replace with real IDs in production). */
export const PLAN_TO_STRIPE_PRODUCT: Record<PlanTier, string> = {
  free: process.env.STRIPE_PRODUCT_FREE ?? 'prod_bruce_free',
  pro: process.env.STRIPE_PRODUCT_PRO ?? 'prod_bruce_pro',
  enterprise: process.env.STRIPE_PRODUCT_ENTERPRISE ?? 'prod_bruce_enterprise',
};

/** Meter `event_name` values — must match meters configured in Stripe Billing. */
export const BILLING_EVENTS = {
  opportunity_scan: 'opportunity_scans',
  gtm_campaign: 'gtm_campaigns',
  health_check: 'health_checks',
  ai_credit_used: 'ai_credits',
} as const;
