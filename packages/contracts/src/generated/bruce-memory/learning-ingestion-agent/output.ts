/* eslint-disable */
/* auto-generated from modules/bruce-memory/learning-ingestion-agent/output.schema.json */

/**
 * Result of learning record ingestion and storage
 */
export interface LearningIngestionOutput {
  ingestion_result: {
    /**
     * Was record successfully ingested?
     */
    success: boolean;
    /**
     * Unique ID assigned to this learning record
     */
    learning_id: string;
    /**
     * The record as stored (after normalization)
     */
    normalized_record?: {
      learning_id?: string;
      venture_id?: string;
      venture_name?: string;
      source_module?: string;
      learning_type?: string;
      outcome?: string;
      narrative?: string;
      confidence?: number;
      quality_score?: number;
      tags?: string[];
      sector?: string;
      stage?: string;
      stored_timestamp?: string;
      observed_timestamp?: string;
      [k: string]: unknown;
    };
    /**
     * Quality assessment of the learning record
     */
    quality_score?: number;
    /**
     * Any transformations or corrections applied during normalization
     */
    normalization_notes?: string;
    /**
     * Similar learnings found in existing corpus
     */
    duplicates_detected?: {
      existing_learning_id?: string;
      similarity_score?: number;
      difference?: string;
      [k: string]: unknown;
    }[];
    /**
     * Does this record require manual review?
     */
    requires_manual_review?: boolean;
    /**
     * Why manual review is needed (if required)
     */
    review_reason?: string;
    /**
     * Status of vector embedding for similarity search
     */
    vector_embedding_status?: "queued" | "processing" | "completed" | "failed";
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
