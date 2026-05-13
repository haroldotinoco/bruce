/* eslint-disable */
/* auto-generated from modules/bruce-core/saas/billing-events.schema.json */

/**
 * JSON Schema defining all billing events emitted by Bruce Core
 */
export type BruceCoreBillingEventsSchema = {
  /**
   * Unique identifier for this event
   */
  event_id: string;
  /**
   * Type of billing event
   */
  event_type:
    | "bruce-core.venture.created"
    | "bruce-core.module.activated"
    | "bruce-core.plan.upgraded"
    | "bruce-core.plan.downgraded"
    | "bruce-core.venture.limit.exceeded"
    | "bruce-core.account.created";
  /**
   * Account ID associated with this event
   */
  account_id: string;
  /**
   * When the event occurred (ISO 8601)
   */
  timestamp: string;
  data:
    | VentureCreatedEvent
    | ModuleActivatedEvent
    | PlanUpgradedEvent
    | PlanDowngradedEvent
    | VentureLimitExceededEvent
    | AccountCreatedEvent;
  [k: string]: unknown;
}[];

/**
 * Emitted when a new venture is created
 */
export interface VentureCreatedEvent {
  /**
   * ID of the newly created venture
   */
  venture_id: string;
  /**
   * Name of the venture
   */
  venture_name: string;
  /**
   * Source opportunity ID
   */
  opportunity_id: string;
  /**
   * User or system that created the venture
   */
  created_by?: string;
  [k: string]: unknown;
}
/**
 * Emitted when a module is activated on an account
 */
export interface ModuleActivatedEvent {
  /**
   * ID of the activated module
   */
  module_id: string;
  /**
   * Human-readable name of the module
   */
  module_name: string;
  /**
   * Initial configuration for the module
   */
  config?: {
    [k: string]: unknown;
  };
  /**
   * User or system that activated the module
   */
  activated_by?: string;
  [k: string]: unknown;
}
/**
 * Emitted when an account's billing plan is upgraded
 */
export interface PlanUpgradedEvent {
  /**
   * Previous billing plan
   */
  previous_plan: "free" | "pro" | "enterprise";
  /**
   * New billing plan
   */
  new_plan: "free" | "pro" | "enterprise";
  /**
   * Date when upgrade becomes effective
   */
  effective_date: string;
  /**
   * Reason for the upgrade (e.g., 'limit-exceeded', 'manual-request')
   */
  upgrade_reason?: string;
  [k: string]: unknown;
}
/**
 * Emitted when an account's billing plan is downgraded
 */
export interface PlanDowngradedEvent {
  /**
   * Previous billing plan
   */
  previous_plan: "free" | "pro" | "enterprise";
  /**
   * New billing plan
   */
  new_plan: "free" | "pro" | "enterprise";
  /**
   * Date when downgrade becomes effective
   */
  effective_date: string;
  /**
   * Reason for the downgrade (e.g., 'manual-request', 'payment-failed')
   */
  downgrade_reason?: string;
  [k: string]: unknown;
}
/**
 * Emitted when an account reaches its venture creation limit
 */
export interface VentureLimitExceededEvent {
  /**
   * Type of limit that was exceeded
   */
  limit_type: "active_ventures" | "total_ventures" | "api_calls_per_month";
  /**
   * Current count of the limited resource
   */
  current_count: number;
  /**
   * Maximum allowed value
   */
  limit_value: number;
  /**
   * Recommended next step
   */
  suggested_action?: "upgrade_plan" | "archive_ventures" | "contact_support";
  [k: string]: unknown;
}
/**
 * Emitted when a new account is created
 */
export interface AccountCreatedEvent {
  /**
   * Name of the newly created account
   */
  account_name: string;
  /**
   * Initial billing plan for the account
   */
  initial_plan: "free" | "pro" | "enterprise";
  /**
   * User or system that created the account
   */
  created_by?: string;
  /**
   * Primary contact email for the account
   */
  contact_email?: string;
  [k: string]: unknown;
}
