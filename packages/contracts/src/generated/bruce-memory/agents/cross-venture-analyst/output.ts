/* eslint-disable */
/* auto-generated from modules/bruce-memory/agents/cross-venture-analyst/output.schema.json */

export interface CrossVentureAnalystOutput {
  analysis_id: string;
  analysis_type: string;
  ventures_analyzed?: number;
  time_range?: {
    [k: string]: unknown;
  };
  findings: {
    /**
     * Clear, falsifiable pattern statement
     */
    finding: string;
    supporting_ventures: string[];
    confidence: number;
    statistical_note?: string;
    actionable_implication?: string;
    [k: string]: unknown;
  }[];
  /**
   * Observed correlations between variables (NOT causal claims)
   */
  correlations?: {
    variable_a?: string;
    variable_b?: string;
    direction?: "positive" | "negative" | "none";
    strength?: "weak" | "moderate" | "strong";
    caveat?: string;
    [k: string]: unknown;
  }[];
  /**
   * Findings that contradict conventional wisdom or previous assumptions
   */
  counter_intuitive_findings?: {
    finding?: string;
    why_surprising?: string;
    confidence?: number;
    [k: string]: unknown;
  }[];
  /**
   * Populated when data was insufficient for reliable conclusions
   */
  insufficient_data_note?: string;
  [k: string]: unknown;
}
