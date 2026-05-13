/* eslint-disable */
/* auto-generated from modules/add-venture/agents/value-proposition-designer/output.schema.json */

export interface ValuePropositionDesignerOutput {
  venture_id: string;
  volume_number: 3;
  volume_title: string;
  core_value_proposition: string;
  differentiation_strategy: {
    differentiator?: string;
    why_matters_to_customer?: string;
    defensibility_rationale?: string;
    competitive_comparison?: string;
    [k: string]: unknown;
  }[];
  value_proposition_canvas: {
    customer_pains?: string[];
    customer_gains?: string[];
    pain_relievers?: {
      pain?: string;
      how_we_relieve?: string;
      [k: string]: unknown;
    }[];
    gain_creators?: {
      gain?: string;
      how_we_create?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  positioning_statement: {
    for_target?: string;
    product_name?: string;
    category?: string;
    key_benefit?: string;
    primary_differentiator?: string;
    proof_point?: string;
    [k: string]: unknown;
  };
  unique_differentiators?: string[];
  comparison_vs_alternatives?: {
    alternative?: string;
    their_strength?: string;
    our_advantage?: string;
    [k: string]: unknown;
  }[];
  assumptions?: string[];
  data_gaps?: string[];
  confidence_score: number;
  confidence_rationale?: string;
  key_sections?: string[];
  execution_timestamp?: string;
  agent_id?: string;
  [k: string]: unknown;
}
