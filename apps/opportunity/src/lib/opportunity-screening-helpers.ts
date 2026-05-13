/**
 * Pure helpers for opportunity screening quality gate (unit-tested; safe for import from workflows if only data).
 */
import {
  DEFAULT_OPPORTUNITY_QUALITY_CONFIG,
  type OpportunityQualityConfig,
} from '../config/opportunity-quality.js';
import type { LogValue, LogValueVariant } from '@bruce/contracts/observability';

/** Per-dimension breakdown lifted from the scoring agent's structured output. */
export interface ScoringDimensionDetail {
  key: string;
  label: string;
  score: number;
  rationale?: string;
  factors: string[];
}

const SCORING_DIMENSION_LABELS: Record<string, string> = {
  market_size: 'Market size',
  urgency: 'Urgency',
  competition: 'Competition',
  strategic_fit: 'Strategic fit',
};

/**
 * Coerce LLM output to a finite USD amount.
 *
 * Handles the shapes we have observed from the analyst agent in production:
 * - Plain numbers (preferred contract)
 * - Numeric strings ("8500000000", "8_500_000_000", "8,500,000,000")
 * - Leading currency symbol / trailing ISO code ("$500M", "500M USD")
 * - Single-letter magnitude suffixes: K, M, B, T
 * - Word magnitude suffixes: thousand, million, billion, trillion
 *   (with or without whitespace, e.g. "$100 billion", "1.2 Billion")
 *
 * Returns `0` when the input cannot be interpreted — callers treat that as a
 * missing estimate and the scoring agent will flag it in its rationale.
 */
export function coerceUsdAmount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;

  let t = value.trim().toLowerCase();
  if (!t) return 0;

  t = t.replace(/usd\b/g, '').replace(/us\$/g, '').replace(/\$/g, '').trim();
  if (!t) return 0;

  let mult = 1;
  const wordMatch = t.match(/(thousand|million|billion|trillion)\b/);
  if (wordMatch) {
    const word = wordMatch[1];
    if (word === 'thousand') mult = 1e3;
    else if (word === 'million') mult = 1e6;
    else if (word === 'billion') mult = 1e9;
    else if (word === 'trillion') mult = 1e12;
    t = t.replace(wordMatch[0], '').trim();
  }

  t = t.replace(/[,_\s]/g, '');
  if (!t) return 0;

  if (mult === 1) {
    const last = t[t.length - 1];
    if (last === 'k' || last === 'm' || last === 'b' || last === 't') {
      if (last === 'k') mult = 1e3;
      else if (last === 'm') mult = 1e6;
      else if (last === 'b') mult = 1e9;
      else if (last === 't') mult = 1e12;
      t = t.slice(0, -1);
    }
  }

  const n = Number(t);
  if (!Number.isFinite(n)) return 0;
  return n * mult;
}

function asRecord(x: unknown): Record<string, unknown> | null {
  return x && typeof x === 'object' && !Array.isArray(x) ? (x as Record<string, unknown>) : null;
}

const SOURCE_URL_LIKE = /^https?:\/\//i;

/**
 * Coerce market-scanner `sources` (often `string[]` from the LLM) into objects expected by
 * opportunity-analyst input schema (`url`, `source_title`, `source_type`).
 */
export function normalizeOpportunitySources(sources: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(sources)) return [];
  const out: Array<Record<string, unknown>> = [];
  for (const item of sources) {
    if (typeof item === 'string') {
      const s = item.trim();
      if (!s) continue;
      if (SOURCE_URL_LIKE.test(s)) {
        out.push({ url: s, source_type: 'unknown' });
      } else {
        out.push({ source_title: s, source_type: 'unknown' });
      }
      continue;
    }
    const rec = asRecord(item);
    if (!rec) continue;
    const row: Record<string, unknown> = {};
    if (typeof rec.url === 'string' && rec.url.trim()) row.url = rec.url.trim();
    if (typeof rec.source_title === 'string' && rec.source_title.trim()) {
      row.source_title = rec.source_title.trim();
    } else if (typeof rec.title === 'string' && rec.title.trim()) {
      row.source_title = rec.title.trim();
    }
    if (typeof rec.source_type === 'string' && rec.source_type.trim()) {
      row.source_type = rec.source_type.trim();
    }
    if (Object.keys(row).length === 0) continue;
    out.push(row);
  }
  return out;
}

