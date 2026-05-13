/* eslint-disable */
/* auto-generated from modules/gtm/agents/analytics-agent/output.schema.json */

/**
 * Campaign performance analysis with interpretation and actionable recommendations
 */
export interface AnalyticsAgentOutput {
  performance_summary: {
    success_metric: string;
    target_value: number;
    achieved_value: number;
    /**
     * Percentage difference from target (positive = exceeding target)
     */
    variance_percent?: number;
    /**
     * Overall campaign status
     */
    status: "exceeding-target" | "on-track" | "at-risk" | "failed";
    /**
     * Statistical confidence in results (0.95 = 95% confidence)
     */
    confidence_level?: number;
    /**
     * % of expected data available (100 = complete)
     */
    data_completeness_percent?: number;
    [k: string]: unknown;
  };
  segment_breakdown?: {
    /**
     * Segment identifier (e.g., 'variant_control', 'audience_segment_1')
     */
    segment_name: string;
    metric_value: number;
    target?: number;
    vs_target: "above-target" | "on-target" | "below-target";
    /**
     * Number of conversions/events in segment
     */
    sample_size?: number;
    trend?: "improving" | "stable" | "declining";
    /**
     * Is this segment statistically significantly different from control?
     */
    statistical_significance?: boolean;
    [k: string]: unknown;
  }[];
  winning_patterns?: {
    /**
     * What's working (e.g., 'messaging emphasizing ROI', 'targeting job title "VP Sales"')
     */
    pattern: string;
    /**
     * Which segments exhibit this pattern
     */
    segments: string[];
    /**
     * % improvement vs. control
     */
    performance_lift: number;
    [k: string]: unknown;
  }[];
  losing_patterns?: {
    /**
     * What's not working
     */
    pattern: string;
    segments: string[];
    /**
     * % underperformance vs. control
     */
    performance_loss: number;
    [k: string]: unknown;
  }[];
  /**
   * Unexpected patterns or anomalies
   */
  surprising_findings?: string[];
  root_cause_analysis?: {
    /**
     * Explanation of successful elements
     */
    what_worked?: string;
    /**
     * Explanation of underperforming elements
     */
    what_didnt_work?: string;
    /**
     * External events/changes that influenced results
     */
    external_factors_impact?: {
      factor?: string;
      estimated_impact?: number;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  /**
   * Narrative summary of campaign performance, winning/losing patterns, and key insights (200-400 words)
   */
  interpretation: string;
  recommendation: {
    /**
     * Recommended action
     */
    action: "scale-campaign" | "pause-campaign" | "pivot-messaging" | "continue-monitoring" | "kill-campaign";
    /**
     * Data-backed rationale for recommendation
     */
    rationale: string;
    /**
     * Specific next actions
     */
    next_steps?: string[];
    /**
     * Additional data points that would improve future analysis
     */
    next_data_to_collect?: string[];
    [k: string]: unknown;
  };
  comparison_to_benchmarks?: {
    /**
     * How does this campaign compare to historical performance?
     */
    vs_historical?: string;
    /**
     * How does performance compare to platform benchmarks?
     */
    vs_platform_average?: string;
    /**
     * How does it compare to industry benchmarks?
     */
    vs_industry?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
