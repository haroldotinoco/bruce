/* eslint-disable */
/* auto-generated from modules/gtm/agents/growth-experimenter/input.schema.json */

/**
 * Current traction, GTM performance, and constraints for growth experimentation planning
 */
export interface GrowthExperimenterInput {
  venture_context: {
    name: string;
    /**
     * Venture stage
     */
    stage: "pre-launch" | "early-traction" | "growth" | "scale";
    target_audience: string;
    /**
     * Evidence of product-market fit
     */
    product_market_fit_signal?: "unclear" | "weak" | "moderate" | "strong";
    competitive_context?: string;
    [k: string]: unknown;
  };
  current_traction: {
    monthly_active_users: number;
    monthly_recurring_revenue_usd?: number;
    monthly_signup_rate?: number;
    monthly_churn_rate_percent?: number;
    nps_score?: number;
    unit_economics?: {
      cac_usd?: number;
      ltv_usd?: number;
      payback_period_months?: number;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  gtm_performance: {
    active_channels: {
      channel?: string;
      monthly_spend?: number;
      monthly_leads?: number;
      conversion_rate?: number;
      cac?: number;
      [k: string]: unknown;
    }[];
    monthly_marketing_budget?: number;
    marketing_team_size?: number;
    highest_performing_channel?: string;
    most_expensive_channel?: string;
    [k: string]: unknown;
  };
  resources?: {
    available_budget_for_experiments?: number;
    team_capacity_fte?: number;
    existing_capabilities?: string[];
    [k: string]: unknown;
  };
  goals?: {
    /**
     * Desired growth rate (%)
     */
    growth_target_percent?: number;
    timeframe_months?: number;
    /**
     * Primary business priority
     */
    priority?: "user-growth" | "revenue-growth" | "profitability" | "market-share";
    [k: string]: unknown;
  };
  constraints?: {
    /**
     * What is off-limits for experimentation (e.g., 'pricing', 'product features')
     */
    cannot_change?: string[];
    /**
     * Recent experiments to avoid repeating
     */
    recent_experiments?: string[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
