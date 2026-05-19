/* eslint-disable */
// auto-generated from modules/add-venture/agents/risk-validation-analyst/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const RiskValidationAnalystOutputSchema = z.object({
  "venture_id": z.string(),
  "volume_number": z.literal(7),
  "volume_title": z.string(),
  "critical_assumptions": z.array(z.object({
  "assumption": z.string().nullish(),
  "risk_level": z.enum(["high", "medium", "low"]).nullish(),
  "validation_method": z.string().nullish(),
  "timeline_days": z.number().int().nullish(),
  "success_criteria": z.string().nullish(),
  "priority_rank": z.number().int().nullish()
})),
  "risk_matrix": z.object({
  "high_impact_high_likelihood": z.array(z.string()).nullish(),
  "high_impact_medium_likelihood": z.array(z.string()).nullish(),
  "high_impact_low_likelihood": z.array(z.string()).nullish(),
  "medium_impact_high_likelihood": z.array(z.string()).nullish(),
  "other_risks": z.array(z.string()).nullish()
}),
  "kill_criteria": z.array(z.object({
  "criterion": z.string().nullish(),
  "measurement_method": z.string().nullish(),
  "kill_threshold": z.string().nullish(),
  "timeline_days": z.number().int().nullish()
})),
  "validation_roadmap": z.array(z.object({
  "experiment_name": z.string().nullish(),
  "assumption_testing": z.array(z.string()).nullish(),
  "method": z.string().nullish(),
  "duration_days": z.number().int().nullish(),
  "success_metric": z.string().nullish(),
  "expected_learning": z.string().nullish(),
  "go_no_go_decision": z.string().nullish()
})),
  "minimum_viable_validation": z.object({
  "first_30_days": z.array(z.string()).nullish(),
  "target_learning": z.array(z.string()).nullish(),
  "resource_requirement": z.string().nullish()
}),
  "risk_mitigation_strategy": z.object({
  "top_5_risks": z.array(z.string()).nullish(),
  "mitigation_actions": z.array(z.object({
  "risk": z.string().nullish(),
  "action": z.string().nullish(),
  "timeline_weeks": z.number().int().nullish()
})).nullish(),
  "unmitigatable_risks": z.array(z.string()).nullish(),
  "total_de_risking_timeline_months": z.number().nullish()
}),
  "assumptions": z.array(z.string()).nullish(),
  "data_gaps": z.array(z.string()).nullish(),
  "confidence_score": z.number().min(0).max(100),
  "confidence_rationale": z.string().nullish(),
  "key_sections": z.array(z.string()).nullish(),
  "execution_timestamp": z.string().nullish(),
  "agent_id": z.string().nullish()
});
export type RiskValidationAnalystOutput = z.infer<typeof RiskValidationAnalystOutputSchema>;
