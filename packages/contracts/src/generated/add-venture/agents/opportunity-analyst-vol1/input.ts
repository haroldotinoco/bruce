/* eslint-disable */
/* auto-generated from modules/add-venture/agents/opportunity-analyst-vol1/input.schema.json */

export interface OpportunityAnalystVol1Input {
  briefing: {
    venture_id: string;
    opportunity_id: string;
    problem_context: {
      [k: string]: unknown;
    };
    market_context: {
      [k: string]: unknown;
    };
    customer_context: {
      [k: string]: unknown;
    };
    competitive_context?: {
      [k: string]: unknown;
    };
    key_assumptions?: string[];
    data_gaps?: string[];
    [k: string]: unknown;
  };
  analysis_parameters?: {
    depth_level?: "executive_summary" | "standard" | "deep_dive";
    /**
     * Specific market aspects to emphasize
     */
    market_validation_focus?: string[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
