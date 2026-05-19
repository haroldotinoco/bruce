/* eslint-disable */
// auto-generated from modules/add-venture/agents/gtm-planner/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GtmPlannerInputSchema = z.object({
  "venture_id": z.string(),
  "opportunity_id": z.string(),
  "briefing": z.object({}),
  "vol_1_opportunity": z.object({}),
  "vol_2_customer_market": z.object({}),
  "vol_3_value_proposition": z.object({}),
  "vol_4_business_model": z.object({})
});
export type GtmPlannerInput = z.infer<typeof GtmPlannerInputSchema>;
