/* eslint-disable */
// auto-generated from modules/opportunity/agents/market-scanner/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const MarketScannerOutputSchema = z.object({
  "scan_id": z.string().nullish(),
  "scan_timestamp": z.string().nullish(),
  "opportunities_found": z.array(z.object({}).passthrough()).nullish()
}).passthrough();
export type MarketScannerOutput = z.infer<typeof MarketScannerOutputSchema>;
