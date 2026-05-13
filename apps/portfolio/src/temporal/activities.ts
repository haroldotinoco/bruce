import { getAgentRunner } from '@bruce/agent-runtime';
import { emitEvent } from '@bruce/events';
import {
  buildBruceMemoryInputFromPortfolioDecisionHandoff,
  buildPortfolioToBruceCoreHandoff,
  createModuleHandoffEnvelope,
  createValidatedModuleHandoffEnvelope,
  validatePortfolioToBruceCoreHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';

export async function runPortfolioAnalystAgent(params: {
  accountId: string;
  ventureId: string;
  agentInput: Record<string, unknown>;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
}): Promise<unknown> {
  const { accountId, ventureId, agentInput, correlationId } = params;
  logger.info({ accountId, ventureId }, 'portfolio: portfolio-analyst');

  const runner = getAgentRunner();
  const result = await runner.run(
    'portfolio',
    'portfolio-analyst',
    agentInput,
    {
      accountId,
      ventureId,
      module: 'portfolio',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
    }
  );

  if (!result.success) {
    throw new Error(result.error ?? 'portfolio-analyst failed');
  }
  return result.output;
}

export async function emitPortfolioPipelineCompleted(params: {
  accountId: string;
  ventureId: string;
  result: unknown;
  agentInput: Record<string, unknown>;
  correlationId: string;
}): Promise<void> {
  const sourceHandoff =
    params.agentInput.source_handoff && typeof params.agentInput.source_handoff === 'object'
      ? (params.agentInput.source_handoff as Record<string, unknown>)
      : {};
  const bruceCorePayload = buildPortfolioToBruceCoreHandoff({
    ventureId: params.ventureId,
    result: params.result as Record<string, unknown>,
    sourceHandoff,
  });
  const bruceCoreHandoff = createValidatedModuleHandoffEnvelope({
    fromModule: 'portfolio',
    toModule: 'bruce-core',
    ventureId: params.ventureId,
    payload: bruceCorePayload,
    correlationId: params.correlationId,
    triggeredBy: 'workflow_step',
    targetSchema: 'portfolio-to-bruce-core.schema.json',
    validator: validatePortfolioToBruceCoreHandoff,
  });
  const bruceMemoryHandoff = createModuleHandoffEnvelope({
    fromModule: 'portfolio',
    toModule: 'bruce-memory',
    ventureId: params.ventureId,
    payload: buildBruceMemoryInputFromPortfolioDecisionHandoff(bruceCorePayload),
    correlationId: params.correlationId,
    triggeredBy: 'workflow_step',
  });
  await emitEvent(
    'portfolio.pipeline.completed',
    'portfolio',
    {
      account_id: params.accountId,
      result: params.result,
      source_handoff: sourceHandoff,
      handoffs: {
        'bruce-core': bruceCoreHandoff,
        'bruce-memory': bruceMemoryHandoff,
      },
    },
    {
      ventureId: params.ventureId,
      correlationId: params.correlationId,
      warnWhenNoSubscribers: false,
    }
  );
}

export async function updatePortfolioExecutionState(params: {
  accountId: string;
  ventureId: string;
  step: string;
  state: unknown;
}): Promise<void> {
  const redis = getRedisClient();
  await redis.set(params.accountId, 'portfolio', 'pipeline', params.ventureId, `state:${params.step}`, params.state, 3600);
}

export { obsStartRun, obsUpdateStep, obsStepEvent, obsCompleteRun, obsFailRun, obsSetRunProgress } from '@bruce/observability';
