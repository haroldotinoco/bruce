/* eslint-disable */
/* auto-generated from modules/add-venture/agents/customer-market-architect/input.schema.json */

export interface CustomerMarketArchitectInput {
  venture_id: string;
  opportunity_id: string;
  /**
   * Standardized briefing from briefing-interpreter
   */
  briefing: {
    [k: string]: unknown;
  };
  /**
   * Volume 1: Opportunity Diagnosis from opportunity-analyst-vol1
   */
  vol_1_opportunity: {
    problem_anatomy?: string;
    market_readiness?: string;
    addressable_market?: string;
    macro_context?: string;
    opportunity_thesis?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
