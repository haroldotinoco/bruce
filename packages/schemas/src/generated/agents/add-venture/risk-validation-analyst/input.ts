/* eslint-disable */
// auto-generated from modules/add-venture/agents/risk-validation-analyst/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const RiskValidationAnalystInputSchema = z.object({
  "venture_id": z.string(),
  "opportunity_id": z.string(),
  "vol_1_opportunity": z.object({}),
  "vol_2_customer_market": z.object({}),
  "vol_3_value_proposition": z.object({}),
  "vol_4_business_model": z.object({}),
  "vol_5_gtm": z.object({}),
  "vol_6_narrative": z.object({})
});
export type RiskValidationAnalystInput = z.infer<typeof RiskValidationAnalystInputSchema>;
