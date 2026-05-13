/* eslint-disable */
/* auto-generated from modules/bruce-memory/agents/learning-ingestion-agent/input.schema.json */

/**
 * Learning record from any module for ingestion into memory system
 */
export interface LearningIngestionAgentInput {
  learning_record: {
    /**
     * Venture ID (or 'cross-venture' for portfolio-level learnings)
     */
    venture_id: string;
    venture_name?: string;
    /**
     * Which module is reporting this learning
     */
    source_module: "portfolio" | "governance" | "risk-monitor" | "allocation" | "venture-team";
    /**
     * Type of learning
     */
    learning_type?:
      | "hypothesis_test"
      | "market_insight"
      | "gtm_channel"
      | "product_decision"
      | "team_insight"
      | "competitive_observation"
      | "kill_postmortem";
    /**
     * Was this learning a success or failure?
     */
    outcome: "success" | "failure" | "partial_success" | "inconclusive";
    /**
     * Detailed narrative of the learning (what happened, why it matters)
     */
    narrative: string;
    /**
     * Metrics supporting the learning
     */
    quantitative_data?: {
      metric_name?: string;
      value?: number | string;
      baseline?: number | string;
      change_percent?: number;
      [k: string]: unknown;
    };
    /**
     * Confidence in this learning (higher = more certain)
     */
    confidence?: number;
    /**
     * Tags for filtering (e.g., 'B2B SaaS', 'GTM', 'pricing')
     */
    applicability_tags?: string[];
    /**
     * Industry vertical
     */
    sector?: string;
    /**
     * Venture stage when learning was observed
     */
    stage?: "pre-launch" | "early" | "growth" | "mature";
    /**
     * When this learning was observed
     */
    timestamp?: string;
    /**
     * Other ventures with similar learning or context
     */
    related_ventures?: string[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
