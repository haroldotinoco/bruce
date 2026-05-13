/* eslint-disable */
/* auto-generated from modules/bruce-memory/saas/billing-events.schema.json */

/**
 * Billing event definitions for BruceMemory operations and resource consumption tracking
 */
export interface BruceMemoryBillingEventsSchema {
  "bruce-memory.learning.ingested"?: LearningRecordIngested;
  "bruce-memory.pattern.extracted"?: PatternExtracted;
  "bruce-memory.query.executed"?: QueryExecuted;
  "bruce-memory.synthesis.completed"?: IntelligenceSynthesisCompleted;
  "bruce-memory.cross-venture-analysis.completed"?: CrossVentureAnalysisCompleted;
  "bruce-memory.namespace.provisioned"?: VectorDBNamespaceProvisioned;
  [k: string]: unknown;
}
/**
 * Emitted when a new learning record is successfully ingested into the learning corpus
 */
export interface LearningRecordIngested {
  /**
   * Unique event identifier
   */
  event_id: string;
  /**
   * Event type identifier
   */
  event_type?: "bruce-memory.learning.ingested";
  /**
   * When the learning was ingested
   */
  timestamp: string;
  /**
   * Account performing the ingestion
   */
  account_id: string;
  /**
   * Venture the learning belongs to
   */
  venture_id: string;
  /**
   * ID of ingested learning record
   */
  learning_id?: string;
  /**
   * Size of learning content in bytes
   */
  content_length_bytes?: number;
  /**
   * Learning category
   */
  category?:
    | "success"
    | "failure"
    | "pivot"
    | "market_insight"
    | "technical_learning"
    | "partnership"
    | "fundraising"
    | "team_dynamics"
    | "product_launch"
    | "go_to_market";
  /**
   * Number of billable units (1 per learning record)
   */
  billable_units: number;
  /**
   * Account plan type at time of ingestion
   */
  plan_type?: "free" | "pro" | "enterprise";
  /**
   * Source of ingestion
   */
  source?: "api" | "web_ui" | "import" | "batch";
  [k: string]: unknown;
}
/**
 * Emitted when pattern extraction identifies a new pattern from the learning corpus
 */
export interface PatternExtracted {
  /**
   * Unique event identifier
   */
  event_id: string;
  /**
   * Event type identifier
   */
  event_type?: "bruce-memory.pattern.extracted";
  /**
   * When the pattern was extracted
   */
  timestamp: string;
  /**
   * Account owning the pattern
   */
  account_id: string;
  /**
   * ID of extracted pattern
   */
  pattern_id: string;
  /**
   * Pattern extraction job ID
   */
  job_id?: string;
  /**
   * Pattern category
   */
  pattern_category?:
    | "success_factor"
    | "risk_indicator"
    | "market_dynamic"
    | "technical_best_practice"
    | "operational_insight"
    | "team_insight";
  /**
   * Number of ventures involved in pattern (1 for venture-specific, >1 for cross-venture)
   */
  venture_count?: number;
  /**
   * Number of learnings supporting this pattern
   */
  learning_count?: number;
  /**
   * Confidence score of extracted pattern
   */
  confidence_score?: number;
  /**
   * Extraction frequency
   */
  extraction_cadence?: "weekly" | "daily" | "manual";
  /**
   * Number of billable units (1 per pattern extracted)
   */
  billable_units: number;
  /**
   * Account plan type at time of extraction
   */
  plan_type?: "free" | "pro" | "enterprise";
  [k: string]: unknown;
}
/**
 * Emitted when a natural language query is executed against the pattern library
 */
export interface QueryExecuted {
  /**
   * Unique event identifier
   */
  event_id: string;
  /**
   * Event type identifier
   */
  event_type?: "bruce-memory.query.executed";
  /**
   * When the query was executed
   */
  timestamp: string;
  /**
   * Account executing the query
   */
  account_id: string;
  /**
   * Unique query execution ID
   */
  query_id?: string;
  /**
   * Length of query string in characters
   */
  query_length?: number;
  /**
   * Number of patterns returned
   */
  results_returned?: number;
  /**
   * Query execution time in milliseconds
   */
  execution_time_ms?: number;
  /**
   * Filters used in query
   */
  filters_applied?: {
    venture_filter?: boolean;
    category_filter?: boolean;
    confidence_filter?: boolean;
    [k: string]: unknown;
  };
  /**
   * Number of billable units (1 per query)
   */
  billable_units: number;
  /**
   * Account plan type at time of query
   */
  plan_type?: "free" | "pro" | "enterprise";
  [k: string]: unknown;
}
/**
 * Emitted when an intelligence synthesis report is successfully generated
 */
