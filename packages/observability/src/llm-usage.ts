import { and, count, eq, gte, isNotNull, isNull, lte, sum } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';
import type { LlmUsageTotals } from '@bruce/contracts/observability';

const { workflowRuns, workflowSteps, llmUsageEvents } = schema;

export type ChatUsagePayload = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  cost?: number;
  /** Full provider usage object for auditing */
  [key: string]: unknown;
};

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function extractCostUsd(usage: ChatUsagePayload | null | undefined): number | null {
  if (!usage) return null;
  const c = num(usage.cost);
  return c;
}

/**
 * Resolves `workflow_steps.id` for a run + step key (+ optional parent step key).
 */
export async function resolveWorkflowStepId(
  accountId: string,
  runId: string,
  stepKey: string,
  parentStepKey?: string,
): Promise<string | null> {
  return await withAccountContext(accountId, async (tx) => {
    let parentId: string | null = null;
    if (parentStepKey) {
      const [p] = await tx
        .select({ id: workflowSteps.id })
        .from(workflowSteps)
        .where(
          and(
            eq(workflowSteps.run_id, runId),
            eq(workflowSteps.key, parentStepKey),
            isNull(workflowSteps.parent_step_id),
          ),
        )
        .limit(1);
      parentId = p?.id ?? null;
      if (!parentId) return null;
    }

    const where = parentId
      ? and(
          eq(workflowSteps.run_id, runId),
          eq(workflowSteps.key, stepKey),
          eq(workflowSteps.parent_step_id, parentId),
        )
      : and(
          eq(workflowSteps.run_id, runId),
          eq(workflowSteps.key, stepKey),
          isNull(workflowSteps.parent_step_id),
        );

    const [row] = await tx.select({ id: workflowSteps.id }).from(workflowSteps).where(where).limit(1);
    return row?.id ?? null;
  });
}

export type RecordLlmUsageInput = {
  accountId: string;
  correlationId: string;
  module: string;
  agentId: string;
  provider: string;
  modelId: string;
  usage: ChatUsagePayload | null | undefined;
  observability?: {
    runId: string;
    stepKey: string;
    parentStepKey?: string;
  };
};

/**
 * Persists one LLM completion row. Never throws (logs on failure).
 */
export async function recordLlmUsage(input: RecordLlmUsageInput): Promise<void> {
  const u = input.usage;
  if (!u) {
    logger.debug({ agentId: input.agentId, model: input.modelId }, 'recordLlmUsage: no usage in response');
  }

  try {
    const runId = input.observability?.runId;
    let stepId: string | null = null;
    if (runId && input.observability?.stepKey) {
      stepId = await resolveWorkflowStepId(
        input.accountId,
        runId,
        input.observability.stepKey,
        input.observability.parentStepKey,
      );
    }

    const promptTokens = num(u?.prompt_tokens) ?? undefined;
    const completionTokens = num(u?.completion_tokens) ?? undefined;
    const totalTokens = num(u?.total_tokens) ?? undefined;
    const costUsd = extractCostUsd(u ?? undefined);

    await withAccountContext(input.accountId, async (tx) => {
      let fkRunId: string | null = runId ?? null;
      if (fkRunId) {
        const [r] = await tx
          .select({ id: workflowRuns.id })
          .from(workflowRuns)
          .where(and(eq(workflowRuns.id, fkRunId), eq(workflowRuns.account_id, input.accountId)))
          .limit(1);
        if (!r) fkRunId = null;
      }

      await tx.insert(llmUsageEvents).values({
        account_id: input.accountId,
        run_id: fkRunId,
        step_id: stepId,
        module: input.module,
        agent_id: input.agentId,
        provider: input.provider,
        model_id: input.modelId,
        prompt_tokens: promptTokens ?? null,
        completion_tokens: completionTokens ?? null,
        total_tokens: totalTokens ?? null,
        cost_usd: costUsd,
        usage_raw: u ? (u as Record<string, unknown>) : null,
        correlation_id: input.correlationId,
      });
    });
  } catch (err) {
    logger.warn(
      { err, agentId: input.agentId, module: input.module },
      'recordLlmUsage failed (non-fatal)',
    );
  }
}

