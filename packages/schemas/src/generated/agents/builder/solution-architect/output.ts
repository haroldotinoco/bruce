/* eslint-disable */
// auto-generated from modules/builder/agents/solution-architect/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const SolutionArchitectOutputSchema = z.object({
  "architecture_diagram_ref": z.string().nullish(),
  "services": z.array(z.object({
  "name": z.string(),
  "responsibility": z.string(),
  "tech": z.string(),
  "api_endpoints": z.array(z.string()).nullish(),
  "dependencies": z.array(z.string()).nullish()
})),
  "data_models": z.array(z.object({
  "entity": z.string(),
  "fields": z.array(z.object({
  "name": z.string().nullish(),
  "type": z.string().nullish(),
  "required": z.boolean().nullish(),
  "description": z.string().nullish()
})),
  "relationships": z.array(z.object({
  "target_entity": z.string().nullish(),
  "relationship_type": z.string().nullish()
})).nullish()
})),
  "api_contract_refs": z.array(z.string()).nullish(),
  "infrastructure_spec": z.object({
  "cloud_provider": z.string(),
  "services": z.array(z.object({
  "name": z.string().nullish(),
  "type": z.string().nullish(),
  "configuration": z.object({}).nullish()
})),
  "networking": z.object({
  "vpc_config": z.object({}).nullish(),
  "load_balancing": z.string().nullish()
}).nullish(),
  "estimated_monthly_cost": z.string().nullish()
}),
  "scalability_notes": z.string().nullish()
});
export type SolutionArchitectOutput = z.infer<typeof SolutionArchitectOutputSchema>;
