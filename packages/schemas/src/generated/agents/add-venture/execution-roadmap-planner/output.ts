/* eslint-disable */
// auto-generated from modules/add-venture/agents/execution-roadmap-planner/output.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const ExecutionRoadmapPlannerOutputSchema = z.object({
  "venture_id": z.string(),
  "volume_number": z.literal(8),
  "volume_title": z.string(),
  "phases": z.array(z.object({
  "phase_name": z.string().nullish(),
  "duration_weeks": z.number().int().nullish(),
  "objectives": z.array(z.string()).nullish(),
  "milestones": z.array(z.string()).nullish(),
  "resources_needed": z.string().nullish(),
  "budget": z.number().nullish(),
  "success_criteria": z.array(z.string()).nullish(),
  "dependencies": z.array(z.string()).nullish()
})),
  "critical_path": z.object({
  "longest_dependency_chain": z.array(z.string()).nullish(),
  "sequencing_requirements": z.array(z.string()).nullish(),
  "risk_delay_points": z.array(z.string()).nullish()
}),
  "resource_requirements": z.object({
  "headcount": z.object({}).catchall(z.object({})).nullish(),
  "hiring_timeline": z.array(z.string()).nullish(),
  "tools_and_infrastructure_monthly": z.number().nullish(),
  "budget_allocation": z.object({}).catchall(z.number()).nullish(),
  "total_runway_12_months": z.number().nullish()
}),
  "success_metrics_and_gates": z.array(z.object({
  "phase": z.string().nullish(),
  "phase_gate_criteria": z.array(z.string()).nullish(),
  "key_metrics": z.object({}).catchall(z.string()).nullish(),
  "go_no_go_decision": z.string().nullish(),
  "adjustment_triggers": z.array(z.string()).nullish()
})),
  "first_30_days": z.object({
  "focus_areas": z.array(z.string()).nullish(),
  "week_1": z.array(z.string()).nullish(),
  "week_2": z.array(z.string()).nullish(),
  "week_3": z.array(z.string()).nullish(),
  "week_4": z.array(z.string()).nullish(),
  "team_composition": z.string().nullish()
}),
  "assumptions": z.array(z.string()).nullish(),
  "data_gaps": z.array(z.string()).nullish(),
  "confidence_score": z.number().min(0).max(100),
  "confidence_rationale": z.string().nullish(),
  "key_sections": z.array(z.string()).nullish(),
  "execution_timestamp": z.string().nullish(),
  "agent_id": z.string().nullish()
});
export type ExecutionRoadmapPlannerOutput = z.infer<typeof ExecutionRoadmapPlannerOutputSchema>;