function toTotals(row: {
  pt: unknown;
  ct: unknown;
  tt: unknown;
  cost: unknown;
  cnt: unknown;
}): LlmUsageTotals {
  const n = (v: unknown) => (typeof v === 'string' ? parseInt(v, 10) : Number(v)) || 0;
  const cost =
    row.cost === null || row.cost === undefined
      ? null
      : typeof row.cost === 'string'
        ? parseFloat(row.cost)
        : Number(row.cost);
  return {
    prompt_tokens: n(row.pt),
    completion_tokens: n(row.ct),
    total_tokens: n(row.tt),
    cost_usd: Number.isFinite(cost ?? NaN) ? cost : null,
    request_count: n(row.cnt),
  };
}

export async function getLlmUsageAggregatesForRun(
  accountId: string,
  runId: string,
): Promise<{ run: LlmUsageTotals; byStepId: Map<string, LlmUsageTotals> }> {
  return await withAccountContext(accountId, async (tx) => {
    const [runRow] = await tx
      .select({
        pt: sum(llmUsageEvents.prompt_tokens),
        ct: sum(llmUsageEvents.completion_tokens),
        tt: sum(llmUsageEvents.total_tokens),
        cost: sum(llmUsageEvents.cost_usd),
        cnt: count(),
      })
      .from(llmUsageEvents)
      .where(eq(llmUsageEvents.run_id, runId));

    const run: LlmUsageTotals = runRow
      ? {
          prompt_tokens: Number(runRow.pt ?? 0),
          completion_tokens: Number(runRow.ct ?? 0),
          total_tokens: Number(runRow.tt ?? 0),
          cost_usd:
            runRow.cost === null || runRow.cost === undefined
              ? null
              : Number(runRow.cost),
          request_count: Number(runRow.cnt ?? 0),
        }
      : {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          cost_usd: null,
          request_count: 0,
        };

    const byStepRows = await tx
      .select({
        step_id: llmUsageEvents.step_id,
        pt: sum(llmUsageEvents.prompt_tokens),
        ct: sum(llmUsageEvents.completion_tokens),
        tt: sum(llmUsageEvents.total_tokens),
        cost: sum(llmUsageEvents.cost_usd),
        cnt: count(),
      })
      .from(llmUsageEvents)
      .where(and(eq(llmUsageEvents.run_id, runId), isNotNull(llmUsageEvents.step_id)))
      .groupBy(llmUsageEvents.step_id);

    const byStepId = new Map<string, LlmUsageTotals>();
    for (const r of byStepRows) {
      if (!r.step_id) continue;
      byStepId.set(
        r.step_id,
        toTotals({
          pt: r.pt,
          ct: r.ct,
          tt: r.tt,
          cost: r.cost,
          cnt: r.cnt,
        }),
      );
    }

    return { run, byStepId };
  });
}

export async function getLlmUsageForAccountInRange(
  accountId: string,
  opts: { module?: string; since: Date; until?: Date },
): Promise<LlmUsageTotals> {
  return await withAccountContext(accountId, async (tx) => {
    const parts = [gte(llmUsageEvents.created_at, opts.since)];
    if (opts.until) parts.push(lte(llmUsageEvents.created_at, opts.until));
    if (opts.module) parts.push(eq(llmUsageEvents.module, opts.module));

    const [row] = await tx
      .select({
        pt: sum(llmUsageEvents.prompt_tokens),
        ct: sum(llmUsageEvents.completion_tokens),
        tt: sum(llmUsageEvents.total_tokens),
        cost: sum(llmUsageEvents.cost_usd),
        cnt: count(),
      })
      .from(llmUsageEvents)
      .where(and(...parts));

    return row
      ? {
          prompt_tokens: Number(row.pt ?? 0),
          completion_tokens: Number(row.ct ?? 0),
          total_tokens: Number(row.tt ?? 0),
          cost_usd:
            row.cost === null || row.cost === undefined ? null : Number(row.cost),
          request_count: Number(row.cnt ?? 0),
        }
      : {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          cost_usd: null,
          request_count: 0,
        };
  });
}
