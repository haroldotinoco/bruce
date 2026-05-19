import type { ModuleId } from '../config/env.types';
import type { EvalCoverageLevel, ReadinessDimension, ReadinessState } from '../config/module-readiness';

export type VentureStage = 'concept' | 'scoping' | 'building' | 'live' | 'archived';

export interface Venture {
  id: string;
  name: string;
  stage: VentureStage;
  created_at: string;
  updated_at: string;
  score?: number;
  modules_active: ModuleId[];
  owner?: string;
  description?: string;
}

export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed' | 'canceled';

export interface Scan {
  id: string;
  status: ScanStatus;
  themes: string[] | null;
  venture_id?: string | null;
  opportunities_found: number | null;
  created_at: string;
  completed_at: string | null;
  temporal_workflow_id: string | null;
}

export interface ScanDetail extends Scan {
  result: unknown;
  error_message: string | null;
  updated_at: string;
  /** From platform.projects when venture_id is a UUID */
  project_nickname?: string | null;
}

/** POST /scans/:id/restart-downstream */
export interface RestartDownstreamRequest {
  confirm_nickname: string;
  acknowledge_irreversible: true;
  opportunity_id?: string;
  rollback_from_step?: string;
}

export interface RestartDownstreamResponse {
  workflow_id: string;
  pipeline_run_id: string | null;
  status: string;
  execution_id?: string;
  poll_url?: string;
}

export interface ForceHandoffRequest {
  force: true;
  reason: string;
  target_module?: string;
  source_step_id?: string;
}

export interface ForceHandoffResponse {
  status: 'emitted';
  event_type: string;
  source_module: ModuleId;
  target_modules: ModuleId[];
  forced_from_run_id: string;
  forced_from_temporal_workflow_id?: string;
}

export interface StartFromPromptRequest {
  prompt: string;
  venture_id?: string;
  venture_name?: string;
  forced_brand_name?: string;
  project_nickname?: string;
}

export interface StartFromPromptResponse {
  venture_id: string;
  correlation_id: string;
  workflow_id: string;
  execution_id?: string;
  poll_url?: string;
  synthetic: {
    opportunity_scan_id?: string;
    opportunity_observability_run_id?: string;
    add_venture_pipeline_run_id?: string | null;
    add_venture_observability_run_id?: string;
  };
}

export interface Opportunity {
  id: string;
  problem_statement: string;
  market_segment: string;
  score: number;
  created_at: string;
  scan_id: string | null;
  research_data?: unknown;
  key_insights?: string[];
  competitive_landscape?: unknown;
  total_score?: number;
  title?: string;
}

export type JobStatusString =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELED'
  | 'TIMED_OUT'
  | 'TERMINATED';

export interface JobStatus {
  workflow_id: string;
  status: JobStatusString;
  started_at?: string;
  completed_at?: string;
  result?: unknown;
  error?: string | null;
}

export interface Usage {
  plan: string;
  scans_this_month: number;
  scans_limit_month: number;
  max_ai_credits_per_month: number;
  unlimited?: boolean;
}

export interface StartScanThemed {
  themes: string[];
  filters?: Record<string, unknown>;
  venture_id?: string;
  webhook_url?: string;
}

export interface StartScanVenture {
  venture_id: string;
  opportunities?: unknown[];
  themes?: string[];
}

export type StartScanRequest = StartScanThemed | StartScanVenture;

export interface StartScanResponse {
  workflow_id: string;
  /** DB row id — prefer for `/opportunity/scans/:id` so refresh and list stay in sync. */
  id?: string;
  execution_id?: string;
  status: string;
}

export interface ModuleHealth {
  id: ModuleId;
  status: 'ok' | 'degraded' | 'down' | 'idle';
  lastRunAt?: string;
  jobs24h: number;
  failures24h: number;
  avgLatencyMs: number;
  costUsd14d: number;
}

export interface LiveEvent {
  id: string;
  module: ModuleId;
  kind: string;
  venture_id?: string;
  message: string;
  at: string;
  severity: 'info' | 'success' | 'warn' | 'error';
}

export interface TemporalRun {
  id: string;
  workflow_type: string;
  module: ModuleId;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'QUEUED' | 'CANCELED';
  started_at: string;
  duration_ms: number | null;
  venture_id?: string;
  progress?: number;
  steps?: RunStep[];
}

export interface RunStep {
  name: string;
  status: 'pending' | 'running' | 'done' | 'failed' | 'skipped';
  started_at?: string;
  duration_ms?: number;
}

export interface AgentCapability {
  id: string;
  module: ModuleId;
  name: string;
  label: string;
  description: string;
  capabilities: string[];
  inputs?: string[];
  outputs?: string[];
  model?: string;
  evaluation?: {
    covered: boolean;
    scenario_count: number;
  };
  runtime_readiness?: ManifestRuntimeReadiness;
}

