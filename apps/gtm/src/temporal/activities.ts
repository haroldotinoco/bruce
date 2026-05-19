import { runAgentStep } from '@bruce/agent-runtime';
import { emitEvent } from '@bruce/events';
import {
  buildGtmToStartupOpsHandoff,
  createValidatedModuleHandoffEnvelope,
  validateGtmToStartupOpsHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { getRedisClient } from '@bruce/redis';

export async function runChannelStrategistAgent(params: {
  accountId: string;
  ventureId: string;
  agentInput: Record<string, unknown>;
  correlationId: string;
  observabilityRunId?: string;
  observabilityStepKey?: string;
  observabilityParentStepKey?: string;
}): Promise<unknown> {
  const { accountId, ventureId, agentInput, correlationId } = params;
  logger.info({ accountId, ventureId }, 'gtm: channel-strategist');

  const result = await runAgentStep({
    module: 'gtm',
    agentId: 'channel-strategist',
    input: agentInput,
    context: {
      accountId,
      ventureId,
      module: 'gtm',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
    },
  });

  if (!result.success) {
    throw new Error(result.error ?? 'channel-strategist failed');
  }
  return result.output;
}

export async function emitGtmPipelineCompleted(params: {
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
  const startupOpsPayload = buildGtmToStartupOpsHandoff({
    ventureId: params.ventureId,
    result: params.result as Record<string, unknown>,
    sourceHandoff,
  });
  const handoff = createValidatedModuleHandoffEnvelope({
    fromModule: 'gtm',
    toModule: 'startup-ops',
    ventureId: params.ventureId,
    payload: startupOpsPayload,
    correlationId: params.correlationId,
    triggeredBy: 'workflow_step',
    targetSchema: 'gtm-to-startup-ops.schema.json',
    validator: validateGtmToStartupOpsHandoff,
  });
  await emitEvent(
    'gtm.pipeline.completed',
    'gtm',
    {
      account_id: params.accountId,
      observability_run_id: params.observabilityRunId,
      temporal_workflow_id: params.temporalWorkflowId,
      result: params.result,
      source_handoff: sourceHandoff,
      handoff,
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

export async function updateGtmExecutionState(params: {
  accountId: string;
  ventureId: string;
  step: string;
  state: unknown;
}): Promise<void> {
  const redis = getRedisClient();
  await redis.set(params.accountId, 'gtm', 'pipeline', params.ventureId, `state:${params.step}`, params.state, 3600);
}

export { obsStartRun, obsUpdateStep, obsStepEvent, obsCompleteRun, obsFailRun, obsSetRunProgress } from '@bruce/observability';
