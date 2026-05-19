import { runAgentStep } from '@bruce/agent-runtime';
import { emitEvent } from '@bruce/events';
import {
  buildBruceMemoryInputFromPortfolioDecisionHandoff,
  buildPortfolioToBruceCoreHandoff,
  createModuleHandoffEnvelope,
  createValidatedModuleHandoffEnvelope,
  validatePortfolioToBruceCoreHandoff,
} from '@bruce/handoff';
import { getRedisClient } from '@bruce/redis';

export async function runAgentActivity(params: {
  module: string;
  agentId: string;
  input: unknown;
  context: {
    accountId: string;
    ventureId?: string;
    correlationId: string;
    observabilityRunId?: string;
    observabilityStepKey?: string;
    observabilityParentStepKey?: string;
  };
}): Promise<unknown> {
  const result = await runAgentStep({
    module: params.module,
    agentId: params.agentId,
    input: params.input,
    context: {
      accountId: params.context.accountId,
      ventureId: params.context.ventureId,
      module: params.module,
      executionId: crypto.randomUUID(),
      correlationId: params.context.correlationId,
      observabilityRunId: params.context.observabilityRunId,
      observabilityStepKey: params.context.observabilityStepKey,
      observabilityParentStepKey: params.context.observabilityParentStepKey,
    },
  });

  if (!result.success) {
    throw new Error(result.error ?? `${params.module}/${params.agentId} failed`);
  }
  return result.output;
}

export async function emitPortfolioPipelineCompleted(params: {
  accountId: string;
  ventureId: string;
  result: unknown;
  agentInput: Record<string, unknown>;
  correlationId: string;
  observabilityRunId?: string;
  temporalWorkflowId?: string;
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
      observability_run_id: params.observabilityRunId,
      temporal_workflow_id: params.temporalWorkflowId,
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
      observabilityRunId: params.observabilityRunId,
      temporalWorkflowId: params.temporalWorkflowId,
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
