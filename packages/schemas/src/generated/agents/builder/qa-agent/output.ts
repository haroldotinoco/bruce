/* eslint-disable */
// auto-generated from modules/builder/agents/qa-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const QaAgentOutputSchema = z.object({
  "test_results": z.array(z.object({
  "scenario_id": z.string(),
  "status": z.enum(["pass", "fail"]),
  "duration_ms": z.number().int().nullish(),
  "screenshot_ref": z.string().nullish(),
  "error_message": z.string().nullish(),
  "failed_step": z.string().nullish()
})),
  "overall_status": z.enum(["pass", "fail"]),
  "pass_rate_percent": z.number(),
  "critical_failures": z.array(z.object({
  "scenario_id": z.string().nullish(),
  "failure_type": z.string().nullish(),
  "impact": z.string().nullish()
})).nullish(),
  "qa_report_ref": z.string().nullish(),
  "test_environment_used": z.object({
  "browser": z.string().nullish(),
  "staging_url": z.string().nullish(),
  "test_execution_time": z.string().nullish()
}).nullish()
});
export type QaAgentOutput = z.infer<typeof QaAgentOutputSchema>;