/** TAM/SAM/SOM under `opportunity.market_sizing` (alternate analyst shape). */
function extractMarketSizingEstimate(r: Record<string, unknown>): Record<string, unknown> | null {
  const opp = asRecord(r.opportunity);
  if (!opp) return null;
  const ms = asRecord(opp.market_sizing);
  if (!ms) return null;
  const out: Record<string, unknown> = {};
  const pairs: [keyof typeof out, string, string][] = [
    ['tam', 'TAM', 'tam'],
    ['sam', 'SAM', 'sam'],
    ['som', 'SOM', 'som'],
  ];
  for (const [dest, upper, lower] of pairs) {
    const raw = ms[upper] ?? ms[lower];
    if (raw === undefined) continue;
    if (typeof raw === 'string' || typeof raw === 'number') {
      out[dest] = raw;
    } else {
      const block = asRecord(raw);
      const est = block?.estimate;
      if (est !== undefined) out[dest] = est;
    }
  }
  return Object.keys(out).length ? out : null;
}

function pickMarketSizeObject(r: Record<string, unknown>): Record<string, unknown> {
  const top = r.market_size_estimate;
  const topObj =
    top && typeof top === 'object' && !Array.isArray(top) ? (top as Record<string, unknown>) : null;
  const da = r.deep_analysis;
  const nested =
    da && typeof da === 'object' && !Array.isArray(da)
      ? (da as Record<string, unknown>).market_size_estimate
      : undefined;
  const nestedObj =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : null;
  let merged: Record<string, unknown>;
  if (topObj && nestedObj) merged = { ...nestedObj, ...topObj };
  else if (topObj) merged = { ...topObj };
  else if (nestedObj) merged = { ...nestedObj };
  else merged = {};

  const tam0 = coerceUsdAmount(merged.tam);
  const sam0 = coerceUsdAmount(merged.sam);
  const som0 = coerceUsdAmount(merged.som);
  if (tam0 === 0 && sam0 === 0 && som0 === 0) {
    const fromSizing = extractMarketSizingEstimate(r);
    if (fromSizing) {
      merged = { ...merged, ...fromSizing };
    }
  }
  return merged;
}

function pickAnalystCompetitionLandscape(a: Record<string, unknown>): {
  direct_competitors: unknown[];
  competitive_intensity: string;
} {
  let comp = asRecord(a.competition_landscape) ?? {};
  let direct = Array.isArray(comp.direct_competitors) ? [...comp.direct_competitors] : [];
  let intensity =
    typeof comp.competitive_intensity === 'string' ? comp.competitive_intensity : 'medium';

  if (direct.length === 0) {
    const opp = asRecord(a.opportunity);
    const nested = opp
      ? asRecord(opp.competitive_landscape) ?? asRecord(opp.competition_landscape)
      : null;
    if (nested) {
      if (Array.isArray(nested.direct_competitors) && nested.direct_competitors.length > 0) {
        direct = [...nested.direct_competitors];
      }
      if (typeof nested.competitive_intensity === 'string') {
        intensity = nested.competitive_intensity;
      }
    }
  }

  return { direct_competitors: direct, competitive_intensity: intensity };
}

function pickAnalystProblemAnalysis(a: Record<string, unknown>): {
  pain_severity: string;
  market_readiness: string;
} {
  const pa = asRecord(a.problem_analysis) ?? {};
  let pain = typeof pa.pain_severity === 'string' ? pa.pain_severity : '';
  let readiness = typeof pa.market_readiness === 'string' ? pa.market_readiness : '';

  const needsPain = !pain;
  const needsReadiness = !readiness;
  if (needsPain || needsReadiness) {
    const opp = asRecord(a.opportunity);
    const md = opp ? asRecord(opp.market_diagnosis) : null;
    if (md) {
      if (needsReadiness && typeof md.market_readiness === 'string') {
        readiness = md.market_readiness;
      }
      if (needsPain) {
        const psf = md.pain_severity_frequency;
        const text = typeof psf === 'string' ? psf.toLowerCase() : '';
        if (text.includes('severe') || text.includes('acute') || text.includes('critical')) {
          pain = 'high';
        } else if (text.includes('moderate') || text.includes('medium')) {
          pain = 'medium';
        } else if (text.includes('low') || text.includes('mild')) {
          pain = 'low';
        } else {
          pain = 'medium';
        }
      }
    }
  }

  return {
    pain_severity: pain || 'medium',
    market_readiness: readiness || 'medium',
  };
}

