/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/brand-critic/input.schema.json */

export interface BrandCriticInput {
  /**
   * Complete brand strategy output
   */
  brand_strategy: {
    [k: string]: unknown;
  };
  /**
   * Complete visual system output
   */
  visual_system: {
    [k: string]: unknown;
  };
  /**
   * Logo concepts and recommended logo output
   */
  logo_concepts: {
    [k: string]: unknown;
  };
  /**
   * Top naming candidates with scores
   */
  naming_candidates: {
    [k: string]: unknown;
  };
  /**
   * Market analysis for competitive positioning reference
   */
  market_analysis?: {
    [k: string]: unknown;
  };
  /**
   * Curated visual clusters and source references used to assess moodboard fit
   */
  moodboard?: {
    [k: string]: unknown;
  };
  /**
   * Exploratory raster logo studies generated before final SVG production
   */
  logo_studies?: {
    [k: string]: unknown;
  }[];
  evaluation_criteria?: {
    strategic_alignment_weight?: number;
    distinctiveness_weight?: number;
    visual_coherence_weight?: number;
    naming_quality_weight?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
