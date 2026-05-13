import { describe, expect, it } from 'vitest';
import {
  isHandoffStrictValidationEnabled,
  normalizeOpportunityToVentureFields,
  validateOpportunityToVentureHandoff,
} from './validate.js';

describe('validateOpportunityToVentureHandoff', () => {
  it('accepts merged handoff after normalization', () => {
    const raw = {
      opportunity_id: 'opp-1',
      description: 'Problem text',
      target_segment: 'B2B',
      market_size_estimate: { tam: 12 },
      total_score: 77,
      screened_at: '2026-05-07T10:00:00Z',
    };
    const ok = validateOpportunityToVentureHandoff(raw as Record<string, unknown>);
    expect(ok.ok).toBe(true);
  });

  it('fills defaults for missing structural fields', () => {
    const n = normalizeOpportunityToVentureFields({
      opportunity_id: 'opp-2',
      problem_statement: 'x',
      market_segment: 'seg',
    } as Record<string, unknown>);
    expect(n.market_size_estimate).toMatchObject({ tam: 0 });
    expect(Array.isArray(n.key_insights)).toBe(true);
    expect(typeof n.screened_at).toBe('string');
  });

  it('rejects out-of-range scores and invalid key insights', () => {
    const result = validateOpportunityToVentureHandoff({
      opportunity_id: 'opp-3',
      problem_statement: 'x',
      market_segment: 'seg',
      market_size_estimate: { tam: 1000 },
      validation_score: 101,
      key_insights: [{ insight: 'ok', confidence_score: 120 }],
      screened_at: '2026-05-07T10:00:00Z',
    });
    expect(result.ok).toBe(false);
  });
});

describe('isHandoffStrictValidationEnabled', () => {
  it('defaults to strict mode', () => {
    delete process.env.BRUCE_HANDOFF_VALIDATE_STRICT;
    expect(isHandoffStrictValidationEnabled()).toBe(true);
  });

  it('allows explicit opt-out', () => {
    process.env.BRUCE_HANDOFF_VALIDATE_STRICT = 'false';
    expect(isHandoffStrictValidationEnabled()).toBe(false);
    delete process.env.BRUCE_HANDOFF_VALIDATE_STRICT;
  });
});
