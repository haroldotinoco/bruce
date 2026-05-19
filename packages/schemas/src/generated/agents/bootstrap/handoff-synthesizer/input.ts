/* eslint-disable */
// auto-generated from modules/bootstrap/agents/handoff-synthesizer/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const HandoffSynthesizerInputSchema = z.object({
  "prompt": z.string().min(20),
  "target_module": z.enum(["add-venture", "brand-aid"]),
  "venture_id": z.string(),
  "venture_name": z.string().nullish(),
  "synthesis_phase": z.enum(["opportunity", "dossier"]).nullish(),
  "opportunity_handoff": z.object({}).nullish(),
  "validation_errors": z.array(z.string()).nullish()
});
export type HandoffSynthesizerInput = z.infer<typeof HandoffSynthesizerInputSchema>;
