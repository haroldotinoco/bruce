/* eslint-disable */
// auto-generated from modules/builder/agents/backend-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BackendAgentOutputSchema = z.object({
  "code_repo_ref": z.string().nullish(),
  "api_endpoints": z.array(z.object({
  "method": z.string().nullish(),
  "path": z.string().nullish(),
  "handler": z.string().nullish()
})).nullish(),
  "test_coverage_percent": z.number().nullish(),
  "code_quality_score": z.number().nullish(),
  "generated_files": z.array(z.string()).nullish(),
  "build_status": z.enum(["success", "failed"]),
  "build_errors": z.array(z.object({
  "file": z.string().nullish(),
  "line": z.number().int().nullish(),
  "error": z.string().nullish()
})).nullish(),
  "deployment_notes": z.string().nullish()
});
export type BackendAgentOutput = z.infer<typeof BackendAgentOutputSchema>;
