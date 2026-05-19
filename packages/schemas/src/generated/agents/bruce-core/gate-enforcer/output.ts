/* eslint-disable */
// auto-generated from modules/bruce-core/agents/gate-enforcer/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GateEnforcerOutputSchema = z.object({
  "gate_decision_id": z.string(),
  "gate_name": z.enum(["post-screening", "post-structuring", "post-build", "post-launch", "post-traction"]),
  "venture_id": z.string(),
  "status": z.enum(["PASSED", "FAILED", "BORDERLINE"]),
  "score": z.number().min(0).max(100),
  "threshold": z.number(),
  "score_breakdown": z.object({}).catchall(z.object({
  "score": z.number().min(0).max(100).nullish(),
  "weight": z.number().min(0).max(1).nullish(),
  "weighted_contribution": z.number().nullish(),
  "rationale": z.string().nullish(),
  "data_points": z.array(z.string()).nullish()
})).nullish(),
  "overall_rationale": z.string().nullish(),
  "confidence_score": z.number().min(0).max(1).nullish(),
  "confidence_rationale": z.string().nullish(),
  "escalation_required": z.boolean().nullish(),
  "escalation_reason": z.string().nullish(),
  "key_strengths": z.array(z.string()).nullish(),
  "key_weaknesses": z.array(z.string()).nullish(),
  "conditions_for_improvement": z.array(z.object({
  "criterion": z.string().nullish(),
  "current_score": z.number().nullish(),
  "improvement_target": z.number().nullish(),
  "recommendations": z.array(z.string()).nullish()
})).nullish(),
  "recommendations_if_pass": z.array(z.string()).nullish(),
  "recommendations_if_fail": z.array(z.string()).nullish(),
  "evaluator_notes": z.string().nullish(),
  "evaluated_at": z.string().nullish(),
  "evaluation_duration_seconds": z.number().nullish(),
  "correlation_id": z.string().nullish()
});
export type GateEnforcerOutput = z.infer<typeof GateEnforcerOutputSchema>;