export interface IntelligenceSynthesisCompleted {
  /**
   * Unique event identifier
   */
  event_id: string;
  /**
   * Event type identifier
   */
  event_type?: "bruce-memory.synthesis.completed";
  /**
   * When the synthesis completed
   */
  timestamp: string;
  /**
   * Account for which synthesis was generated
   */
  account_id: string;
  /**
   * ID of synthesis report
   */
  synthesis_id: string;
  /**
   * Type of synthesis trigger
   */
  synthesis_type?: "scheduled" | "on_demand" | "automated";
  /**
   * Synthesis period
   */
  period?: "weekly" | "monthly" | "custom";
  /**
   * Start of analysis period
   */
  period_start?: string;
  /**
   * End of analysis period
   */
  period_end?: string;
  /**
   * Number of learnings included in synthesis
   */
  learnings_analyzed?: number;
  /**
   * Number of patterns analyzed
   */
  patterns_analyzed?: number;
  /**
   * Number of ventures included
   */
  ventures_included?: number;
  /**
   * Time to generate synthesis in milliseconds
   */
  execution_time_ms?: number;
  /**
   * Number of billable units (1 per synthesis)
   */
  billable_units: number;
  /**
   * Account plan type at time of synthesis
   */
  plan_type?: "free" | "pro" | "enterprise";
  [k: string]: unknown;
}
/**
 * Emitted when a cross-venture analysis job is successfully completed (Enterprise only)
 */
export interface CrossVentureAnalysisCompleted {
  /**
   * Unique event identifier
   */
  event_id: string;
  /**
   * Event type identifier
   */
  event_type?: "bruce-memory.cross-venture-analysis.completed";
  /**
   * When the analysis completed
   */
  timestamp: string;
  /**
   * Enterprise account performing analysis
   */
  account_id: string;
  /**
   * ID of analysis job
   */
  analysis_id: string;
  /**
   * Scope of analysis
   */
  analysis_scope?: "all_ventures" | "selected_ventures" | "by_category";
  /**
   * Number of ventures included
   */
  ventures_analyzed?: number;
  /**
   * New cross-venture patterns identified
   */
  patterns_identified?: number;
  /**
   * Total learnings analyzed
   */
  learnings_processed?: number;
  /**
   * Total execution time in milliseconds
   */
  execution_time_ms?: number;
  /**
   * Whether anonymized global patterns were included
   */
  included_anonymized_global?: boolean;
  /**
   * Number of billable units (ventures analyzed)
   */
  billable_units: number;
  /**
   * Account plan type (always enterprise)
   */
  plan_type?: "enterprise";
  [k: string]: unknown;
}
/**
 * Emitted when a new vector database namespace is provisioned for an account
 */
export interface VectorDBNamespaceProvisioned {
  /**
   * Unique event identifier
   */
  event_id: string;
  /**
   * Event type identifier
   */
  event_type?: "bruce-memory.namespace.provisioned";
  /**
   * When namespace was provisioned
   */
  timestamp: string;
  /**
   * Account for which namespace was created
   */
  account_id: string;
  /**
   * Namespace identifier
   */
  namespace_id: string;
  /**
   * Vector database provider
   */
  provider?: "pinecone" | "weaviate" | "milvus";
  /**
   * Cloud region where namespace is hosted
   */
  region?: string;
  /**
   * Storage limit allocated to namespace
   */
  storage_limit_gb?: number;
  /**
   * Reason namespace was provisioned
   */
  trigger_reason?: "plan_upgrade" | "manual_opt_in" | "plan_downgrade_resize";
  /**
   * Number of billable units (1 per namespace)
   */
  billable_units: number;
  /**
   * Account plan type at time of provisioning
   */
  plan_type?: "free" | "pro" | "enterprise";
  [k: string]: unknown;
}
