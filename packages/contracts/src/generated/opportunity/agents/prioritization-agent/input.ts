/* eslint-disable */
/* auto-generated from modules/opportunity/agents/prioritization-agent/input.schema.json */

export interface PrioritizationAgentInput {
  /**
   * @minItems 1
   */
  scored_opportunities: [
    {
      opportunity_id?: string;
      title?: string;
      total_score?: number;
      recommendation?: string;
      discovery_date?: string;
      tags?: unknown[];
      [k: string]: unknown;
    },
    ...{
      opportunity_id?: string;
      title?: string;
      total_score?: number;
      recommendation?: string;
      discovery_date?: string;
      tags?: unknown[];
      [k: string]: unknown;
    }[]
  ];
  prioritization_context?: {
    portfolio_focus_areas?: string[];
    max_ventures_per_cycle?: number;
    /**
     * Enforce max 2 per vertical in advancement list
     */
    diversity_constraint?: boolean;
    minimum_advancement_score?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
