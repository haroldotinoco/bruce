/* eslint-disable */
// auto-generated from modules/bruce-core/agents/module-dispatcher/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ModuleDispatcherInputSchema = z.object({
  "venture_id": z.string(),
  "stage": z.enum(["GENERATED", "QUALIFIED", "STRUCTURED", "BUILT", "LAUNCHED", "OPERATING"]),
  "trigger_type": z.enum(["stage_advancement", "manual_redispatch", "retry"]).nullish(),
  "modules": z.array(z.string()),
  "venture_context": z.object({
  "venture_id": z.string().nullish(),
  "name": z.string().nullish(),
  "founder_info": z.object({}).nullish(),
  "problem_statement": z.string().nullish(),
  "target_market": z.object({}).nullish(),
  "stage_entry_timestamp": z.string().nullish()
}).nullish(),
  "module_inputs": z.object({}).catchall(z.object({})).nullish(),
  "parallelization_allowed": z.boolean().nullish(),
  "retry_attempt": z.number().nullish(),
  "previous_batch_id": z.string().nullish(),
  "correlation_id": z.string().nullish()
});
export type ModuleDispatcherInput = z.infer<typeof ModuleDispatcherInputSchema>;
