/* eslint-disable */
// auto-generated from modules/add-venture/agents/briefing-interpreter/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BriefingInterpreterOutputSchema = z.object({
  "venture_id": z.string(),
  "opportunity_id": z.string(),
  "briefing_timestamp": z.string(),
  "briefing_version": z.string().nullish(),
  "problem_context": z.object({
  "core_problem": z.string().nullish(),
  "affected_personas": z.array(z.string()).nullish(),
  "current_solutions": z.array(z.string()).nullish(),
  "confidence_level": z.number().nullish()
}),
  "market_context": z.object({
  "tam": z.number().nullish(),
  "sam": z.number().nullish(),
  "som": z.number().nullish(),
  "market_dynamics": z.string().nullish(),
  "regulatory_environment": z.string().nullish(),
  "confidence_level": z.number().nullish()
}),
  "customer_context": z.object({
  "primary_segment": z.string().nullish(),
  "segment_size": z.number().int().nullish(),
  "jtbd_functional": z.string().nullish(),
  "jtbd_emotional": z.string().nullish(),
  "willingness_to_pay": z.string().nullish(),
  "confidence_level": z.number().nullish()
}),
  "competitive_context": z.object({
  "direct_competitors": z.array(z.string()).nullish(),
  "indirect_competitors": z.array(z.string()).nullish(),
  "competitive_intensity": z.string().nullish(),
  "differentiation_opportunities": z.array(z.string()).nullish(),
  "barriers_to_entry": z.array(z.string()).nullish(),
  "confidence_level": z.number().nullish()
}),
  "portfolio_context": z.object({
  "strategic_fit_summary": z.string().nullish(),
  "capital_efficiency": z.string().nullish(),
  "team_skill_fit": z.string().nullish(),
  "confidence_level": z.number().nullish()
}).nullish(),
  "key_assumptions": z.array(z.string()).nullish(),
  "data_gaps": z.array(z.string()).nullish(),
  "briefing_quality_score": z.number().min(0).max(100).nullish()
});
export type BriefingInterpreterOutput = z.infer<typeof BriefingInterpreterOutputSchema>;