export function canonicalMarketSizeFromAnalystRecord(r: Record<string, unknown>): {
  tam: number;
  sam: number;
  som: number;
  confidence: number;
} {
  const m = pickMarketSizeObject(r);
  const tam = coerceUsdAmount(m.tam);
  const sam = coerceUsdAmount(m.sam);
  const som = coerceUsdAmount(m.som);
  let confidence = 0.5;
  const confRaw = m.confidence;
  if (typeof confRaw === 'number' && Number.isFinite(confRaw)) {
    confidence = confRaw;
  } else if (typeof confRaw === 'string') {
    const n = Number(confRaw.trim());
    if (Number.isFinite(n)) confidence = n;
  }
  return { tam, sam, som, confidence };
}

/** Plain object for persistence / scoring after hoist + coercion. */
export function canonicalMarketSizeEstimateObject(r: Record<string, unknown>): Record<string, unknown> {
  const c = canonicalMarketSizeFromAnalystRecord(r);
  return {
    tam: c.tam,
    sam: c.sam,
    som: c.som,
    confidence: c.confidence,
  };
}

function pickDimensionDetail(value: unknown): { score: number; rationale?: string; factors: string[] } {
  if (typeof value === 'number') return { score: value, factors: [] };
  if (!value || typeof value !== 'object') return { score: 0, factors: [] };
  const o = value as Record<string, unknown>;
  const score = typeof o.score === 'number' ? o.score : 0;
  const rationale = typeof o.rationale === 'string' ? o.rationale : undefined;
  const factors = Array.isArray(o.factors)
    ? o.factors.filter((f): f is string => typeof f === 'string')
    : [];
  return { score, rationale, factors };
}

/**
 * Extract per-dimension scoring details from a scoring-agent output. The
 * scoring agent's contract guarantees four 0-25 dimensions
 * (market_size, urgency, competition, strategic_fit), each with `score`,
 * `rationale`, `factors`. We surface every dimension that was returned, in a
 * stable order, so the dashboard can render a "Scoring breakdown" card per
 * sub-step instead of just the bare total.
 */
export function extractScoringDimensions(scoredOutput: unknown): ScoringDimensionDetail[] {
  if (!scoredOutput || typeof scoredOutput !== 'object') return [];
  const dims = (scoredOutput as Record<string, unknown>).dimensions;
  if (!dims || typeof dims !== 'object') return [];
  const entries = Object.entries(dims as Record<string, unknown>);
  const ordered = [
    ...entries.filter(([k]) => SCORING_DIMENSION_LABELS[k]),
    ...entries.filter(([k]) => !SCORING_DIMENSION_LABELS[k]),
  ];
  return ordered.map(([key, value]) => {
    const detail = pickDimensionDetail(value);
    return {
      key,
      label: SCORING_DIMENSION_LABELS[key] ?? humanizeKey(key),
      score: detail.score,
      rationale: detail.rationale,
      factors: detail.factors,
    };
  });
}

