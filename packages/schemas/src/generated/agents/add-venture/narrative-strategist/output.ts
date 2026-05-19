/* eslint-disable */
// auto-generated from modules/add-venture/agents/narrative-strategist/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const NarrativeStrategistOutputSchema = z.object({
  "venture_id": z.string(),
  "volume_number": z.literal(6),
  "volume_title": z.string(),
  "one_liner": z.string(),
  "elevator_pitches": z.object({
  "thirty_seconds": z.string().nullish(),
  "two_minutes": z.string().nullish()
}),
  "messaging_pillars": z.array(z.object({
  "pillar": z.string().nullish(),
  "why_matters": z.string().nullish(),
  "supporting_evidence": z.array(z.string()).nullish()
})),
  "tone_of_voice": z.array(z.string()),
  "brand_narrative": z.object({
  "heros_journey": z.string().nullish(),
  "what_we_stand_for": z.string().nullish(),
  "customer_transformation": z.string().nullish(),
  "why_now": z.string().nullish()
}),
  "investor_pitch_hook": z.string(),
  "tagline_candidates": z.array(z.string()).nullish(),
  "stakeholder_narratives": z.object({
  "customer_narrative": z.string().nullish(),
  "investor_narrative": z.string().nullish(),
  "employee_narrative": z.string().nullish(),
  "partner_narrative": z.string().nullish()
}).nullish(),
  "assumptions": z.array(z.string()).nullish(),
  "data_gaps": z.array(z.string()).nullish(),
  "confidence_score": z.number().min(0).max(100),
  "confidence_rationale": z.string().nullish(),
  "key_sections": z.array(z.string()).nullish(),
  "execution_timestamp": z.string().nullish(),
  "agent_id": z.string().nullish()
});
export type NarrativeStrategistOutput = z.infer<typeof NarrativeStrategistOutputSchema>;
