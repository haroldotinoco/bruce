/* eslint-disable */
// auto-generated from modules/brand-aid/agents/market-analyst/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const MarketAnalystInputSchema = z.object({
  "venture_hypothesis": z.string(),
  "competitors": z.array(z.object({
  "name": z.string(),
  "website": z.string().nullish(),
  "category": z.enum(["direct", "adjacent", "category_leader"]).nullish()
})),
  "customer_segment": z.string(),
  "research_focus": z.array(z.string()).nullish(),
  "geographic_scope": z.enum(["global", "regional", "national"]).nullish(),
  "timeframe": z.string().nullish()
});
export type MarketAnalystInput = z.infer<typeof MarketAnalystInputSchema>;
