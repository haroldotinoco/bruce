/* eslint-disable */
// auto-generated from modules/add-venture/agents/customer-market-architect/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const CustomerMarketArchitectOutputSchema = z.object({
  "venture_id": z.string(),
  "volume_number": z.literal(2),
  "volume_title": z.string(),
  "customer_segments": z.array(z.object({
  "segment_name": z.string().nullish(),
  "priority_rank": z.number().int().nullish(),
  "segment_size_customers": z.number().int().nullish(),
  "segment_tam_usd": z.number().nullish(),
  "customer_archetypes": z.array(z.string()).nullish(),
  "primary_pain_points": z.array(z.string()).nullish(),
  "willingness_to_pay_range": z.object({
  "min_annual_usd": z.number().nullish(),
  "max_annual_usd": z.number().nullish(),
  "median_annual_usd": z.number().nullish()
}).nullish()
})),
  "jtbd_map": z.object({
  "functional_jobs": z.array(z.string()).nullish(),
  "emotional_jobs": z.array(z.string()).nullish(),
  "social_jobs": z.array(z.string()).nullish(),
  "job_hierarchy": z.array(z.object({
  "job": z.string().nullish(),
  "priority": z.enum(["primary", "secondary", "tertiary"]).nullish(),
  "alternative_solutions": z.array(z.string()).nullish()
})).nullish()
}),
  "decision_maker_map": z.object({
  "primary_buyer_title": z.string().nullish(),
  "primary_buyer_motivation": z.string().nullish(),
  "end_user_title": z.string().nullish(),
  "end_user_motivation": z.string().nullish(),
  "stakeholders": z.array(z.object({
  "role": z.string().nullish(),
  "influence_level": z.enum(["decision_maker", "strong_influencer", "approver", "user"]).nullish(),
  "success_criteria": z.string().nullish()
})).nullish(),
  "buying_approval_workflow": z.string().nullish(),
  "typical_sales_cycle_months": z.number().nullish()
}),
  "market_architecture": z.object({
  "total_addressable_segment": z.number().nullish(),
  "revenue_concentration": z.string().nullish(),
  "geographic_distribution": z.string().nullish(),
  "competitive_positioning": z.string().nullish(),
  "barriers_to_entry": z.array(z.string()).nullish()
}),
  "assumptions": z.array(z.string()).nullish(),
  "data_gaps": z.array(z.string()).nullish(),
  "confidence_score": z.number().min(0).max(100),
  "confidence_rationale": z.string().nullish(),
  "key_sections": z.array(z.string()).nullish(),
  "execution_timestamp": z.string().nullish(),
  "agent_id": z.string().nullish()
});
export type CustomerMarketArchitectOutput = z.infer<typeof CustomerMarketArchitectOutputSchema>;
