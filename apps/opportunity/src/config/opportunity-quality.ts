/**
 * Quality gate thresholds for opportunity screening (read in Node — passed into Temporal workflow args).
 */
export interface OpportunityQualityConfig {
  passScore: number;
  lowScoreThreshold: number;
  maxImproveAttempts: number;
  maxQualityCandidates: number;
  minimumAdvancementScore: number;
}

export const OPPORTUNITY_QUALITY_RULES = [
  {
    key: 'passScore',
    env: 'OPPORTUNITY_PASS_SCORE',
    defaultValue: 70,
    description: 'Minimum scoring-agent total_score that passes the screening quality gate.',
  },
  {
    key: 'lowScoreThreshold',
    env: 'OPPORTUNITY_LOW_SCORE_THRESHOLD',
    defaultValue: 50,
    description: 'Scores below this threshold skip improvement loops and move to a new candidate.',
  },
  {
    key: 'maxImproveAttempts',
    env: 'OPPORTUNITY_MAX_IMPROVE_ATTEMPTS',
    defaultValue: 3,
    description: 'Maximum analyst/scoring improvement attempts for a mid-score candidate.',
  },
  {
    key: 'maxQualityCandidates',
    env: 'OPPORTUNITY_MAX_QUALITY_CANDIDATES',
    defaultValue: 10,
    description: 'Maximum fresh candidates to try before failing the input slot.',
  },
  {
    key: 'minimumAdvancementScore',
    env: 'OPPORTUNITY_MINIMUM_ADVANCEMENT_SCORE',
    defaultValue: 75,
    description: 'Minimum score supplied to prioritization for advancement context.',
  },
] as const;

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseScore(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : fallback;
}

/**
 * Loads from env (OPPORTUNITY_*). Used when starting workflows from scan.service.
 */
export function getOpportunityQualityConfig(): OpportunityQualityConfig {
  return {
    passScore: parseScore(process.env.OPPORTUNITY_PASS_SCORE, 70),
    lowScoreThreshold: parseScore(process.env.OPPORTUNITY_LOW_SCORE_THRESHOLD, 50),
    maxImproveAttempts: parsePositiveInt(process.env.OPPORTUNITY_MAX_IMPROVE_ATTEMPTS, 3),
    maxQualityCandidates: parsePositiveInt(process.env.OPPORTUNITY_MAX_QUALITY_CANDIDATES, 10),
    minimumAdvancementScore: parseScore(process.env.OPPORTUNITY_MINIMUM_ADVANCEMENT_SCORE, 75),
  };
}

/** Defaults for Temporal workflow when `quality` is omitted (deterministic, no env in workflow sandbox). */
export const DEFAULT_OPPORTUNITY_QUALITY_CONFIG: OpportunityQualityConfig = {
  passScore: 70,
  lowScoreThreshold: 50,
  maxImproveAttempts: 3,
  maxQualityCandidates: 10,
  minimumAdvancementScore: 75,
};

export function describeOpportunityQualityRules(): Array<
  (typeof OPPORTUNITY_QUALITY_RULES)[number] & { currentValue: number }
> {
  const current = getOpportunityQualityConfig();
  return OPPORTUNITY_QUALITY_RULES.map((rule) => ({
    ...rule,
    currentValue: current[rule.key],
  }));
}
