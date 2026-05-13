/* eslint-disable */
/* auto-generated from modules/opportunity/agents/scoring-agent/output.schema.json */

/**
 * Loose validation; activities.ts merges defaults for downstream steps.
 */
export interface ScoringAgentOutput {
  opportunity_id?: string;
  total_score?: number;
  scored_opportunities?: unknown[];
  dimensions?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
