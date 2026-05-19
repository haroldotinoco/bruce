/* eslint-disable */
// auto-generated from modules/builder/agents/governance-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GovernanceAgentInputSchema = z.object({
  "functional_spec_report": z.object({}),
  "bdd_spec_report": z.object({}),
  "architecture_report": z.object({}).nullish(),
  "backend_report": z.object({}).nullish(),
  "frontend_report": z.object({}).nullish(),
  "qa_report": z.object({}),
  "security_report": z.object({}),
  "post_launch_monitoring_plan": z.object({}).nullish(),
  "rollback_procedure": z.object({}).nullish()
});
export type GovernanceAgentInput = z.infer<typeof GovernanceAgentInputSchema>;
