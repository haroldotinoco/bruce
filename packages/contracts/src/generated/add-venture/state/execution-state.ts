/* eslint-disable */
/* auto-generated from modules/add-venture/state/execution-state.schema.json */

export interface AddVentureExecutionState {
  current_venture_processing?: {
    venture_id?: string;
    opportunity_id?: string;
    current_phase?:
      | "briefing_interpretation"
      | "volume_structuring"
      | "critique_review"
      | "iteration"
      | "dossier_composition"
      | "complete";
    current_volume_processing?: number;
    iteration_count?: number;
    start_time?: string;
    [k: string]: unknown;
  };
  partial_volumes?: {
    venture_id?: string;
    volume_number?: number;
    content?: {
      [k: string]: unknown;
    };
    confidence_score?: number;
    [k: string]: unknown;
  }[];
  /**
   * List of volumes completed in current structuring job
   */
  volumes_completed?: number[];
  critique_results?: {
    iteration?: number;
    overall_score?: number;
    weak_volumes?: number[];
    [k: string]: unknown;
  }[];
  processing_errors?: {
    venture_id?: string;
    error?: string;
    timestamp?: string;
    agent_id?: string;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
