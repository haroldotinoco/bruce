/* eslint-disable */
/* auto-generated from modules/gtm/agents/channel-strategist/output.schema.json */

export type RankedChannelRecommendations = {
  /**
   * Priority ranking (1 = highest priority)
   */
  rank: number;
  /**
   * Channel name (e.g., 'paid-linkedin', 'organic-seo', 'product-hunt', 'partnerships', 'content-marketing', 'paid-google-ads', 'plg-virality')
   */
  channel: string;
  /**
   * Why this channel is effective for this audience and product
   */
  rationale: string;
  /**
   * How well does this channel reach target audience?
   */
  audience_fit_score: number;
  /**
   * How easy to execute (100 = very easy, 0 = complex)
   */
  implementation_ease: number;
  /**
   * Days until meaningful results (signups, engagement)
   */
  time_to_traction_days?: number;
  /**
   * Monthly budget range for this channel
   */
  estimated_budget_range_usd?: {
    min: number;
    max: number;
    [k: string]: unknown;
  };
  /**
   * FTE dedicated to this channel (0.25 = quarter-time)
   */
  required_team_size?: number;
  /**
   * Execution risks or external dependencies
   */
  risk_factors?: string[];
  /**
   * Key metrics to track (e.g., 'CPL', 'Conversion Rate', 'Content velocity')
   */
  success_metrics?: string[];
  [k: string]: unknown;
}[];
export type ChannelsNotRecommended = {
  channel: string;
  reason: string;
  [k: string]: unknown;
}[];

/**
 * Ranked channel recommendations with rationale and resource planning
 */
export interface ChannelStrategistOutput {
  recommended_channels: RankedChannelRecommendations;
  channels_to_avoid?: ChannelsNotRecommended;
  competitive_analysis?: MarketCompetitiveContext;
  resource_requirements: ResourcePlanning;
  /**
   * Ordered list of immediate actions to execute strategy
   */
  next_steps: string[];
  /**
   * Confidence in this strategy given available data
   */
  confidence_score?: number;
  [k: string]: unknown;
}
export interface MarketCompetitiveContext {
  /**
   * Mapping of each competitor to their active channels
   */
  competitor_channels: {
    [k: string]: string[];
  };
  /**
   * Underexploited channels where we can differentiate
   */
  market_gaps?: string[];
  /**
   * How market trends affect channel effectiveness
   */
  trends_analysis?: string;
  [k: string]: unknown;
}
export interface ResourcePlanning {
  /**
   * Total recommended monthly budget across all channels
   */
  total_monthly_budget_usd: number;
  /**
   * Channel-by-channel budget breakdown
   */
  budget_allocation?: {
    [k: string]: number;
  };
  /**
   * Total dedicated marketing FTE
   */
  team_headcount: number;
  /**
   * Roles needed (e.g., 'Paid Social Manager', 'Content Writer', 'Partnership Manager')
   */
  team_composition?: string[];
  /**
   * Software/services to acquire (e.g., 'LinkedIn Campaign Manager', 'Google Ads', 'Airtable')
   */
  required_tools?: string[];
  /**
   * Days until first traction signal across strategy
   */
  timeline_to_first_result_days: number;
  [k: string]: unknown;
}
