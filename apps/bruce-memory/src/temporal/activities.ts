import { runAgentStep } from '@bruce/agent-runtime';
import { emitEvent } from '@bruce/events';
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
