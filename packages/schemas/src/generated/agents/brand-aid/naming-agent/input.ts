/* eslint-disable */
// auto-generated from modules/brand-aid/agents/naming-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const NamingAgentInputSchema = z.object({
  "creative_direction": z.object({
  "naming_criteria": z.array(z.string()).nullish(),
  "key_visual_metaphors": z.array(z.string()).nullish(),
  "brand_voice_examples": z.array(z.string()).nullish()
}),
  "positioning": z.string(),
  "target_customer": z.string().nullish(),
  "competitive_names": z.array(z.string()).nullish(),
  "naming_preferences": z.object({
  "preferred_length_syllables": z.number().int().min(1).max(4).nullish(),
  "preferred_style": z.array(z.string()).nullish(),
  "cultural_context": z.string().nullish(),
  "international_availability": z.boolean().nullish()
}).nullish()
});
export type NamingAgentInput = z.infer<typeof NamingAgentInputSchema>;
