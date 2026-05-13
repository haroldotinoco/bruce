/* eslint-disable */
/* auto-generated from modules/opportunity/agents/opportunity-analyst/input.schema.json */

export interface OpportunityAnalystInput {
  raw_opportunity: {
    opportunity_title: string;
    problem_statement: string;
    target_segment: string;
    pain_points?: string[];
    sources?: {
      url?: string;
      source_title?: string;
      source_type?: string;
      [k: string]: unknown;
    }[];
    discovery_confidence?: number;
    [k: string]: unknown;
  };
  analysis_focus?: {
    depth_level?: "quick_screen" | "standard" | "deep_dive";
    priority_areas?: string[];
    [k: string]: unknown;
  };
  /**
   * Present when the pipeline re-runs analysis after a sub-threshold score; address feedback_to_address.
   */
  quality_retry?: {
    attempt?: number;
    previous_score?: number;
    feedback_to_address?: string;
    prior_scoring_summary?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
