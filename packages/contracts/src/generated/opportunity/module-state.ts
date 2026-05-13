/* eslint-disable */
/* auto-generated from modules/opportunity/module-state.schema.json */

/**
 * Persistent state for the opportunity module
 */
export interface OpportunityModuleState {
  module_id: string;
  active_opportunities?: {
    opportunity_id?: string;
    status?: "discovered" | "screening" | "analyzing" | "scored" | "rejected" | "advanced";
    added_date?: string;
    last_updated?: string;
    [k: string]: unknown;
  }[];
  /**
   * When the last discovery cycle completed
   */
  last_scan_timestamp?: string;
  /**
   * How often to run discovery cycles
   */
  scan_frequency_days?: number;
  filter_settings?: {
    /**
     * Minimum TAM in USD to consider
     */
    min_tam?: number;
    /**
     * Geographic regions to prioritize
     */
    geographic_focus?: string[];
    industry_filters?: string[];
    auto_reject_criteria?: string[];
    [k: string]: unknown;
  };
  statistics?: {
    total_discovered?: number;
    total_advanced?: number;
    total_rejected?: number;
    avg_advancement_rate?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
