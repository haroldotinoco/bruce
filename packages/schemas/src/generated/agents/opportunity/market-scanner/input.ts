/* eslint-disable */
// auto-generated from modules/opportunity/agents/market-scanner/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const MarketScannerInputSchema = z.object({
  "scan_id": z.string(),
  "discovery_focus": z.object({
  "industry_verticals": z.array(z.string()).nullish(),
  "geographic_scope": z.array(z.string()).nullish(),
  "minimum_tam": z.number().nullish(),
  "focus_areas": z.array(z.string()).nullish()
}).nullish(),
  "search_strategy": z.object({
  "primary_keywords": z.array(z.string()).nullish(),
  "secondary_keywords": z.array(z.string()).nullish(),
  "exclude_keywords": z.array(z.string()).nullish()
}).nullish(),
  "quality_filters": z.object({
  "minimum_discovery_confidence": z.number().min(0).max(1).nullish(),
  "minimum_sources_required": z.number().int().nullish(),
  "auto_exclude_criteria": z.array(z.string()).nullish()
}).nullish(),
  "output_targets": z.object({
  "minimum_opportunities": z.number().int().nullish(),
  "maximum_opportunities": z.number().int().nullish()
}).nullish()
});
export type MarketScannerInput = z.infer<typeof MarketScannerInputSchema>;
