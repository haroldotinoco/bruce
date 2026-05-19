import { afterEach, describe, expect, it } from 'vitest';
import {
  describeOpportunityQualityRules,
  getOpportunityQualityConfig,
} from '../config/opportunity-quality.js';
import {
  buildAnalystInputSummary,
  buildFeedbackFromScoring,
  canonicalMarketSizeEstimateObject,
  canonicalMarketSizeFromAnalystRecord,
  coerceUsdAmount,
  extractTotalScore,
  hashStringToUint32,
  mergeQualityConfig,
  normalizeOpportunitySources,
  scoredOpportunitiesRowsFromMany,
  normalizeThemesForScoring,
  scoringPayloadFromSingleAnalyst,
  varyOpportunitySeed,
} from './opportunity-screening-helpers.js';

describe('normalizeOpportunitySources', () => {
  it('maps string URLs and plain strings to analyst-shaped objects', () => {
    const n = normalizeOpportunitySources([
      'https://example.com/a',
      'Some report title',
      '',
    ]);
    expect(n).toEqual([
      { url: 'https://example.com/a', source_type: 'unknown' },
      { source_title: 'Some report title', source_type: 'unknown' },
    ]);
  });

  it('preserves object entries and maps title to source_title', () => {
    const n = normalizeOpportunitySources([
      { url: 'https://x.test', source_title: 'X', source_type: 'news' },
      { title: 'Only title' },
    ]);
    expect(n).toEqual([
      { url: 'https://x.test', source_title: 'X', source_type: 'news' },
      { source_title: 'Only title' },
    ]);
  });

  it('returns empty for non-array or unrecognised items', () => {
    expect(normalizeOpportunitySources(null)).toEqual([]);
    expect(normalizeOpportunitySources([1, null, {}])).toEqual([]);
  });
});

describe('mergeQualityConfig', () => {
  it('fills defaults when partial is undefined', () => {
    const m = mergeQualityConfig(undefined);
    expect(m.passScore).toBe(70);
    expect(m.maxImproveAttempts).toBe(3);
  });

  it('overrides with partial', () => {
    const m = mergeQualityConfig({ passScore: 80, maxQualityCandidates: 5 });
    expect(m.passScore).toBe(80);
    expect(m.maxQualityCandidates).toBe(5);
    expect(m.lowScoreThreshold).toBe(50);
  });
});

describe('varyOpportunitySeed', () => {
  it('adds suffix keyword deterministically', () => {
    const a = varyOpportunitySeed({ primary_keywords: ['ai'] }, 'venture-uuid', 0);
    const b = varyOpportunitySeed({ primary_keywords: ['ai'] }, 'venture-uuid', 1);
    expect((a.primary_keywords as string[]).length).toBeGreaterThan(1);
    expect((b.primary_keywords as string[]).join(',')).not.toBe((a.primary_keywords as string[]).join(','));
  });
});

describe('hashStringToUint32', () => {
  it('is stable', () => {
    expect(hashStringToUint32('hello')).toBe(hashStringToUint32('hello'));
  });
});

describe('normalizeThemesForScoring', () => {
  it('trims, de-dupes case-insensitively, drops placeholders', () => {
    expect(normalizeThemesForScoring(undefined)).toEqual([]);
    expect(normalizeThemesForScoring([])).toEqual([]);
    expect(normalizeThemesForScoring(['  a ', 'A', 'default', '(default)', ''])).toEqual(['a']);
    expect(normalizeThemesForScoring(['fintech', ' Healthcare '])).toEqual(['fintech', 'Healthcare']);
  });
});

describe('scoringPayloadFromSingleAnalyst', () => {
  it('maps analyst output to scoring input', () => {
    const p = scoringPayloadFromSingleAnalyst({
      opportunity_id: 'oid-1',
      title: 'Test',
      market_size_estimate: { tam: 1, sam: 2, som: 3, confidence: 0.8 },
      competition_landscape: { direct_competitors: ['A'], competitive_intensity: 'high' },
      problem_analysis: { pain_severity: 'high', market_readiness: 'medium' },
      analysis_quality: { confidence_level: 0.7, data_gaps: ['g1'] },
    });
    expect((p.opportunity as { title: string }).title).toBe('Test');
    expect((p.opportunity as { opportunity_id: string }).opportunity_id).toBe('oid-1');
    const mse = (p.opportunity as { market_size_estimate: { tam: number; sam: number; som: number } })
      .market_size_estimate;
    expect(mse.tam).toBe(1);
    expect(mse.sam).toBe(2);
    expect(mse.som).toBe(3);
    const ctx = p.scoring_context as { portfolio_focus_areas: string[]; strategic_priorities: string[] };
    expect(ctx.portfolio_focus_areas).toEqual([]);
    expect(ctx.strategic_priorities).toEqual([]);
  });

  it('fills scoring_context from scan themes', () => {
    const p = scoringPayloadFromSingleAnalyst(
      {
        opportunity_id: 'oid-x',
        title: 'T',
        market_size_estimate: { tam: 1, sam: 1, som: 1, confidence: 0.5 },
        competition_landscape: { direct_competitors: [], competitive_intensity: 'low' },
      },
      { scanThemes: ['healthcare', 'healthcare', '  fintech '] }
    );
    const ctx = p.scoring_context as { portfolio_focus_areas: string[]; strategic_priorities: string[] };
    expect(ctx.portfolio_focus_areas).toEqual(['healthcare', 'fintech']);
    expect(ctx.strategic_priorities).toEqual(['healthcare', 'fintech']);
  });

  it('coerces string TAM/SAM/SOM and reads from deep_analysis', () => {
    const p = scoringPayloadFromSingleAnalyst({
      opportunity_id: 'oid-2',
      title: 'Nested',
      deep_analysis: {
        market_size_estimate: { tam: '8,500,000,000', sam: '1700000000', som: '85000000', confidence: '0.72' },
      },
      competition_landscape: { direct_competitors: [], competitive_intensity: 'low' },
    });
    const mse = (p.opportunity as { market_size_estimate: Record<string, unknown> }).market_size_estimate;
    expect(mse.tam).toBe(8_500_000_000);
    expect(mse.sam).toBe(1_700_000_000);
    expect(mse.som).toBe(85_000_000);
    expect(mse.confidence).toBe(0.72);
  });
});

