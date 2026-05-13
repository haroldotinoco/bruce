/* eslint-disable */
/* auto-generated from modules/contracts/portfolio-to-bruce-core.schema.json */

/**
 * Handoff from portfolio module to bruce-core module. Portfolio aggregates multi-venture health data and recommends strategic decisions. Bruce-core reviews and executes those decisions, updating venture states and resource allocation.
 */
export interface PortfolioToBruceCoreHandoff {
  /**
   * Venture identifier (UUID v4)
   */
  venture_id: string;
  /**
   * When this review was conducted
   */
  review_date: string;
  /**
   * Period being reviewed
   */
  review_period?: {
    start_date?: string;
    end_date?: string;
    [k: string]: unknown;
  };
  /**
   * Current venture status
   */
  venture_status:
    | "generated"
    | "qualified"
    | "structured"
    | "built"
    | "launched"
    | "operating"
    | "iterating"
    | "scaling"
    | "paused"
    | "killed";
  /**
   * Recommended decision for this venture
   */
  decision: "scale" | "iterate" | "pause" | "kill" | "continue";
  /**
   * Type of decision being recommended
   */
  decision_type?:
    | "continue_current_path"
    | "increase_investment"
    | "shift_hypothesis"
    | "temporary_pause"
    | "permanent_termination";
  /**
   * Explanation for recommendation
   */
  rationale: string;
  /**
   * Health scores driving this decision
   */
  supporting_health_scores?: {
    activation?: number;
    retention?: number;
    revenue?: number;
    product_quality?: number;
    financial?: number;
    market_fit?: number;
    [k: string]: unknown;
  };
  /**
   * Key metrics reviewed
   */
  supporting_metrics?: {
    dau?: number;
    mau?: number;
    mrr?: number;
    arr?: number;
    retention_rate?: number;
    churn_rate?: number;
    burn_rate?: number;
    runway_months?: number;
    cac?: number;
    ltv?: number;
    ltv_cac_ratio?: number;
    [k: string]: unknown;
  };
  /**
   * How are metrics trending?
   */
  trend_analysis?: {
    user_growth_trend?: "accelerating" | "steady" | "decelerating" | "contracting";
    retention_trend?: "improving" | "stable" | "declining";
    revenue_trend?: "growing" | "flat" | "declining";
    financial_runway_trend?: "improving" | "stable" | "worsening";
    [k: string]: unknown;
  };
  /**
   * Confidence in this recommendation
   */
  confidence_score: number;
  /**
   * Risks to monitor
   */
  risk_flags?: {
    risk?: string;
    severity?: "low" | "medium" | "high" | "critical";
    mitigation?: string;
    [k: string]: unknown;
  }[];
  /**
   * If decision is SCALE, what does that look like?
   */
  if_scale_decision?: {
    /**
     * Why should this be scaled?
     */
    justification?: string;
    /**
     * What is working well?
     */
    key_strengths?: string[];
    resource_increase?: {
      /**
       * Add X engineers/team members
       */
      headcount_delta?: number;
      /**
       * Increase monthly budget by
       */
      budget_delta_usd?: number;
      [k: string]: unknown;
    };
    /**
     * What should be achieved in next period?
     */
    next_milestones?: string[];
    /**
     * What would validate this scaling decision?
     */
    success_metrics?: {
      metric?: string;
      target_value?: number;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  /**
   * If decision is ITERATE, what needs to change?
   */
  if_iterate_decision?: {
    /**
     * Why not scale yet?
     */
    justification?: string;
    /**
     * What's limiting growth?
     */
    current_bottleneck?: string;
    /**
     * What should be tested?
     */
    experiments_to_run?: {
      experiment?: string;
      hypothesis?: string;
      success_criteria?: string;
      timeline_weeks?: number;
      [k: string]: unknown;
    }[];
    resource_allocation?: {
      headcount_delta?: number;
      budget_delta_usd?: number;
      [k: string]: unknown;
    };
    /**
     * When should this be reassessed?
     */
    next_review_date?: string;
    [k: string]: unknown;
  };
  /**
   * If decision is PAUSE, what's the plan?
   */
  if_pause_decision?: {
    /**
     * Why pause?
     */
    justification?: string;
    /**
     * How long to pause?
     */
    pause_duration_weeks?: number;
    /**
     * What should be accomplished during pause?
     */
    pause_objectives?: string[];
    resource_reduction?: {
      headcount_reduction?: number;
      budget_reduction_usd?: number;
      [k: string]: unknown;
    };
    /**
     * What must be true to resume?
     */
    resume_criteria?: string[];
    /**
     * Planned resume date (if known)
     */
    resume_date?: string;
    [k: string]: unknown;
  };
  /**
   * If decision is KILL, what's the exit plan?
   */
  if_kill_decision?: {
    /**
     * Why kill?
     */
    justification?: string;
    /**
     * Fundamental blockers
     */
    why_not_viable?: string[];
    /**
     * What did we learn?
     */
    learnings_for_portfolio?: string[];
    /**
     * Steps to wind down
     */
    shutdown_plan?: {
      action?: string;
      responsible_party?: string;
      timeline?: string;
      [k: string]: unknown;
    }[];
    /**
     * Where do team members go?
     */
    team_transition?: string;
    [k: string]: unknown;
  };
  /**
   * Overall resource impact of decision
   */
  resource_impact?: {
    /**
     * Change to monthly spend
     */
    monthly_budget_delta_usd?: number;
    /**
     * Net change in headcount
     */
    headcount_delta?: number;
    [k: string]: unknown;
  };
  /**
   * References to reports, metrics, artifacts supporting this decision
   */
  supporting_data_refs?: string[];
  /**
   * When should this venture be reviewed again?
   */
  next_review_date?: string;
  /**
   * What should be accomplished before next review?
   */
  milestones_for_next_period?: {
    milestone?: string;
    target_date?: string;
    success_criteria?: string;
    [k: string]: unknown;
  }[];
  /**
   * How does this venture compare to portfolio peers?
   */
  comparability_to_portfolio?: {
    /**
     * Where does this rank in portfolio?
     */
    performance_percentile?: number;
    /**
     * How does it compare to similar stage ventures?
     */
    peer_comparison?: string;
    [k: string]: unknown;
  };
  /**
   * Portfolio-level context for this decision
   */
  portfolio_context?: {
    /**
     * Overall portfolio health
     */
    portfolio_health?: number;
    total_ventures_in_portfolio?: number;
    ventures_scaling?: number;
    ventures_iterating?: number;
    ventures_paused?: number;
    total_monthly_budget?: number;
    [k: string]: unknown;
  };
  /**
   * Is this ready for bruce-core to execute?
   */
  decision_ready?: boolean;
  /**
   * Issues that require human review/approval
   */
  escalation_flags?: string[];
  /**
   * Which portfolio agent instance prepared this
   */
  prepared_by?: string;
  created_at?: string;
}
