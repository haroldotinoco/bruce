/* eslint-disable */
/* auto-generated from modules/startup-ops/contracts/ops-recommendation.schema.json */

/**
 * Actionable operational recommendation with urgency and expected impact
 */
export interface OpsRecommendation {
  recommendation_id: string;
  venture_id: string;
  created_at: string;
  area:
    | "activation"
    | "retention"
    | "revenue"
    | "product_quality"
    | "financial_sustainability"
    | "market_fit"
    | "general";
  title: string;
  description?: string;
  urgency: "immediate" | "this_week" | "next_cycle";
  expected_impact?: string;
  /**
   * @minItems 1
   */
  specific_actions: [string, ...string[]];
  metrics_to_watch?: string[];
  created_from_anomaly_id?: string | null;
  [k: string]: unknown;
}
