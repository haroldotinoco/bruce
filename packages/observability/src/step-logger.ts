import { and, eq, isNull } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';
import type {
  LogValue,
  QualityGate,
  StepLogLevel,
} from '@bruce/contracts/observability';

const { workflowRuns, workflowSteps, stepLogEntries } = schema;

type StepKey = string;

export interface StepDefinition {
  key: StepKey;
  label: string;
  icon?: string;
  description?: string;
  agentIds?: string[];
}

export interface StartWorkflowRunOpts {
  accountId: string;
  module: string;
  workflowType?: string;
  temporalWorkflowId?: string;
  correlationId?: string;
  ventureId?: string;
  title: string;
  subtitle?: string;
  /** Optional pre-declared top-level steps (rendered as `pending` immediately). */
  steps?: StepDefinition[];
  runId?: string;
}

export interface WorkflowRunHandle {
  runId: string;
  /** Get-or-create a top-level step logger by key. */
  step(key: StepKey, label?: string, opts?: Partial<StepDefinition>): Promise<StepLogger>;
  /** Mark the entire run as completed with optional result payload. */
  complete(result?: unknown): Promise<void>;
  /** Mark the run as failed with an error. */
  fail(err: unknown): Promise<void>;
  /** Update the overall run progress 0..1. */
  setProgress(progress: number): Promise<void>;
}

export interface StepLogger {
  readonly runId: string;
  readonly stepId: string;
  readonly key: StepKey;
  /** Mark the step as `running` and stamp `started_at` if not already. */
  start(): Promise<void>;
  /** Upsert one or more typed fields into the step's `fields_json`. */
  field(key: string, value: LogValue): Promise<void>;
  fields(fields: Record<string, LogValue>): Promise<void>;
  /** Append a typed log entry to the step's timeline. */
  event(
    level: StepLogLevel,
    message: string,
    fields?: Record<string, LogValue>,
    extra?: { agentId?: string; attempt?: number },
  ): Promise<void>;
  /** Update progress fraction (0..1) — drives the bullet ring. */
  setProgress(fraction: number): Promise<void>;
  /** Increment attempt counter (for retries / quality-gate loops). */
  retry(reason: string, max?: number): Promise<void>;
  /** Stamp the latest quality-gate evaluation. */
  qualityGate(gate: QualityGate): Promise<void>;
  /** Get-or-create a child step logger (sub-step). */
  child(key: StepKey, label: string, opts?: Partial<StepDefinition>): Promise<StepLogger>;
  /** Mark the step as `done` with optional final fields. */
  succeed(fields?: Record<string, LogValue>): Promise<void>;
  /** Mark the step as `failed`, log the error and bubble it up. */
  fail(err: unknown, fields?: Record<string, LogValue>): Promise<void>;
  /** Mark as `skipped`. */
  skip(reason?: string): Promise<void>;
}

const VALID_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseUuidOrNull(v: string | undefined): string | undefined {
  if (!v) return undefined;
  return VALID_UUID_RE.test(v) ? v : undefined;
}

export async function startWorkflowRun(
  opts: StartWorkflowRunOpts,
): Promise<WorkflowRunHandle> {
  const accountId = opts.accountId;
  const ventureId = parseUuidOrNull(opts.ventureId);

  const runId = await withAccountContext(accountId, async (tx) => {
    const [row] = await tx
      .insert(workflowRuns)
      .values({
        ...(opts.runId ? { id: opts.runId } : {}),
        module: opts.module,
        workflow_type: opts.workflowType ?? null,
        temporal_workflow_id: opts.temporalWorkflowId ?? null,
        correlation_id: opts.correlationId ?? null,
        account_id: accountId,
        venture_id: ventureId ?? null,
        status: 'running',
        title: opts.title,
        subtitle: opts.subtitle ?? null,
        progress: 0,
      })
      .returning({ id: workflowRuns.id });

    if (!row?.id) throw new Error('Failed to insert workflow_run');

    if (opts.steps && opts.steps.length > 0) {
      await tx.insert(workflowSteps).values(
        opts.steps.map((s, idx) => ({
          run_id: row.id,
          parent_step_id: null,
          seq: idx,
          key: s.key,
          label: s.label,
          icon: s.icon ?? null,
          description: s.description ?? null,
          status: 'pending',
          agent_ids: s.agentIds ?? [],
        })),
      );
    }

    return row.id;
  });

  logger.info(
    {
      run_id: runId,
      module: opts.module,
      workflow_type: opts.workflowType,
      temporal_workflow_id: opts.temporalWorkflowId,
      correlation_id: opts.correlationId,
      account_id: accountId,
      venture_id: ventureId,
    },
    `[obs] workflow run started: ${opts.title}`,
  );

  return buildRunHandle(runId, accountId, opts.module);
}

