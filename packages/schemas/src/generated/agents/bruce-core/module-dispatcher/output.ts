/* eslint-disable */
// auto-generated from modules/bruce-core/agents/module-dispatcher/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ModuleDispatcherOutputSchema = z.object({
  "dispatch_batch_id": z.string().nullish(),
  "venture_id": z.string().nullish(),
  "status": z.string().nullish(),
  "modules_dispatched": z.array(z.unknown()).nullish()
}).passthrough();
export type ModuleDispatcherOutput = z.infer<typeof ModuleDispatcherOutputSchema>;
