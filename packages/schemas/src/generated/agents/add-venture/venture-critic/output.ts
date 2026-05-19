/* eslint-disable */
// auto-generated from modules/add-venture/agents/venture-critic/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const VentureCriticOutputSchema = z.object({
  "venture_id": z.string(),
  "critique_timestamp": z.string(),
  "overall_score": z.number().min(0).max(100),
  "dimension_scores": z.object({
  "market_clarity": z.number().nullish(),
  "customer_evidence": z.number().nullish(),
  "model_soundness": z.number().nullish(),
  "gtm_realism": z.number().nullish(),
  "risk_awareness": z.number().nullish(),
  "narrative_quality": z.number().nullish()
}),
  "volume_scores": z.object({}).catchall(z.number()),
  "weak_volumes": z.array(z.string()).nullish(),
  "specific_feedback": z.array(z.object({
  "volume": z.string().nullish(),
  "issue": z.string().nullish(),
  "recommendation": z.string().nullish(),
  "severity": z.enum(["critical", "high", "medium"]).nullish()
})).nullish(),
  "coherence_assessment": z.object({
  "narrative_coherence": z.string().nullish(),
  "internal_contradictions": z.array(z.string()).nullish(),
  "assumption_validation": z.string().nullish()
}).nullish(),
  "improvement_required": z.boolean().nullish(),
  "approval_recommendation": z.enum(["advance", "iterate", "reject"]),
  "iteration_guidance": z.object({
  "weak_volumes_to_rework": z.array(z.string()).nullish(),
  "focus_areas": z.array(z.string()).nullish(),
  "timeline_days": z.number().int().nullish()
}).nullish(),
  "critique_notes": z.string().nullish(),
  "execution_timestamp": z.string().nullish(),
  "agent_id": z.string().nullish()
});
export type VentureCriticOutput = z.infer<typeof VentureCriticOutputSchema>;