export interface ModuleManifest {
  id: ModuleId;
  agents_count: number;
  evaluation?: {
    scenario_count: number;
    covered_agent_count: number;
    coverage_level: EvalCoverageLevel;
    scenarios: Array<{
      id: string;
      title: string;
      agent_id: string | null;
      path: string;
    }>;
  };
  runtime_readiness?: ManifestRuntimeReadiness;
}

export interface ManifestRuntimeReadiness {
  state: ReadinessState;
  navigation: ReadinessDimension;
  http_health: ReadinessDimension;
  workflow_routes: ReadinessDimension;
  temporal_worker: ReadinessDimension;
  event_worker: ReadinessDimension;
  dashboard_data_source: 'real' | 'mock';
  manifest_completeness: ReadinessDimension;
  eval_coverage?: EvalCoverageLevel;
  summary: string;
}

// =============================================================================
// Observability / structured workflow logs
// (mirrors @bruce/contracts/observability — keep in sync)
// =============================================================================

export type LogValueKind =
  | 'null'
  | 'boolean'
  | 'number'
  | 'integer'
  | 'percent'
  | 'currency'
  | 'duration_ms'
  | 'score'
  | 'text_short'
  | 'text_long'
  | 'markdown'
  | 'code'
  | 'date'
  | 'time'
  | 'datetime'
  | 'timestamp'
  | 'url'
  | 'email'
  | 'image_url'
  | 'video_url'
  | 'color'
  | 'tag'
  | 'tags'
  | 'badge'
  | 'enum'
  | 'id_ref'
  | 'array'
  | 'object'
  | 'json';

export type LogValueVariant = 'success' | 'warn' | 'error' | 'info' | 'neutral';

export interface LogValue {
  kind: LogValueKind;
  value: unknown;
  unit?: string;
  variant?: LogValueVariant;
  out_of?: number;
  threshold?: number;
  passed?: boolean;
  ref_kind?: 'opportunity' | 'venture' | 'agent' | 'workflow' | 'scan' | 'job' | string;
  ref_label?: string;
  ref_url?: string;
  item_kind?: LogValueKind;
  tone_map?: Record<string, LogValueVariant>;
  language?: string;
}

export type WorkflowStepStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';
export type WorkflowRunStatus = 'queued' | 'running' | 'completed' | 'failed';
export type StepLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export interface StepLogEntry {
  id?: string;
  at: string;
  level: StepLogLevel;
  message: string;
  fields?: Record<string, LogValue>;
  agent_id?: string;
  attempt?: number;
}

/** Legacy alias (StepLogEntry but with the limited "severity" set used by the old UI). */
export interface WorkflowStepEvent {
  at: string;
  message: string;
  severity: 'info' | 'warn' | 'error' | 'success';
  fields?: Record<string, LogValue>;
}

export interface QualityGate {
  name: string;
  score?: LogValue;
  threshold?: number;
  passed: boolean;
  attempt: number;
  max_attempts?: number;
  reason?: string;
}

export interface StepAttempt {
  current: number;
  max?: number;
  reason?: string;
}

export interface LlmUsageTotals {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number | null;
  request_count: number;
}

export interface WorkflowStep {
  id: string;
  key?: string;
  label: string;
  icon: string;
  description?: string;
  agent_ids: string[];
  status: WorkflowStepStatus;
  started_at?: string;
  finished_at?: string;
  duration_ms?: number;
  /** Live elapsed for currently-running steps; computed by the dashboard. */
  elapsed_ms?: number;
  /** 0..1 deterministic progress (for the SVG progress ring). */
  progress_fraction?: number;
  attempt?: StepAttempt;
  quality_gate?: QualityGate;
  fields?: Record<string, LogValue>;
  sub_steps?: WorkflowStep[];
  log?: StepLogEntry[];
  // Legacy fields kept for backward compatibility with older mocks/UI.
  inputs?: string[];
  outputs?: string[];
  events?: WorkflowStepEvent[];
  llm_usage?: LlmUsageTotals;
}

export interface ActiveWorkflow {
  id: string;
  module: ModuleId;
  workflow_type?: string;
  venture_id?: string;
  venture_name?: string;
  account_id?: string;
  title: string;
  subtitle?: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  started_at: string;
  completed_at?: string;
  /** Live elapsed_ms (computed by dashboard for running runs). */
  elapsed_ms?: number;
  progress: number;
  steps: WorkflowStep[];
  temporal_workflow_id?: string;
  error_message?: string;
  llm_usage?: LlmUsageTotals;
}

export interface WorkflowRunSummary {
  id: string;
  module: ModuleId;
  workflow_type: string;
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
