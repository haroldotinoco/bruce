/* eslint-disable */
/* auto-generated from modules/bruce-memory/pattern-extractor/input.schema.json */

/**
 * Learning corpus for weekly pattern extraction
 */
export interface PatternExtractorInput {
  extraction_parameters: {
    analysis_period?: "weekly" | "monthly";
    /**
     * How many weeks of learnings to analyze
     */
    lookback_weeks?: number;
    /**
     * Minimum ventures required for pattern
     */
    min_pattern_evidence?: number;
    /**
     * Minimum confidence threshold
     */
    min_confidence?: number;
    /**
     * Optional sector focus (if empty, analyze all)
     */
    focus_sectors?: string[];
    /**
     * Optional learning types to focus on
     */
    focus_learning_types?: string[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
