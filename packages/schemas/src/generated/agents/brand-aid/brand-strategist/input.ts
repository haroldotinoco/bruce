/* eslint-disable */
// auto-generated from modules/brand-aid/agents/brand-strategist/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BrandStrategistInputSchema = z.object({
  "venture_hypothesis": z.string(),
  "target_customer": z.object({
  "segment": z.string(),
  "needs": z.array(z.string()),
  "pain_points": z.array(z.string())
}),
  "problem_statement": z.string(),
  "competitive_landscape": z.array(z.object({
  "competitor": z.string().nullish(),
  "positioning": z.string().nullish(),
  "strengths": z.array(z.string()).nullish(),
  "weaknesses": z.array(z.string()).nullish()
})).nullish(),
  "business_model": z.object({
  "revenue_model": z.string().nullish(),
  "customer_acquisition": z.string().nullish(),
  "unit_economics": z.string().nullish()
}).nullish(),
  "desired_perception": z.string().nullish(),
  "constraints": z.array(z.string()).nullish()
});
export type BrandStrategistInput = z.infer<typeof BrandStrategistInputSchema>;
