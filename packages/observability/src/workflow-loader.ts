import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';
import type {
  ActiveWorkflow,
  LlmUsageTotals,
  WorkflowRunSummary,
  WorkflowStep,
  WorkflowStepStatus,
  WorkflowRunStatus,
  StepLogEntry,
  StepLogLevel,
  QualityGate,
  LogValue,
} from '@bruce/contracts/observability';
import { getLlmUsageAggregatesForRun } from './llm-usage.js';

const { workflowRuns, workflowSteps, stepLogEntries } = schema;

interface StepRow {
  id: string;
  run_id: string;
  parent_step_id: string | null;
  seq: number;
  key: string;
  label: string;
  icon: string | null;
  description: string | null;
  status: string;
  started_at: Date | null;
  finished_at: Date | null;
  duration_ms: number | null;
  progress_fraction: number | null;
  attempt_current: number | null;
  attempt_max: number | null;
  attempt_reason: string | null;
  quality_gate_json: unknown;
  fields_json: unknown;
  agent_ids: string[];
}

interface LogRow {
  id: string;
  step_id: string;
  at: Date;
  level: string;
  message: string | null;
  fields_json: unknown;
  agent_id: string | null;
  attempt: number | null;
}

export async function getWorkflowRun(
  accountId: string,
  runId: string,
): Promise<ActiveWorkflow | null> {
  return await withAccountContext(accountId, async (tx) => {
    const [run] = await tx
      .select()
      .from(workflowRuns)
      .where(and(eq(workflowRuns.id, runId), eq(workflowRuns.account_id, accountId)))
      .limit(1);
    if (!run) return null;

    const stepRows = (await tx
      .select()
      .from(workflowSteps)
      .where(eq(workflowSteps.run_id, runId))
      .orderBy(asc(workflowSteps.seq), asc(workflowSteps.created_at))) as unknown as StepRow[];

    const logRows = (await tx
      .select()
      .from(stepLogEntries)
      .where(eq(stepLogEntries.run_id, runId))
      .orderBy(asc(stepLogEntries.at))) as unknown as LogRow[];

    const usageAgg = await getLlmUsageAggregatesForRun(accountId, runId);

    return assembleActiveWorkflow(run as unknown as RunRow, stepRows, logRows, usageAgg);
  });
}

