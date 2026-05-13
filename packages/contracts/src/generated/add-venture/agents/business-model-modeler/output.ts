/* eslint-disable */
/* auto-generated from modules/add-venture/agents/business-model-modeler/output.schema.json */

export interface BusinessModelModelerOutput {
  venture_id: string;
  volume_number: 4;
  volume_title: string;
  revenue_model: {
    model_type?: string;
    revenue_streams?: string[];
    pricing_strategy?: string;
    customer_segments?: {
      segment?: string;
      annual_arpu?: number;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  unit_economics: {
    cac_by_segment?: {
      [k: string]: number;
    };
    ltv_by_segment?: {
      [k: string]: number;
    };
    cac_payback_months_by_segment?: {
      [k: string]: number;
    };
    gross_margin_percent?: number;
    ltv_cac_ratio?: number;
    industry_benchmark_ltv_cac?: number;
    [k: string]: unknown;
  };
  business_model_scenarios: {
    scenario_name?: "conservative" | "base" | "aggressive";
    year_1_target_mrr?: number;
    year_1_customer_count?: number;
    year_1_revenue?: number;
    avg_cac?: number;
    avg_ltv?: number;
    avg_payback_months?: number;
    gross_margin_percent?: number;
    monthly_burn?: number;
    break_even_month?: number;
    year_3_mrr_target?: number;
    year_3_customer_count?: number;
    required_runway_months?: number;
    [k: string]: unknown;
  }[];
  break_even_analysis: {
    fixed_costs_monthly?: number;
    variable_cost_per_customer?: number;
    conservative_breakeven_month?: number;
    base_breakeven_month?: number;
    aggressive_breakeven_month?: number;
    [k: string]: unknown;
  };
  recommended_scenario: {
    scenario?: string;
    rationale?: string;
    critical_success_factors?: string[];
    key_metrics_to_monitor?: string[];
    total_capital_required_12_months?: number;
    [k: string]: unknown;
  };
  assumptions?: string[];
  data_gaps?: string[];
  confidence_score: number;
  confidence_rationale?: string;
  key_sections?: string[];
  execution_timestamp?: string;
  agent_id?: string;
  [k: string]: unknown;
}
