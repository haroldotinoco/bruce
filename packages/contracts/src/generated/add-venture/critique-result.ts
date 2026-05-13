/* eslint-disable */
/* auto-generated from modules/add-venture/critique-result.schema.json */

/**
 * Output from venture-critic agent reviewing complete dossier
 */
export interface CritiqueResult {
  venture_id: string;
  critique_timestamp: string;
  iteration_number?: number;
  /**
   * Composite dossier score
   */
  overall_score: number;
  /**
   * Score for each volume (vol_1 through vol_8)
   */
  volume_scores?: {
    [k: string]: number;
  };
  /**
   * Volumes scoring below 70 (flagged for iteration)
   */
  weak_volumes?: string[];
  improvement_suggestions?: {
    volume?: string;
    issue?: string;
    suggested_fix?: string;
    priority?: "critical" | "high" | "medium";
    [k: string]: unknown;
  }[];
  /**
   * Pass if score >= 70, iterate if 60-69, reject if < 60
   */
  recommendation: "pass" | "iterate" | "reject";
  iteration_limit_reached?: boolean;
  critique_notes?: string;
  [k: string]: unknown;
}
