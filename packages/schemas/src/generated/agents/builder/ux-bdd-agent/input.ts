/* eslint-disable */
// auto-generated from modules/builder/agents/ux-bdd-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const UxBddAgentInputSchema = z.object({
  "functional_spec": z.object({}),
  "user_flows": z.array(z.object({})),
  "design_system": z.object({}).nullish(),
  "accessibility_requirements": z.object({}).nullish()
});
export type UxBddAgentInput = z.infer<typeof UxBddAgentInputSchema>;
