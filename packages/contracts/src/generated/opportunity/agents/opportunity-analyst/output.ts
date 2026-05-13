/* eslint-disable */
/* auto-generated from modules/opportunity/agents/opportunity-analyst/output.schema.json */

/**
 * Include market_size_estimate at the document root (numeric tam/sam/som in USD). activities.ts hoists from deep_analysis if needed and coerces strings before scoring.
 */
export interface OpportunityAnalystOutput {
  opportunity_id?: string;
  title?: string;
  problem_statement?: string;
  /**
   * TAM/SAM/SOM in USD at document root when possible (not only under deep_analysis). Prefer numeric tam, sam, som; pipeline coerces strings and hoists from deep_analysis if missing here.
   */
  market_size_estimate?: {
    [k: string]: unknown;
  };
  deep_analysis?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
