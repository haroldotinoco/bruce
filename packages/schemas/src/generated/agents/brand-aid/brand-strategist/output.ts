/* eslint-disable */
// auto-generated from modules/brand-aid/agents/brand-strategist/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BrandStrategistOutputSchema = z.object({
  "positioning": z.string(),
  "primary_archetype": z.enum(["Hero", "Sage", "Creator", "Innocent", "Explorer", "Lover", "Jester", "Everyman", "Caregiver", "Ruler", "Magician", "Mentor"]),
  "secondary_archetype": z.union([z.literal("Hero"), z.literal("Sage"), z.literal("Creator"), z.literal("Innocent"), z.literal("Explorer"), z.literal("Lover"), z.literal("Jester"), z.literal("Everyman"), z.literal("Caregiver"), z.literal("Ruler"), z.literal("Magician"), z.literal("Mentor"), z.null()]).nullish(),
  "brand_promise": z.string(),
  "personality_traits": z.array(z.string()),
  "values": z.array(z.string()),
  "target_customer_summary": z.object({
  "segment": z.string(),
  "primary_need": z.string(),
  "psychographic": z.string().nullish()
}),
  "competitive_context": z.string(),
  "strategic_rationale": z.string().nullish()
});
export type BrandStrategistOutput = z.infer<typeof BrandStrategistOutputSchema>;
