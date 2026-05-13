/* eslint-disable */
/* auto-generated from modules/add-venture/agents/briefing-interpreter/output.schema.json */

export interface BriefingInterpreterOutput {
  venture_id: string;
  opportunity_id: string;
  briefing_timestamp: string;
  briefing_version?: string;
  problem_context: {
    core_problem?: string;
    affected_personas?: string[];
    current_solutions?: string[];
    confidence_level?: number;
    [k: string]: unknown;
  };
  market_context: {
    tam?: number;
    sam?: number;
    som?: number;
    market_dynamics?: string;
    regulatory_environment?: string;
    confidence_level?: number;
    [k: string]: unknown;
  };
  customer_context: {
    primary_segment?: string;
    segment_size?: number;
    jtbd_functional?: string;
    jtbd_emotional?: string;
    willingness_to_pay?: string;
    confidence_level?: number;
    [k: string]: unknown;
  };
  competitive_context: {
    direct_competitors?: string[];
    indirect_competitors?: string[];
    competitive_intensity?: string;
    differentiation_opportunities?: string[];
    barriers_to_entry?: string[];
    confidence_level?: number;
    [k: string]: unknown;
  };
  portfolio_context?: {
    strategic_fit_summary?: string;
    capital_efficiency?: string;
    team_skill_fit?: string;
    confidence_level?: number;
    [k: string]: unknown;
  };
  /**
   * Critical assumptions underpinning the briefing
   */
  key_assumptions?: string[];
  /**
   * Known gaps requiring validation
   */
  data_gaps?: string[];
  /**
   * Confidence that briefing provides sufficient context for downstream agents
   */
  briefing_quality_score?: number;
  [k: string]: unknown;
}
