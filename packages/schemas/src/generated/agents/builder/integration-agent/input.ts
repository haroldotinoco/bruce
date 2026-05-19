/* eslint-disable */
// auto-generated from modules/builder/agents/integration-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const IntegrationAgentInputSchema = z.object({
  "architecture_doc_ref": z.object({
  "document_id": z.string().nullish(),
  "version": z.string().nullish(),
  "url": z.string().nullish()
}),
  "feature_backlog": z.array(z.object({
  "feature_id": z.string().nullish(),
  "name": z.string().nullish(),
  "description": z.string().nullish(),
  "required_integrations": z.array(z.string()).nullish(),
  "priority": z.enum(["critical", "high", "medium", "low"]).nullish(),
  "acceptance_criteria": z.array(z.string()).nullish()
})),
  "tech_stack": z.object({
  "backend_framework": z.string().nullish(),
  "backend_language": z.string().nullish(),
  "frontend_framework": z.string().nullish(),
  "frontend_language": z.string().nullish(),
  "database": z.string().nullish(),
  "hosting_platform": z.string().nullish(),
  "runtime_environment": z.string().nullish()
}),
  "existing_integrations": z.array(z.object({
  "name": z.string().nullish(),
  "type": z.string().nullish(),
  "status": z.enum(["active", "planned", "deprecated"]).nullish(),
  "auth_method": z.string().nullish()
})).nullish(),
  "budget_tier": z.enum(["pre-seed", "seed", "series-a", "series-b", "enterprise"]).nullish(),
  "custom_requirements": z.object({
  "compliance_requirements": z.array(z.string()).nullish(),
  "geographic_constraints": z.array(z.string()).nullish(),
  "performance_requirements": z.object({}).nullish(),
  "availability_sla": z.string().nullish()
}).nullish()
});
export type IntegrationAgentInput = z.infer<typeof IntegrationAgentInputSchema>;
