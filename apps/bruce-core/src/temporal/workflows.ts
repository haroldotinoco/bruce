import { defineQuery, proxyActivities, setHandler, uuid4, workflowInfo } from '@temporalio/workflow';
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

const STEP_VENTURE_LIFECYCLE = 'venture_lifecycle';
const STEP_MODULE_DISPATCH = 'module_dispatch';
const STEP_PERSIST = 'persist_venture_record';
const STEP_EMIT = 'emit_venture_created';

const TOP_LEVEL_STEPS = [
  {
    key: STEP_VENTURE_LIFECYCLE,
    label: 'Venture lifecycle',
    icon: 'route',
    description: 'Run venture lifecycle manager.',
    agentIds: ['venture-lifecycle-manager'],
  },
  {
    key: STEP_MODULE_DISPATCH,
    label: 'Module dispatch',
    icon: 'send',
    description: 'Run module dispatcher.',
    agentIds: ['module-dispatcher'],
  },
  {
    key: STEP_PERSIST,
    label: 'Persist venture record',
    icon: 'database',
    description: 'Persist the venture lifecycle record.',
    agentIds: [],
  },
  {
    key: STEP_EMIT,
    label: 'Emit venture created',
    icon: 'radio',
    description: 'Emit venture creation event.',
    agentIds: [],
  },
];

/**
 * Maps to venture-onboarding / venture creation (Fase 3.1): lifecycle → dispatch → persist → event.
 */
export async function ventureCreationWorkflow(input: {
  account_id: string;
  venture_id: string;
  correlation_id?: string;
}): Promise<unknown> {
  const correlationId = input.correlation_id ?? uuid4();
  const wfId = workflowInfo().workflowId;

  setHandler(queryState, () => workflowState);

  const obsRunId = await act.obsStartRun({
    accountId: input.account_id,
    module: 'bruce-core',
    workflowType: 'ventureCreationWorkflow',
    temporalWorkflowId: wfId,
    correlationId,
    ventureId: input.venture_id,
    title: `Bruce-Core venture creation · ${wfId.slice(-8)}`,
    steps: TOP_LEVEL_STEPS,
  });

  try {
    workflowState = { status: 'running', currentStep: STEP_VENTURE_LIFECYCLE };
    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: input.account_id,
      key: STEP_VENTURE_LIFECYCLE,
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    const lifecycle = await act.runVentureLifecycleStep({
      accountId: input.account_id,
      ventureId: input.venture_id,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_VENTURE_LIFECYCLE,
    });

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: input.account_id,
      key: STEP_VENTURE_LIFECYCLE,
      status: 'done',
      finishedAt: new Date().toISOString(),
    });

    workflowState = { status: 'running', currentStep: STEP_MODULE_DISPATCH };
    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: input.account_id,
      key: STEP_MODULE_DISPATCH,
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    const dispatch = await act.runModuleDispatchStep({
      accountId: input.account_id,
      ventureId: input.venture_id,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_MODULE_DISPATCH,
    });

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: input.account_id,
      key: STEP_MODULE_DISPATCH,
      status: 'done',
      finishedAt: new Date().toISOString(),
    });

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: input.account_id,
      key: STEP_PERSIST,
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    const recordId = await act.persistVentureRecord({
      accountId: input.account_id,
      ventureId: input.venture_id,
      record: { lifecycle, dispatch },
    });

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: input.account_id,
      key: STEP_PERSIST,
      status: 'done',
      finishedAt: new Date().toISOString(),
    });

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: input.account_id,
      key: STEP_EMIT,
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    await act.emitVentureCreated({
      accountId: input.account_id,
      ventureId: input.venture_id,
      recordId,
      correlationId,
      observabilityRunId: obsRunId,
      temporalWorkflowId: wfId,
    });

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: input.account_id,
      key: STEP_EMIT,
      status: 'done',
      finishedAt: new Date().toISOString(),
    });

    const finalResult = {
      venture_id: input.venture_id,
      record_id: recordId,
      status: 'completed',
      observability_run_id: obsRunId,
    };

    await act.obsCompleteRun({
      runId: obsRunId,
      accountId: input.account_id,
      result: finalResult,
    });

    workflowState = {
      status: 'completed',
      currentStep: 'done',
      results: finalResult,
    };

    return finalResult;
  } catch (error) {
    await act.obsFailRun({
      runId: obsRunId,
      accountId: input.account_id,
      errorMessage: (error as Error).message,
    });
    workflowState = {
      status: 'failed',
      currentStep: 'error',
      error: (error as Error).message,
    };
    throw error;
  }
}
