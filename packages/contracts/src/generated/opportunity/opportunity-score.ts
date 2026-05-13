/* eslint-disable */
/* auto-generated from modules/opportunity/opportunity-score.schema.json */

/**
 * Scoring result for an opportunity across standard dimensions
 */
export interface OpportunityScore {
  /**
   * Reference to the opportunity being scored
   */
  opportunity_id: string;
  scoring_timestamp: string;
  dimensions: {
    market_size: {
      score: number;
      rationale: string;
      factors?: string[];
      [k: string]: unknown;
    };
    urgency: {
      score: number;
      rationale: string;
      factors?: string[];
      [k: string]: unknown;
    };
    competition: {
      score: number;
      rationale: string;
      factors?: string[];
      [k: string]: unknown;
    };
    strategic_fit: {
      score: number;
      rationale: string;
      factors?: string[];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Sum of all dimension scores
   */
  total_score: number;
  /**
   * Recommended action based on score
   */
  recommendation: "advance" | "reconsider" | "reject";
  /**
   * Agent ID that performed scoring
   */
  scored_by?: string;
  [k: string]: unknown;
}
