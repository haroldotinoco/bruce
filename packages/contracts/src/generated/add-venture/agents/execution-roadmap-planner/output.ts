/* eslint-disable */
/* auto-generated from modules/add-venture/agents/execution-roadmap-planner/output.schema.json */

export interface ExecutionRoadmapPlannerOutput {
  venture_id: string;
  volume_number: 8;
  volume_title: string;
  phases: {
    phase_name?: string;
    duration_weeks?: number;
    objectives?: string[];
    milestones?: string[];
    resources_needed?: string;
    budget?: number;
    success_criteria?: string[];
    dependencies?: string[];
    [k: string]: unknown;
  }[];
  critical_path: {
    longest_dependency_chain?: string[];
    sequencing_requirements?: string[];
    risk_delay_points?: string[];
    [k: string]: unknown;
  };
  resource_requirements: {
    headcount?: {
      [k: string]: {
        [k: string]: unknown;
      };
    };
    hiring_timeline?: string[];
    tools_and_infrastructure_monthly?: number;
    budget_allocation?: {
      [k: string]: number;
    };
    total_runway_12_months?: number;
    [k: string]: unknown;
  };
  success_metrics_and_gates: {
    phase?: string;
    phase_gate_criteria?: string[];
    key_metrics?: {
      [k: string]: string;
    };
    go_no_go_decision?: string;
    adjustment_triggers?: string[];
    [k: string]: unknown;
  }[];
  first_30_days: {
    focus_areas?: string[];
    week_1?: string[];
    week_2?: string[];
    week_3?: string[];
    week_4?: string[];
    team_composition?: string;
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
