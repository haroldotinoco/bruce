/* eslint-disable */
/* auto-generated from modules/add-venture/agents/venture-critic/output.schema.json */

export interface VentureCriticOutput {
  venture_id: string;
  critique_timestamp: string;
  overall_score: number;
  dimension_scores: {
    market_clarity?: number;
    customer_evidence?: number;
    model_soundness?: number;
    gtm_realism?: number;
    risk_awareness?: number;
    narrative_quality?: number;
    [k: string]: unknown;
  };
  volume_scores: {
    [k: string]: number;
  };
  /**
   * Volumes scoring <65 flagged for iteration
   */
  weak_volumes?: string[];
  specific_feedback?: {
    volume?: string;
    issue?: string;
    recommendation?: string;
    severity?: "critical" | "high" | "medium";
    [k: string]: unknown;
  }[];
  coherence_assessment?: {
    narrative_coherence?: string;
    internal_contradictions?: string[];
    assumption_validation?: string;
    [k: string]: unknown;
  };
  improvement_required?: boolean;
  approval_recommendation: "advance" | "iterate" | "reject";
  iteration_guidance?: {
    weak_volumes_to_rework?: string[];
    focus_areas?: string[];
    timeline_days?: number;
    [k: string]: unknown;
  };
  critique_notes?: string;
  execution_timestamp?: string;
  agent_id?: string;
  [k: string]: unknown;
}
