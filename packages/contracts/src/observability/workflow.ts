import type { LogValue } from './log-value.js';

/**
 * Universal structured workflow / step / log model used by the dashboard and
 * by every Bruce module's observability endpoint (`GET /workflows/:id`).
 *
 * Lives in @bruce/contracts so the dashboard, the @bruce/observability
 * package and the per-module routes all share the same shape.
 */

export type WorkflowStepStatus =
  | 'pending'
  | 'running'
  | 'done'
  | 'failed'
  | 'skipped';

export type WorkflowRunStatus = 'queued' | 'running' | 'completed' | 'failed';

export type StepLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

/**
 * One entry in a step's typed log timeline. Backwards-compatible alias
 * `WorkflowStepEvent` is exported for the existing dashboard code.
 */
export interface StepLogEntry {
  id: string;
  at: string;
  level: StepLogLevel;
  message?: string;
  /** Typed payload — keys are arbitrary, values are LogValues. */
  fields?: Record<string, LogValue>;
  agent_id?: string;
  attempt?: number;
}

/** Backwards-compat alias used by the dashboard before the migration. */
export interface WorkflowStepEvent {
  at: string;
  message: string;
  severity: 'info' | 'warn' | 'error' | 'success';
}

export interface QualityGate {
  name: string;
  /** Conventionally a `kind: 'score'` LogValue. */
  score?: LogValue;
  threshold: number;
  passed: boolean;
  attempt: number;
  max_attempts: number;
  reason?: string;
}

export interface StepAttempt {
  current: number;
  max: number;
  reason?: string;
}

/** Aggregated token/cost totals for LLM calls (per step or whole run). */
export interface LlmUsageTotals {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  /** Sum of provider-reported USD cost when available. */
  cost_usd: number | null;
  request_count: number;
}

export interface WorkflowStep {
  id: string;
  /** Stable per-run key — used to upsert when re-emitting state. */
  key?: string;
  label: string;
  icon: string;
  description?: string;
  agent_ids: string[];
  status: WorkflowStepStatus;

  started_at?: string;
  finished_at?: string;
  duration_ms?: number;
  /** Server-computed `now - started_at` for the running step. */
  elapsed_ms?: number;

  /** 0..1 — drives the circular progress ring around the bullet. */
  progress_fraction?: number;

  attempt?: StepAttempt;
  quality_gate?: QualityGate;

  /** Resumable "card" of typed fields summarising the step. */
  fields?: Record<string, LogValue>;

  /** Nested steps. Recursive. */
  sub_steps?: WorkflowStep[];

  /** Timeline of typed events. */
  log?: StepLogEntry[];

  /** Legacy artifact name lists (kept for read compatibility). */
  inputs?: string[];
  outputs?: string[];
  /** Legacy alias for `log` — old dashboard code reads `events`. */
  events?: WorkflowStepEvent[];

  /** LLM usage attributed to this step (including sub-steps is separate). */
  llm_usage?: LlmUsageTotals;
}

export interface ActiveWorkflow {
  id: string;
  /** Originating module name (e.g. 'opportunity', 'add-venture'). */
  module: string;
  workflow_type?: string;
  venture_id?: string;
  venture_name?: string;
  account_id?: string;
  title: string;
  subtitle?: string;
  status: WorkflowRunStatus;
  started_at: string;
  completed_at?: string;
  /** 0..1 across all steps. */
  progress: number;
  steps: WorkflowStep[];
  temporal_workflow_id?: string;
  error_message?: string;
  /** Total LLM usage for this workflow run. */
  llm_usage?: LlmUsageTotals;
}

export interface WorkflowRunSummary {
  id: string;
  module: string;
  workflow_type?: string;
  title: string;
  subtitle?: string;
  status: WorkflowRunStatus;
  venture_id?: string;
  account_id?: string;
  started_at: string;
  completed_at?: string;
  progress: number;
  temporal_workflow_id?: string;
}
