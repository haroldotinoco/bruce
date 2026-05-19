/* eslint-disable */
// auto-generated from modules/builder/agents/qa-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const QaAgentInputSchema = z.object({
  "bdd_scenarios": z.array(z.unknown()),
  "staging_url": z.string(),
  "test_credentials": z.object({
  "email": z.string().nullish(),
  "password": z.string().nullish()
}).nullish(),
  "test_environment_setup": z.object({}).nullish()
});
export type QaAgentInput = z.infer<typeof QaAgentInputSchema>;
