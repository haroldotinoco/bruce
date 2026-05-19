/* eslint-disable */
// auto-generated from modules/builder/agents/frontend-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const FrontendAgentOutputSchema = z.object({
  "code_repo_ref": z.string().nullish(),
  "components_generated": z.array(z.object({
  "name": z.string().nullish(),
  "path": z.string().nullish(),
  "props": z.array(z.object({
  "name": z.string().nullish(),
  "type": z.string().nullish(),
  "required": z.boolean().nullish()
})).nullish()
})).nullish(),
  "pages_generated": z.array(z.object({
  "name": z.string().nullish(),
  "path": z.string().nullish(),
  "route": z.string().nullish()
})).nullish(),
  "build_status": z.enum(["success", "failed"]),
  "lighthouse_score_estimate": z.number().nullish(),
  "build_errors": z.array(z.object({
  "file": z.string().nullish(),
  "error": z.string().nullish()
})).nullish(),
  "integration_notes": z.string().nullish()
});
export type FrontendAgentOutput = z.infer<typeof FrontendAgentOutputSchema>;
