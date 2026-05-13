import { getAgentRunner } from '@bruce/agent-runtime';
import { withAccountContext } from '@bruce/db';
import { getEventBus } from '@bruce/events';
import { logger } from '@bruce/logger';

export async function runVentureLifecycleStep(params: {
  accountId: string;
  ventureId: string;
  correlationId: string;
}): Promise<unknown> {
  const { accountId, ventureId, correlationId } = params;
  logger.info({ accountId, ventureId }, 'Running venture-lifecycle-manager');

  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'bruce-core',
    'venture-lifecycle-manager',
    {
      venture_id: ventureId,
      trigger_type: 'module_completed',
      module_completion: {
        module_names: ['opportunity'],
        dispatch_batch_id: crypto.randomUUID(),
        completed_at: new Date().toISOString(),
      },
      current_venture_state: {
        stage: 'GENERATED',
        stage_entry_timestamp: new Date().toISOString(),
      },
      correlation_id: correlationId,
    },
    {
      accountId,
      ventureId,
      module: 'bruce-core',
      executionId: crypto.randomUUID(),
      correlationId,
    }
  );

  if (!result.success) {
    throw new Error(`Venture lifecycle failed: ${result.error}`);
  }

  return result.output;
}

export async function runModuleDispatchStep(params: {
  accountId: string;
  ventureId: string;
  correlationId: string;
}): Promise<unknown> {
  const { accountId, ventureId, correlationId } = params;
  logger.info({ accountId, ventureId }, 'Running module-dispatcher');

  const agentRunner = getAgentRunner();
  const result = await agentRunner.run(
    'bruce-core',
    'module-dispatcher',
    {
      venture_id: ventureId,
      stage: 'GENERATED',
      modules: ['opportunity'],
      trigger_type: 'stage_advancement',
      venture_context: {
        venture_id: ventureId,
        name: 'Venture',
        stage_entry_timestamp: new Date().toISOString(),
      },
      parallelization_allowed: false,
      correlation_id: correlationId,
    },
    {
      accountId,
      ventureId,
      module: 'bruce-core',
      executionId: crypto.randomUUID(),
      correlationId,
    }
  );

  if (!result.success) {
    throw new Error(`Module dispatch failed: ${result.error}`);
  }

  return result.output;
}

export async function persistVentureRecord(params: {
  accountId: string;
  ventureId: string;
  record: unknown;
}): Promise<string> {
  const { accountId, ventureId, record } = params;
  logger.info({ accountId, ventureId }, 'Persisting venture record');

  return await withAccountContext(accountId, async () => {
    void record;
    return crypto.randomUUID();
  });
}

export async function emitVentureCreated(params: {
  accountId: string;
  ventureId: string;
  recordId: string;
}): Promise<void> {
  const eventBus = getEventBus();
  await eventBus.emit({
    type: 'bruce-core.venture.created',
    accountId: params.accountId,
    ventureId: params.ventureId,
    sourceModule: 'bruce-core',
    payload: { record_id: params.recordId },
  });
}