describe('coerceUsdAmount / canonical market size', () => {
  it('coerces numeric strings', () => {
    expect(coerceUsdAmount('1e9')).toBe(1e9);
    expect(coerceUsdAmount(' 42 ')).toBe(42);
    expect(coerceUsdAmount('not-a-number')).toBe(0);
  });

  it('coerces dollar amounts and K/M/B suffixes', () => {
    expect(coerceUsdAmount('$500M')).toBe(500_000_000);
    expect(coerceUsdAmount('$150m')).toBe(150_000_000);
    expect(coerceUsdAmount('30M')).toBe(30_000_000);
    expect(coerceUsdAmount('$1.2B')).toBe(1.2e9);
    expect(coerceUsdAmount('250k')).toBe(250_000);
    expect(coerceUsdAmount('$2,500K')).toBe(2_500_000);
    expect(coerceUsdAmount('$1.5T')).toBe(1.5e12);
  });

  it('coerces word magnitude suffixes (billion/million/thousand/trillion)', () => {
    expect(coerceUsdAmount('$100 billion')).toBe(100e9);
    expect(coerceUsdAmount('100 billion')).toBe(100e9);
    expect(coerceUsdAmount('1.2 Billion')).toBe(1.2e9);
    expect(coerceUsdAmount('30 million')).toBe(30e6);
    expect(coerceUsdAmount('250 thousand')).toBe(250_000);
    expect(coerceUsdAmount('1.5 trillion')).toBe(1.5e12);
    expect(coerceUsdAmount('500M USD')).toBe(500_000_000);
    expect(coerceUsdAmount('US$30 million')).toBe(30_000_000);
  });

  it('reads opportunity.market_sizing with word-suffix string estimates', () => {
    const c = canonicalMarketSizeFromAnalystRecord({
      market_size_estimate: { tam: 0, sam: 0, som: 0, confidence: 0.5 },
      opportunity: {
        market_sizing: {
          TAM: { estimate: '$100 billion', methodology: '…' },
          SAM: { estimate: '$30 billion', methodology: '…' },
          SOM: { estimate: '$5 billion', methodology: '…' },
        },
      },
    });
    expect(c).toEqual({ tam: 100e9, sam: 30e9, som: 5e9, confidence: 0.5 });
  });

  it('canonicalMarketSizeEstimateObject merges top-level over deep_analysis', () => {
    const o = {
      deep_analysis: {
        market_size_estimate: { tam: 1, sam: 2, som: 3, confidence: 0.4 },
      },
      market_size_estimate: { tam: 10, som: 30 },
    };
    expect(canonicalMarketSizeEstimateObject(o)).toEqual({
      tam: 10,
      sam: 2,
      som: 30,
      confidence: 0.4,
    });
  });

  it('canonicalMarketSizeFromAnalystRecord prefers top-level when only top has strings', () => {
    const c = canonicalMarketSizeFromAnalystRecord({
      market_size_estimate: { tam: '100', sam: '200', som: '300' },
    });
    expect(c).toEqual({ tam: 100, sam: 200, som: 300, confidence: 0.5 });
  });

  it('reads opportunity.market_sizing when root market_size_estimate is all zero', () => {
    const analyst = {
      opportunity_id: 'd17fd5c3-d84e-4d38-b834-3edb4300b7a2',
      title: 'Analyzed opportunity',
      market_size_estimate: { tam: 0, sam: 0, som: 0, confidence: 0.5 },
      competition_landscape: { direct_competitors: [], competitive_intensity: 'medium' },
      opportunity: {
        market_sizing: {
          SAM: { estimate: '$150M', methodology: '…' },
          SOM: { estimate: '$30M', methodology: '…' },
          TAM: { estimate: '$500M', methodology: '…' },
        },
        competitive_landscape: {
          direct_competitors: ['Vet telemedicine platforms like Vetster and TeleVet.'],
          competitive_intensity: 'medium',
        },
        market_diagnosis: {
          market_readiness: 'Customers are motivated to adopt solutions.',
          pain_severity_frequency: 'The pain is severe as it impacts pet health.',
        },
      },
    };
    expect(canonicalMarketSizeFromAnalystRecord(analyst)).toEqual({
      tam: 500_000_000,
      sam: 150_000_000,
      som: 30_000_000,
      confidence: 0.5,
    });
    const p = scoringPayloadFromSingleAnalyst(analyst);
    const mse = (p.opportunity as { market_size_estimate: Record<string, number> }).market_size_estimate;
    expect(mse.tam).toBe(500_000_000);
    expect(mse.sam).toBe(150_000_000);
    expect(mse.som).toBe(30_000_000);
    const comp = (p.opportunity as { competition_landscape: { direct_competitors: unknown[] } })
      .competition_landscape;
    expect(comp.direct_competitors.length).toBe(1);
    const pa = (p.opportunity as { problem_analysis: { pain_severity: string; market_readiness: string } })
      .problem_analysis;
    expect(pa.pain_severity).toBe('high');
    expect(pa.market_readiness).toContain('motivated');
  });
});

