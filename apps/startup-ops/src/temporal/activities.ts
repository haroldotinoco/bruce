import { runAgentStep } from '@bruce/agent-runtime';
import { emitEvent } from '@bruce/events';
import {
  buildStartupOpsToPortfolioHandoff,
  createValidatedModuleHandoffEnvelope,
  validateStartupOpsToPortfolioHandoff,
} from '@bruce/handoff';
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

  const result = await runAgentStep({
    module: 'startup-ops',
    agentId: 'metrics-ingestion-agent',
    input: agentInput,
    context: {
      accountId,
      ventureId,
      module: 'startup-ops',
      executionId: crypto.randomUUID(),
      correlationId,
      observabilityRunId: params.observabilityRunId,
      observabilityStepKey: params.observabilityStepKey,
      observabilityParentStepKey: params.observabilityParentStepKey,
    },
  });

  if (!result.success) {
    throw new Error(result.error ?? 'metrics-ingestion-agent failed');
  }
  return result.output;
}

export async function emitStartupOpsPipelineCompleted(params: {
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
  const portfolioPayload = buildStartupOpsToPortfolioHandoff({
    ventureId: params.ventureId,
    result: params.result as Record<string, unknown>,
    sourceHandoff,
  });
  const handoff = createValidatedModuleHandoffEnvelope({
    fromModule: 'startup-ops',
    toModule: 'portfolio',
    ventureId: params.ventureId,
    payload: portfolioPayload,
    correlationId: params.correlationId,
    triggeredBy: 'workflow_step',
    targetSchema: 'startup-ops-to-portfolio.schema.json',
    validator: validateStartupOpsToPortfolioHandoff,
  });
  await emitEvent(
    'startup-ops.pipeline.completed',
    'startup-ops',
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
