/* eslint-disable */
/* auto-generated from modules/gtm/agents/channel-strategist/input.schema.json */

/**
 * Product, audience, and resource context for channel strategy analysis
 */
export interface ChannelStrategistInput {
  product: ProductDefinition;
  target_audience: TargetAudience;
  resources: ResourceConstraints;
  market_context: MarketAndCompetitiveContext;
  goals?: GTMGoals;
  [k: string]: unknown;
}
export interface ProductDefinition {
  /**
   * Product name
   */
  name: string;
  /**
   * Product category
   */
  category:
    | "b2b-saas"
    | "b2c-consumer"
    | "marketplace"
    | "developer-tool"
    | "ai-agent"
    | "fintech"
    | "healthtech"
    | "edtech"
    | "other";
  /**
   * Core value proposition in 1-2 sentences
   */
  value_proposition: string;
  /**
   * How does it differ from existing solutions?
   */
  competitive_positioning?: string;
  /**
   * ARR or customer LTV estimate
   */
  price_point_usd?: number;
  [k: string]: unknown;
}
export interface TargetAudience {
  /**
   * Title/description of ideal customer (e.g., 'VP of Sales at Series B SaaS')
   */
  primary_persona: string;
  /**
   * Other decision makers or influencers
   */
  secondary_personas?: string[];
  /**
   * Target geographies (e.g., ['US', 'EU', 'APAC'])
   */
  geography?: string[];
  company_size?: {
    min_headcount?: number;
    max_headcount?: number;
    [k: string]: unknown;
  };
  /**
   * Where audience spends time (e.g., ['LinkedIn', 'Twitter', 'Slack', 'industry conferences'])
   */
  media_consumption?: string[];
  /**
   * Values, pain points, aspirations
   */
  psychographics?: string;
  [k: string]: unknown;
}
export interface ResourceConstraints {
  /**
   * Available marketing budget per month
   */
  monthly_budget_usd: number;
  /**
   * Number of dedicated marketing people (0.5 = part-time)
   */
  team_size: number;
  /**
   * What the team is already skilled in (e.g., ['content-writing', 'paid-social', 'partnership-ops'])
   */
  existing_capabilities?: string[];
  /**
   * Founder's existing network and credibility in target market
   */
  founder_network?: "weak" | "moderate" | "strong";
  [k: string]: unknown;
}
export interface MarketAndCompetitiveContext {
  /**
   * Known competitors and their visible marketing channels
   */
  competitors: {
    name?: string;
    estimated_active_channels?: string[];
    [k: string]: unknown;
  }[];
  /**
   * Recent shifts affecting GTM (e.g., 'iOS privacy changes', 'AI search impacts', 'LinkedIn algorithm changes')
   */
  market_trends?: string[];
  /**
   * Sales cycle length (e.g., 30 days for self-serve, 180 for enterprise)
   */
  time_to_revenue_days?: number;
  [k: string]: unknown;
}
export interface GTMGoals {
  /**
   * Marketing qualified leads target
   */
  target_mqls_per_month?: number;
  /**
   * Free signup target
   */
  target_signups_per_month?: number;
  /**
   * How many weeks to ramp GTM
   */
  timeline_weeks?: number;
  [k: string]: unknown;
}
