/* eslint-disable */
// auto-generated from modules/bruce-core/agents/venture-lifecycle-manager/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const VentureLifecycleManagerOutputSchema = z.object({
  "venture_id": z.string().nullish(),
  "decision": z.string().nullish(),
  "new_stage": z.string().nullish(),
  "correlation_id": z.string().nullish()
}).passthrough();
export type VentureLifecycleManagerOutput = z.infer<typeof VentureLifecycleManagerOutputSchema>;
