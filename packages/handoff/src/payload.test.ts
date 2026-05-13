import { describe, expect, it } from 'vitest';
import { MissingVentureHandoffError, resolveOpportunityFromInterModulePayload } from './payload.js';

describe('resolveOpportunityFromInterModulePayload', () => {
  it('prefers venture_handoff over ranked row', () => {
    const payload = {
      venture_handoff: {
        opportunity_id: 'opp-1',
        title: 'Handoff title',
        problem_statement: 'Full problem',
        target_segment: 'SMB',
      },
      results: {
        ranked_opportunities: [
          {
            opportunity_id: 'opp-x',
            title: 'Thin rank',
            total_score: 99,
          },
        ],
      },
    };
    const out = resolveOpportunityFromInterModulePayload(payload);
    expect(out.opportunity_id).toBe('opp-1');
    expect(out.problem_statement).toBe('Full problem');
    expect(out.target_segment).toBe('SMB');
  });

  it('maps description and segment aliases when fallback is explicitly allowed', () => {
    const payload = {
      results: {
        ranked_opportunities: [
          {
            opportunity_id: 'opp-2',
            title: 'Alias test',
            description: 'From description',
            segment: 'Enterprise',
          },
        ],
      },
    };
    const out = resolveOpportunityFromInterModulePayload(payload, { allowFallback: true });
    expect(out.problem_statement).toBe('From description');
    expect(out.target_segment).toBe('Enterprise');
  });

  it('fails fast when the durable handoff payload is missing', () => {
    expect(() =>
      resolveOpportunityFromInterModulePayload({
        results: { ranked_opportunities: [] },
      }),
    ).toThrow(MissingVentureHandoffError);
  });
});
