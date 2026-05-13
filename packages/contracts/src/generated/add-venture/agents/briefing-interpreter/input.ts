/* eslint-disable */
/* auto-generated from modules/add-venture/agents/briefing-interpreter/input.schema.json */

export interface BriefingInterpreterInput {
  opportunity: {
    opportunity_id: string;
    title: string;
    problem_statement: string;
    target_segment: string;
    market_size_estimate?: {
      tam?: number;
      sam?: number;
      som?: number;
      confidence?: number;
      [k: string]: unknown;
    };
    competition_landscape?: {
      [k: string]: unknown;
    };
    problem_analysis?: {
      [k: string]: unknown;
    };
    analysis_quality?: {
      confidence_level?: number;
      data_gaps?: string[];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  portfolio_context?: {
    focus_areas?: string[];
    strategic_priorities?: string[];
    capital_allocation?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
