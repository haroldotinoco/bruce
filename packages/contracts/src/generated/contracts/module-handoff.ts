/* eslint-disable */
/* auto-generated from modules/contracts/module-handoff.schema.json */

/**
 * Standard envelope for inter-module communication. Wraps module-specific payloads with metadata for tracing and orchestration. All handoffs use this envelope regardless of specific payload content.
 */
export interface ModuleToModuleHandoffEnvelope {
  /**
   * Unique identifier for this handoff (UUID v4)
   */
  handoff_id: string;
  /**
   * Source module name
   */
  from_module:
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
   * Destination module name
   */
  to_module:
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
   * Venture identifier (UUID v4 format)
   */
  venture_id: string;
  /**
   * Module-specific payload content. Structure determined by handoff-specific schema (e.g., venture-to-brand.schema.json). Receivers should validate against their respective schema.
   */
  payload: {
    [k: string]: unknown;
  };
  /**
   * References to state snapshots and artifacts that context the handoff
   */
  context_refs?: {
    /**
     * Type of reference
     */
    ref_type: "venture_state_snapshot" | "artifact" | "metric_snapshot" | "decision_record";
    /**
     * Identifier of referenced resource
     */
    ref_id: string;
    /**
     * Human-readable description of what this reference contains
     */
    description?: string;
    [k: string]: unknown;
  }[];
  /**
   * Distributed tracing and orchestration metadata
   */
  metadata: {
    /**
     * Unique ID tying all handoffs in a workflow together (UUID v4). Enables end-to-end tracing.
     */
    correlation_id: string;
    /**
     * Full trace path (e.g., 'opportunity:123:add-venture:456:bruce-core:789') for sequence reconstruction
     */
    trace_id?: string;
    /**
     * What triggered this handoff
     */
    triggered_by?: "workflow_step" | "event_subscription" | "manual_trigger" | "scheduled_task";
    /**
     * Temporal.io workflow execution ID for orchestration context
     */
    workflow_execution_id?: string;
    /**
     * When handoff was generated
     */
    timestamp: string;
    [k: string]: unknown;
  };
  /**
   * Validation results for this handoff against target schema
   */
  validation?: {
    /**
     * Name of the schema used to validate payload (e.g., 'venture-to-brand.schema.json')
     */
    target_schema?: string;
    /**
     * Whether payload passed schema validation
     */
    is_valid?: boolean;
    /**
     * JSON Schema validation errors (if any)
     */
    validation_errors?: {
      /**
       * JSON path to invalid field
       */
      path?: string;
      /**
       * Validation error message
       */
      error?: string;
      [k: string]: unknown;
    }[];
    validated_at?: string;
    [k: string]: unknown;
  };
}
