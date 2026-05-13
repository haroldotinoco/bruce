/* eslint-disable */
/* auto-generated from modules/bruce-memory/contracts/pattern.schema.json */

/**
 * An extracted, evidence-backed pattern across multiple ventures
 */
export interface Pattern {
  pattern_id: string;
  /**
   * Clear, falsifiable pattern statement. Anonymized. No venture names.
   */
  statement: string;
  /**
   * @minItems 3
   */
  evidence_venture_ids: [string, string, string, ...string[]];
  evidence_count?: number;
  confidence: number;
  applicability_scope?: {
    market_segments?: string[];
    business_model_types?: string[];
    stages?: string[];
    [k: string]: unknown;
  };
  caveats?: string[];
  /**
   * pattern_ids that contradict this pattern
   */
  contradicted_by?: string[];
  status?: "active" | "pending_evidence" | "contradicted" | "stale";
  /**
   * What Bruce should do differently based on this pattern
   */
  action_implication?: string;
  created_at?: string;
  last_updated_at?: string;
  /**
   * Times this pattern has been confirmed by a new venture
   */
  times_validated?: number;
  [k: string]: unknown;
}
