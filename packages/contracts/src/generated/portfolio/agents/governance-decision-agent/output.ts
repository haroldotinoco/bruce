/* eslint-disable */
/* auto-generated from modules/portfolio/agents/governance-decision-agent/output.schema.json */

/**
 * Final governance decisions for all ventures in review cycle
 */
export interface GovernanceDecisionAgentOutput {
  governance_decisions: {
    decision_timestamp: string;
    /**
     * Per-venture governance decisions
     */
    decisions: {
      venture_id: string;
      name: string;
      decision: "scale" | "iterate" | "pause" | "kill";
      /**
       * Confidence in this decision
       */
      confidence_score: number;
      /**
       * Clear explanation of decision
       */
      rationale: string;
      /**
       * Key metrics supporting decision
       */
      supporting_metrics?: {
        health_score?: number;
        traction_score?: number;
        monthly_growth_rate?: number;
        cac_ltv_ratio?: number;
        runway_months?: number;
        [k: string]: unknown;
      };
      /**
       * If kill decision: which criteria triggered it
       */
      kill_criteria_met?: {
        criterion?: string;
        evidence?: string;
        [k: string]: unknown;
      }[];
      /**
       * What needs to happen next
       */
      next_milestones?: {
        milestone?: string;
        target_date?: string;
        success_criteria?: string;
        [k: string]: unknown;
      }[];
      /**
       * Resource level from allocation-agent
       */
      resource_recommendation?: "increase" | "maintain" | "decrease";
      /**
       * Specific risks to monitor post-decision
       */
      risk_flags?: string[];
      /**
       * Does this decision require human approval?
       */
      human_review_required?: boolean;
      /**
       * Can this decision be reversed?
       */
      decision_reversibility?: "easily_reversible" | "moderately_reversible" | "difficult_to_reverse";
      [k: string]: unknown;
    }[];
    /**
     * Portfolio-level decision summary
     */
    summary: {
      total_ventures_reviewed?: number;
      decisions_by_type?: {
        scale?: number;
        iterate?: number;
        pause?: number;
        kill?: number;
        [k: string]: unknown;
      };
      ventures_requiring_human_review?: string[];
      /**
       * Total monthly budget change from decisions (USD)
       */
      total_budget_impact?: number;
      /**
       * High-level summary of governance cycle
       */
      portfolio_narrative?: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
