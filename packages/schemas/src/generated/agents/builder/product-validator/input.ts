/* eslint-disable */
// auto-generated from modules/builder/agents/product-validator/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ProductValidatorInputSchema = z.object({
  "venture_hypothesis": z.string(),
  "target_users": z.array(z.object({
  "segment": z.string().nullish(),
  "needs": z.array(z.string()).nullish(),
  "use_case": z.string().nullish()
})),
  "proposed_features": z.array(z.object({
  "name": z.string().nullish(),
  "description": z.string().nullish(),
  "priority": z.enum(["critical", "high", "medium", "low"]).nullish()
})).nullish(),
  "constraints": z.object({
  "tech_stack": z.string().nullish(),
  "timeline": z.string().nullish(),
  "team_size": z.number().int().nullish(),
  "budget": z.string().nullish()
}).nullish(),
  "success_metrics": z.array(z.string()).nullish()
});
export type ProductValidatorInput = z.infer<typeof ProductValidatorInputSchema>;
