/* eslint-disable */
/* auto-generated from modules/bruce-memory/pattern-extractor/output.schema.json */

/**
 * Extracted patterns from learning corpus analysis
 */
export interface PatternExtractorOutput {
  pattern_extraction_result: {
    extraction_timestamp?: string;
    learnings_analyzed?: number;
    extracted_patterns?: {
      pattern_id?: string;
      /**
       * Clear, concise pattern statement
       */
      statement?: string;
      /**
       * Type of pattern
       */
      pattern_type?: "success_factor" | "blocker" | "correlation" | "timing" | "market_insight";
      /**
       * Ventures exhibiting this pattern
       */
      evidence_ventures?: string[];
      evidence_count?: number;
      confidence?: number;
      /**
       * Magnitude of pattern impact
       */
      effect_size?: "small" | "medium" | "large";
      applicability_scope?: {
        sectors?: string[];
        stages?: string[];
        geographies?: string[];
        [k: string]: unknown;
      };
      /**
       * Conditions and limitations
       */
      caveats?: string[];
      /**
       * Summary of supporting learnings
       */
      supporting_evidence?: string;
      /**
       * Exceptions to this pattern
       */
      counter_examples?: string[];
      [k: string]: unknown;
    }[];
    /**
     * Patterns that may be outdated
     */
    pattern_retirement_candidates?: {
      pattern_id?: string;
      reason?: string;
      [k: string]: unknown;
    }[];
    /**
     * Potential patterns not yet meeting publication threshold
     */
    emerging_patterns?: {
      pattern_statement?: string;
      evidence_count?: number;
      confidence?: number;
      reason_not_published?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
