/* eslint-disable */
/* auto-generated from modules/bruce-core/agents/gate-enforcer/output.schema.json */

/**
 * Output from the Gate Enforcer agent - a gate evaluation decision
 */
export interface GateEnforcerOutput {
  /**
   * Unique identifier for this gate decision
   */
  gate_decision_id: string;
  gate_name: "post-screening" | "post-structuring" | "post-build" | "post-launch" | "post-traction";
  venture_id: string;
  /**
   * Gate decision: PASSED (score ≥ threshold), FAILED (score < threshold - 5), BORDERLINE (in between)
   */
  status: "PASSED" | "FAILED" | "BORDERLINE";
  /**
   * Evaluation score on 0-100 scale
   */
  score: number;
  /**
   * Minimum score required to pass this gate
   */
  threshold: number;
  /**
   * Score for each evaluation criterion with weight
   */
  score_breakdown?: {
    [k: string]: {
      score?: number;
      weight?: number;
      weighted_contribution?: number;
      rationale?: string;
      /**
       * Specific data points supporting this score
       */
      data_points?: string[];
      [k: string]: unknown;
    };
  };
  /**
   * Summary explanation of the decision
   */
  overall_rationale?: string;
  /**
   * Confidence in this decision (0.0-1.0)
   */
  confidence_score?: number;
  /**
   * Explanation of confidence score - sources of uncertainty
   */
  confidence_rationale?: string;
  /**
   * Whether human review required (true for BORDERLINE, false otherwise)
   */
  escalation_required?: boolean;
  /**
   * If escalation_required, explain why human review needed
   */
  escalation_reason?: string;
  /**
   * What venture is doing well
   */
  key_strengths?: string[];
  /**
   * Areas of concern
   */
  key_weaknesses?: string[];
  /**
   * If FAILED or BORDERLINE, how to improve for next evaluation
   */
  conditions_for_improvement?: {
    criterion?: string;
    current_score?: number;
    improvement_target?: number;
    recommendations?: string[];
    [k: string]: unknown;
  }[];
  /**
   * If PASSED, recommendations for next stage
   */
  recommendations_if_pass?: string[];
  /**
   * If FAILED, recommendations for remediation
   */
  recommendations_if_fail?: string[];
  /**
   * Additional context or observations from evaluator
   */
  evaluator_notes?: string;
  evaluated_at?: string;
  /**
   * How long the evaluation took
   */
  evaluation_duration_seconds?: number;
  correlation_id?: string;
  [k: string]: unknown;
}
