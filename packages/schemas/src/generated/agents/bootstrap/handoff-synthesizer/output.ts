/* eslint-disable */
// auto-generated from modules/bootstrap/agents/handoff-synthesizer/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const HandoffSynthesizerOutputSchema = z.object({
  "synthesis_phase": z.enum(["opportunity", "dossier"]),
  "venture_handoff": z.object({}).nullish(),
  "scan_results": z.object({
  "ranked_opportunities": z.array(z.object({})).nullish(),
  "prioritization_timestamp": z.string().nullish()
}).nullish(),
  "dossier": z.object({}).nullish()
});
export type HandoffSynthesizerOutput = z.infer<typeof HandoffSynthesizerOutputSchema>;
