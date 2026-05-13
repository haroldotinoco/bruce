/* eslint-disable */
/* auto-generated from modules/contracts/module-event.schema.json */

/**
 * Event emitted by any module for async, non-critical updates. Enables publish-subscribe patterns without blocking handoffs. Events are logged but do not require immediate processing by consumers.
 */
export interface ModuleEvent {
  /**
   * Unique identifier for this event (UUID v4)
   */
  event_id: string;
  /**
   * Type of event
   */
  event_type:
    | "venture_initialized"
    | "venture_qualified"
    | "venture_rejected"
    | "venture_hypothesis_updated"
    | "brand_assets_generated"
    | "product_spec_completed"
    | "gtm_plan_activated"
    | "metrics_checkpoint"
    | "hypothesis_validation_result"
    | "hypothesis_invalidated"
    | "anomaly_detected"
    | "health_score_updated"
    | "decision_escalated"
    | "decision_made"
    | "venture_status_changed"
    | "artifact_generated"
    | "error_occurred"
    | "manual_intervention_required";
  /**
   * Which module emitted this event
   */
  module:
    | "opportunity"
    | "add-venture"
    | "brand-aid"
    | "builder"
    | "gtm"
    | "startup-ops"
    | "portfolio"
    | "bruce-core"
    | "bruce-memory";
  /**
   * Venture this event pertains to (may be null for platform-level events)
   */
  venture_id?: string;
  /**
   * When event occurred
   */
  timestamp: string;
  /**
   * Event severity. info=routine, warning=attention needed, error=failed task, critical=immediate action needed
   */
  severity: "info" | "warning" | "error" | "critical";
  /**
   * Event-specific payload. Structure varies by event_type.
   */
  payload: {
    [k: string]: unknown;
  };
  /**
   * Trace ID linking this event to parent workflow execution
   */
  correlation_id?: string;
  /**
   * Full trace path for sequence reconstruction
   */
  trace_id?: string;
  /**
   * If triggered by human action, which user (optional)
   */
  user_id?: string;
  /**
   * Which modules have subscribed to this event type
   */
  subscribers?: (
    | "opportunity"
    | "add-venture"
    | "brand-aid"
    | "builder"
    | "gtm"
    | "startup-ops"
    | "portfolio"
    | "bruce-core"
    | "bruce-memory"
  )[];
}
