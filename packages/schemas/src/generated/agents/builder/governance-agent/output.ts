/* eslint-disable */
// auto-generated from modules/builder/agents/governance-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GovernanceAgentOutputSchema = z.object({
  "launch_approved": z.boolean(),
  "approval_rationale": z.string(),
  "blocking_issues": z.array(z.object({
  "stage": z.string().nullish(),
  "issue": z.string().nullish(),
  "severity": z.string().nullish(),
  "remediation": z.string().nullish()
})).nullish(),
  "launch_readiness_score": z.number(),
  "approved_at": z.string().nullish(),
  "approved_by": z.string().nullish(),
  "conditions": z.array(z.object({
  "condition_id": z.string().nullish(),
  "description": z.string().nullish(),
  "enforcement": z.string().nullish()
})).nullish(),
  "stage_summary": z.object({
  "functional_validation": z.string().nullish(),
  "ux_bdd_specification": z.string().nullish(),
  "solution_architecture": z.string().nullish(),
  "backend_development": z.string().nullish(),
  "frontend_development": z.string().nullish(),
  "qa_testing": z.string().nullish(),
  "security_audit": z.string().nullish()
}).nullish()
});
export type GovernanceAgentOutput = z.infer<typeof GovernanceAgentOutputSchema>;
