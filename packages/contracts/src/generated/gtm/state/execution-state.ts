/* eslint-disable */
/* auto-generated from modules/gtm/state/execution-state.schema.json */

/**
 * Runtime state tracking in-flight workflows and activities
 */
export interface GTMModuleExecutionState {
  /**
   * Current active workflow ID
   */
  workflow_id?: string;
  /**
   * Current step in active workflow
   */
  current_step?: string;
  campaigns_in_flight?: {
    campaign_id?: string;
    campaign_name?: string;
    channel?: string;
    status?: "launching" | "active" | "paused" | "completed";
    start_date?: string;
    expected_end_date?: string;
    spend_to_date?: number;
    [k: string]: unknown;
  }[];
  pending_content_pieces?: {
    content_id?: string;
    content_type?:
      | "blog_post"
      | "whitepaper"
      | "case_study"
      | "video"
      | "infographic"
      | "email"
      | "ad_creative"
      | "landing_page";
    channel?: string;
    status?: "draft" | "in_review" | "approved" | "scheduled" | "published";
    due_date?: string;
    [k: string]: unknown;
  }[];
  /**
   * When analytics were last fetched
   */
  last_analytics_pull?: string;
  ab_tests_active?: {
    test_id?: string;
    campaign_id?: string;
    variants?: string[];
    start_date?: string;
    expected_end_date?: string;
    statistical_significance_required?: number;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