function humanizeKey(k: string): string {
  return k
    .replace(/[_\-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Recommendation chip helper: maps the agent's enum to a LogValue variant. */
export function recommendationVariant(value: unknown): LogValueVariant {
  if (value === 'advance') return 'success';
  if (value === 'reconsider') return 'warn';
  if (value === 'reject') return 'error';
  return 'neutral';
}

/**
 * Build the structured `fields` payload for a scoring sub-step from the
 * scoring agent's output. Returns a record of `LogValue`s keyed by field
 * name. Dimensions are emitted as an `array` of `object`s so the dashboard's
 * `LogValueComponent` can recurse, with the typed `score` chip per item.
 */
export function buildScoringFields(
  scored: unknown,
  threshold: number,
): Record<string, LogValue> {
  const out: Record<string, LogValue> = {};
  const s = (scored && typeof scored === 'object' ? scored : {}) as Record<string, unknown>;

  const total = typeof s.total_score === 'number' ? s.total_score : 0;
  const passed = total >= threshold;
  out.score = {
    kind: 'score',
    value: total,
    out_of: 100,
    threshold,
    passed,
    variant: passed ? 'success' : 'warn',
  };

  if (typeof s.recommendation === 'string') {
    out.recommendation = {
      kind: 'enum',
      value: s.recommendation,
      variant: recommendationVariant(s.recommendation),
    };
  }

  if (typeof s.confidence_in_score === 'number') {
    out.confidence = { kind: 'percent', value: s.confidence_in_score, unit: '%' };
  }

  if (typeof s.scoring_notes === 'string' && s.scoring_notes.trim()) {
    out.notes = { kind: 'text_long', value: s.scoring_notes };
  }

  const dimensions = extractScoringDimensions(scored);
  if (dimensions.length) {
    out.dimensions = {
      kind: 'array',
      item_kind: 'object',
      value: dimensions.map((d) => ({
        kind: 'object',
        value: {
          dimension: { kind: 'text_short', value: d.label },
          score: { kind: 'score', value: d.score, out_of: 25 },
          rationale: d.rationale
            ? { kind: 'text_long', value: d.rationale }
            : undefined,
          factors: d.factors.length
            ? { kind: 'tags', value: d.factors }
            : undefined,
        },
      })),
    };
  }

  return out;
}

/** Return true when the scoring agent returned no usable score (likely a missing total_score from the LLM). */
export function isMissingScore(scoredOutput: unknown): boolean {
  if (!scoredOutput || typeof scoredOutput !== 'object') return true;
  const s = scoredOutput as Record<string, unknown>;
  return typeof s.total_score !== 'number';
}

/** True when the scoring agent did NOT return any dimensions — the breakdown will be empty. */
export function hasNoScoringDimensions(scoredOutput: unknown): boolean {
  return extractScoringDimensions(scoredOutput).length === 0;
}

/**
 * Build a compact, human-readable summary of the analyst dossier that was
 * fed into the scoring agent. We intentionally pick a small set of fields
 * (not the entire blob) so the inspector can render a useful "what the
 * agent saw" block without overwhelming the user. The full payload is
 * still available via `raw_input`.
 */
export function buildAnalystInputSummary(analystOutput: unknown): LogValue {
  const a =
    analystOutput && typeof analystOutput === 'object'
      ? (analystOutput as Record<string, unknown>)
      : {};
  const rawM = pickMarketSizeObject(a);
  const mseCanon = canonicalMarketSizeFromAnalystRecord(a);
  const compPick = pickAnalystCompetitionLandscape(a);
  const comp = {
    direct_competitors: compPick.direct_competitors,
    competitive_intensity: compPick.competitive_intensity,
  };
  const paPick = pickAnalystProblemAnalysis(a);
  const pa = {
    pain_severity: paPick.pain_severity,
    market_readiness: paPick.market_readiness,
  };
  const aq =
    a.analysis_quality && typeof a.analysis_quality === 'object'
      ? (a.analysis_quality as Record<string, unknown>)
      : {};
  const directCompetitors = Array.isArray(comp.direct_competitors)
    ? (comp.direct_competitors as unknown[])
    : [];
  const dataGaps = Array.isArray(aq.data_gaps)
    ? (aq.data_gaps as unknown[]).filter((x): x is string => typeof x === 'string')
    : [];

  const currencyIf = (
    key: 'tam' | 'sam' | 'som',
    coerced: number,
  ): LogValue | undefined => {
    const present = key in rawM && rawM[key] !== undefined && rawM[key] !== null;
    if (present || coerced !== 0) {
      return { kind: 'currency', value: coerced, unit: 'USD' };
    }
    return undefined;
  };

  const summary: Record<string, LogValue | undefined> = {
    opportunity_id:
      typeof a.opportunity_id === 'string'
        ? { kind: 'id_ref', value: a.opportunity_id, ref_kind: 'opportunity' }
        : undefined,
    title:
      typeof a.title === 'string' ? { kind: 'text_short', value: a.title } : undefined,
    tam: currencyIf('tam', mseCanon.tam),
    sam: currencyIf('sam', mseCanon.sam),
    som: currencyIf('som', mseCanon.som),
    market_confidence:
      rawM &&
      'confidence' in rawM &&
      rawM.confidence !== undefined &&
      rawM.confidence !== null
        ? { kind: 'percent', value: mseCanon.confidence, unit: '%' }
        : undefined,
    direct_competitors_count: {
      kind: 'integer',
      value: directCompetitors.length,
      unit: '',
    },
    competitive_intensity:
      typeof comp.competitive_intensity === 'string'
        ? { kind: 'enum', value: comp.competitive_intensity }
        : undefined,
    pain_severity:
      typeof pa.pain_severity === 'string'
        ? { kind: 'enum', value: pa.pain_severity }
        : undefined,
    market_readiness:
      typeof pa.market_readiness === 'string'
        ? { kind: 'enum', value: pa.market_readiness }
        : undefined,
    analysis_confidence:
      typeof aq.confidence_level === 'number'
        ? { kind: 'percent', value: aq.confidence_level, unit: '%' }
        : undefined,
    data_gaps: dataGaps.length
      ? { kind: 'tags', value: dataGaps }
      : { kind: 'text_short', value: 'none reported' },
  };

  // Strip undefined entries so the renderer doesn't print blank rows.
  const compact: Record<string, LogValue> = {};
  for (const [k, v] of Object.entries(summary)) {
    if (v !== undefined) compact[k] = v;
  }
  return { kind: 'object', value: compact };
}

/** Simple deterministic string hash for seed variation (0..2^32). */
export function hashStringToUint32(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

const KEYWORD_SUFFIXES = [
  'alt',
  'market',
  'emerging',
  'startup',
  'sector',
  '2025',
  'scale',
  'tech',
  'growth',
  'innovation',
];

/**
 * Varies search seed for a new "full retry" market scan (deterministic per venture + candidate index).
 */
export function varyOpportunitySeed(
  opportunity: unknown,
  ventureId: string,
  candidateIndex: number
): Record<string, unknown> {
  const o =
    opportunity && typeof opportunity === 'object'
      ? { ...(opportunity as Record<string, unknown>) }
      : {};
  const pk = Array.isArray(o.primary_keywords)
    ? [...(o.primary_keywords as string[])]
    : ['venture'];
  const h = hashStringToUint32(`${ventureId}:${candidateIndex}`);
  const suffix = KEYWORD_SUFFIXES[h % KEYWORD_SUFFIXES.length];
  if (!pk.includes(suffix)) {
    pk.push(suffix);
  }
  o.primary_keywords = pk;
  const secondary = Array.isArray(o.secondary_keywords)
    ? [...(o.secondary_keywords as string[])]
    : [];
  secondary.push(`variant-${candidateIndex}`);
  o.secondary_keywords = secondary;
  return o;
}

/** Placeholder theme values stored when no real scan themes exist — omit from scoring context. */
const SCORING_THEME_PLACEHOLDERS = new Set(['default', '(default)']);

/**
 * Normalize scan themes for scoring payload: trim, de-duplicate (case-insensitive), cap length,
 * drop empty and placeholder tokens.
 */
export function normalizeThemesForScoring(themes: string[] | undefined): string[] {
  if (!themes?.length) {
    return [];
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of themes) {
    if (typeof raw !== 'string') {
      continue;
    }
    const t = raw.trim();
    if (!t) {
      continue;
    }
    const lower = t.toLowerCase();
    if (SCORING_THEME_PLACEHOLDERS.has(lower)) {
      continue;
    }
    if (seen.has(lower)) {
      continue;
    }
    seen.add(lower);
    out.push(t);
    if (out.length >= 20) {
      break;
    }
  }
  return out;
}

export type ScoringPayloadOptions = {
  /** Scan / workflow themes — mapped into portfolio_focus_areas and strategic_priorities for the agent. */
  scanThemes?: string[];
};

/** Build scoring-agent payload from a single normalized analyst output. */
export function scoringPayloadFromSingleAnalyst(
  analystOutput: unknown,
  options?: ScoringPayloadOptions
): Record<string, unknown> {
  const a = analystOutput && typeof analystOutput === 'object' ? (analystOutput as Record<string, unknown>) : {};
  const oppId = typeof a.opportunity_id === 'string' ? a.opportunity_id : 'unknown-opportunity-id';
  const title = typeof a.title === 'string' ? a.title : 'Analyzed opportunity';

  const { tam, sam, som, confidence: conf } = canonicalMarketSizeFromAnalystRecord(a);

  const compPick = pickAnalystCompetitionLandscape(a);
  const direct = compPick.direct_competitors;
  const intensity = compPick.competitive_intensity;

  const problem_analysis = pickAnalystProblemAnalysis(a);

  const aq =
    a.analysis_quality && typeof a.analysis_quality === 'object'
      ? (a.analysis_quality as Record<string, unknown>)
      : {};
  const analysis_quality = {
    confidence_level: typeof aq.confidence_level === 'number' ? aq.confidence_level : 0.5,
    data_gaps: Array.isArray(aq.data_gaps) ? aq.data_gaps : [],
  };

  const focus = normalizeThemesForScoring(options?.scanThemes);

  return {
    opportunity: {
      opportunity_id: oppId,
      title,
      market_size_estimate: { tam, sam, som, confidence: conf },
      problem_analysis,
      competition_landscape: {
        direct_competitors: direct,
        competitive_intensity: intensity,
      },
      analysis_quality,
    },
    scoring_context: {
      portfolio_focus_areas: focus,
      strategic_priorities: focus,
      apply_market_signals: true,
    },
  };
}

export function buildFeedbackFromScoring(scoredOutput: unknown): string {
  const s =
    scoredOutput && typeof scoredOutput === 'object'
      ? (scoredOutput as Record<string, unknown>)
      : {};
  const parts: string[] = [];
  if (typeof s.total_score === 'number') {
    parts.push(`Previous total score: ${s.total_score}.`);
  }
  if (
    s.recommendation === 'advance' ||
    s.recommendation === 'reconsider' ||
    s.recommendation === 'reject'
  ) {
    parts.push(`Prior recommendation: ${s.recommendation}.`);
  }
  const dims = s.dimensions;
  if (dims && typeof dims === 'object') {
    parts.push(`Dimension scores/detail: ${JSON.stringify(dims)}`);
  }
  return parts.length > 0 ? parts.join(' ') : 'Improve evidence depth, market sizing, and competitive clarity.';
}

/**
 * Maps a single scoring-agent output (or batch-shaped object) to prioritization rows.
 * Duplicated from activities for use in Temporal workflows (no activities import).
 */
export function scoredOpportunitiesFromOutput(scored: unknown): Array<Record<string, unknown>> {
  if (scored && typeof scored === 'object') {
    const s = scored as Record<string, unknown>;
    if (Array.isArray(s.scored_opportunities)) {
      return s.scored_opportunities as Array<Record<string, unknown>>;
    }
    if (Array.isArray(s.opportunities)) {
      return s.opportunities as Array<Record<string, unknown>>;
    }
    if (
      typeof s.opportunity_id === 'string' ||
      typeof s.total_score === 'number' ||
      typeof s.scoring_timestamp === 'string'
    ) {
      const title =
        typeof s.title === 'string'
          ? s.title
          : typeof s.opportunity_title === 'string'
            ? s.opportunity_title
            : 'Scored opportunity';
      return [
        {
          opportunity_id:
            typeof s.opportunity_id === 'string' ? s.opportunity_id : '00000000-0000-4000-8000-000000000001',
          title,
          total_score: typeof s.total_score === 'number' ? s.total_score : 0,
          recommendation: s.recommendation ?? 'reconsider',
          discovery_date:
            typeof s.scoring_timestamp === 'string' ? s.scoring_timestamp : new Date().toISOString(),
          dimensions: s.dimensions,
          tags: Array.isArray(s.tags) ? s.tags : [],
        },
      ];
    }
  }
  return [
    {
      opportunity_id: '00000000-0000-4000-8000-000000000002',
      title: 'Scored opportunity (fallback)',
      total_score: 0,
      recommendation: 'review',
      discovery_date: new Date().toISOString(),
      tags: [] as string[],
    },
  ];
}

export function scoredOpportunitiesRowsFromMany(scoredOutputs: unknown[]): Array<Record<string, unknown>> {
  return scoredOutputs.flatMap((s) => scoredOpportunitiesFromOutput(s));
}

export function extractTotalScore(scoredOutput: unknown): number {
  const s =
    scoredOutput && typeof scoredOutput === 'object'
      ? (scoredOutput as Record<string, unknown>)
      : {};
  return typeof s.total_score === 'number' ? s.total_score : 0;
}

/** Merge workflow quality with defaults (Temporal workflow args). */
export function mergeQualityConfig(
  partial: Partial<OpportunityQualityConfig> | undefined
): OpportunityQualityConfig {
  const d = DEFAULT_OPPORTUNITY_QUALITY_CONFIG;
  if (!partial) return { ...d };
  return {
    passScore: partial.passScore ?? d.passScore,
    lowScoreThreshold: partial.lowScoreThreshold ?? d.lowScoreThreshold,
    maxImproveAttempts: partial.maxImproveAttempts ?? d.maxImproveAttempts,
    maxQualityCandidates: partial.maxQualityCandidates ?? d.maxQualityCandidates,
    minimumAdvancementScore: partial.minimumAdvancementScore ?? d.minimumAdvancementScore,
  };
}
