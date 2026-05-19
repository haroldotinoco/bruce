/* eslint-disable */
// auto-generated from modules/add-venture/agents/business-model-modeler/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const BusinessModelModelerInputSchema = z.object({
  "venture_id": z.string(),
  "opportunity_id": z.string(),
  "briefing": z.object({}),
  "vol_1_opportunity": z.object({}),
  "vol_2_customer_market": z.object({}),
  "vol_3_value_proposition": z.object({})
});
export type BusinessModelModelerInput = z.infer<typeof BusinessModelModelerInputSchema>;
