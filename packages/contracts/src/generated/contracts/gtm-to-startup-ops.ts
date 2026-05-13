/* eslint-disable */
/* auto-generated from modules/contracts/gtm-to-startup-ops.schema.json */

/**
 * Handoff from gtm module to startup-ops module. Encapsulates launch configuration, analytics setup, and hypothesis validation framework for operational monitoring.
 */
export interface GTMToStartupOpsHandoff {
  /**
   * Venture identifier (UUID v4)
   */
  venture_id: string;
  /**
   * Actual or planned launch date
   */
  launch_date: string;
  /**
   * Current launch status
   */
  go_live_status?: "pre_launch" | "launched" | "paused";
  /**
   * High-level GTM strategy summary
   */
  gtm_strategy_summary: string;
  /**
   * Primary market/segment being targeted
   */
  target_market: string;
  /**
   * ICP for this launch
   */
  target_customer_profile?: {
    segment?: string;
    pain_point?: string;
    buying_authority?: string;
    [k: string]: unknown;
  };
  /**
   * Channels being activated for launch
   */
  launch_channels: {
    channel_name?:
      | "organic"
      | "paid_search"
      | "paid_social"
      | "content"
      | "partnerships"
      | "pr"
      | "community"
      | "direct_sales"
      | "influencer"
      | "affiliate"
      | "email";
    description?: string;
    launch_date?: string;
    responsible_person?: string;
    /**
     * Budget in USD
     */
    budget_allocated?: number;
    [k: string]: unknown;
  }[];
  /**
   * Active campaign IDs for tracking
   */
  campaign_ids?: {
    campaign_id?: string;
    campaign_name?: string;
    channel?: string;
    start_date?: string;
    [k: string]: unknown;
  }[];
  /**
   * Analytics setup for tracking launch success
   */
  analytics_configuration: {
    /**
     * e.g., 'Mixpanel', 'Amplitude', 'custom'
     */
    analytics_provider?: string;
    /**
     * Key events for monitoring
     */
    events_to_track?: {
      /**
       * e.g., 'user_signup', 'feature_activated'
       */
      event_name?: string;
      event_description?: string;
      /**
       * How is this tracked? (e.g., 'client SDK', 'server-side')
       */
      tracking_method?: string;
      attributes_to_capture?: string[];
      [k: string]: unknown;
    }[];
    /**
     * Primary conversion funnel
     */
    funnel_definition?: {
      funnel_name?: string;
      funnel_steps?: {
        step_name?: string;
        event_name?: string;
        description?: string;
        [k: string]: unknown;
      }[];
      [k: string]: unknown;
    };
    /**
     * URL to analytics dashboard
     */
    dashboard_url?: string;
    [k: string]: unknown;
  };
  /**
   * Metrics to monitor obsessively
   */
  critical_metrics: {
    /**
     * e.g., 'DAU', 'Signups', 'Feature Activation Rate'
     */
    metric_name?: string;
    /**
     * How is it calculated?
     */
    definition?: string;
    target_value?: number;
    unit?: string;
    /**
     * How often to check
     */
    tracking_interval?: "realtime" | "hourly" | "daily" | "weekly";
    /**
     * Alert if metric falls below this (or goes above, depending on metric)
     */
    alert_threshold?: number;
    [k: string]: unknown;
  }[];
  /**
   * Core hypothesis this launch validates
   */
  hypothesis_being_validated: {
    /**
     * The core hypothesis being tested
     */
    hypothesis_statement?: string;
    /**
     * How will we know if hypothesis is validated?
     */
    success_criteria?: {
      criterion?: string;
      target_metric?: string;
      target_value?: number;
      [k: string]: unknown;
    }[];
    /**
     * How many weeks to validate?
     */
    validation_timeline_weeks?: number;
    /**
     * How do we decide if validated vs invalidated?
     */
    decision_logic?: string;
    [k: string]: unknown;
  };
  /**
   * How will customers be acquired?
   */
  customer_acquisition_strategy?: {
    /**
     * Target customer acquisition cost
     */
    cac_target_usd?: number;
    /**
     * Estimated lifetime value
     */
    ltv_estimate_usd?: number;
    /**
     * Target LTV:CAC ratio (e.g., 3:1)
     */
    ltv_cac_ratio_target?: number;
    /**
     * Prioritized channels for acquisition
     */
    acquisition_channels_priority?: string[];
    [k: string]: unknown;
  };
  /**
   * How will users be activated?
   */
  activation_strategy?: {
    /**
     * % of signups to become active users
     */
    target_activation_rate?: number;
    /**
     * What defines an 'active' user for this product?
     */
    activation_definition?: string;
    key_activation_actions?: string[];
    [k: string]: unknown;
  };
  /**
   * How will users be retained?
   */
  retention_strategy?: {
    /**
     * Target monthly retention %
     */
    target_retention_rate?: number;
    /**
     * How to identify at-risk users
     */
    churn_monitoring?: string[];
    /**
     * Actions to improve retention
     */
    retention_initiatives?: string[];
    [k: string]: unknown;
  };
  /**
   * Revenue generation strategy
   */
  revenue_model?: {
    revenue_streams?: string[];
    /**
     * Target MRR by launch (can be 0 for freemium)
     */
    target_mrr_usd?: number;
    /**
     * Target ARR
     */
    target_arr_usd?: number;
    /**
     * Target CAC payback period
     */
    payback_period_months?: number;
    [k: string]: unknown;
  };
  /**
   * Items that must be complete before launch
   */
  pre_launch_checklist?: {
    item?: string;
    status?: "complete" | "in_progress" | "not_started" | "blocked";
    owner?: string;
    due_date?: string;
    [k: string]: unknown;
  }[];
  /**
   * Known launch risks and mitigation
   */
  launch_risks?: {
    risk?: string;
    probability?: "low" | "medium" | "high";
    impact?: "low" | "medium" | "high";
    mitigation?: string;
    [k: string]: unknown;
  }[];
  /**
   * When to review launch results
   */
  post_launch_review_date?: string;
  created_at?: string;
}
