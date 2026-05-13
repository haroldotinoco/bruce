/* eslint-disable */
/* auto-generated from modules/add-venture/agents/gtm-planner/output.schema.json */

export interface GTMPlannerOutput {
  venture_id: string;
  volume_number: 5;
  volume_title: string;
  icp_definition: {
    company_profile?: string;
    buying_committee_size?: number;
    budget_authority?: string;
    pain_intensity_score?: number;
    where_to_find?: string[];
    estimated_total_icp_companies?: number;
    [k: string]: unknown;
  };
  channel_priorities: {
    channel?: string;
    priority_rank?: number;
    why_this_channel?: string;
    estimated_cac?: number;
    year_1_revenue_target?: number;
    year_3_revenue_target?: number;
    launch_month?: number;
    [k: string]: unknown;
  }[];
  launch_sequence: {
    phase?: string;
    duration_weeks?: number;
    key_objectives?: string[];
    team_composition?: string;
    customer_targets?: string;
    success_criteria?: string;
    [k: string]: unknown;
  }[];
  ninety_day_playbook: {
    week_1_4?: {
      milestones?: string[];
      activities?: string[];
      [k: string]: unknown;
    };
    week_5_8?: {
      milestones?: string[];
      activities?: string[];
      [k: string]: unknown;
    };
    week_9_12?: {
      milestones?: string[];
      activities?: string[];
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  budget_allocation: {
    total_year_1_gtm_budget?: number;
    sales_headcount_required?: number;
    marketing_budget?: number;
    budget_by_channel?: {
      [k: string]: number;
    };
    cac_targets_by_channel?: {
      [k: string]: number;
    };
    payback_period_target_months?: number;
    [k: string]: unknown;
  };
  acquisition_funnel?: {
    awareness_to_first_call?: string;
    first_call_to_demo?: string;
    demo_to_proposal?: string;
    proposal_to_close?: string;
    sales_cycle_total_months?: number;
    estimated_conversion_rate?: number;
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
