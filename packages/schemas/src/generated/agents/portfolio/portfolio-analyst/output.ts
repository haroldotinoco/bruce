/* eslint-disable */
// auto-generated from modules/portfolio/agents/portfolio-analyst/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const PortfolioAnalystOutputSchema = z.object({
  "portfolio_snapshot": z.object({
  "review_timestamp": z.string(),
  "review_cycle_id": z.string(),
  "total_ventures": z.number().int(),
  "ventures_ranked": z.array(z.object({
  "venture_id": z.string(),
  "name": z.string(),
  "rank": z.number().int().min(1),
  "health_score": z.number().min(0).max(100),
  "health_dimensions": z.object({
  "traction_score": z.number().min(0).max(100).nullish(),
  "financial_score": z.number().min(0).max(100).nullish(),
  "team_score": z.number().min(0).max(100).nullish(),
  "market_score": z.number().min(0).max(100).nullish()
}),
  "trend": z.enum(["improving", "stable", "declining"]).nullish(),
  "score_change": z.number().nullish(),
  "confidence": z.number().min(0).max(100),
  "critical_metrics": z.array(z.object({
  "metric": z.string().nullish(),
  "value": z.union([z.number(), z.string()]).nullish(),
  "status": z.enum(["healthy", "warning", "critical"]).nullish()
})).nullish()
})),
  "patterns": z.array(z.object({
  "pattern_id": z.string().nullish(),
  "description": z.string().nullish(),
  "type": z.enum(["success_factor", "blocker", "correlation", "timing"]).nullish(),
  "affected_ventures": z.array(z.string()).nullish(),
  "affected_count": z.number().int().nullish(),
  "evidence": z.string().nullish(),
  "confidence": z.number().min(0).max(100).nullish(),
  "recommendation": z.string().nullish()
})).nullish(),
  "outliers": z.array(z.object({
  "venture_id": z.string().nullish(),
  "name": z.string().nullish(),
  "outlier_type": z.enum(["positive_surprise", "negative_surprise", "trajectory_mismatch", "risk_emergence"]).nullish(),
  "description": z.string().nullish(),
  "evidence": z.string().nullish(),
  "priority": z.enum(["low", "medium", "high"]).nullish(),
  "recommended_action": z.string().nullish()
})).nullish(),
  "data_quality_summary": z.object({
  "completeness_percent": z.number().min(0).max(100),
  "stale_fields_percent": z.number().min(0).max(100),
  "ventures_with_issues": z.array(z.object({
  "venture_id": z.string().nullish(),
  "issue": z.string().nullish()
})).nullish()
}),
  "analyst_confidence": z.number().min(0).max(100),
  "next_decision_focus": z.array(z.string()).nullish(),
  "analysis_notes": z.string().nullish()
})
});
export type PortfolioAnalystOutput = z.infer<typeof PortfolioAnalystOutputSchema>;
