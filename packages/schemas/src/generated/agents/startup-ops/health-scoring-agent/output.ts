/* eslint-disable */
// auto-generated from modules/startup-ops/agents/health-scoring-agent/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const HealthScoringAgentOutputSchema = z.object({
  "health_report_id": z.string(),
  "venture_id": z.string(),
  "scored_at": z.string(),
  "stage": z.enum(["seed", "early", "growth"]),
  "dimension_scores": z.object({
  "activation": z.object({
  "score": z.number().min(0).max(100).nullish(),
  "status": z.enum(["critical", "at_risk", "healthy"]).nullish(),
  "based_on": z.array(z.string()).nullish()
}),
  "retention": z.object({
  "score": z.number().min(0).max(100).nullish(),
  "status": z.enum(["critical", "at_risk", "healthy"]).nullish(),
  "based_on": z.array(z.string()).nullish()
}),
  "revenue": z.object({
  "score": z.number().min(0).max(100).nullish(),
  "status": z.enum(["critical", "at_risk", "healthy", "insufficient_data"]).nullish(),
  "based_on": z.array(z.string()).nullish()
}),
  "product_quality": z.object({
  "score": z.number().min(0).max(100).nullish(),
  "status": z.enum(["critical", "at_risk", "healthy", "insufficient_data"]).nullish(),
  "based_on": z.array(z.string()).nullish()
}),
  "financial_sustainability": z.object({
  "score": z.number().min(0).max(100).nullish(),
  "status": z.enum(["critical", "at_risk", "healthy"]).nullish(),
  "based_on": z.array(z.string()).nullish()
}),
  "market_fit": z.object({
  "score": z.number().min(0).max(100).nullish(),
  "status": z.enum(["critical", "at_risk", "healthy"]).nullish(),
  "based_on": z.array(z.string()).nullish()
})
}),
  "composite_score": z.number().min(0).max(100),
  "composite_status": z.enum(["critical", "warning", "healthy"]).nullish(),
  "trends": z.object({
  "activation": z.enum(["improving", "stable", "declining", "n/a"]).nullish(),
  "retention": z.enum(["improving", "stable", "declining", "n/a"]).nullish(),
  "revenue": z.enum(["improving", "stable", "declining", "n/a"]).nullish(),
  "product_quality": z.enum(["improving", "stable", "declining", "n/a"]).nullish(),
  "financial_sustainability": z.enum(["improving", "stable", "declining", "n/a"]).nullish(),
  "market_fit": z.enum(["improving", "stable", "declining", "n/a"]).nullish(),
  "composite": z.enum(["improving", "stable", "declining", "n/a"]).nullish()
}).nullish(),
  "at_risk_dimensions": z.array(z.object({
  "dimension": z.string().nullish(),
  "score": z.number().nullish(),
  "reason": z.string().nullish()
})),
  "critical_dimensions": z.array(z.object({
  "dimension": z.string().nullish(),
  "score": z.number().nullish(),
  "reason": z.string().nullish()
})),
  "period": z.object({
  "start": z.string().nullish(),
  "end": z.string().nullish()
}).nullish(),
  "metric_snapshot_id": z.string().nullish()
});
export type HealthScoringAgentOutput = z.infer<typeof HealthScoringAgentOutputSchema>;
