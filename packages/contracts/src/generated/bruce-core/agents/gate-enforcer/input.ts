/* eslint-disable */
/* auto-generated from modules/bruce-core/agents/gate-enforcer/input.schema.json */

/**
 * Input to the Gate Enforcer agent for gate evaluation
 */
export interface GateEnforcerInput {
  venture_id: string;
  gate_name: "post-screening" | "post-structuring" | "post-build" | "post-launch" | "post-traction";
  /**
   * Current stage of the venture
   */
  current_stage?: string;
  /**
   * What triggered this evaluation
   */
  evaluation_trigger?: "module_completed" | "manual_request" | "sla_triggered";
  /**
   * Complete venture record
   */
  venture_data?: {
    venture_id?: string;
    name?: string;
    founder_info?: {
      [k: string]: unknown;
    };
    problem_statement?: string;
    target_market?: {
      [k: string]: unknown;
    };
    created_at?: string;
    [k: string]: unknown;
  };
  /**
   * Outputs from specialist modules
   */
  module_outputs?: {
    opportunity_screening?: {
      founder_assessment?: string;
      problem_validation?: {
        [k: string]: unknown;
      };
      market_analysis?: {
        [k: string]: unknown;
      };
      feasibility_assessment?: string;
      [k: string]: unknown;
    };
    brand?: {
      positioning?: string;
      messaging_framework?: {
        [k: string]: unknown;
      };
      competitive_positioning?: string;
      [k: string]: unknown;
    };
    builder?: {
      mvp_plan?: {
        [k: string]: unknown;
      };
      technical_architecture?: string;
      resource_requirements?: {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    market?: {
      gotomarket_strategy?: {
        [k: string]: unknown;
      };
      pricing_model?: {
        [k: string]: unknown;
      };
      customer_acquisition_plan?: {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    operator?: {
      operational_plan?: string;
      kpi_framework?: {
        [k: string]: unknown;
      };
      resource_plan?: {
        [k: string]: unknown;
      };
      cohort_setup?: {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * For post-launch/post-traction gates: actual metrics
   */
  metric_data?: {
    cohort_age_days?: number;
    month_1_retention?: number;
    month_2_retention?: number;
    week_over_week_growth_pct?: number;
    actual_cac?: number;
    projected_cac?: number;
    gross_margin_pct?: number;
    nps?: number;
    weekly_active_users?: number;
    customer_satisfaction?: string;
    [k: string]: unknown;
  };
  /**
   * Prior gate evaluations for context
   */
  previous_evaluations?: {
    gate_name?: string;
    status?: string;
    score?: number;
    evaluated_at?: string;
    [k: string]: unknown;
  }[];
  /**
   * Correlation ID for tracing
   */
  correlation_id?: string;
  [k: string]: unknown;
}
