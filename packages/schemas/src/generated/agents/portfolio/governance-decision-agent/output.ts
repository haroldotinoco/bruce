/* eslint-disable */
// auto-generated from modules/portfolio/agents/governance-decision-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GovernanceDecisionAgentOutputSchema = z.object({
  "governance_decisions": z.object({
  "decision_timestamp": z.string(),
  "decisions": z.array(z.object({
  "venture_id": z.string(),
  "name": z.string(),
  "decision": z.enum(["scale", "iterate", "pause", "kill"]),
  "confidence_score": z.number().min(0).max(100),
  "rationale": z.string(),
  "supporting_metrics": z.object({
  "health_score": z.number().nullish(),
  "traction_score": z.number().nullish(),
  "monthly_growth_rate": z.number().nullish(),
  "cac_ltv_ratio": z.number().nullish(),
  "runway_months": z.number().nullish()
}).nullish(),
  "kill_criteria_met": z.array(z.object({
  "criterion": z.string().nullish(),
  "evidence": z.string().nullish()
})).nullish(),
  "next_milestones": z.array(z.object({
  "milestone": z.string().nullish(),
  "target_date": z.string().nullish(),
  "success_criteria": z.string().nullish()
})).nullish(),
  "resource_recommendation": z.enum(["increase", "maintain", "decrease"]).nullish(),
  "risk_flags": z.array(z.string()).nullish(),
  "human_review_required": z.boolean().nullish(),
  "decision_reversibility": z.enum(["easily_reversible", "moderately_reversible", "difficult_to_reverse"]).nullish()
})),
  "summary": z.object({
  "total_ventures_reviewed": z.number().int().nullish(),
  "decisions_by_type": z.object({
  "scale": z.number().int().nullish(),
  "iterate": z.number().int().nullish(),
  "pause": z.number().int().nullish(),
  "kill": z.number().int().nullish()
}).nullish(),
  "ventures_requiring_human_review": z.array(z.string()).nullish(),
  "total_budget_impact": z.number().nullish(),
  "portfolio_narrative": z.string().nullish()
})
})
});
export type GovernanceDecisionAgentOutput = z.infer<typeof GovernanceDecisionAgentOutputSchema>;