describe('buildAnalystInputSummary', () => {
  it('includes currency fields for string amounts from deep_analysis', () => {
    const summary = buildAnalystInputSummary({
      title: 'X',
      deep_analysis: {
        market_size_estimate: { tam: '5000000', sam: '1000000', som: '250000' },
      },
    });
    expect(summary.kind).toBe('object');
    const v = summary.value as Record<string, { kind: string; value: number }>;
    expect(v.tam?.value).toBe(5_000_000);
    expect(v.sam?.value).toBe(1_000_000);
    expect(v.som?.value).toBe(250_000);
  });
});

describe('extractTotalScore / buildFeedbackFromScoring', () => {
  it('extracts score', () => {
    expect(extractTotalScore({ total_score: 62 })).toBe(62);
    expect(extractTotalScore({})).toBe(0);
  });

  it('builds feedback string', () => {
    const t = buildFeedbackFromScoring({
      total_score: 55,
      recommendation: 'reconsider',
      dimensions: { a: 10 },
    });
    expect(t).toContain('55');
    expect(t).toContain('reconsider');
  });
});

describe('scoredOpportunitiesRowsFromMany', () => {
  it('flattens multiple scored outputs', () => {
    const rows = scoredOpportunitiesRowsFromMany([
      { opportunity_id: 'a', total_score: 80, title: 'T1' },
      { opportunity_id: 'b', total_score: 81, title: 'T2' },
    ]);
    expect(rows.length).toBe(2);
  });

  it('filters and canonicalizes mixed scored_opportunities rows for prioritization', () => {
    const rows = scoredOpportunitiesRowsFromMany([
      {
        scored_opportunities: [
          { opportunity_id: 'a', total_score: 75.4, title: 'T1', tags: ['ai'] },
          75,
          { opportunity_id: 'b', total_score: 70, opportunity_title: 'T2' },
          70,
        ],
      },
    ]);

    expect(rows).toEqual([
      expect.objectContaining({
        opportunity_id: 'a',
        title: 'T1',
        total_score: 75,
        recommendation: 'reconsider',
        tags: ['ai'],
      }),
      expect.objectContaining({
        opportunity_id: 'b',
        title: 'T2',
        total_score: 70,
        recommendation: 'reconsider',
        tags: [],
      }),
    ]);
    expect(rows.every((row) => row && typeof row === 'object' && !Array.isArray(row))).toBe(true);
  });
});

describe('getOpportunityQualityConfig', () => {
  const orig = { ...process.env };

  afterEach(() => {
    process.env = { ...orig };
  });

  it('reads all OPPORTUNITY_* quality env vars', () => {
    process.env.OPPORTUNITY_PASS_SCORE = '65';
    process.env.OPPORTUNITY_LOW_SCORE_THRESHOLD = '42';
    process.env.OPPORTUNITY_MAX_IMPROVE_ATTEMPTS = '5';
    process.env.OPPORTUNITY_MAX_QUALITY_CANDIDATES = '12';
    process.env.OPPORTUNITY_MINIMUM_ADVANCEMENT_SCORE = '80';

    const c = getOpportunityQualityConfig();
    expect(c).toEqual({
      passScore: 65,
      lowScoreThreshold: 42,
      maxImproveAttempts: 5,
      maxQualityCandidates: 12,
      minimumAdvancementScore: 80,
    });
  });

  it('describes current quality gate values for operator surfaces', () => {
    process.env.OPPORTUNITY_PASS_SCORE = '65';

    expect(describeOpportunityQualityRules()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'passScore',
          env: 'OPPORTUNITY_PASS_SCORE',
          defaultValue: 70,
          currentValue: 65,
        }),
      ]),
    );
  });
});
