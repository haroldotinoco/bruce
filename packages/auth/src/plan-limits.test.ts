import { describe, expect, it } from 'vitest';
import { PLAN_LIMITS, normalizePlan } from './plan-limits.js';

describe('PLAN_LIMITS', () => {
  it('free plan has lower limits than pro', () => {
    const free = PLAN_LIMITS.free;
    const pro = PLAN_LIMITS.pro;

    expect(free.max_ventures).toBeLessThan(pro.max_ventures);
    expect(free.max_opportunities_per_month).toBeLessThan(pro.max_opportunities_per_month);
  });

  it('enterprise has high ceilings', () => {
    const enterprise = PLAN_LIMITS.enterprise;

    expect(enterprise.max_ventures).toBeGreaterThan(100);
    expect(enterprise.max_ai_credits_per_month).toBeGreaterThan(999000);
  });
});

describe('normalizePlan', () => {
  it('accepts known tiers', () => {
    expect(normalizePlan('pro')).toBe('pro');
    expect(normalizePlan('enterprise')).toBe('enterprise');
    expect(normalizePlan('free')).toBe('free');
  });

  it('defaults unknown values to free', () => {
    expect(normalizePlan('unknown')).toBe('free');
    expect(normalizePlan(null)).toBe('free');
  });
});
