/* eslint-disable */
// auto-generated from modules/builder/agents/solution-architect/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const SolutionArchitectInputSchema = z.object({
  "functional_spec": z.object({}),
  "bdd_spec": z.object({}),
  "tech_stack_requirements": z.object({
  "backend_preference": z.string().nullish(),
  "database_preference": z.string().nullish(),
  "cloud_provider": z.string().nullish()
}).nullish(),
  "scalability_requirements": z.object({
  "initial_users": z.number().int().nullish(),
  "growth_forecast_months": z.number().int().nullish(),
  "peak_concurrent_users": z.number().int().nullish()
}).nullish(),
  "compliance_requirements": z.array(z.string()).nullish()
});
export type SolutionArchitectInput = z.infer<typeof SolutionArchitectInputSchema>;
