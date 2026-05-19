/* eslint-disable */
// auto-generated from modules/gtm/agents/growth-experimenter/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const GrowthExperimenterOutputSchema = z.object({
  "prioritized_experiments": z.array(z.object({
  "rank": z.number().int().min(1),
  "experiment_name": z.string(),
  "hypothesis": z.string(),
  "methodology": z.string().nullish(),
  "success_metric": z.string(),
  "target_value": z.number().nullish(),
  "target_impact": z.string().nullish(),
  "budget_usd": z.number().nullish(),
  "timeline_days": z.number().int(),
  "resource_requirement": z.string().nullish(),
  "cost_of_learning": z.number().nullish(),
  "roi_if_successful": z.string().nullish(),
  "go_no_go_decision_criteria": z.string().nullish(),
  "dependencies": z.array(z.string()).nullish(),
  "risks": z.array(z.string()).nullish()
})),
  "experiment_sequencing": z.string().nullish(),
  "success_playbook_opportunity": z.object({
  "if_top_experiment_succeeds": z.string().nullish(),
  "scaling_path": z.string().nullish(),
  "team_capability_to_build": z.array(z.string()).nullish()
}).nullish(),
  "resource_allocation_plan": z.object({
  "total_budget": z.number().nullish(),
  "allocation_by_experiment": z.object({}).catchall(z.number()).nullish(),
  "contingency_reserve": z.number().nullish()
}).nullish(),
  "quarterly_roadmap": z.object({
  "month_1": z.array(z.string()).nullish(),
  "month_2": z.array(z.string()).nullish(),
  "month_3": z.array(z.string()).nullish()
}).nullish(),
  "stopping_rules": z.object({
  "pause_if": z.array(z.string()).nullish(),
  "kill_if": z.array(z.string()).nullish(),
  "scale_if": z.array(z.string()).nullish()
}).nullish()
});
export type GrowthExperimenterOutput = z.infer<typeof GrowthExperimenterOutputSchema>;
