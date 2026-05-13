/* eslint-disable */
/* auto-generated from modules/add-venture/agents/opportunity-analyst-vol1/output.schema.json */

export interface OpportunityAnalystVol1Output {
  venture_id: string;
  volume_number: 1;
  volume_title?: "Opportunity Diagnosis";
  content: {
    problem_anatomy: {
      core_problem?: string;
      problem_evolution?: string;
      stakeholder_impact?: string;
      current_workarounds?: string[];
      acceptance_criteria?: string[];
      [k: string]: unknown;
    };
    market_readiness: {
      maturity_stage?: string;
      demand_signals?: string[];
      competitive_activation?: string;
      urgency_drivers?: string[];
      timeline_assessment?: string;
      [k: string]: unknown;
    };
    addressable_market: {
      tam_analysis?: string;
      sam_definition?: string;
      som_realistic?: string;
      growth_trajectory?: string;
      unit_economics_feasibility?: string;
      [k: string]: unknown;
    };
    macro_context?: {
      industry_trends?: string[];
      regulatory_shifts?: string;
      technology_enablers?: string[];
      economic_context?: string;
      demographic_drivers?: string[];
      [k: string]: unknown;
    };
    /**
     * One-paragraph hypothesis statement
     */
    opportunity_thesis: string;
    [k: string]: unknown;
  };
  key_assumptions?: string[];
  validation_roadmap?: {
    assumption?: string;
    validation_method?: string;
    success_criteria?: string;
    [k: string]: unknown;
  }[];
  confidence_score: number;
  confidence_rationale?: string;
  critical_unknowns?: string[];
  execution_timestamp?: string;
  agent_id?: string;
  [k: string]: unknown;
}
