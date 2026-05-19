/* eslint-disable */
// auto-generated from modules/builder/agents/backend-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BackendAgentInputSchema = z.object({
  "architecture_spec": z.object({}),
  "bdd_scenarios": z.array(z.unknown()),
  "data_models": z.array(z.unknown()),
  "api_contracts": z.array(z.unknown()).nullish(),
  "environment_config": z.object({}).nullish()
});
export type BackendAgentInput = z.infer<typeof BackendAgentInputSchema>;
