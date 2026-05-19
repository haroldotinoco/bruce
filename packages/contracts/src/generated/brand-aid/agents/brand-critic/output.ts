/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/brand-critic/output.schema.json */

export interface BrandCritiqueOutput {
  scores: {
    strategic_alignment?: number;
    distinctiveness?: number;
    visual_coherence?: number;
    naming_quality?: number;
    moodboard_fit?: number;
    logo_study_quality?: number;
    overall?: number;
    [k: string]: unknown;
  };
  dimension_analysis: {
    strategic_alignment?: {
      score?: number;
      rationale?: string;
      evidence?: string[];
      [k: string]: unknown;
    };
    distinctiveness?: {
      score?: number;
      rationale?: string;
      vs_competitors?: string;
      [k: string]: unknown;
    };
    visual_coherence?: {
      score?: number;
      rationale?: string;
      consistency_checks?: string[];
      [k: string]: unknown;
    };
    naming_quality?: {
      score?: number;
      rationale?: string;
      name_alignment?: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * What works well about the brand identity
   */
  strengths?: string[];
  /**
   * Specific issues requiring work
   */
  improvement_areas?: string[];
  /**
   * Which stages to revisit if score < 75, and what to focus on
   */
  iteration_recommendations?: string;
  /**
   * Does brand meet 75+ overall threshold?
   */
  pass_fail: boolean;
  /**
   * Confidence in the critique (1.0 = very high confidence)
   */
  confidence?: number;
  [k: string]: unknown;
}