function buildRunHandle(
  runId: string,
  accountId: string,
  module: string,
): WorkflowRunHandle {
  return {
    runId,
    async step(key, label, defOpts) {
      return getOrCreateStep({
        runId,
        accountId,
        module,
        parentStepId: null,
        key,
        label: label ?? key,
        opts: defOpts,
      });
    },
    async complete(result) {
      await withAccountContext(accountId, async (tx) => {
        await tx
          .update(workflowRuns)
          .set({
            status: 'completed',
            progress: 1,
            completed_at: new Date(),
            updated_at: new Date(),
            ...(result !== undefined ? { result_json: result } : {}),
          })
          .where(eq(workflowRuns.id, runId));
      });
      logger.info({ run_id: runId, module }, '[obs] workflow run completed');
    },
    async fail(err) {
      const message = err instanceof Error ? err.message : String(err);
      await withAccountContext(accountId, async (tx) => {
        await tx
          .update(workflowRuns)
          .set({
            status: 'failed',
            completed_at: new Date(),
            updated_at: new Date(),
            error_message: message,
          })
          .where(eq(workflowRuns.id, runId));
      });
      logger.error(
        { run_id: runId, module, err: message },
        '[obs] workflow run failed',
      );
    },
    async setProgress(progress) {
      const clamped = Math.max(0, Math.min(1, progress));
      await withAccountContext(accountId, async (tx) => {
        await tx
          .update(workflowRuns)
          .set({ progress: clamped, updated_at: new Date() })
          .where(eq(workflowRuns.id, runId));
      });
    },
  };
}

interface GetOrCreateStepArgs {
  runId: string;
  accountId: string;
  module: string;
  parentStepId: string | null;
  key: StepKey;
  label: string;
  opts?: Partial<StepDefinition>;
}

async function getOrCreateStep(args: GetOrCreateStepArgs): Promise<StepLogger> {
  const { runId, accountId, parentStepId, key, label, opts } = args;

  const stepId = await withAccountContext(accountId, async (tx) => {
    const where = parentStepId
      ? and(
          eq(workflowSteps.run_id, runId),
          eq(workflowSteps.parent_step_id, parentStepId),
          eq(workflowSteps.key, key),
        )
      : and(
          eq(workflowSteps.run_id, runId),
          isNull(workflowSteps.parent_step_id),
          eq(workflowSteps.key, key),
        );

    const [existing] = await tx
      .select({ id: workflowSteps.id })
      .from(workflowSteps)
      .where(where)
      .limit(1);
    if (existing) return existing.id;

    const [row] = await tx
      .insert(workflowSteps)
      .values({
        run_id: runId,
        parent_step_id: parentStepId,
        seq: opts?.key ? 0 : 0,
        key,
        label,
        icon: opts?.icon ?? null,
        description: opts?.description ?? null,
        status: 'pending',
        agent_ids: opts?.agentIds ?? [],
      })
      .returning({ id: workflowSteps.id });
    if (!row?.id) throw new Error('Failed to insert workflow_step');
    return row.id;
  });

  return buildStepLogger({
    runId,
    accountId,
    module: args.module,
    stepId,
    key,
  });
}

interface BuildStepLoggerArgs {
  runId: string;
  accountId: string;
  module: string;
  stepId: string;
  key: StepKey;
}

