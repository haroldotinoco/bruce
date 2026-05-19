/* eslint-disable */
// auto-generated from modules/add-venture/agents/value-proposition-designer/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ValuePropositionDesignerInputSchema = z.object({
  "venture_id": z.string(),
  "opportunity_id": z.string(),
  "briefing": z.object({}),
  "vol_1_opportunity": z.object({}),
  "vol_2_customer_market": z.object({})
});
export type ValuePropositionDesignerInput = z.infer<typeof ValuePropositionDesignerInputSchema>;
