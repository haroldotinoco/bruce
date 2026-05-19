/* eslint-disable */
// auto-generated from modules/add-venture/agents/customer-market-architect/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const CustomerMarketArchitectInputSchema = z.object({
  "venture_id": z.string(),
  "opportunity_id": z.string(),
  "briefing": z.object({}),
  "vol_1_opportunity": z.object({
  "problem_anatomy": z.string().nullish(),
  "market_readiness": z.string().nullish(),
  "addressable_market": z.string().nullish(),
  "macro_context": z.string().nullish(),
  "opportunity_thesis": z.string().nullish()
})
});
export type CustomerMarketArchitectInput = z.infer<typeof CustomerMarketArchitectInputSchema>;
