import { getAgentRunner } from '@bruce/agent-runtime';
import { emitEvent } from '@bruce/events';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';

export async function runSolutionArchitectAgent(params: {
  accountId: string;
  ventureId: string;
  agentInput: Record<string, unknown>;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
}): Promise<unknown> {
  const { accountId, ventureId, agentInput, correlationId } = params;
  logger.info({ accountId, ventureId }, 'builder: solution-architect');

  const runner = getAgentRunner();
  const result = await runner.run(
    'builder',
    'solution-architect',
    agentInput,
    {
      accountId,
      ventureId,
      module: 'builder',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
    }
  );

  if (!result.success) {
    throw new Error(result.error ?? 'solution-architect failed');
  }
  return result.output;
}

export async function emitBuilderPipelineCompleted(params: {
  accountId: string;
  ventureId: string;
  result: unknown;
}): Promise<void> {
  await emitEvent(
    'builder.pipeline.completed',
    'builder',
    { account_id: params.accountId, result: params.result },
    { ventureId: params.ventureId, warnWhenNoSubscribers: false }
  );
}

export async function updateBuilderExecutionState(params: {
  accountId: string;
  ventureId: string;
  step: string;
  state: unknown;
}): Promise<void> {
  const redis = getRedisClient();
  await redis.set(params.accountId, 'builder', 'pipeline', params.ventureId, `state:${params.step}`, params.state, 3600);
}

export { obsStartRun, obsUpdateStep, obsStepEvent, obsCompleteRun, obsFailRun, obsSetRunProgress } from '@bruce/observability';
