/* eslint-disable */
/* auto-generated from modules/bruce-core/agents/module-dispatcher/input.schema.json */

/**
 * Input to the Module Dispatcher for orchestrating specialist module invocations
 */
export interface ModuleDispatcherInput {
  venture_id: string;
  /**
   * Venture stage triggering dispatch
   */
  stage: "GENERATED" | "QUALIFIED" | "STRUCTURED" | "BUILT" | "LAUNCHED" | "OPERATING";
  /**
   * What triggered this dispatch request
   */
  trigger_type?: "stage_advancement" | "manual_redispatch" | "retry";
  /**
   * List of module names to dispatch (e.g., ['brand', 'builder'])
   */
  modules: string[];
  /**
   * Venture data to pass to modules
   */
  venture_context?: {
    venture_id?: string;
    name?: string;
    founder_info?: {
      [k: string]: unknown;
    };
    problem_statement?: string;
    target_market?: {
      [k: string]: unknown;
    };
    stage_entry_timestamp?: string;
    [k: string]: unknown;
  };
  /**
   * Input data for each module (e.g., outputs from prior modules)
   */
  module_inputs?: {
    [k: string]: {
      [k: string]: unknown;
    };
  };
  /**
   * Whether modules can execute in parallel (set by lifecycle manager)
   */
  parallelization_allowed?: boolean;
  /**
   * If this is a retry, which attempt number (1-based)
   */
  retry_attempt?: number;
  /**
   * For retries, reference to previous dispatch batch
   */
  previous_batch_id?: string;
  correlation_id?: string;
  [k: string]: unknown;
}
