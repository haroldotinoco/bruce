/**
 * Temporal workflow bundle entry — avoid importing metrics/prom-client here.
 */

export function pickAdvanceRankedOpportunity(
  ranked: Array<Record<string, unknown>>,
): Record<string, unknown> | undefined {
  for (const r of ranked) {
    const rec = String(r.recommendation ?? '').toLowerCase();
    const status = String(r.status ?? '').toUpperCase();
    if (rec === 'advance' || status === 'ADVANCE') {
      return r;
    }
  }
  return ranked[0];
}

function indexByOpportunityId(items: unknown[]): Map<string, Record<string, unknown>> {
  const m = new Map<string, Record<string, unknown>>();
  for (const item of items) {
    if (item && typeof item === 'object') {
      const r = item as Record<string, unknown>;
      const id = typeof r.opportunity_id === 'string' ? r.opportunity_id : null;
      if (id) {
        m.set(id, r);
      }
    }
  }
  return m;
}

/**
 * Merge prioritization row (thin) with full analyst + scoring records keyed by opportunity_id.
 * Analyst fields win over collisions so briefing narratives survive ranked overlays.
 */
export function mergeRankedWithAnalystAndScoring(
  rankedRow: Record<string, unknown>,
  analyst: Record<string, unknown> | undefined,
  scored: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const aid =
    (typeof rankedRow.opportunity_id === 'string' && rankedRow.opportunity_id) ||
    (analyst && typeof analyst.opportunity_id === 'string' && analyst.opportunity_id) ||
    (scored && typeof scored.opportunity_id === 'string' && scored.opportunity_id) ||
    '';

  const score =
    typeof rankedRow.total_score === 'number'
      ? rankedRow.total_score
      : scored && typeof scored.total_score === 'number'
        ? scored.total_score
        : 0;

  return {
    ...rankedRow,
    ...(scored ?? {}),
    ...(analyst ?? {}),
    opportunity_id: aid,
    rank: rankedRow.rank,
    advancement_reason: rankedRow.advancement_reason,
    prioritization_status: rankedRow.status,
    prioritization_recommendation: rankedRow.recommendation,
    vertical: rankedRow.vertical,
    total_score: score,
    validation_score: score,
  };
}

export function buildVentureHandoffFromPrioritization(params: {
  prioritizedResults: Record<string, unknown>;
  passedAnalystOutputs: unknown[];
  passedScoredOutputs: unknown[];
}): Record<string, unknown> {
  const rawRanked = params.prioritizedResults.ranked_opportunities;
  const ranked = Array.isArray(rawRanked)
    ? (rawRanked as Array<Record<string, unknown>>)
    : [];

  const selected = pickAdvanceRankedOpportunity(ranked);
  if (!selected) {
    return {
      opportunity_id: '',
      title: 'No ranked opportunities',
      problem_statement: '',
      target_segment: 'general',
    };
  }

  const oid = typeof selected.opportunity_id === 'string' ? selected.opportunity_id : '';
  const analysts = indexByOpportunityId(params.passedAnalystOutputs);
  const scoredIx = indexByOpportunityId(params.passedScoredOutputs);

  const merged = mergeRankedWithAnalystAndScoring(
    selected,
    oid ? analysts.get(oid) : undefined,
    oid ? scoredIx.get(oid) : undefined,
  );

  const screenedAt =
    typeof params.prioritizedResults.prioritization_timestamp === 'string'
      ? params.prioritizedResults.prioritization_timestamp
      : typeof merged.screened_at === 'string'
        ? merged.screened_at
        : '';

  const mse =
    merged.market_size_estimate && typeof merged.market_size_estimate === 'object'
      ? (merged.market_size_estimate as Record<string, unknown>)
      : { tam: 0 };

  const insights = Array.isArray(merged.key_insights)
    ? (merged.key_insights as unknown[])
    : [];

  return {
    ...merged,
    market_size_estimate: mse,
    key_insights: insights,
    screened_at: merged.screened_at ?? screenedAt,
    market_segment:
      typeof merged.market_segment === 'string' && merged.market_segment.length > 0
        ? merged.market_segment
        : typeof merged.target_segment === 'string'
          ? merged.target_segment
          : typeof merged.segment === 'string'
            ? merged.segment
            : 'general',
  };
}
