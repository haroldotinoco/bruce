import { and, eq, isNull } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';
import type {
  LogValue,
  QualityGate,
  StepLogLevel,
  WorkflowStepStatus,
} from '@bruce/contracts/observability';

const { workflowRuns, workflowSteps, stepLogEntries } = schema;

/**
 * Temporal activities for the universal observability layer. Each module's
 * worker re-exports these from its own `activities.ts` so the workflow can
 * proxy them like any other activity.
 *
 * All operations are scoped through `withAccountContext` so RLS policies on
 * the `observability` schema are respected.
 */

const VALID_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseUuidOrNull(v: string | undefined | null): string | null {
  if (!v) return null;
  return VALID_UUID_RE.test(v) ? v : null;
}

export interface ObsStartRunInput {
  accountId: string;
  module: string;
  workflowType?: string;
  temporalWorkflowId?: string;
  ventureId?: string;
  title: string;
  subtitle?: string;
  steps?: Array<{
    key: string;
    label: string;
    icon?: string;
    description?: string;
    agentIds?: string[];
  }>;
}

export async function obsStartRun(input: ObsStartRunInput): Promise<string> {
  const accountId = input.accountId;
  const ventureId = parseUuidOrNull(input.ventureId);
  const runId = await withAccountContext(accountId, async (tx) => {
    const [row] = await tx
      .insert(workflowRuns)
      .values({
        module: input.module,
        workflow_type: input.workflowType ?? null,
        temporal_workflow_id: input.temporalWorkflowId ?? null,
        account_id: accountId,
        venture_id: ventureId,
        status: 'running',
        title: input.title,
        subtitle: input.subtitle ?? null,
        progress: 0,
      })
      .returning({ id: workflowRuns.id });
    if (!row?.id) throw new Error('obsStartRun: insert returned no id');
    if (input.steps?.length) {
      await tx.insert(workflowSteps).values(
        input.steps.map((s, idx) => ({
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
      module: input.module,
      workflow_type: input.workflowType,
      temporal_workflow_id: input.temporalWorkflowId,
      account_id: accountId,
    },
    `[obs] workflow run started: ${input.title}`,
  );
  return runId;
}

export interface ObsUpdateStepInput {
  runId: string;
  accountId: string;
  /** Stable per-run key used to identify or upsert the step. */
  key: string;
  /** Optional parent step key for sub-steps. */
  parentKey?: string;
  label?: string;
  icon?: string;
  description?: string;
  agentIds?: string[];
  status?: WorkflowStepStatus;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  progressFraction?: number;
  attempt?: { current: number; max?: number; reason?: string };
  qualityGate?: QualityGate;
  /** Merged into existing fields_json. */
  fields?: Record<string, LogValue>;
  seq?: number;
}

export async function obsUpdateStep(input: ObsUpdateStepInput): Promise<string> {
  const { runId, accountId } = input;
  return await withAccountContext(accountId, async (tx) => {
    let parentStepId: string | null = null;
    if (input.parentKey) {
      const [parent] = await tx
        .select({ id: workflowSteps.id })
        .from(workflowSteps)
        .where(
          and(
            eq(workflowSteps.run_id, runId),
            isNull(workflowSteps.parent_step_id),
            eq(workflowSteps.key, input.parentKey),
          ),
        )
        .limit(1);
      if (!parent) throw new Error(`obsUpdateStep: parent step '${input.parentKey}' not found`);
      parentStepId = parent.id;
    }

    const where = parentStepId
      ? and(
          eq(workflowSteps.run_id, runId),
          eq(workflowSteps.parent_step_id, parentStepId),
          eq(workflowSteps.key, input.key),
        )
      : and(
          eq(workflowSteps.run_id, runId),
          isNull(workflowSteps.parent_step_id),
          eq(workflowSteps.key, input.key),
        );

    const [existing] = await tx
      .select()
      .from(workflowSteps)
      .where(where)
      .limit(1);

    let stepId: string;
    if (!existing) {
      const [row] = await tx
        .insert(workflowSteps)
        .values({
          run_id: runId,
          parent_step_id: parentStepId,
          seq: input.seq ?? 0,
          key: input.key,
          label: input.label ?? input.key,
          icon: input.icon ?? null,
          description: input.description ?? null,
          status: input.status ?? 'pending',
          agent_ids: input.agentIds ?? [],
        })
        .returning({ id: workflowSteps.id });
      if (!row?.id) throw new Error('obsUpdateStep: insert returned no id');
      stepId = row.id;
    } else {
      stepId = existing.id;
    }

    const patch: Record<string, unknown> = { updated_at: new Date() };
    if (input.label !== undefined) patch.label = input.label;
    if (input.icon !== undefined) patch.icon = input.icon;
    if (input.description !== undefined) patch.description = input.description;
    if (input.agentIds !== undefined) patch.agent_ids = input.agentIds;
    if (input.status !== undefined) patch.status = input.status;
    if (input.startedAt !== undefined) patch.started_at = new Date(input.startedAt);
    if (input.finishedAt !== undefined) patch.finished_at = new Date(input.finishedAt);
    if (input.durationMs !== undefined) patch.duration_ms = input.durationMs;
    if (input.progressFraction !== undefined)
      patch.progress_fraction = Math.max(0, Math.min(1, input.progressFraction));
    if (input.attempt) {
      patch.attempt_current = input.attempt.current;
      patch.attempt_max = input.attempt.max ?? input.attempt.current;
      patch.attempt_reason = input.attempt.reason ?? null;
    }
    if (input.qualityGate) patch.quality_gate_json = input.qualityGate;
    if (input.fields) {
      const currentFields =
        (existing?.fields_json as Record<string, unknown> | null) ?? {};
      for (const [k, val] of Object.entries(input.fields))
        currentFields[k] = val as unknown;
      patch.fields_json = currentFields;
    }
    if (input.status === 'done' && input.finishedAt === undefined) {
      patch.finished_at = new Date();
    }
    if (
      (input.status === 'done' || input.status === 'failed') &&
      input.durationMs === undefined
    ) {
      const startedAt = existing?.started_at ?? null;
      const finishedAt = (patch.finished_at as Date | undefined) ?? new Date();
      if (startedAt) {
        patch.duration_ms = Math.max(0, finishedAt.getTime() - startedAt.getTime());
      }
    }
    if (input.status === 'done' && input.progressFraction === undefined) {
      patch.progress_fraction = 1;
    }

    await tx.update(workflowSteps).set(patch).where(eq(workflowSteps.id, stepId));
    return stepId;
  });
}

export interface ObsStepEventInput {
  runId: string;
  accountId: string;
  stepKey: string;
  parentKey?: string;
  level: StepLogLevel;
  message: string;
  fields?: Record<string, LogValue>;
  agentId?: string;
  attempt?: number;
}

export async function obsStepEvent(input: ObsStepEventInput): Promise<void> {
  const { runId, accountId } = input;
  await withAccountContext(accountId, async (tx) => {
    let parentStepId: string | null = null;
    if (input.parentKey) {
      const [parent] = await tx
        .select({ id: workflowSteps.id })
        .from(workflowSteps)
        .where(
          and(
            eq(workflowSteps.run_id, runId),
            isNull(workflowSteps.parent_step_id),
            eq(workflowSteps.key, input.parentKey),
          ),
        )
        .limit(1);
      if (parent) parentStepId = parent.id;
    }
    const where = parentStepId
      ? and(
          eq(workflowSteps.run_id, runId),
          eq(workflowSteps.parent_step_id, parentStepId),
          eq(workflowSteps.key, input.stepKey),
        )
      : and(
          eq(workflowSteps.run_id, runId),
          isNull(workflowSteps.parent_step_id),
          eq(workflowSteps.key, input.stepKey),
        );
    const [step] = await tx
      .select({ id: workflowSteps.id })
      .from(workflowSteps)
      .where(where)
      .limit(1);
    if (!step) {
      logger.warn(
        { run_id: runId, step_key: input.stepKey, parent_key: input.parentKey },
        '[obs] obsStepEvent: step not found',
      );
      return;
    }
    await tx.insert(stepLogEntries).values({
      step_id: step.id,
      run_id: runId,
      level: input.level,
      message: input.message,
      fields_json: input.fields ?? null,
      agent_id: input.agentId ?? null,
      attempt: input.attempt ?? null,
    });
  });
  const logFn =
    input.level === 'error'
      ? logger.error
      : input.level === 'warn'
        ? logger.warn
        : input.level === 'debug'
          ? logger.debug
          : logger.info;
  logFn(
    {
      run_id: input.runId,
      step_key: input.stepKey,
      parent_key: input.parentKey,
      level: input.level,
      fields: input.fields,
      attempt: input.attempt,
      agent_id: input.agentId,
    },
    `[obs] ${input.message}`,
  );
}

export async function obsCompleteRun(input: {
  runId: string;
  accountId: string;
  result?: unknown;
}): Promise<void> {
  await withAccountContext(input.accountId, async (tx) => {
    await tx
      .update(workflowRuns)
      .set({
        status: 'completed',
        progress: 1,
        completed_at: new Date(),
        updated_at: new Date(),
        ...(input.result !== undefined ? { result_json: input.result } : {}),
      })
      .where(eq(workflowRuns.id, input.runId));
  });
  logger.info({ run_id: input.runId }, '[obs] workflow run completed');
}

export async function obsFailRun(input: {
  runId: string;
  accountId: string;
  errorMessage: string;
}): Promise<void> {
  await withAccountContext(input.accountId, async (tx) => {
    await tx
      .update(workflowRuns)
      .set({
        status: 'failed',
        completed_at: new Date(),
        updated_at: new Date(),
        error_message: input.errorMessage,
      })
      .where(eq(workflowRuns.id, input.runId));
  });
  logger.error(
    { run_id: input.runId, err: input.errorMessage },
    '[obs] workflow run failed',
  );
}

export async function obsSetRunProgress(input: {
  runId: string;
  accountId: string;
  progress: number;
}): Promise<void> {
  const clamped = Math.max(0, Math.min(1, input.progress));
  await withAccountContext(input.accountId, async (tx) => {
    await tx
      .update(workflowRuns)
      .set({ progress: clamped, updated_at: new Date() })
      .where(eq(workflowRuns.id, input.runId));
  });
}