function buildStepLogger(args: BuildStepLoggerArgs): StepLogger {
  const { runId, accountId, module, stepId, key } = args;

  async function patchStep(patch: Record<string, unknown>): Promise<void> {
    await withAccountContext(accountId, async (tx) => {
      await tx
        .update(workflowSteps)
        .set({ ...patch, updated_at: new Date() })
        .where(eq(workflowSteps.id, stepId));
    });
  }

  async function readFields(): Promise<Record<string, unknown>> {
    return await withAccountContext(accountId, async (tx) => {
      const [row] = await tx
        .select({ fields_json: workflowSteps.fields_json })
        .from(workflowSteps)
        .where(eq(workflowSteps.id, stepId))
        .limit(1);
      return (row?.fields_json as Record<string, unknown> | null) ?? {};
    });
  }

  return {
    runId,
    stepId,
    key,
    async start() {
      await withAccountContext(accountId, async (tx) => {
        const [row] = await tx
          .select({ started_at: workflowSteps.started_at })
          .from(workflowSteps)
          .where(eq(workflowSteps.id, stepId))
          .limit(1);
        const set: Record<string, unknown> = {
          status: 'running',
          updated_at: new Date(),
        };
        if (!row?.started_at) set.started_at = new Date();
        await tx
          .update(workflowSteps)
          .set(set)
          .where(eq(workflowSteps.id, stepId));
      });
      logger.info({ run_id: runId, step_id: stepId, step_key: key, module }, `[obs] step started: ${key}`);
    },
    async field(fieldKey, value) {
      const current = await readFields();
      current[fieldKey] = value as unknown;
      await patchStep({ fields_json: current });
    },
    async fields(merge) {
      const current = await readFields();
      for (const [k, val] of Object.entries(merge)) current[k] = val as unknown;
      await patchStep({ fields_json: current });
    },
    async event(level, message, fields, extra) {
      await withAccountContext(accountId, async (tx) => {
        await tx.insert(stepLogEntries).values({
          step_id: stepId,
          run_id: runId,
          level,
          message,
          fields_json: fields ?? null,
          agent_id: extra?.agentId ?? null,
          attempt: extra?.attempt ?? null,
        });
      });
      const logFn =
        level === 'error'
          ? logger.error
          : level === 'warn'
            ? logger.warn
            : level === 'debug'
              ? logger.debug
              : logger.info;
      logFn(
        {
          run_id: runId,
          step_id: stepId,
          step_key: key,
          module,
          level,
          fields,
          attempt: extra?.attempt,
          agent_id: extra?.agentId,
        },
        `[obs] ${message}`,
      );
    },
    async setProgress(fraction) {
      const clamped = Math.max(0, Math.min(1, fraction));
      await patchStep({ progress_fraction: clamped });
    },
    async retry(reason, max) {
      await withAccountContext(accountId, async (tx) => {
        const [row] = await tx
          .select({
            current: workflowSteps.attempt_current,
            max: workflowSteps.attempt_max,
          })
          .from(workflowSteps)
          .where(eq(workflowSteps.id, stepId))
          .limit(1);
        const next = (row?.current ?? 1) + 1;
        await tx
          .update(workflowSteps)
          .set({
            attempt_current: next,
            attempt_max: max ?? row?.max ?? next,
            attempt_reason: reason,
            updated_at: new Date(),
          })
          .where(eq(workflowSteps.id, stepId));
      });
      logger.warn(
        { run_id: runId, step_id: stepId, step_key: key, module, reason },
        `[obs] step retry: ${key}`,
      );
    },
    async qualityGate(gate) {
      await patchStep({ quality_gate_json: gate });
      logger.info(
        {
          run_id: runId,
          step_id: stepId,
          step_key: key,
          module,
          quality_gate: gate,
        },
        `[obs] quality_gate ${gate.name}: passed=${gate.passed} attempt=${gate.attempt}/${gate.max_attempts}`,
      );
    },
    async child(childKey, childLabel, childOpts) {
      return getOrCreateStep({
        runId,
        accountId,
        module,
        parentStepId: stepId,
        key: childKey,
        label: childLabel,
        opts: childOpts,
      });
    },
    async succeed(finalFields) {
      if (finalFields) {
        const current = await readFields();
        for (const [k, val] of Object.entries(finalFields)) current[k] = val as unknown;
        await patchStep({ fields_json: current });
      }
      await withAccountContext(accountId, async (tx) => {
        const [row] = await tx
          .select({ started_at: workflowSteps.started_at })
          .from(workflowSteps)
          .where(eq(workflowSteps.id, stepId))
          .limit(1);
        const finishedAt = new Date();
        const startedAt = row?.started_at ?? finishedAt;
        const durationMs = Math.max(0, finishedAt.getTime() - startedAt.getTime());
        await tx
          .update(workflowSteps)
          .set({
            status: 'done',
            finished_at: finishedAt,
            duration_ms: durationMs,
            progress_fraction: 1,
            updated_at: finishedAt,
          })
          .where(eq(workflowSteps.id, stepId));
      });
      logger.info({ run_id: runId, step_id: stepId, step_key: key, module }, `[obs] step done: ${key}`);
    },
    async fail(err, fields) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      if (fields) {
        const current = await readFields();
        for (const [k, val] of Object.entries(fields)) current[k] = val as unknown;
        await patchStep({ fields_json: current });
      }
      await withAccountContext(accountId, async (tx) => {
        await tx.insert(stepLogEntries).values({
          step_id: stepId,
          run_id: runId,
          level: 'error',
          message,
          fields_json: stack ? { stack: { kind: 'code', value: stack } } : null,
        });
        const [row] = await tx
          .select({ started_at: workflowSteps.started_at })
          .from(workflowSteps)
          .where(eq(workflowSteps.id, stepId))
          .limit(1);
        const finishedAt = new Date();
        const startedAt = row?.started_at ?? finishedAt;
        const durationMs = Math.max(0, finishedAt.getTime() - startedAt.getTime());
        await tx
          .update(workflowSteps)
          .set({
            status: 'failed',
            finished_at: finishedAt,
            duration_ms: durationMs,
            updated_at: finishedAt,
          })
          .where(eq(workflowSteps.id, stepId));
      });
      logger.error(
        { run_id: runId, step_id: stepId, step_key: key, module, err: message },
        `[obs] step failed: ${key}`,
      );
    },
    async skip(reason) {
      await patchStep({
        status: 'skipped',
        finished_at: new Date(),
      });
      if (reason) {
        await withAccountContext(accountId, async (tx) => {
          await tx.insert(stepLogEntries).values({
            step_id: stepId,
            run_id: runId,
            level: 'info',
            message: `Skipped: ${reason}`,
          });
        });
      }
      logger.info({ run_id: runId, step_id: stepId, step_key: key, module }, `[obs] step skipped: ${key}`);
    },
  };
}
