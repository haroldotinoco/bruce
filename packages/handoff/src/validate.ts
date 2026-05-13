import { z } from 'zod';

/**
 * Runtime validation aligned with modules/contracts/opportunity-to-venture.schema.json.
 */
const KeyInsightSchema = z
  .object({
    insight: z.string(),
    evidence: z.string().optional(),
    confidence_score: z.number().min(0).max(100).optional(),
  })
  .passthrough();

export const OpportunityToVentureHandoffSchema = z
  .object({
    opportunity_id: z.string().min(1),
    problem_statement: z.string(),
    market_segment: z.string().min(1),
    market_size_estimate: z
      .object({
        tam: z.number(),
        tam_reasoning: z.string().optional(),
        addressable_market: z.number().optional(),
        capturable_market: z.number().optional(),
      })
      .passthrough(),
    validation_score: z.number().min(0).max(100),
    key_insights: z.array(KeyInsightSchema),
    screened_at: z.string().datetime({ offset: true }),
  })
  .passthrough();

export type OpportunityToVentureHandoff = z.infer<typeof OpportunityToVentureHandoffSchema>;

export interface ValidateHandoffResult {
  ok: boolean;
  errors?: string[];
  normalized?: OpportunityToVentureHandoff;
}

export function isHandoffStrictValidationEnabled(): boolean {
  const raw = process.env.BRUCE_HANDOFF_VALIDATE_STRICT?.trim().toLowerCase();
  if (raw === '0' || raw === 'false') {
    return false;
  }
  return true;
}

/**
 * Normalizes common aliases then validates.
 */
export function normalizeOpportunityToVentureFields(raw: Record<string, unknown>): Record<string, unknown> {
  const problem_statement =
    typeof raw.problem_statement === 'string' && raw.problem_statement.trim().length > 0
      ? raw.problem_statement
      : typeof raw.description === 'string'
        ? raw.description
        : '';

  const market_segment =
    typeof raw.market_segment === 'string' && raw.market_segment.trim().length > 0
      ? raw.market_segment
      : typeof raw.target_segment === 'string' && raw.target_segment.trim().length > 0
        ? raw.target_segment
        : typeof raw.segment === 'string'
          ? raw.segment
          : 'general';

  let market_size_estimate = raw.market_size_estimate;
  if (!market_size_estimate || typeof market_size_estimate !== 'object') {
    market_size_estimate = { tam: 0 };
  }

  const tamRaw = (market_size_estimate as Record<string, unknown>).tam;
  const tam = typeof tamRaw === 'number' ? tamRaw : Number(tamRaw);
  market_size_estimate = {
    ...(market_size_estimate as object),
    tam: Number.isFinite(tam) ? tam : 0,
  };

  const validationScoreRaw =
    typeof raw.validation_score === 'number'
      ? raw.validation_score
      : typeof raw.total_score === 'number'
        ? raw.total_score
        : Number(raw.validation_score ?? raw.total_score);
  const validation_score = Number.isFinite(validationScoreRaw) ? validationScoreRaw : 0;

  const key_insights = Array.isArray(raw.key_insights)
    ? raw.key_insights
        .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
        .map((item) => {
          const confidenceRaw =
            typeof item.confidence_score === 'number'
              ? item.confidence_score
              : Number(item.confidence_score);
          return {
            ...item,
            insight: typeof item.insight === 'string' ? item.insight : JSON.stringify(item),
            ...(typeof item.evidence === 'string' ? { evidence: item.evidence } : {}),
            ...(Number.isFinite(confidenceRaw) ? { confidence_score: confidenceRaw } : {}),
          };
        })
    : [];

  const screened_at =
    typeof raw.screened_at === 'string' && raw.screened_at.length > 0
      ? raw.screened_at
      : typeof raw.prioritization_timestamp === 'string'
        ? raw.prioritization_timestamp
        : new Date().toISOString();

  return {
    ...raw,
    problem_statement,
    market_segment,
    market_size_estimate,
    validation_score,
    key_insights,
    screened_at,
  };
}

export function validateOpportunityToVentureHandoff(raw: Record<string, unknown>): ValidateHandoffResult {
  const normalized = normalizeOpportunityToVentureFields(raw);
  const parsed = OpportunityToVentureHandoffSchema.safeParse(normalized);
  if (parsed.success) {
    return { ok: true, normalized: parsed.data };
  }
  const errors = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  return { ok: false, errors };
}
