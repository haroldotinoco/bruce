import { getAgentRunner } from '@bruce/agent-runtime';
import { emitEvent } from '@bruce/events';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';

export async function runMarketAnalystAgent(params: {
  accountId: string;
  ventureId: string;
  agentInput: Record<string, unknown>;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
}): Promise<unknown> {
  const { accountId, ventureId, agentInput, correlationId } = params;
  logger.info({ accountId, ventureId }, 'brand-aid: market-analyst');

  const runner = getAgentRunner();
  const result = await runner.run(
    'brand-aid',
    'market-analyst',
    agentInput,
    {
      accountId,
      ventureId,
      module: 'brand-aid',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
    }
  );

  if (!result.success) {
    throw new Error(result.error ?? 'market-analyst failed');
  }
  return result.output;
}

export async function emitBrandPipelineCompleted(params: {
  accountId: string;
  ventureId: string;
  result: unknown;
}): Promise<void> {
  await emitEvent(
    'brand-aid.pipeline.completed',
    'brand-aid',
    { account_id: params.accountId, result: params.result },
    { ventureId: params.ventureId, warnWhenNoSubscribers: false }
  );
}

export async function updateBrandExecutionState(params: {
  accountId: string;
  ventureId: string;
  step: string;
  state: unknown;
}): Promise<void> {
  const redis = getRedisClient();
  await redis.set(params.accountId, 'brand-aid', 'pipeline', params.ventureId, `state:${params.step}`, params.state, 3600);
}

export { obsStartRun, obsUpdateStep, obsStepEvent, obsCompleteRun, obsFailRun, obsSetRunProgress } from '@bruce/observability';
