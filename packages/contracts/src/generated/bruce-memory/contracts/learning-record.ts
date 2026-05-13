/* eslint-disable */
/* auto-generated from modules/bruce-memory/contracts/learning-record.schema.json */

/**
 * A single learning extracted from a venture event or outcome
 */
export interface LearningRecord {
  learning_id: string;
  source_module:
    | "opportunity"
    | "add-venture"
    | "brand-aid"
    | "builder"
    | "gtm"
    | "startup-ops"
    | "portfolio"
    | "bruce-core";
  venture_id: string;
  venture_name?: string;
  venture_stage_at_time?:
    | "structured"
    | "built"
    | "launched"
    | "operating"
    | "iterating"
    | "scaling"
    | "paused"
    | "killed";
  market_segment?: string;
  business_model_type?: string;
  /**
   * Clear, plain-language description of what was learned
   */
  learning_narrative: string;
  /**
   * At least one measurable data point supporting the learning
   */
  quantitative_data?: {
    [k: string]: unknown;
  };
  venture_outcome?: "success" | "failure" | "ongoing";
  /**
   * Domain tags: e.g. gtm, unit-economics, product, market-timing
   */
  tags?: string[];
  /**
   * Submitter confidence in this learning (0.4 minimum to store)
   */
  confidence: number;
  created_at: string;
  created_by_event_id?: string;
  /**
   * Vector DB reference after embedding
   */
  embedding_ref?: string;
  [k: string]: unknown;
}
