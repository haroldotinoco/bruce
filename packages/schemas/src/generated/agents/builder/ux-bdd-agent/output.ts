/* eslint-disable */
// auto-generated from modules/builder/agents/ux-bdd-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const UxBddAgentOutputSchema = z.object({
  "wireframe_refs": z.array(z.string()).nullish(),
  "bdd_scenarios": z.array(z.object({
  "scenario_id": z.string(),
  "feature": z.string(),
  "given": z.array(z.string()),
  "when": z.array(z.string()),
  "then": z.array(z.string()),
  "priority": z.enum(["critical", "high", "medium", "low"]).nullish(),
  "tags": z.array(z.string()).nullish()
})),
  "user_flows": z.array(z.object({
  "flow_id": z.string(),
  "name": z.string(),
  "steps": z.array(z.object({
  "step_number": z.number().int().nullish(),
  "action": z.string().nullish(),
  "screen_ref": z.string().nullish()
}))
})),
  "acceptance_criteria": z.array(z.object({
  "criterion_id": z.string().nullish(),
  "description": z.string().nullish(),
  "verification_method": z.string().nullish()
})),
  "ux_annotations": z.object({
  "accessibility_notes": z.array(z.string()).nullish(),
  "interaction_notes": z.array(z.string()).nullish(),
  "error_handling_strategy": z.string().nullish()
}).nullish()
});
export type UxBddAgentOutput = z.infer<typeof UxBddAgentOutputSchema>;
