/* eslint-disable */
/* auto-generated from modules/gtm/agents/content-system-agent/input.schema.json */

/**
 * Product messaging, positioning, and distribution context for content system design
 */
export interface ContentSystemAgentInput {
  product: {
    name: string;
    /**
     * Single sentence value proposition
     */
    core_value_prop: string;
    category: string;
    /**
     * Top 3 ways product differs from competitors
     */
    key_differentiators: string[];
    /**
     * Specific use cases (e.g., 'preventing insider data theft', 'reducing mean-time-to-incident')
     */
    target_use_cases?: string[];
    [k: string]: unknown;
  };
  target_audience: {
    personas: {
      name: string;
      role: string;
      pain_points: string[];
      /**
       * What matters to this persona (e.g., 'cost savings', 'ease of use', 'compliance')
       */
      values: string[];
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  };
  /**
   * Where content will be published
   */
  distribution_channels: (
    | "linkedin"
    | "twitter"
    | "newsletter"
    | "blog"
    | "tiktok"
    | "youtube"
    | "instagram"
    | "industry-publication"
    | "podcast"
    | "webinar"
    | "community"
  )[];
  brand_guidelines: {
    /**
     * Overall brand tone
     */
    tone: "formal" | "conversational" | "provocative" | "educational" | "playful";
    /**
     * Examples of brand voice (e.g., 'We explain complex security in plain English')
     */
    voice_examples: string[];
    /**
     * Brand messaging pillars (optional; will be refined)
     */
    messaging_pillars?: string[];
    /**
     * Brand colors or palette
     */
    brand_colors?: string;
    logo_url?: string;
    [k: string]: unknown;
  };
  resources?: {
    /**
     * FTE dedicated to content production
     */
    content_team_size?: number;
    /**
     * Desired content publishing cadence
     */
    publishing_frequency?: "daily" | "3x-weekly" | "2x-weekly" | "weekly" | "bi-weekly";
    /**
     * Can hire external writers/designers?
     */
    outsourcing_available?: boolean;
    [k: string]: unknown;
  };
  success_metrics?: {
    monthly_engagement_target?: number;
    monthly_lead_target?: number;
    /**
     * % of template-generated vs custom content
     */
    content_reuse_target_percent?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
