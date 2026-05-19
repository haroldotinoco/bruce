/* eslint-disable */
// auto-generated from modules/add-venture/agents/opportunity-analyst-vol1/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const OpportunityAnalystVol1OutputSchema = z.object({
  "venture_id": z.string(),
  "volume_number": z.literal(1),
  "volume_title": z.literal("Opportunity Diagnosis").nullish(),
  "content": z.object({
  "problem_anatomy": z.object({
  "core_problem": z.string().nullish(),
  "problem_evolution": z.string().nullish(),
  "stakeholder_impact": z.string().nullish(),
  "current_workarounds": z.array(z.string()).nullish(),
  "acceptance_criteria": z.array(z.string()).nullish()
}),
  "market_readiness": z.object({
  "maturity_stage": z.string().nullish(),
  "demand_signals": z.array(z.string()).nullish(),
  "competitive_activation": z.string().nullish(),
  "urgency_drivers": z.array(z.string()).nullish(),
  "timeline_assessment": z.string().nullish()
}),
  "addressable_market": z.object({
  "tam_analysis": z.string().nullish(),
  "sam_definition": z.string().nullish(),
  "som_realistic": z.string().nullish(),
  "growth_trajectory": z.string().nullish(),
  "unit_economics_feasibility": z.string().nullish()
}),
  "macro_context": z.object({
  "industry_trends": z.array(z.string()).nullish(),
  "regulatory_shifts": z.string().nullish(),
  "technology_enablers": z.array(z.string()).nullish(),
  "economic_context": z.string().nullish(),
  "demographic_drivers": z.array(z.string()).nullish()
}).nullish(),
  "opportunity_thesis": z.string()
}),
  "key_assumptions": z.array(z.string()).nullish(),
  "validation_roadmap": z.array(z.object({
  "assumption": z.string().nullish(),
  "validation_method": z.string().nullish(),
  "success_criteria": z.string().nullish()
})).nullish(),
  "confidence_score": z.number().min(0).max(100),
  "confidence_rationale": z.string().nullish(),
  "critical_unknowns": z.array(z.string()).nullish(),
  "execution_timestamp": z.string().nullish(),
  "agent_id": z.string().nullish()
});
export type OpportunityAnalystVol1Output = z.infer<typeof OpportunityAnalystVol1OutputSchema>;
