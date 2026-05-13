/* eslint-disable */
/* auto-generated from modules/add-venture/agents/dossier-composer/output.schema.json */

export interface FinalVentureDossier {
  venture_id: string;
  opportunity_id: string;
  venture_name: string;
  created_date: string;
  created_by?: string;
  volumes: {
    vol_1?: {
      [k: string]: unknown;
    };
    vol_2?: {
      [k: string]: unknown;
    };
    vol_3?: {
      [k: string]: unknown;
    };
    vol_4?: {
      [k: string]: unknown;
    };
    vol_5?: {
      [k: string]: unknown;
    };
    vol_6?: {
      [k: string]: unknown;
    };
    vol_7?: {
      [k: string]: unknown;
    };
    vol_8?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  critique_result: {
    [k: string]: unknown;
  };
  executive_summary: {
    narrative_summary?: string;
    opportunity_snapshot?: string;
    customer_snapshot?: string;
    business_model_snapshot?: string;
    [k: string]: unknown;
  };
  key_metrics: {
    market_tam_usd?: number;
    primary_segment_size?: number;
    primary_segment_willingness_to_pay_median?: number;
    year_1_revenue_target?: number;
    year_1_customer_target?: number;
    year_1_mrr_target?: number;
    cac?: number;
    ltv?: number;
    payback_period_months?: number;
    breakeven_month?: number;
    year_1_headcount?: number;
    funding_required_12_months?: number;
    critique_overall_score?: number;
    [k: string]: unknown;
  };
  status: "approved" | "needs_iteration" | "rejected";
  artifact_refs?: {
    pdf_url?: string;
    json_url?: string;
    archival_path?: string;
    [k: string]: unknown;
  };
  execution_timestamp?: string;
  agent_id?: string;
  [k: string]: unknown;
}
