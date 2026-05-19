/* eslint-disable */
// auto-generated from modules/builder/agents/product-validator/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ProductValidatorOutputSchema = z.object({
  "feature_list": z.array(z.object({
  "name": z.string().nullish(),
  "description": z.string().nullish(),
  "priority": z.string().nullish(),
  "acceptance_criteria": z.array(z.string()).nullish(),
  "dependencies": z.array(z.string()).nullish()
})),
  "user_flows": z.array(z.object({
  "flow_name": z.string().nullish(),
  "actors": z.array(z.string()).nullish(),
  "steps": z.array(z.string()).nullish(),
  "happy_path": z.string().nullish(),
  "edge_cases": z.array(z.string()).nullish()
})),
  "data_model_overview": z.object({
  "entities": z.array(z.string()).nullish(),
  "relationships": z.string().nullish(),
  "key_fields": z.object({}).nullish()
}).nullish(),
  "external_dependencies": z.array(z.object({
  "service": z.string().nullish(),
  "purpose": z.string().nullish(),
  "criticality": z.enum(["critical", "high", "medium", "low"]).nullish()
})).nullish(),
  "assumptions_and_constraints": z.array(z.string()).nullish(),
  "buildability_assessment": z.object({
  "feasible": z.boolean().nullish(),
  "concerns": z.array(z.string()).nullish(),
  "scope_evaluation": z.string().nullish(),
  "recommendations": z.array(z.string()).nullish()
}),
  "pass_fail": z.boolean().nullish()
});
export type ProductValidatorOutput = z.infer<typeof ProductValidatorOutputSchema>;
