import { getAgentRunner } from '@bruce/agent-runtime';
import { emitEvent } from '@bruce/events';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';

export async function runMetricsIngestionAgent(params: {
  accountId: string;
  ventureId: string;
  agentInput: Record<string, unknown>;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
}): Promise<unknown> {
  const { accountId, ventureId, agentInput, correlationId } = params;
  logger.info({ accountId, ventureId }, 'startup-ops: metrics-ingestion-agent');

  const runner = getAgentRunner();
  const result = await runner.run(
    'startup-ops',
    'metrics-ingestion-agent',
    agentInput,
    {
      accountId,
      ventureId,
      module: 'startup-ops',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
    }
  );

  if (!result.success) {
    throw new Error(result.error ?? 'metrics-ingestion-agent failed');
  }
  return result.output;
}

export async function emitStartupOpsPipelineCompleted(params: {
  accountId: string;
  ventureId: string;
  result: unknown;
}): Promise<void> {
  await emitEvent(
    'startup-ops.pipeline.completed',
    'startup-ops',
    { account_id: params.accountId, result: params.result },
    { ventureId: params.ventureId, warnWhenNoSubscribers: false }
  );
}

export async function updateStartupOpsExecutionState(params: {
  accountId: string;
  ventureId: string;
  step: string;
  state: unknown;
}): Promise<void> {
  const redis = getRedisClient();
  await redis.set(params.accountId, 'startup-ops', 'pipeline', params.ventureId, `state:${params.step}`, params.state, 3600);
}

export { obsStartRun, obsUpdateStep, obsStepEvent, obsCompleteRun, obsFailRun, obsSetRunProgress } from '@bruce/observability';
