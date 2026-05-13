/* eslint-disable */
/* auto-generated from modules/bruce-core/agents/governance-agent/output.schema.json */

/**
 * Portfolio governance decision from Governance Agent
 */
export interface GovernanceAgentOutput {
  portfolio_decision_id: string;
  decision: "SCALE" | "ITERATE" | "PAUSE" | "KILL";
  venture_id: string;
  venture_name?: string;
  /**
   * High-level summary of decision rationale
   */
  reasoning?: string;
  /**
   * Confidence in this decision (0.0-1.0)
   */
  confidence_score: number;
  /**
   * Explanation of confidence score - sources of uncertainty
   */
  confidence_rationale?: string;
  /**
   * Key metrics supporting the decision
   */
  supporting_metrics?: {
    month_2_retention?: number;
    cac_ltv_ratio?: number;
    wow_growth_pct?: number;
    nps?: number;
    burn_rate_months?: number;
    [k: string]: unknown;
  };
  /**
   * What the venture is doing well
   */
  key_strengths?: string[];
  /**
   * Risks or concerns with current trajectory
   */
  key_risks?: string[];
  /**
   * Specific next steps
   */
  recommended_actions?: string[];
  /**
   * If-then contingencies
   */
  contingency_plans?: {
    condition?: string;
    action?: string;
    [k: string]: unknown;
  }[];
  /**
   * Recommended timing for actions
   */
  timeline?: string;
  /**
   * When to re-evaluate this venture
   */
  next_review_date?: string;
  /**
   * Category of governance decision
   */
  decision_category?: "growth_decision" | "optimization_decision" | "risk_mitigation" | "resource_allocation";
  /**
   * Can this decision be undone
   */
  reversibility?: "reversible" | "partially_reversible" | "irreversible";
  /**
   * If KILL or PAUSE: who must approve (e.g., ['founder', 'portfolio_manager'])
   */
  required_approvals?: string[];
  /**
   * governance-agent
   */
  decided_by?: string;
  decided_at?: string;
  correlation_id?: string;
  [k: string]: unknown;
}
