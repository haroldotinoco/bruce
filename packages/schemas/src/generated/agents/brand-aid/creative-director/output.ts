/* eslint-disable */
// auto-generated from modules/brand-aid/agents/creative-director/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const CreativeDirectorOutputSchema = z.object({
  "creative_brief": z.string(),
  "mood_board_description": z.string(),
  "visual_language_criteria": z.array(z.string()),
  "naming_criteria": z.array(z.string()),
  "tone_of_voice_guidelines": z.string(),
  "design_token_guidance": z.object({
  "color_temperature": z.string().nullish(),
  "color_vibrancy": z.string().nullish(),
  "typography_attitude": z.string().nullish(),
  "spacing_philosophy": z.string().nullish(),
  "imagery_style": z.string().nullish()
}).nullish(),
  "key_visual_metaphors": z.array(z.string()).nullish(),
  "brand_voice_examples": z.array(z.string()).nullish(),
  "constraints_and_guardrails": z.array(z.string()).nullish()
});
export type CreativeDirectorOutput = z.infer<typeof CreativeDirectorOutputSchema>;
