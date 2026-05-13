/* eslint-disable */
/* auto-generated from modules/opportunity/agents/scoring-agent/input.schema.json */

export interface ScoringAgentInput {
  opportunity: {
    opportunity_id?: string;
    title?: string;
    market_size_estimate?: {
      tam?: number;
      sam?: number;
      som?: number;
      confidence?: number;
      [k: string]: unknown;
    };
    problem_analysis?: {
      pain_severity?: string;
      market_readiness?: string;
      [k: string]: unknown;
    };
    competition_landscape?: {
      direct_competitors?: unknown[];
      competitive_intensity?: string;
      [k: string]: unknown;
    };
    analysis_quality?: {
      confidence_level?: number;
      data_gaps?: unknown[];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  scoring_context?: {
    portfolio_focus_areas?: string[];
    strategic_priorities?: string[];
    apply_market_signals?: boolean;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
