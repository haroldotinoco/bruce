/* eslint-disable */
/* auto-generated from modules/opportunity/agents/prioritization-agent/output.schema.json */

/**
 * Loose validation; activities.ts merges ranked_opportunities if missing.
 */
export interface PrioritizationAgentOutput {
  prioritization_id?: string;
  ranked_opportunities?: unknown[];
  /**
   * LLMs often return notes as string[]; validation is loose; activities.ts coerces to strings.
   */
  summary?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
