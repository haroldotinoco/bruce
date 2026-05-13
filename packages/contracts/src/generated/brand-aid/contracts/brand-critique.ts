/* eslint-disable */
/* auto-generated from modules/brand-aid/contracts/brand-critique.schema.json */

export interface BrandCritique {
  scores: {
    strategic_alignment: number;
    distinctiveness: number;
    visual_coherence: number;
    naming_quality: number;
    overall: number;
    [k: string]: unknown;
  };
  dimension_analysis?: {
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
      [k: string]: unknown;
    };
    naming_quality?: {
      score?: number;
      rationale?: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  strengths?: string[];
  improvement_areas?: string[];
  iteration_recommendations?: string;
  /**
   * True if score >= 75 (passing)
   */
  pass_fail: boolean;
  /**
   * Confidence in the critique
   */
  confidence?: number;
  [k: string]: unknown;
}
