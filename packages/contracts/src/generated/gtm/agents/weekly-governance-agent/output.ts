/* eslint-disable */
/* auto-generated from modules/gtm/agents/weekly-governance-agent/output.schema.json */

/**
 * Executive summary of GTM performance, decisions, and next-week priorities
 */
export interface WeeklyGovernanceReportOutput {
  week_ending_date: string;
  /**
   * Title for report (e.g., 'GTM Weekly Report - Week of April 22')
   */
  report_title?: string;
  /**
   * 2-3 paragraph narrative summary of week (what happened, is it good/bad, why)
   */
  executive_summary: string;
  gtm_health_score?: {
    /**
     * Overall GTM health (0-100)
     */
    overall_score: number;
    /**
     * Week-over-week trend
     */
    trend: "improving" | "stable" | "declining";
    /**
     * On track to meet quarterly targets?
     */
    vs_target?: "on-track" | "at-risk" | "off-track";
    [k: string]: unknown;
  };
  performance_vs_targets: {
    /**
     * Metric name (e.g., 'Monthly Revenue Pace', 'CAC')
     */
    metric: string;
    weekly_value: number;
    target: number;
    actual_month_to_date?: number;
    status: "on-track" | "at-risk" | "off-track";
    trend?: "improving" | "stable" | "declining";
    commentary?: string;
    [k: string]: unknown;
  }[];
  channel_performance_summary?: {
    channel: string;
    weekly_leads?: number;
    cac?: number;
    trend?: "improving" | "stable" | "declining";
    status: "healthy" | "at-risk" | "needs-action";
    commentary?: string;
    [k: string]: unknown;
  }[];
  /**
   * @maxItems 3
   */
  key_decisions_needed?:
    | []
    | [
        {
          /**
           * What decision needs to be made?
           */
          decision: string;
          /**
           * Available options
           */
          options?: string[];
          /**
           * What we recommend and why
           */
          recommendation: string;
          /**
           * Expected impact of recommended decision
           */
          impact_if_approved?: string;
          /**
           * How urgently is decision needed?
           */
          timeframe: "immediately" | "by-eow" | "by-end-of-week" | "can-wait";
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * What decision needs to be made?
           */
          decision: string;
          /**
           * Available options
           */
          options?: string[];
          /**
           * What we recommend and why
           */
          recommendation: string;
          /**
           * Expected impact of recommended decision
           */
          impact_if_approved?: string;
          /**
           * How urgently is decision needed?
           */
          timeframe: "immediately" | "by-eow" | "by-end-of-week" | "can-wait";
          [k: string]: unknown;
        },
        {
          /**
           * What decision needs to be made?
           */
          decision: string;
          /**
           * Available options
           */
          options?: string[];
          /**
           * What we recommend and why
           */
          recommendation: string;
          /**
           * Expected impact of recommended decision
           */
          impact_if_approved?: string;
          /**
           * How urgently is decision needed?
           */
          timeframe: "immediately" | "by-eow" | "by-end-of-week" | "can-wait";
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * What decision needs to be made?
           */
          decision: string;
          /**
           * Available options
           */
          options?: string[];
          /**
           * What we recommend and why
           */
          recommendation: string;
          /**
           * Expected impact of recommended decision
           */
          impact_if_approved?: string;
          /**
           * How urgently is decision needed?
           */
          timeframe: "immediately" | "by-eow" | "by-end-of-week" | "can-wait";
          [k: string]: unknown;
        },
        {
          /**
           * What decision needs to be made?
           */
          decision: string;
          /**
           * Available options
           */
          options?: string[];
          /**
           * What we recommend and why
           */
          recommendation: string;
          /**
           * Expected impact of recommended decision
           */
          impact_if_approved?: string;
          /**
           * How urgently is decision needed?
           */
          timeframe: "immediately" | "by-eow" | "by-end-of-week" | "can-wait";
          [k: string]: unknown;
        },
        {
          /**
           * What decision needs to be made?
           */
          decision: string;
          /**
           * Available options
           */
          options?: string[];
          /**
           * What we recommend and why
           */
          recommendation: string;
          /**
           * Expected impact of recommended decision
           */
          impact_if_approved?: string;
          /**
           * How urgently is decision needed?
           */
          timeframe: "immediately" | "by-eow" | "by-end-of-week" | "can-wait";
          [k: string]: unknown;
        }
      ];
  risk_flags?: {
    /**
     * What is the risk?
     */
    risk: string;
    /**
     * How severe?
     */
    severity: "low" | "medium" | "high" | "critical";
    /**
     * What action should be taken?
     */
    action: string;
    [k: string]: unknown;
  }[];
  budget_status?: {
    monthly_budget: number;
    mtd_spend: number;
    mtd_spend_percent?: number;
    weekly_burn_rate?: number;
    remaining_budget: number;
    on_track?: boolean;
    commentary?: string;
    [k: string]: unknown;
  };
  /**
   * @maxItems 5
   */
  next_week_priorities?:
    | []
    | [
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        },
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        },
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        },
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        },
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        },
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        },
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        }
      ]
    | [
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        },
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        },
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        },
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        },
        {
          /**
           * What needs to happen next week
           */
          priority: string;
          /**
           * Who is responsible
           */
          owner: string;
          due_date?: string;
          [k: string]: unknown;
        }
      ];
  /**
   * Key metrics at a glance
   */
  metrics_snapshot?: {
    monthly_revenue_pace?: number;
    monthly_lead_pace?: number;
    blended_cac?: number;
    marketing_roas?: number;
    pipeline_coverage_ratio?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
