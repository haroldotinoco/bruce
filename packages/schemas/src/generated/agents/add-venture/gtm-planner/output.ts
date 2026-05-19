/* eslint-disable */
// auto-generated from modules/add-venture/agents/gtm-planner/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GtmPlannerOutputSchema = z.object({
  "venture_id": z.string(),
  "volume_number": z.literal(5),
  "volume_title": z.string(),
  "icp_definition": z.object({
  "company_profile": z.string().nullish(),
  "buying_committee_size": z.number().int().nullish(),
  "budget_authority": z.string().nullish(),
  "pain_intensity_score": z.number().nullish(),
  "where_to_find": z.array(z.string()).nullish(),
  "estimated_total_icp_companies": z.number().int().nullish()
}),
  "channel_priorities": z.array(z.object({
  "channel": z.string().nullish(),
  "priority_rank": z.number().int().nullish(),
  "why_this_channel": z.string().nullish(),
  "estimated_cac": z.number().nullish(),
  "year_1_revenue_target": z.number().nullish(),
  "year_3_revenue_target": z.number().nullish(),
  "launch_month": z.number().int().nullish()
})),
  "launch_sequence": z.array(z.object({
  "phase": z.string().nullish(),
  "duration_weeks": z.number().int().nullish(),
  "key_objectives": z.array(z.string()).nullish(),
  "team_composition": z.string().nullish(),
  "customer_targets": z.string().nullish(),
  "success_criteria": z.string().nullish()
})),
  "ninety_day_playbook": z.object({
  "week_1_4": z.object({
  "milestones": z.array(z.string()).nullish(),
  "activities": z.array(z.string()).nullish()
}).nullish(),
  "week_5_8": z.object({
  "milestones": z.array(z.string()).nullish(),
  "activities": z.array(z.string()).nullish()
}).nullish(),
  "week_9_12": z.object({
  "milestones": z.array(z.string()).nullish(),
  "activities": z.array(z.string()).nullish()
}).nullish()
}),
  "budget_allocation": z.object({
  "total_year_1_gtm_budget": z.number().nullish(),
  "sales_headcount_required": z.number().int().nullish(),
  "marketing_budget": z.number().nullish(),
  "budget_by_channel": z.object({}).catchall(z.number()).nullish(),
  "cac_targets_by_channel": z.object({}).catchall(z.number()).nullish(),
  "payback_period_target_months": z.number().nullish()
}),
  "acquisition_funnel": z.object({
  "awareness_to_first_call": z.string().nullish(),
  "first_call_to_demo": z.string().nullish(),
  "demo_to_proposal": z.string().nullish(),
  "proposal_to_close": z.string().nullish(),
  "sales_cycle_total_months": z.number().nullish(),
  "estimated_conversion_rate": z.number().nullish()
}).nullish(),
  "assumptions": z.array(z.string()).nullish(),
  "data_gaps": z.array(z.string()).nullish(),
  "confidence_score": z.number().min(0).max(100),
  "confidence_rationale": z.string().nullish(),
  "key_sections": z.array(z.string()).nullish(),
  "execution_timestamp": z.string().nullish(),
  "agent_id": z.string().nullish()
});
export type GtmPlannerOutput = z.infer<typeof GtmPlannerOutputSchema>;
