/* eslint-disable */
/* auto-generated from modules/add-venture/agents/customer-market-architect/output.schema.json */

export interface CustomerMarketArchitectOutput {
  venture_id: string;
  volume_number: 2;
  volume_title: string;
  customer_segments: {
    segment_name?: string;
    priority_rank?: number;
    segment_size_customers?: number;
    segment_tam_usd?: number;
    customer_archetypes?: string[];
    primary_pain_points?: string[];
    willingness_to_pay_range?: {
      min_annual_usd?: number;
      max_annual_usd?: number;
      median_annual_usd?: number;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  }[];
  jtbd_map: {
    functional_jobs?: string[];
    emotional_jobs?: string[];
    social_jobs?: string[];
    job_hierarchy?: {
      job?: string;
      priority?: "primary" | "secondary" | "tertiary";
      alternative_solutions?: string[];
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  decision_maker_map: {
    primary_buyer_title?: string;
    primary_buyer_motivation?: string;
    end_user_title?: string;
    end_user_motivation?: string;
    stakeholders?: {
      role?: string;
      influence_level?: "decision_maker" | "strong_influencer" | "approver" | "user";
      success_criteria?: string;
      [k: string]: unknown;
    }[];
    buying_approval_workflow?: string;
    typical_sales_cycle_months?: number;
    [k: string]: unknown;
  };
  market_architecture: {
    total_addressable_segment?: number;
    revenue_concentration?: string;
    geographic_distribution?: string;
    competitive_positioning?: string;
    barriers_to_entry?: string[];
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
