/* eslint-disable */
// auto-generated from modules/brand-aid/agents/market-analyst/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const MarketAnalystOutputSchema = z.object({
  "competitor_positioning_map": z.array(z.object({
  "competitor_name": z.string(),
  "stated_positioning": z.string(),
  "implied_positioning": z.string().nullish(),
  "target_segment": z.string().nullish(),
  "key_messages": z.array(z.string()).nullish(),
  "visual_identity_tone": z.string().nullish()
})),
  "white_space_opportunities": z.array(z.object({
  "opportunity": z.string().nullish(),
  "rationale": z.string().nullish(),
  "customer_need": z.string().nullish(),
  "competitive_gap": z.string().nullish()
})),
  "customer_sentiment_summary": z.object({
  "positive_themes": z.array(z.string()).nullish(),
  "negative_themes": z.array(z.string()).nullish(),
  "unmet_needs": z.array(z.string()).nullish(),
  "data_sources": z.array(z.string()).nullish()
}).nullish(),
  "tone_and_voice_analysis": z.object({
  "formality_spectrum": z.string().nullish(),
  "emotional_register": z.string().nullish(),
  "common_linguistic_patterns": z.array(z.string()).nullish(),
  "differentiation_opportunity": z.string().nullish()
}),
  "emerging_trends": z.array(z.object({
  "trend": z.string().nullish(),
  "evidence": z.string().nullish(),
  "implications": z.string().nullish()
})).nullish(),
  "strategic_gaps": z.array(z.string()),
  "research_limitations": z.string().nullish()
});
export type MarketAnalystOutput = z.infer<typeof MarketAnalystOutputSchema>;
