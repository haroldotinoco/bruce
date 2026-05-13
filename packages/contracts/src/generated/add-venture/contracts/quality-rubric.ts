/* eslint-disable */
/* auto-generated from modules/add-venture/contracts/quality-rubric.schema.json */

/**
 * Scoring dimensions and thresholds used by venture-critic agent
 */
export interface QualityRubricForVentureDossier {
  dimensions?: {
    market_clarity?: {
      name?: string;
      weight?: number;
      description?: string;
      scoring_scale?: {
        score_range?: string;
        criteria?: string;
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    };
    customer_evidence?: {
      name?: string;
      weight?: number;
      description?: string;
      scoring_scale?: unknown[];
      [k: string]: unknown;
    };
    model_soundness?: {
      name?: string;
      weight?: number;
      description?: string;
      scoring_scale?: unknown[];
      [k: string]: unknown;
    };
    gtm_realism?: {
      name?: string;
      weight?: number;
      description?: string;
      scoring_scale?: unknown[];
      [k: string]: unknown;
    };
    risk_awareness?: {
      name?: string;
      weight?: number;
      description?: string;
      scoring_scale?: unknown[];
      [k: string]: unknown;
    };
    narrative_quality?: {
      name?: string;
      weight?: number;
      description?: string;
      scoring_scale?: unknown[];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  volume_scoring?: {
    vol_1?: {
      weight?: number;
      criteria?: string[];
      [k: string]: unknown;
    };
    vol_2?: {
      weight?: number;
      criteria?: string[];
      [k: string]: unknown;
    };
    vol_3?: {
      weight?: number;
      criteria?: string[];
      [k: string]: unknown;
    };
    vol_4?: {
      weight?: number;
      criteria?: string[];
      [k: string]: unknown;
    };
    vol_5?: {
      weight?: number;
      criteria?: string[];
      [k: string]: unknown;
    };
    vol_6?: {
      weight?: number;
      criteria?: string[];
      [k: string]: unknown;
    };
    vol_7?: {
      weight?: number;
      criteria?: string[];
      [k: string]: unknown;
    };
    vol_8?: {
      weight?: number;
      criteria?: string[];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  thresholds?: {
    /**
     * Overall score >= this threshold = approve
     */
    pass_score?: number;
    /**
     * Score >= this and < pass = iterate
     */
    iterate_lower_bound?: number;
    /**
     * Score < this = reject
     */
    reject_threshold?: number;
    /**
     * Volume score < this = flag for iteration
     */
    weak_volume_threshold?: number;
    /**
     * Max re-runs before forced rejection
     */
    max_iterations?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
