/* eslint-disable */
// auto-generated from modules/portfolio/agents/portfolio-reporter/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const PortfolioReporterOutputSchema = z.object({
  "governance_report": z.object({
  "report_metadata": z.object({
  "title": z.string().nullish(),
  "report_date": z.string().nullish(),
  "review_cycle": z.string().nullish(),
  "audience": z.string().nullish(),
  "total_ventures_reviewed": z.number().int().nullish()
}),
  "executive_summary": z.object({
  "portfolio_health_snapshot": z.string().nullish(),
  "key_findings": z.array(z.string()).nullish(),
  "governance_decisions_summary": z.object({
  "scale_count": z.number().int().nullish(),
  "iterate_count": z.number().int().nullish(),
  "pause_count": z.number().int().nullish(),
  "kill_count": z.number().int().nullish()
}).nullish(),
  "critical_action_items": z.array(z.string()).nullish(),
  "portfolio_outlook": z.string().nullish()
}),
  "venture_narratives": z.array(z.object({
  "venture_id": z.string().nullish(),
  "name": z.string().nullish(),
  "rank": z.number().int().nullish(),
  "health_section": z.object({
  "health_score": z.number().nullish(),
  "health_trend": z.string().nullish(),
  "key_metrics": z.object({}).nullish(),
  "narrative": z.string().nullish()
}).nullish(),
  "decision_section": z.object({
  "decision": z.string().nullish(),
  "confidence": z.number().nullish(),
  "rationale": z.string().nullish()
}).nullish(),
  "allocation_section": z.object({
  "current_budget": z.number().nullish(),
  "new_budget": z.number().nullish(),
  "budget_change": z.number().nullish(),
  "headcount_change": z.number().int().nullish(),
  "narrative": z.string().nullish()
}).nullish(),
  "milestones_section": z.array(z.object({
  "milestone": z.string().nullish(),
  "target_date": z.string().nullish(),
  "success_criteria": z.string().nullish()
})).nullish(),
  "risks_section": z.array(z.string()).nullish()
})),
  "portfolio_insights": z.object({
  "sector_analysis": z.array(z.object({
  "sector": z.string().nullish(),
  "venture_count": z.number().int().nullish(),
  "health_average": z.number().nullish(),
  "common_patterns": z.array(z.string()).nullish(),
  "common_risks": z.array(z.string()).nullish()
})).nullish(),
  "success_factors": z.array(z.string()).nullish(),
  "systemic_risks": z.array(z.string()).nullish(),
  "resource_efficiency": z.object({
  "portfolio_revenue_per_dollar_spent": z.number().nullish(),
  "high_efficiency_ventures": z.array(z.string()).nullish(),
  "low_efficiency_ventures": z.array(z.string()).nullish()
}).nullish()
}).nullish(),
  "action_items": z.array(z.object({
  "priority": z.number().int().min(1).nullish(),
  "action": z.string().nullish(),
  "owner": z.string().nullish(),
  "timeline": z.string().nullish(),
  "success_criteria": z.string().nullish(),
  "ventures_affected": z.array(z.string()).nullish()
})).nullish(),
  "risk_summary": z.object({
  "overall_risk_rating": z.string().nullish(),
  "critical_risks": z.array(z.object({
  "risk": z.string().nullish(),
  "mitigation": z.string().nullish()
})).nullish()
}).nullish(),
  "appendices": z.object({
  "venture_metrics_table": z.array(z.object({})).nullish(),
  "decision_changelog": z.array(z.object({})).nullish(),
  "glossary": z.object({}).nullish()
}).nullish()
})
});
export type PortfolioReporterOutput = z.infer<typeof PortfolioReporterOutputSchema>;
