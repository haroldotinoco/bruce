/* eslint-disable */
/* auto-generated from modules/add-venture/state/module-state.schema.json */

export interface AddVentureModuleState {
  module_id: string;
  active_structuring_jobs?: {
    venture_id?: string;
    opportunity_id?: string;
    status?: "started" | "in_progress" | "completed" | "failed";
    started_date?: string;
    current_volume?: number;
    current_iteration?: number;
    [k: string]: unknown;
  }[];
  /**
   * IDs of completed venture dossiers
   */
  completed_dossiers?: string[];
  dossier_count?: number;
  statistics?: {
    avg_iterations_per_venture?: number;
    avg_dossier_score?: number;
    pass_rate?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
