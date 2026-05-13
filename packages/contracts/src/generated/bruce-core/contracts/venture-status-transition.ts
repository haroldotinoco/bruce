/* eslint-disable */
/* auto-generated from modules/bruce-core/contracts/venture-status-transition.schema.json */

/**
 * Contract for venture state transitions published on event bus
 */
export interface VentureStatusTransitionContract {
  /**
   * Event type constant
   */
  event_type: "venture.stage_transitioned";
  event_id?: string;
  venture_id: string;
  previous_stage:
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
  new_stage:
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
   * What caused the transition
   */
  trigger?: "gate_passed" | "governance_decision" | "manual_override";
  /**
   * If triggered by gate, reference to gate decision
   */
  gate_decision_id?: string;
  /**
   * If triggered by governance, reference to governance decision
   */
  portfolio_decision_id?: string;
  transition_timestamp?: string;
  correlation_id?: string;
  [k: string]: unknown;
}
