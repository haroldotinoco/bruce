/* eslint-disable */
// auto-generated from modules/add-venture/agents/dossier-composer/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const DossierComposerInputSchema = z.object({
  "venture_id": z.string(),
  "opportunity_id": z.string(),
  "venture_name": z.string(),
  "vol_1_opportunity": z.object({}),
  "vol_2_customer_market": z.object({}),
  "vol_3_value_proposition": z.object({}),
  "vol_4_business_model": z.object({}),
  "vol_5_gtm": z.object({}),
  "vol_6_narrative": z.object({}),
  "vol_7_risk_validation": z.object({}),
  "vol_8_execution_roadmap": z.object({}),
  "critique_result": z.object({})
});
export type DossierComposerInput = z.infer<typeof DossierComposerInputSchema>;
