/* eslint-disable */
// auto-generated from modules/bruce-memory/agents/learning-ingestion-agent/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const LearningIngestionAgentInputSchema = z.object({
  "learning_record": z.object({
  "venture_id": z.string(),
  "venture_name": z.string().nullish(),
  "source_module": z.enum(["portfolio", "governance", "risk-monitor", "allocation", "venture-team"]),
  "learning_type": z.enum(["hypothesis_test", "market_insight", "gtm_channel", "product_decision", "team_insight", "competitive_observation", "kill_postmortem"]).nullish(),
  "outcome": z.enum(["success", "failure", "partial_success", "inconclusive"]),
  "narrative": z.string().min(50),
  "quantitative_data": z.object({
  "metric_name": z.string().nullish(),
  "value": z.union([z.number(), z.string()]).nullish(),
  "baseline": z.union([z.number(), z.string()]).nullish(),
  "change_percent": z.number().nullish()
}).nullish(),
  "confidence": z.number().min(0).max(100).nullish(),
  "applicability_tags": z.array(z.string()).nullish(),
  "sector": z.string().nullish(),
  "stage": z.enum(["pre-launch", "early", "growth", "mature"]).nullish(),
  "timestamp": z.string().nullish(),
  "related_ventures": z.array(z.string()).nullish()
})
});
export type LearningIngestionAgentInput = z.infer<typeof LearningIngestionAgentInputSchema>;
