/* eslint-disable */
/* auto-generated from modules/brand-aid/agents/market-analyst/input.schema.json */

export interface MarketAnalystInput {
  /**
   * The venture hypothesis for context
   */
  venture_hypothesis: string;
  /**
   * List of competitors to research (5-10 max)
   */
  competitors: {
    name: string;
    website?: string;
    category?: "direct" | "adjacent" | "category_leader";
    [k: string]: unknown;
  }[];
  /**
   * Target customer segment for research focus
   */
  customer_segment: string;
  /**
   * Specific areas to research (e.g., 'brand messaging', 'customer reviews', 'positioning claims')
   */
  research_focus?: string[];
  /**
   * Geographic scope for research
   */
  geographic_scope?: "global" | "regional" | "national";
  /**
   * How current should research be (e.g., 'last_12_months', 'last_6_months')
   */
  timeframe?: string;
  [k: string]: unknown;
}
