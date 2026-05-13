/* eslint-disable */
/* auto-generated from modules/builder/saas/billing-events.schema.json */

export type BuilderBillingEventsSchema =
  | BuilderSpecCreated
  | BuilderArchitectureDefined
  | BuilderSprintPlanned
  | BuilderRoadmapGenerated
  | BuilderMvpApproved;

/**
 * Published when an MVP specification is created from a brand identity
 */
export interface BuilderSpecCreated {
  event_type: "builder.spec.created";
  /**
   * Account identifier for billing purposes
   */
  account_id: string;
  /**
   * Associated venture identifier
   */
  venture_id: string;
  /**
   * Unique identifier for the MVP specification
   */
  spec_id: string;
  /**
   * Associated brand identity from brand-aid module
   */
  brand_id?: string;
  /**
   * Account plan tier at time of event
   */
  plan_tier?: "free" | "pro" | "enterprise";
  /**
   * UTC timestamp of event
   */
  timestamp: string;
  metadata?: {
    user_id?: string;
    session_id?: string;
    venture_name?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * Published when technical architecture is defined for an MVP specification
 */
export interface BuilderArchitectureDefined {
  event_type: "builder.architecture.defined";
  account_id: string;
  venture_id: string;
  spec_id: string;
  /**
   * Unique identifier for the architecture definition
   */
  architecture_id?: string;
  plan_tier?: "free" | "pro" | "enterprise";
  /**
   * Selected technology stack
   */
  tech_stack?: {
    frontend_framework?: string;
    backend_framework?: string;
    database?: string;
    authentication?: string;
    hosting_platform?: string;
    monitoring_tools?: string[];
    [k: string]: unknown;
  };
  /**
   * Overall architecture pattern
   */
  architecture_type?: "monolithic" | "microservices" | "serverless" | "hybrid";
  timestamp: string;
  metadata?: {
    user_id?: string;
    /**
     * Whether custom architecture review was performed (enterprise feature)
     */
    custom_architecture_review?: boolean;
    architecture_complexity?: "simple" | "moderate" | "complex";
    scalability_tier?: "startup" | "growth" | "enterprise";
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * Published when sprint plans are created for an MVP specification
 */
export interface BuilderSprintPlanned {
  event_type: "builder.sprint.planned";
  account_id: string;
  venture_id: string;
  spec_id: string;
  /**
   * Number of sprints planned
   */
  sprint_count?: number;
  /**
   * Identifiers for each sprint
   */
  sprint_ids?: string[];
  plan_tier?: "free" | "pro" | "enterprise";
  planning_details?: {
    total_stories?: number;
    total_tasks?: number;
    total_story_points?: number;
    team_size?: number;
    methodology?: "agile" | "lean" | "waterfall" | "kanban";
    [k: string]: unknown;
  };
  timestamp: string;
  metadata?: {
    user_id?: string;
    average_story_points_per_sprint?: number;
    estimated_development_weeks?: number;
    /**
     * Whether multiple teams were planned (enterprise feature)
     */
    multi_team_sprint_plan?: boolean;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * Published when a development roadmap is generated from sprint plans
 */
export interface BuilderRoadmapGenerated {
  event_type: "builder.roadmap.generated";
  account_id: string;
  venture_id: string;
  spec_id: string;
  /**
   * Unique identifier for the roadmap
   */
  roadmap_id?: string;
  plan_tier?: "free" | "pro" | "enterprise";
  roadmap_summary?: {
    total_phases?: number;
    total_duration_weeks?: number;
    key_milestones?: string[];
    phase_breakdown?: {
      phase_name?: string;
      duration_weeks?: number;
      deliverables?: string[];
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  timestamp: string;
  metadata?: {
    user_id?: string;
    roadmap_formats_generated?: ("markdown" | "pdf" | "json" | "asana" | "monday")[];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * Published when MVP specification is approved and ready for handoff to GTM module
 */
export interface BuilderMvpApproved {
  event_type: "builder.mvp.approved";
  account_id: string;
  venture_id: string;
  /**
   * Approved MVP specification identifier
   */
  spec_id: string;
  /**
   * Associated brand from brand-aid module
   */
  brand_id?: string;
  brand_name?: string;
  plan_tier?: "free" | "pro" | "enterprise";
  /**
   * Summary of MVP specification
   */
  mvp_deliverables?: {
    /**
     * Total features in MVP
     */
    feature_count?: number;
    sprint_count?: number;
    story_count?: number;
    acceptance_criteria_count?: number;
    estimated_development_weeks?: number;
    team_size?: number;
    [k: string]: unknown;
  };
  /**
   * Formats in which specification was exported
   */
  specification_exports?: {
    formats?: ("markdown" | "pdf" | "jira" | "asana" | "monday" | "linear" | "json")[];
    total_file_size_kb?: number;
    [k: string]: unknown;
  };
  timestamp: string;
  metadata?: {
    user_id?: string;
    approval_notes?: string;
    /**
     * Time from spec creation to approval
     */
    workflow_duration_seconds?: number;
    completed_steps?: (
      | "context_ingestion"
      | "architecture_definition"
      | "feature_prioritization"
      | "sprint_planning"
      | "acceptance_criteria"
    )[];
    gtm_handoff_initiated?: boolean;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
