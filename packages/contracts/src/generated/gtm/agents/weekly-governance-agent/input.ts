/* eslint-disable */
/* auto-generated from modules/gtm/agents/weekly-governance-agent/input.schema.json */

/**
 * Weekly GTM performance data for governance reporting and decision support
 */
export interface WeeklyGovernanceAgentInput {
  week_context: {
    week_ending_date: string;
    /**
     * Is this standard weekly or special reporting period?
     */
    reporting_period?: "weekly" | "monthly-week-4" | "quarter-end";
    /**
     * Who will read this report?
     */
    audience?: "executive-team" | "board" | "gtm-team";
    [k: string]: unknown;
  };
  performance_data: {
    campaigns?: {
      campaign_id?: string;
      channel?: string;
      weekly_spend?: number;
      weekly_leads?: number;
      cac?: number;
      status?: "active" | "paused" | "scaling" | "winding-down";
      [k: string]: unknown;
    }[];
    channel_performance?: {
      [k: string]: {
        weekly_spend?: number;
        weekly_leads?: number;
        conversion_rate?: number;
        cac?: number;
        trend?: "improving" | "stable" | "declining";
        [k: string]: unknown;
      };
    };
    /**
     * Any anomalies or unexpected events this week
     */
    anomalies?: {
      issue?: string;
      severity?: "info" | "warning" | "critical";
      impact?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  gtm_targets: {
    monthly_revenue_target_usd?: number;
    monthly_lead_target: number;
    target_cac_usd?: number;
    target_conversion_rate_percent?: number;
    monthly_budget?: number;
    [k: string]: unknown;
  };
  budget_status?: {
    monthly_budget?: number;
    week_1_actual_spend?: number;
    week_2_actual_spend?: number;
    week_3_actual_spend?: number;
    week_4_actual_spend?: number;
    ytd_actual_spend?: number;
    [k: string]: unknown;
  };
  /**
   * Decisions waiting for executive input
   */
  pending_decisions?: {
    decision_type?: "campaign-scale" | "campaign-pause" | "budget-reallocation" | "channel-kill";
    campaign_or_channel?: string;
    context?: string;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
