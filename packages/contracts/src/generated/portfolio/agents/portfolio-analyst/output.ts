/* eslint-disable */
/* auto-generated from modules/portfolio/agents/portfolio-analyst/output.schema.json */

/**
 * Comprehensive portfolio snapshot with rankings, patterns, and outliers
 */
export interface PortfolioAnalysisOutput {
  portfolio_snapshot: {
    /**
     * When analysis was completed
     */
    review_timestamp: string;
    /**
     * Reference to input review cycle
     */
    review_cycle_id: string;
    /**
     * Total ventures analyzed
     */
    total_ventures: number;
    /**
     * Ventures ranked by health score (highest first)
     */
    ventures_ranked: {
      venture_id: string;
      name: string;
      /**
       * Overall rank (1 = healthiest)
       */
      rank: number;
      /**
       * Composite health score
       */
      health_score: number;
      /**
       * Score breakdown by dimension
       */
      health_dimensions: {
        traction_score?: number;
        financial_score?: number;
        team_score?: number;
        market_score?: number;
        [k: string]: unknown;
      };
      /**
       * Health trend vs previous period
       */
      trend?: "improving" | "stable" | "declining";
      /**
       * Points change from previous health score
       */
      score_change?: number;
      /**
       * Confidence in this score (% of dimensions with current data)
       */
      confidence: number;
      /**
       * Key metrics supporting the score
       */
      critical_metrics?: {
        metric?: string;
        value?: number | string;
        status?: "healthy" | "warning" | "critical";
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    }[];
    /**
     * Cross-venture patterns identified
     */
    patterns?: {
      pattern_id?: string;
      /**
       * Clear statement of the pattern
       */
      description?: string;
      /**
       * Type of pattern
       */
      type?: "success_factor" | "blocker" | "correlation" | "timing";
      /**
       * Venture IDs exhibiting this pattern
       */
      affected_ventures?: string[];
      affected_count?: number;
      /**
       * Quantitative or qualitative evidence
       */
      evidence?: string;
      confidence?: number;
      /**
       * Suggested action based on pattern
       */
      recommendation?: string;
      [k: string]: unknown;
    }[];
    /**
     * Ventures deviating significantly from expected performance
     */
    outliers?: {
      venture_id?: string;
      name?: string;
      /**
       * Type of deviation
       */
      outlier_type?: "positive_surprise" | "negative_surprise" | "trajectory_mismatch" | "risk_emergence";
      /**
       * What is unusual about this venture
       */
      description?: string;
      /**
       * Supporting data
       */
      evidence?: string;
      /**
       * How urgent this outlier is
       */
      priority?: "low" | "medium" | "high";
      /**
       * Suggested response
       */
      recommended_action?: string;
      [k: string]: unknown;
    }[];
    data_quality_summary: {
      /**
       * % of health metrics across all ventures with current data
       */
      completeness_percent: number;
      /**
       * % of fields >14 days old
       */
      stale_fields_percent: number;
      ventures_with_issues?: {
        venture_id?: string;
        issue?: string;
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    };
    /**
     * Overall confidence in this analysis (higher = more complete data)
     */
    analyst_confidence: number;
    /**
     * Decisions that should be prioritized in governance cycle
     */
    next_decision_focus?: string[];
    /**
     * Additional context or caveats
     */
    analysis_notes?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
