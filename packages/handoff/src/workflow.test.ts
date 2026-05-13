import { describe, expect, it } from 'vitest';
import {
  buildVentureHandoffFromPrioritization,
  mergeRankedWithAnalystAndScoring,
} from './workflow.js';

describe('mergeRankedWithAnalystAndScoring', () => {
  it('preserves analyst narrative over thin ranked row', () => {
    const ranked = {
      rank: 1,
      opportunity_id: 'same-id',
      title: 'Rank title',
      total_score: 82,
      recommendation: 'advance',
      status: 'ADVANCE',
    };
    const analyst = {
      opportunity_id: 'same-id',
      title: 'Analyst title',
      problem_statement: 'Painful manual workflows',
      target_segment: 'Mid-market ops teams',
      market_size_estimate: { tam: 1e9, sam: 1e8 },
    };
    const scored = {
      opportunity_id: 'same-id',
      total_score: 80,
      dimensions: { foo: 10 },
    };
    const merged = mergeRankedWithAnalystAndScoring(ranked, analyst, scored);
    expect(merged.problem_statement).toBe('Painful manual workflows');
    expect(merged.target_segment).toBe('Mid-market ops teams');
    expect(merged.total_score).toBe(82);
    expect(merged.dimensions).toEqual({ foo: 10 });
    expect(merged.rank).toBe(1);
  });
});

describe('buildVentureHandoffFromPrioritization', () => {
  it('merges selected advance row with analyst and scoring by id', () => {
    const prioritizedResults = {
      prioritization_timestamp: '2026-05-01T12:00:00Z',
      ranked_opportunities: [
        {
          rank: 2,
          opportunity_id: 'b',
          title: 'Hold',
          total_score: 60,
          recommendation: 'reconsider',
        },
        {
          rank: 1,
          opportunity_id: 'a',
          title: 'Thin advance row',
          total_score: 88,
          recommendation: 'advance',
          status: 'ADVANCE',
        },
      ],
    };
    const analyst = {
      opportunity_id: 'a',
      problem_statement: 'Deep analysis body',
      target_segment: 'Retail',
      market_size_estimate: { tam: 5000000 },
    };
    const scored = {
      opportunity_id: 'a',
      total_score: 88,
      recommendation: 'advance',
    };

    const handoff = buildVentureHandoffFromPrioritization({
      prioritizedResults,
      passedAnalystOutputs: [analyst],
      passedScoredOutputs: [scored],
    });

    expect(handoff.opportunity_id).toBe('a');
    expect(handoff.problem_statement).toBe('Deep analysis body');
    expect(handoff.market_segment).toBe('Retail');
    expect(handoff.validation_score).toBe(88);
    expect(handoff.screened_at).toBe('2026-05-01T12:00:00Z');
  });
});
