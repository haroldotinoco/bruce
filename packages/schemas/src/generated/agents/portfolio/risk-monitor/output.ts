/* eslint-disable */
// auto-generated from modules/portfolio/agents/risk-monitor/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const RiskMonitorOutputSchema = z.object({
  "portfolio_risk_assessment": z.object({
  "analysis_date": z.string(),
  "overall_risk_score": z.number().min(0).max(100),
  "risk_rating": z.enum(["low", "medium", "high", "critical"]),
  "risk_dimensions": z.object({
  "concentration_risk_score": z.number().min(0).max(100).nullish(),
  "burn_rate_risk_score": z.number().min(0).max(100).nullish(),
  "runway_distribution_risk_score": z.number().min(0).max(100).nullish(),
  "codependency_risk_score": z.number().min(0).max(100).nullish(),
  "market_correlation_risk_score": z.number().min(0).max(100).nullish()
}),
  "concentration_analysis": z.object({
  "top_3_ventures_percent": z.number().nullish(),
  "top_3_ventures": z.array(z.object({
  "venture_id": z.string().nullish(),
  "name": z.string().nullish(),
  "percentage": z.number().nullish()
})).nullish(),
  "concentration_risk": z.enum(["low", "medium", "high"]).nullish(),
  "concentration_threshold": z.number().nullish(),
  "single_venture_failure_impact": z.string().nullish()
}).nullish(),
  "burn_dynamics": z.object({
  "total_monthly_burn": z.number().nullish(),
  "total_monthly_revenue": z.number().nullish(),
  "net_burn": z.number().nullish(),
  "burn_trend": z.enum(["increasing", "stable", "decreasing"]).nullish(),
  "burn_trend_percent": z.number().nullish(),
  "ventures_exceeding_burn_budget": z.array(z.object({
  "venture_id": z.string().nullish(),
  "name": z.string().nullish(),
  "burn_percent": z.number().nullish()
})).nullish(),
  "burn_risk_status": z.enum(["healthy", "monitor", "high"]).nullish()
}).nullish(),
  "runway_distribution": z.object({
  "median_runway_months": z.number().nullish(),
  "min_runway_months": z.number().nullish(),
  "max_runway_months": z.number().nullish(),
  "ventures_under_6_months": z.array(z.object({
  "venture_id": z.string().nullish(),
  "name": z.string().nullish(),
  "runway_months": z.number().nullish(),
  "critical_date": z.string().nullish()
})).nullish(),
  "runway_cliff_alert": z.boolean().nullish(),
  "runway_cliff_details": z.string().nullish()
}).nullish(),
  "codependency_analysis": z.object({
  "dependency_graph": z.array(z.object({
  "venture_a": z.string().nullish(),
  "venture_b": z.string().nullish(),
  "dependency_type": z.enum(["infrastructure", "customers", "team"]).nullish(),
  "risk_level": z.enum(["low", "medium", "high"]).nullish(),
  "failure_impact": z.string().nullish()
})).nullish(),
  "single_points_of_failure": z.array(z.object({
  "entity": z.string().nullish(),
  "affects_ventures": z.array(z.string()).nullish(),
  "risk_level": z.enum(["medium", "high"]).nullish()
})).nullish()
}).nullish(),
  "market_correlation_analysis": z.object({
  "sector_concentration": z.array(z.object({
  "sector": z.string().nullish(),
  "venture_count": z.number().int().nullish(),
  "revenue_percent": z.number().nullish(),
  "shared_risk": z.string().nullish()
})).nullish(),
  "geographic_concentration": z.object({
  "primary_geographies": z.array(z.object({
  "geography": z.string().nullish(),
  "venture_count": z.number().int().nullish(),
  "revenue_percent": z.number().nullish()
})).nullish()
}).nullish(),
  "correlated_shock_scenarios": z.array(z.object({
  "scenario_name": z.string().nullish(),
  "affected_ventures": z.array(z.string()).nullish(),
  "impact_description": z.string().nullish(),
  "revenue_impact_percent": z.number().nullish()
})).nullish()
}).nullish(),
  "mitigation_recommendations": z.array(z.object({
  "rank": z.number().int().min(1).nullish(),
  "risk_addressed": z.string().nullish(),
  "recommendation": z.string().nullish(),
  "impact": z.string().nullish(),
  "urgency": z.enum(["immediate", "within_month", "within_quarter"]).nullish(),
  "owner": z.string().nullish()
})).nullish()
})
});
export type RiskMonitorOutput = z.infer<typeof RiskMonitorOutputSchema>;
