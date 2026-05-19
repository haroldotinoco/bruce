/* eslint-disable */
// auto-generated from modules/builder/agents/frontend-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const FrontendAgentInputSchema = z.object({
  "bdd_scenarios": z.array(z.unknown()),
  "wireframes": z.array(z.unknown()),
  "design_tokens": z.object({}).nullish(),
  "api_contracts": z.array(z.unknown()).nullish(),
  "navigation_structure": z.object({}).nullish()
});
export type FrontendAgentInput = z.infer<typeof FrontendAgentInputSchema>;
