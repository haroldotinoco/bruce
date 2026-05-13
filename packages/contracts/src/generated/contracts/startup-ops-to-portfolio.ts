/* eslint-disable */
/* auto-generated from modules/contracts/startup-ops-to-portfolio.schema.json */

/**
 * Weekly health report from startup-ops module to portfolio module. Encapsulates operational metrics, hypothesis validation status, and anomalies for multi-venture portfolio analysis and strategic decisions.
 */
export interface StartupOpsToPortfolioHandoff {
  /**
   * Venture identifier (UUID v4)
   */
  venture_id: string;
  /**
   * Reporting period
   */
  report_period: {
    start_date: string;
    end_date: string;
    /**
     * How often reports are generated
     */
    report_frequency?: "weekly" | "biweekly" | "monthly";
    [k: string]: unknown;
  };
  /**
   * Multi-dimensional health assessment (0-100)
   */
  health_scores: {
    /**
     * Are new users being activated? (based on activation rate vs target)
     */
    activation: number;
    /**
     * Are users staying? (based on retention rate vs target)
     */
    retention: number;
    /**
     * Is revenue growing? (based on MRR vs target)
     */
    revenue: number;
    /**
     * Is product quality good? (based on bugs, crashes, support tickets)
     */
    product_quality: number;
    /**
     * Is burn rate sustainable? (based on runway, unit economics)
     */
    financial: number;
    /**
     * Is product-market fit evident? (based on NPS, retention, word-of-mouth)
     */
    market_fit: number;
    [k: string]: unknown;
  };
  /**
   * Weighted average of health scores
   */
  overall_health_score: number;
  /**
   * Current operational metrics
   */
  metric_snapshots: {
    /**
     * Daily active users (most recent)
     */
    dau?: number;
    /**
     * Weekly active users
     */
    wau?: number;
    /**
     * Monthly active users
     */
    mau?: number;
    /**
     * DAU trend analysis
     */
    dau_trend?: {
      current?: number;
      previous_week?: number;
      change_pct?: number;
      trend_direction?: "up" | "flat" | "down";
      [k: string]: unknown;
    };
    /**
     * New signups this period
     */
    signups?: number;
    signup_trend?: {
      current?: number;
      previous_week?: number;
      change_pct?: number;
      [k: string]: unknown;
    };
    /**
     * % of signups becoming active
     */
    activation_rate?: number;
    /**
     * Monthly recurring revenue (USD)
     */
    mrr?: number;
    mrr_trend?: {
      current?: number;
      previous_month?: number;
      change_pct?: number;
      [k: string]: unknown;
    };
    /**
     * Annual recurring revenue (USD)
     */
    arr?: number;
    /**
     * Customer acquisition cost (USD)
     */
    cac?: number;
    /**
     * Customer lifetime value (USD)
     */
    ltv?: number;
    /**
     * LTV:CAC ratio
     */
    ltv_cac_ratio?: number;
    /**
     * Monthly retention % (how many month N users were also active month N-1)
     */
    retention_rate?: number;
    /**
     * Monthly churn %
     */
    churn_rate?: number;
    /**
     * Monthly cash burn (USD, negative is positive cash flow)
     */
    burn_rate?: number;
    /**
     * Estimated months of runway at current burn
     */
    runway_months?: number;
    /**
     * Net Promoter Score (if surveyed)
     */
    nps?: number;
    /**
     * Current open support tickets
     */
    support_tickets_open?: number;
    /**
     * Average support response time
     */
    avg_response_time_hours?: number;
    /**
     * Number of critical/blocking issues
     */
    critical_bugs?: number;
    [k: string]: unknown;
  };
  /**
   * Targets for key metrics (from hypothesis)
   */
  metric_targets?: {
    dau_target?: number;
    activation_rate_target?: number;
    retention_rate_target?: number;
    mrr_target?: number;
    churn_rate_target?: number;
    [k: string]: unknown;
  };
  /**
   * Status of core hypothesis being tested
   */
  hypothesis_validation_status: "validating" | "validated" | "invalidated" | "inconclusive";
  /**
   * Detailed hypothesis validation results
   */
  hypothesis_validation_detail?: {
    /**
     * The hypothesis being tested
     */
    hypothesis?: string;
    validation_criteria?: {
      criterion?: string;
      target_value?: number;
      current_value?: number;
      status?: "met" | "not_met" | "in_progress";
      [k: string]: unknown;
    }[];
    /**
     * How confident are we in this conclusion?
     */
    validation_confidence?: number;
    /**
     * If inconclusive, what's needed to resolve?
     */
    next_steps?: string;
    [k: string]: unknown;
  };
  /**
   * Unusual patterns or concerning trends
   */
  anomalies_detected?: {
    /**
     * What is unusual?
     */
    anomaly?: string;
    metric?: string;
    severity?: "low" | "medium" | "high" | "critical";
    detected_date?: string;
    probable_cause?: string;
    investigation_status?: "open" | "investigating" | "root_cause_found" | "resolved";
    suggested_action?: string;
    [k: string]: unknown;
  }[];
  /**
   * Wins and positive developments
   */
  successes_this_period?: string[];
  /**
   * Challenges faced
   */
  challenges_this_period?: {
    challenge?: string;
    impact?: "low" | "medium" | "high";
    mitigation?: string;
    [k: string]: unknown;
  }[];
  /**
   * Recommendations for next period
   */
  recommendations?: {
    recommendation?: string;
    rationale?: string;
    priority?: "low" | "medium" | "high" | "critical";
    /**
     * e.g., 'small', 'medium', 'large'
     */
    effort_estimate?: string;
    [k: string]: unknown;
  }[];
  /**
   * Resources needed to improve metrics
   */
  resource_needs?: {
    /**
     * Additional team members needed
     */
    headcount_increase?: number;
    /**
     * Additional monthly budget (USD)
     */
    budget_increase?: number;
    other_resources?: string[];
    [k: string]: unknown;
  };
  /**
   * Does this require a portfolio/bruce-core decision?
   */
  decision_required?: boolean;
  /**
   * What decision does startup-ops recommend?
   */
  suggested_decision?: "continue" | "iterate" | "scale" | "pause" | "kill" | "escalate_to_human";
  /**
   * Why this decision?
   */
  suggested_decision_rationale?: string;
  /**
   * Confidence in recommendation
   */
  decision_confidence?: number;
  /**
   * When this report was generated
   */
  reported_at: string;
  /**
   * Which startup-ops agent instance generated this
   */
  report_generated_by_agent?: string;
}
