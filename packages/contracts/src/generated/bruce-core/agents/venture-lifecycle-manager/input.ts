/* eslint-disable */
/* auto-generated from modules/bruce-core/agents/venture-lifecycle-manager/input.schema.json */

/**
 * Input to the Venture Lifecycle Manager agent for lifecycle state transitions
 */
export interface VentureLifecycleManagerInput {
  /**
   * Unique identifier for the venture
   */
  venture_id: string;
  /**
   * Type of event triggering lifecycle decision
   */
  trigger_type:
    | "gate_passed"
    | "gate_failed"
    | "gate_borderline"
    | "module_completed"
    | "escalation_resolved"
    | "sla_check"
    | "portfolio_decision"
    | "manual_hold_release";
  /**
   * Gate evaluation result (if trigger_type is gate_*)
   */
  gate_decision?: {
    /**
     * Name of the gate evaluated
     */
    gate_name: "post-screening" | "post-structuring" | "post-build" | "post-launch" | "post-traction";
    /**
     * Gate decision
     */
    status: "PASSED" | "FAILED" | "BORDERLINE";
    /**
     * Gate evaluation score
     */
    score: number;
    /**
     * Reasoning for gate decision
     */
    rationale?: string;
    /**
     * Breakdown of scoring by criterion
     */
    criteria_details?: {
      [k: string]: {
        score?: number;
        feedback?: string;
        [k: string]: unknown;
      };
    };
    /**
     * Whether gate decision requires human approval
     */
    escalation_required?: boolean;
    /**
     * Reference to gate evaluation record
     */
    gate_evaluation_id?: string;
    /**
     * Timestamp of gate evaluation
     */
    evaluated_at?: string;
    [k: string]: unknown;
  };
  /**
   * Module dispatch completion (if trigger_type is module_completed)
   */
  module_completion?: {
    /**
     * List of completed modules (e.g., ['brand', 'builder'])
     */
    module_names?: string[];
    /**
     * Reference to the dispatch batch
     */
    dispatch_batch_id?: string;
    /**
     * Outputs from completed modules
     */
    module_outputs?: {
      [k: string]: unknown;
    };
    /**
     * Timestamp of completion
     */
    completed_at?: string;
    [k: string]: unknown;
  };
  /**
   * Current state of the venture
   */
  current_venture_state?: {
    /**
     * Current lifecycle stage
     */
    stage:
      | "GENERATED"
      | "QUALIFIED"
      | "STRUCTURED"
      | "BUILT"
      | "LAUNCHED"
      | "OPERATING"
      | "ITERATING"
      | "SCALING"
      | "PAUSED"
      | "KILLED";
    /**
     * When venture entered current stage
     */
    stage_entry_timestamp: string;
    /**
     * History of gate evaluations
     */
    gate_history?: {
      gate?: string;
      status?: string;
      score?: number;
      evaluated_at?: string;
      [k: string]: unknown;
    }[];
    /**
     * Unresolved blockers preventing advancement
     */
    blockers?: {
      id?: string;
      description?: string;
      severity?: "critical" | "high" | "medium";
      identified_at?: string;
      assigned_to?: string;
      [k: string]: unknown;
    }[];
    /**
     * Human escalations awaiting response
     */
    pending_escalations?: {
      escalation_id?: string;
      type?: string;
      created_at?: string;
      due_at?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  /**
   * Resolution of a previous escalation (if trigger_type is escalation_resolved)
   */
  escalation_resolution?: {
    escalation_id?: string;
    /**
     * Human decision on escalation
     */
    decision?: "APPROVED" | "REJECTED" | "HOLD";
    reasoning?: string;
    resolved_by?: string;
    resolved_at?: string;
    [k: string]: unknown;
  };
  /**
   * Portfolio-level governance decision affecting this venture
   */
  portfolio_decision?: {
    /**
     * Portfolio governance decision
     */
    decision?: "SCALE" | "ITERATE" | "PAUSE" | "KILL";
    reasoning?: string;
    /**
     * Governance Agent or human decision
     */
    source?: string;
    confidence_score?: number;
    decision_id?: string;
    [k: string]: unknown;
  };
  /**
   * Correlation ID for tracing this decision across systems
   */
  correlation_id?: string;
  [k: string]: unknown;
}
