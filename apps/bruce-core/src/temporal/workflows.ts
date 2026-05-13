import { defineQuery, proxyActivities, setHandler, uuid4 } from '@temporalio/workflow';
import type * as Activities from './activities.js';

export interface VentureCreationState {
  status: 'starting' | 'running' | 'completed' | 'failed';
  currentStep: string;
  results?: unknown;
  error?: string;
}

let workflowState: VentureCreationState = {
  status: 'starting',
  currentStep: 'init',
};

export const queryState = defineQuery<VentureCreationState>('state');

const act = proxyActivities<typeof Activities>({
  startToCloseTimeout: '5 minutes',
  heartbeatTimeout: '30 seconds',
  retry: {
    initialInterval: '1 second',
    maximumInterval: '1 minute',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

/**
 * Maps to venture-onboarding / venture creation (Fase 3.1): lifecycle → dispatch → persist → event.
 */
export async function ventureCreationWorkflow(input: {
  account_id: string;
  venture_id: string;
  correlation_id?: string;
}): Promise<unknown> {
  const correlationId = input.correlation_id ?? uuid4();

  setHandler(queryState, () => workflowState);

  try {
    workflowState = { status: 'running', currentStep: 'venture_lifecycle' };

    const lifecycle = await act.runVentureLifecycleStep({
      accountId: input.account_id,
      ventureId: input.venture_id,
      correlationId,
    });

    workflowState = { status: 'running', currentStep: 'module_dispatch' };

    const dispatch = await act.runModuleDispatchStep({
      accountId: input.account_id,
      ventureId: input.venture_id,
      correlationId,
    });

    const recordId = await act.persistVentureRecord({
      accountId: input.account_id,
      ventureId: input.venture_id,
      record: { lifecycle, dispatch },
    });

    await act.emitVentureCreated({
      accountId: input.account_id,
      ventureId: input.venture_id,
      recordId,
    });

    workflowState = {
      status: 'completed',
      currentStep: 'done',
      results: { venture_id: input.venture_id, record_id: recordId },
    };

    return {
      venture_id: input.venture_id,
      record_id: recordId,
      status: 'completed',
    };
  } catch (error) {
    workflowState = {
      status: 'failed',
      currentStep: 'error',
      error: (error as Error).message,
    };
    throw error;
  }
}
