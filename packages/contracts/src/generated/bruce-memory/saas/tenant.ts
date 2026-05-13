/* eslint-disable */
/* auto-generated from modules/bruce-memory/saas/tenant.schema.json */

/**
 * JSON Schema defining tenant-specific configuration and metadata for BruceMemory module
 */
export interface BruceMemoryTenantContextSchema {
  /**
   * Unique identifier for the account
   */
  account_id: string;
  /**
   * Active plan tier determining BruceMemory capabilities
   */
  plan_type: "free" | "pro" | "enterprise";
  /**
   * Timestamp when BruceMemory was activated for this account
   */
  created_at: string;
  /**
   * Dedicated namespace in vector database (e.g., Pinecone namespace = account_id)
   */
  vector_db_namespace: string;
  /**
   * Current size and limits of learning corpus
   */
  learning_corpus_size?: {
    /**
     * Total number of learning records in corpus
     */
    total_learnings?: number;
    /**
     * Total storage used in vector database
     */
    storage_bytes?: number;
    /**
     * Maximum allowed storage based on plan
     */
    storage_limit_bytes?: number;
    /**
     * Number of learnings allowed per month
     */
    monthly_ingestion_quota?: number;
    /**
     * Learnings ingested this month
     */
    monthly_ingestion_used?: number;
    [k: string]: unknown;
  };
  /**
   * Minimum confidence score (0-1) for patterns to be surfaced in queries
   */
  pattern_confidence_threshold?: number;
  /**
   * API query rate limiting configuration
   */
  query_rate_limit?: {
    /**
     * Maximum queries per month
     */
    monthly_quota?: number;
    /**
     * Queries executed this month
     */
    monthly_used?: number;
    /**
     * Maximum requests per second
     */
    requests_per_second?: number;
    /**
     * Maximum requests per minute
     */
    requests_per_minute?: number;
    [k: string]: unknown;
  };
  /**
   * Whether account has access to cross-venture pattern analysis (Enterprise only)
   */
  cross_venture_analysis_enabled?: boolean;
  /**
   * Whether account has opted into anonymized global pattern sharing
   */
  cross_venture_consent?: boolean;
  /**
   * Frequency of automatic pattern extraction runs
   */
  pattern_extraction_cadence?: "manual" | "weekly" | "daily";
  /**
   * Frequency of intelligence synthesis compilation
   */
  intelligence_synthesis_cadence?: "manual" | "weekly" | "monthly";
  /**
   * List of ventures associated with this account
   */
  ventures?: {
    /**
     * Unique venture identifier
     */
    venture_id?: string;
    /**
     * Human-readable venture name
     */
    venture_name?: string;
    /**
     * Number of learning records for this venture
     */
    learning_count?: number;
    /**
     * When this venture was added to the account
     */
    added_at?: string;
    [k: string]: unknown;
  }[];
  /**
   * Active API keys for this tenant
   */
  api_keys?: {
    /**
     * Primary API key for authentication
     */
    primary_key?: string;
    /**
     * Secondary API key for rotation/backup
     */
    secondary_key?: string;
    [k: string]: unknown;
  };
  /**
   * Webhook URLs for event notifications
   */
  webhook_endpoints?: {
    endpoint_url?: string;
    /**
     * Event types to subscribe to
     */
    events?: string[];
    active?: boolean;
    [k: string]: unknown;
  }[];
  /**
   * Timestamp of most recent intelligence synthesis
   */
  last_synthesis_at?: string;
  /**
   * Timestamp of most recent pattern extraction
   */
  last_pattern_extraction_at?: string;
  /**
   * Feature flags for experimental/custom features
   */
  feature_flags?: {
    [k: string]: boolean;
  };
  /**
   * Custom metadata and tags
   */
  metadata?: {
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
