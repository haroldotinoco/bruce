export type PlanTier = 'free' | 'pro' | 'enterprise';

export const PLAN_LIMITS: Record<
  PlanTier,
  {
    max_ventures: number;
    max_opportunities_per_month: number;
    max_ai_credits_per_month: number;
  }
> = {
  free: {
    max_ventures: 1,
    max_opportunities_per_month: 5,
    max_ai_credits_per_month: 100,
  },
  pro: {
    max_ventures: 10,
    max_opportunities_per_month: 100,
    max_ai_credits_per_month: 2000,
  },
  enterprise: {
    max_ventures: 999,
    max_opportunities_per_month: 9999,
    max_ai_credits_per_month: 999999,
  },
};

export type PlanLimitKey = keyof (typeof PLAN_LIMITS)['free'];

export function normalizePlan(plan: string | null | undefined): PlanTier {
  if (plan === 'pro' || plan === 'enterprise' || plan === 'free') {
    return plan;
  }
  return 'free';
}