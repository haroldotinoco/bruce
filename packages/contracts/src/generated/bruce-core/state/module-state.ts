/* eslint-disable */
/* auto-generated from modules/bruce-core/state/module-state.schema.json */

/**
 * Persistent state maintained by Bruce Core - venture records and module status
 */
export interface ModuleStateSchema {
  /**
   * All currently active ventures
   */
  active_ventures?: {
    venture_id?: string;
    name?: string;
    current_stage?: string;
    stage_entry_timestamp?: string;
    created_at?: string;
    founder_info?: {
      [k: string]: unknown;
    };
    problem_statement?: string;
    target_market?: {
      [k: string]: unknown;
    };
    gate_history?: {
      gate?: string;
      status?: string;
      score?: number;
      evaluated_at?: string;
      [k: string]: unknown;
    }[];
    blockers?: {
      id?: string;
      description?: string;
      severity?: string;
      identified_at?: string;
      assigned_to?: string;
      [k: string]: unknown;
    }[];
    last_transition_timestamp?: string;
    [k: string]: unknown;
  }[];
  /**
   * Status of specialist modules
   */
  module_statuses?: {
    opportunity_screening?: {
      status?: "healthy" | "degraded" | "unavailable";
      last_invocation?: string;
      success_rate_7d?: number;
      [k: string]: unknown;
    };
    brand?: {
      [k: string]: unknown;
    };
    builder?: {
      [k: string]: unknown;
    };
    market?: {
      [k: string]: unknown;
    };
    operator?: {
      [k: string]: unknown;
    };
    portfolio?: {
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Timestamp of last lifecycle check/portfolio review cycle
   */
  last_cycle_at?: string;
  /**
   * High-level portfolio health snapshot
   */
  portfolio_health_summary?: {
    total_ventures?: number;
    by_stage?: {
      [k: string]: unknown;
    };
    by_decision?: {
      [k: string]: unknown;
    };
    avg_health_score?: number;
    estimated_total_runway_months?: number;
    [k: string]: unknown;
  };
  last_updated_at?: string;
  [k: string]: unknown;
}