interface RunRow {
  id: string;
  module: string;
  workflow_type: string | null;
  temporal_workflow_id: string | null;
  account_id: string;
  venture_id: string | null;
  status: string;
  title: string;
  subtitle: string | null;
  progress: number;
  started_at: Date;
  completed_at: Date | null;
  result_json: unknown;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function getWorkflowRunByTemporalId(
  accountId: string,
  temporalWorkflowId: string,
): Promise<ActiveWorkflow | null> {
  return await withAccountContext(accountId, async (tx) => {
    const [run] = await tx
      .select()
      .from(workflowRuns)
      .where(
        and(
          eq(workflowRuns.account_id, accountId),
          eq(workflowRuns.temporal_workflow_id, temporalWorkflowId),
        ),
      )
      .orderBy(desc(workflowRuns.started_at))
      .limit(1);
    if (!run) return null;

    const stepRows = (await tx
      .select()
      .from(workflowSteps)
      .where(eq(workflowSteps.run_id, run.id))
      .orderBy(asc(workflowSteps.seq), asc(workflowSteps.created_at))) as unknown as StepRow[];

    const logRows = (await tx
      .select()
      .from(stepLogEntries)
      .where(eq(stepLogEntries.run_id, run.id))
      .orderBy(asc(stepLogEntries.at))) as unknown as LogRow[];

    const usageAgg = await getLlmUsageAggregatesForRun(accountId, run.id);

    return assembleActiveWorkflow(run as unknown as RunRow, stepRows, logRows, usageAgg);
  });
}

export async function listWorkflowRuns(
  accountId: string,
  opts: { module?: string; ventureId?: string; status?: string; limit?: number },
): Promise<WorkflowRunSummary[]> {
  return await withAccountContext(accountId, async (tx) => {
    const conditions = [eq(workflowRuns.account_id, accountId)];
    if (opts.module) conditions.push(eq(workflowRuns.module, opts.module));
    if (opts.status) conditions.push(eq(workflowRuns.status, opts.status));
    if (opts.ventureId) conditions.push(eq(workflowRuns.venture_id, opts.ventureId));
    const rows = (await tx
      .select()
      .from(workflowRuns)
      .where(and(...conditions))
      .orderBy(desc(workflowRuns.started_at))
      .limit(opts.limit ?? 50)) as unknown as RunRow[];
    return rows.map((r) => ({
      id: r.id,
      module: r.module,
      workflow_type: r.workflow_type ?? undefined,
      title: r.title,
      subtitle: r.subtitle ?? undefined,
      status: normalizeRunStatus(r.status),
      venture_id: r.venture_id ?? undefined,
      account_id: r.account_id,
      started_at: r.started_at.toISOString(),
      completed_at: r.completed_at?.toISOString(),
      progress: r.progress,
      temporal_workflow_id: r.temporal_workflow_id ?? undefined,
    }));
  });
}

function assembleActiveWorkflow(
  run: RunRow,
  stepRows: StepRow[],
  logRows: LogRow[],
  usageAgg?: { run: LlmUsageTotals; byStepId: Map<string, LlmUsageTotals> },
): ActiveWorkflow {
  const logsByStep = new Map<string, StepLogEntry[]>();
  for (const r of logRows) {
    const list = logsByStep.get(r.step_id) ?? [];
    list.push(rowToLogEntry(r));
    logsByStep.set(r.step_id, list);
  }

  const byParent = new Map<string | null, StepRow[]>();
  for (const r of stepRows) {
    const key = r.parent_step_id;
    const list = byParent.get(key) ?? [];
    list.push(r);
    byParent.set(key, list);
  }

  const buildStep = (row: StepRow): WorkflowStep => {
    const stepUsage = usageAgg?.byStepId.get(row.id);
    const childRows = byParent.get(row.id) ?? [];
    const subSteps = childRows.map(buildStep);
    const startedAt = row.started_at ?? undefined;
    const finishedAt = row.finished_at ?? undefined;
    const status = normalizeStepStatus(row.status);
    const elapsedMs =
      status === 'running' && startedAt
        ? Math.max(0, Date.now() - startedAt.getTime())
        : undefined;

    const log = logsByStep.get(row.id);
    const events = log?.map((l) => ({
      at: l.at,
      message: l.message ?? '',
      severity:
        l.level === 'success'
          ? 'success'
          : l.level === 'warn'
            ? 'warn'
            : l.level === 'error'
              ? 'error'
              : 'info',
    })) as ActiveWorkflow['steps'][number]['events'];

    return {
      id: row.id,
      key: row.key,
      label: row.label,
      icon: row.icon ?? 'circle',
      description: row.description ?? undefined,
      agent_ids: row.agent_ids ?? [],
      status,
      started_at: startedAt?.toISOString(),
      finished_at: finishedAt?.toISOString(),
      duration_ms: row.duration_ms ?? undefined,
      elapsed_ms: elapsedMs,
      progress_fraction: row.progress_fraction ?? undefined,
      attempt:
        row.attempt_current && row.attempt_current > 0
          ? {
              current: row.attempt_current,
              max: row.attempt_max ?? row.attempt_current,
              reason: row.attempt_reason ?? undefined,
            }
          : undefined,
      quality_gate: (row.quality_gate_json as QualityGate | null) ?? undefined,
      fields: (row.fields_json as Record<string, LogValue> | null) ?? undefined,
      sub_steps: subSteps.length ? subSteps : undefined,
      log,
      events,
      llm_usage: stepUsage,
    };
  };

  const topLevelRows = byParent.get(null) ?? [];
  const steps = topLevelRows.map(buildStep);

  return {
    id: run.id,
    module: run.module,
    workflow_type: run.workflow_type ?? undefined,
    venture_id: run.venture_id ?? undefined,
    account_id: run.account_id,
    title: run.title,
    subtitle: run.subtitle ?? undefined,
    status: normalizeRunStatus(run.status),
    started_at: run.started_at.toISOString(),
    completed_at: run.completed_at?.toISOString(),
    progress: computeProgress(run, steps),
    steps,
    temporal_workflow_id: run.temporal_workflow_id ?? undefined,
    error_message: run.error_message ?? undefined,
    llm_usage: usageAgg?.run,
  };
}

function rowToLogEntry(row: LogRow): StepLogEntry {
  return {
    id: row.id,
    at: row.at.toISOString(),
    level: normalizeLevel(row.level),
    message: row.message ?? undefined,
    fields:
      (row.fields_json as Record<string, LogValue> | null) ?? undefined,
    agent_id: row.agent_id ?? undefined,
    attempt: row.attempt ?? undefined,
  };
}

function normalizeStepStatus(s: string): WorkflowStepStatus {
  if (s === 'running' || s === 'done' || s === 'failed' || s === 'skipped') return s;
  return 'pending';
}

function normalizeRunStatus(s: string): WorkflowRunStatus {
  if (s === 'completed' || s === 'failed' || s === 'queued' || s === 'running') return s;
  return 'queued';
}

function normalizeLevel(s: string): StepLogLevel {
  if (s === 'debug' || s === 'info' || s === 'warn' || s === 'error' || s === 'success')
    return s;
  return 'info';
}

function computeProgress(run: RunRow, steps: WorkflowStep[]): number {
  if (run.status === 'completed') return 1;
  if (typeof run.progress === 'number' && run.progress > 0) return run.progress;
  if (steps.length === 0) return 0;
  let acc = 0;
  for (const s of steps) {
    if (s.status === 'done') acc += 1;
    else if (s.status === 'running') acc += s.progress_fraction ?? 0.5;
  }
  return Math.max(0, Math.min(1, acc / steps.length));
}

// Avoid drizzle warning about unused sql tag.
void sql;
