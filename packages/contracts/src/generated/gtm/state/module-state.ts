/* eslint-disable */
/* auto-generated from modules/gtm/state/module-state.schema.json */

/**
 * Persistent state for the GTM module tracking all ventures and campaigns
 */
export interface GTMModuleState {
  module_id: string;
  ventures?: {
    venture_id?: string;
    venture_name?: string;
    gtm_stage?:
      | "strategy_definition"
      | "strategy_approved"
      | "content_system_building"
      | "campaign_launching"
      | "active"
      | "scaling"
      | "optimizing";
    /**
     * List of active campaign IDs
     */
    active_campaigns?: string[];
    /**
     * Channels currently active
     */
    current_channel_mix?: string[];
    /**
     * Total GTM spend to date
     */
    cumulative_spend?: number;
    /**
     * Budget not yet allocated
     */
    budget_remaining?: number;
    total_signups?: number;
    total_activations?: number;
    /**
     * Monthly active users
     */
    total_mau?: number;
    total_revenue?: number;
    last_review_date?: string;
    [k: string]: unknown;
  }[];
  last_strategy_update?: string;
  last_performance_review?: string;
  [k: string]: unknown;
}
