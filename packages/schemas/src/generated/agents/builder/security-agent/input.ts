/* eslint-disable */
// auto-generated from modules/builder/agents/security-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const SecurityAgentInputSchema = z.object({
  "code_repo_ref": z.string(),
  "deployed_staging_url": z.string().nullish(),
  "api_contract_refs": z.array(z.string()).nullish(),
  "infrastructure_spec": z.object({}).nullish(),
  "compliance_requirements": z.array(z.string()).nullish()
});
export type SecurityAgentInput = z.infer<typeof SecurityAgentInputSchema>;
