/* eslint-disable */
// auto-generated from modules/bruce-core/agents/governance-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GovernanceAgentOutputSchema = z.object({
  "portfolio_decision_id": z.string(),
  "decision": z.enum(["SCALE", "ITERATE", "PAUSE", "KILL"]),
  "venture_id": z.string(),
  "venture_name": z.string().nullish(),
  "reasoning": z.string().nullish(),
  "confidence_score": z.number().min(0).max(1),
  "confidence_rationale": z.string().nullish(),
  "supporting_metrics": z.object({
  "month_2_retention": z.number().nullish(),
  "cac_ltv_ratio": z.number().nullish(),
  "wow_growth_pct": z.number().nullish(),
  "nps": z.number().nullish(),
  "burn_rate_months": z.number().nullish()
}).nullish(),
  "key_strengths": z.array(z.string()).nullish(),
  "key_risks": z.array(z.string()).nullish(),
  "recommended_actions": z.array(z.string()).nullish(),
  "contingency_plans": z.array(z.object({
  "condition": z.string().nullish(),
  "action": z.string().nullish()
})).nullish(),
  "timeline": z.string().nullish(),
  "next_review_date": z.string().nullish(),
  "decision_category": z.enum(["growth_decision", "optimization_decision", "risk_mitigation", "resource_allocation"]).nullish(),
  "reversibility": z.enum(["reversible", "partially_reversible", "irreversible"]).nullish(),
  "required_approvals": z.array(z.string()).nullish(),
  "decided_by": z.string().nullish(),
  "decided_at": z.string().nullish(),
  "correlation_id": z.string().nullish()
});
export type GovernanceAgentOutput = z.infer<typeof GovernanceAgentOutputSchema>;
