import { getAgentRunner } from '@bruce/agent-runtime';
import { emitEvent } from '@bruce/events';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';

export async function runLearningIngestionAgent(params: {
  accountId: string;
  ventureId: string;
  agentInput: Record<string, unknown>;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
}): Promise<unknown> {
  const { accountId, ventureId, agentInput, correlationId } = params;
  logger.info({ accountId, ventureId }, 'bruce-memory: learning-ingestion-agent');

  const runner = getAgentRunner();
  const result = await runner.run(
    'bruce-memory',
    'learning-ingestion-agent',
    agentInput,
    {
      accountId,
      ventureId,
      module: 'bruce-memory',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
    }
  );

  if (!result.success) {
    throw new Error(result.error ?? 'learning-ingestion-agent failed');
  }
  return result.output;
}

export async function emitBruceMemoryPipelineCompleted(params: {
  accountId: string;
  ventureId: string;
  result: unknown;
  correlationId?: string;
  observabilityRunId?: string;
  temporalWorkflowId?: string;
}): Promise<void> {
  await emitEvent(
    'bruce-memory.pipeline.completed',
    'bruce-memory',
    {
      account_id: params.accountId,
      observability_run_id: params.observabilityRunId,
      temporal_workflow_id: params.temporalWorkflowId,
      result: params.result,
    },
    {
      ventureId: params.ventureId,
      correlationId: params.correlationId,
      observabilityRunId: params.observabilityRunId,
      temporalWorkflowId: params.temporalWorkflowId,
      warnWhenNoSubscribers: false,
    }
  );
}

export async function updateBruceMemoryExecutionState(params: {
  accountId: string;
  ventureId: string;
  step: string;
  state: unknown;
}): Promise<void> {
  const redis = getRedisClient();
  await redis.set(
    params.accountId,
    'bruce-memory',
    'pipeline',
    params.ventureId,
    `state:${params.step}`,
    params.state,
    3600
  );
}

export { obsStartRun, obsUpdateStep, obsStepEvent, obsCompleteRun, obsFailRun, obsSetRunProgress } from '@bruce/observability';
