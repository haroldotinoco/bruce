/* eslint-disable */
/* auto-generated from modules/bruce-memory/agents/query-agent/input.schema.json */

export interface QueryAgentInput {
  /**
   * Unique query identifier
   */
  query_id: string;
  /**
   * Natural language question about patterns in memory
   */
  question: string;
  /**
   * Optional context to narrow search
   */
  context?: {
    venture_id?: string;
    current_stage?: string;
    market_segment?: string;
    [k: string]: unknown;
  };
  filters?: {
    min_confidence?: number;
    market_segments?: string[];
    stages?: string[];
    source_modules?: string[];
    [k: string]: unknown;
  };
  /**
   * Which BruceAI module is requesting this query
   */
  requested_by_module: string;
  requested_at?: string;
  [k: string]: unknown;
}
