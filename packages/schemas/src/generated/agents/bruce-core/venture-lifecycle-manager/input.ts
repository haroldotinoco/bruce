/* eslint-disable */
// auto-generated from modules/bruce-core/agents/venture-lifecycle-manager/input.schema.json; run pnpm --filter @bruce/schemas generate

import { z } from 'zod';

export const VentureLifecycleManagerInputSchema = z.object({
  "venture_id": z.string(),
  "trigger_type": z.enum(["gate_passed", "gate_failed", "gate_borderline", "module_completed", "escalation_resolved", "sla_check", "portfolio_decision", "manual_hold_release"]),
  "gate_decision": z.object({
  "gate_name": z.enum(["post-screening", "post-structuring", "post-build", "post-launch", "post-traction"]),
  "status": z.enum(["PASSED", "FAILED", "BORDERLINE"]),
  "score": z.number().min(0).max(100),
  "rationale": z.string().nullish(),
  "criteria_details": z.object({}).catchall(z.object({
  "score": z.number().nullish(),
  "feedback": z.string().nullish()
})).nullish(),
  "escalation_required": z.boolean().nullish(),
  "gate_evaluation_id": z.string().nullish(),
  "evaluated_at": z.string().nullish()
}).nullish(),
  "module_completion": z.object({
  "module_names": z.array(z.string()).nullish(),
  "dispatch_batch_id": z.string().nullish(),
  "module_outputs": z.object({}).passthrough().nullish(),
  "completed_at": z.string().nullish()
}).nullish(),
  "current_venture_state": z.object({
  "stage": z.enum(["GENERATED", "QUALIFIED", "STRUCTURED", "BUILT", "LAUNCHED", "OPERATING", "ITERATING", "SCALING", "PAUSED", "KILLED"]),
  "stage_entry_timestamp": z.string(),
  "gate_history": z.array(z.object({
  "gate": z.string().nullish(),
  "status": z.string().nullish(),
  "score": z.number().nullish(),
  "evaluated_at": z.string().nullish()
})).nullish(),
  "blockers": z.array(z.object({
  "id": z.string().nullish(),
  "description": z.string().nullish(),
  "severity": z.enum(["critical", "high", "medium"]).nullish(),
  "identified_at": z.string().nullish(),
  "assigned_to": z.string().nullish()
})).nullish(),
  "pending_escalations": z.array(z.object({
  "escalation_id": z.string().nullish(),
  "type": z.string().nullish(),
  "created_at": z.string().nullish(),
  "due_at": z.string().nullish()
})).nullish()
}).nullish(),
  "escalation_resolution": z.object({
  "escalation_id": z.string().nullish(),
  "decision": z.enum(["APPROVED", "REJECTED", "HOLD"]).nullish(),
  "reasoning": z.string().nullish(),
  "resolved_by": z.string().nullish(),
  "resolved_at": z.string().nullish()
}).nullish(),
  "portfolio_decision": z.object({
  "decision": z.enum(["SCALE", "ITERATE", "PAUSE", "KILL"]).nullish(),
  "reasoning": z.string().nullish(),
  "source": z.string().nullish(),
  "confidence_score": z.number().min(0).max(1).nullish(),
  "decision_id": z.string().nullish()
}).nullish(),
  "correlation_id": z.string().nullish()
});
export type VentureLifecycleManagerInput = z.infer<typeof VentureLifecycleManagerInputSchema>;
