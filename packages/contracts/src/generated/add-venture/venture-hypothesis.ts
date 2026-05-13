/* eslint-disable */
/* auto-generated from modules/add-venture/venture-hypothesis.schema.json */

/**
 * Complete 8-volume venture hypothesis dossier for a funded opportunity
 */
export interface VentureHypothesis {
  /**
   * Unique identifier for this venture hypothesis
   */
  venture_id: string;
  /**
   * Reference to source opportunity
   */
  opportunity_id: string;
  /**
   * Proposed venture name
   */
  venture_name: string;
  created_date: string;
  last_updated?: string;
  volumes?: {
    vol_1_opportunity?: {
      title?: string;
      content?: string;
      confidence_score?: number;
      [k: string]: unknown;
    };
    vol_2_customer_market?: {
      title?: string;
      content?: string;
      confidence_score?: number;
      [k: string]: unknown;
    };
    vol_3_value_proposition?: {
      title?: string;
      content?: string;
      confidence_score?: number;
      [k: string]: unknown;
    };
    vol_4_business_model?: {
      title?: string;
      content?: string;
      confidence_score?: number;
      [k: string]: unknown;
    };
    vol_5_go_to_market?: {
      title?: string;
      content?: string;
      confidence_score?: number;
      [k: string]: unknown;
    };
    vol_6_narrative_strategy?: {
      title?: string;
      content?: string;
      confidence_score?: number;
      [k: string]: unknown;
    };
    vol_7_risk_validation?: {
      title?: string;
      content?: string;
      confidence_score?: number;
      [k: string]: unknown;
    };
    vol_8_execution_roadmap?: {
      title?: string;
      content?: string;
      confidence_score?: number;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  /**
   * Composite score across all volumes
   */
  overall_dossier_score?: number;
  status: "structuring" | "structuring_in_progress" | "structured" | "rejected";
  iteration_count?: number;
  critique_feedback?: {
    iteration?: number;
    score?: number;
    weak_volumes?: string[];
    suggestions?: string[];
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
