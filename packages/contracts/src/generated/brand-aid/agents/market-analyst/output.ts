/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/market-analyst/output.schema.json */

export interface MarketAnalysisOutput {
  /**
   * Positioning of each competitor analyzed
   */
  competitor_positioning_map: {
    competitor_name: string;
    stated_positioning: string;
    implied_positioning?: string;
    target_segment?: string;
    key_messages?: string[];
    visual_identity_tone?: string;
    [k: string]: unknown;
  }[];
  /**
   * Unoccupied positioning spaces and underserved segments
   */
  white_space_opportunities: {
    opportunity?: string;
    rationale?: string;
    customer_need?: string;
    competitive_gap?: string;
    [k: string]: unknown;
  }[];
  /**
   * Aggregated customer feedback and sentiment
   */
  customer_sentiment_summary?: {
    positive_themes?: string[];
    negative_themes?: string[];
    unmet_needs?: string[];
    data_sources?: string[];
    [k: string]: unknown;
  };
  /**
   * How competitors communicate and where voice differentiation is possible
   */
  tone_and_voice_analysis: {
    formality_spectrum?: string;
    emotional_register?: string;
    common_linguistic_patterns?: string[];
    differentiation_opportunity?: string;
    [k: string]: unknown;
  };
  /**
   * Category-level trends and shifts
   */
  emerging_trends?: {
    trend?: string;
    evidence?: string;
    implications?: string;
    [k: string]: unknown;
  }[];
  /**
   * Specific positioning gaps the venture could own (non-overlapping with competitors)
   */
  strategic_gaps: string[];
  /**
   * What could not be researched and why
   */
  research_limitations?: string;
  [k: string]: unknown;
}
