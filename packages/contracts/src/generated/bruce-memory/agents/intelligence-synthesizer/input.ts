/* eslint-disable */
/* auto-generated from modules/bruce-memory/agents/intelligence-synthesizer/input.schema.json */

export interface IntelligenceSynthesizerInput {
  /**
   * Start of synthesis period
   */
  period_start: string;
  /**
   * End of synthesis period
   */
  period_end: string;
  /**
   * Only consider patterns created after this date
   */
  patterns_since?: string;
  /**
   * Minimum confidence threshold for inclusion in key_patterns
   */
  min_confidence?: number;
  /**
   * Maximum key patterns to include (ranked by confidence × recency)
   */
  max_patterns?: number;
  /**
   * Portfolio context for strategic implications
   */
  portfolio_summary?: {
    total_ventures?: number;
    ventures_by_stage?: {
      [k: string]: unknown;
    };
    ventures_by_segment?: {
      [k: string]: unknown;
    };
    active_ventures?: number;
    killed_ventures?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
