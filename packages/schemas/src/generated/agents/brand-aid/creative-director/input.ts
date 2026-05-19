/* eslint-disable */
// auto-generated from modules/brand-aid/agents/creative-director/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const CreativeDirectorInputSchema = z.object({
  "brand_strategy": z.object({
  "positioning": z.string().nullish(),
  "primary_archetype": z.string().nullish(),
  "secondary_archetype": z.string().nullish(),
  "brand_promise": z.string().nullish(),
  "personality_traits": z.array(z.string()).nullish(),
  "values": z.array(z.string()).nullish()
}),
  "market_analysis": z.object({
  "white_space_opportunities": z.array(z.unknown()).nullish(),
  "competitor_positioning_map": z.array(z.unknown()).nullish(),
  "tone_and_voice_analysis": z.object({}).nullish()
}),
  "visual_inspiration": z.array(z.string()).nullish(),
  "brand_voice_references": z.array(z.string()).nullish(),
  "design_constraints": z.array(z.string()).nullish()
});
export type CreativeDirectorInput = z.infer<typeof CreativeDirectorInputSchema>;
