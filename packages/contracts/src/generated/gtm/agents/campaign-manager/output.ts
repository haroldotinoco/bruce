/* eslint-disable */
/* auto-generated from modules/gtm/agents/campaign-manager/output.schema.json */

/**
 * Campaign brief, A/B test plan, budget allocation, and daily monitoring instructions
 */
export interface CampaignManagerOutput {
  campaign_brief: {
    /**
     * Unique campaign identifier (e.g., 'CAMP-2024-001')
     */
    campaign_id: string;
    /**
     * Campaign objective in 1-2 sentences
     */
    objective: string;
    /**
     * Target persona and segment
     */
    target_audience: string;
    /**
     * Primary metric (e.g., 'Cost per qualified lead')
     */
    success_metric: string;
    /**
     * Target value for success metric
     */
    target_kpi: number;
    budget_usd?: number;
    timeline_days?: number;
    launch_date?: string;
    /**
     * Date when we'll make scale/kill decision
     */
    decision_date?: string;
    [k: string]: unknown;
  };
  ab_test_plan?: {
    /**
     * What's being tested
     */
    variable_tested?: string;
    control_description?: string;
    variant_description?: string;
    /**
     * Budget split between control (%) and variant (%)
     */
    split_percentage?: {
      control?: number;
      variant?: number;
      [k: string]: unknown;
    };
    /**
     * Minimum conversions needed for statistical significance
     */
    sample_size_needed?: number;
    /**
     * 0.95 = 95% confidence
     */
    confidence_level?: number;
    /**
     * Estimated days to reach statistical significance
     */
    expected_days_to_significance?: number;
    [k: string]: unknown;
  };
  budget_allocation: {
    total_budget: number;
    /**
     * Budget by segment/audience/variant
     */
    allocation_breakdown: {
      [k: string]: {
        budget_usd?: number;
        percentage?: number;
        daily_budget?: number;
        purpose?: string;
        [k: string]: unknown;
      };
    };
    /**
     * Budget held for scaling winning variants
     */
    contingency_reserve?: number;
    [k: string]: unknown;
  };
  /**
   * Pre-launch tasks
   */
  launch_checklist?: {
    item: string;
    owner: string;
    deadline: string;
    status?: "pending" | "in-progress" | "completed";
    [k: string]: unknown;
  }[];
  daily_monitoring_plan: {
    /**
     * Metrics checked daily (e.g., 'spend vs. pace', 'CTR vs. benchmark')
     */
    metrics_to_monitor: string[];
    /**
     * How often to review metrics
     */
    check_frequency: "hourly" | "daily" | "daily-eod" | "twice-daily";
    alert_thresholds: {
      metric: string;
      threshold_value: number;
      action: string;
      severity?: "info" | "warning" | "critical";
      [k: string]: unknown;
    }[];
    /**
     * Conditions under which to pause campaign immediately
     */
    pause_criteria?: string;
    /**
     * Who to notify and when
     */
    escalation_process?: string;
    [k: string]: unknown;
  };
  success_thresholds?: {
    /**
     * Performance level at which campaign is killed (e.g., CAC 2x target)
     */
    kill_threshold?: number;
    /**
     * Performance level at which campaign is paused for review
     */
    pause_threshold?: number;
    /**
     * Performance level at which campaign is scaled
     */
    scale_threshold?: number;
    [k: string]: unknown;
  };
  reporting_cadence?: {
    daily_snapshot?: string;
    weekly_review?: string;
    final_report_date?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
