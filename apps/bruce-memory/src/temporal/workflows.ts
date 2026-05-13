import {
  defineQuery,
  proxyActivities,
  setHandler,
  uuid4,
  workflowInfo,
} from '@temporalio/workflow';
import type * as Activities from './activities.js';

export interface BruceMemoryPipelineState {
  status: 'starting' | 'running' | 'completed' | 'failed';
  currentStep: string;
  results?: unknown;
  error?: string;
}

let workflowState: BruceMemoryPipelineState = {
  status: 'starting',
  currentStep: 'init',
};

export const queryState = defineQuery<BruceMemoryPipelineState>('state');

const act = proxyActivities<typeof Activities>({
  startToCloseTimeout: '20 minutes',
  retry: {
    initialInterval: '1 second',
    maximumInterval: '1 minute',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

const STEP_LEARNING_INGESTION = 'learning_ingestion';

const TOP_LEVEL_STEPS = [
  {
    key: STEP_LEARNING_INGESTION,
    label: 'Learning ingestion',
    icon: 'brain',
    description: 'Run bruce-memory learning ingestion agent.',
    agentIds: ['learning-ingestion'],
  },
];

export async function bruceMemoryPipelineWorkflow(input: {
  account_id: string;
  venture_id: string;
  agent_input: Record<string, unknown>;
  correlation_id?: string;
}): Promise<unknown> {
  const { account_id, venture_id, agent_input, correlation_id } = input;
  const correlationId = correlation_id ?? uuid4();
  const wfId = workflowInfo().workflowId;

  setHandler(queryState, () => workflowState);

  const obsRunId = await act.obsStartRun({
    accountId: account_id,
    module: 'bruce-memory',
    workflowType: 'bruceMemoryPipelineWorkflow',
    temporalWorkflowId: wfId,
    ventureId: venture_id,
    title: `Bruce-memory pipeline · ${wfId.slice(-8)}`,
    steps: TOP_LEVEL_STEPS,
  });

  try {
    workflowState = { status: 'running', currentStep: STEP_LEARNING_INGESTION };

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: account_id,
      key: STEP_LEARNING_INGESTION,
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    const result = await act.runLearningIngestionAgent({
      accountId: account_id,
      ventureId: venture_id,
      agentInput: agent_input,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_LEARNING_INGESTION,
    });

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: account_id,
      key: STEP_LEARNING_INGESTION,
      status: 'done',
      finishedAt: new Date().toISOString(),
      fields: {
        agent: { kind: 'text_short', value: 'learning-ingestion' },
      },
    });

    await act.emitBruceMemoryPipelineCompleted({
      accountId: account_id,
      ventureId: venture_id,
      result,
    });

    const finalResult = { result, observability_run_id: obsRunId };

    await act.obsCompleteRun({
      runId: obsRunId,
      accountId: account_id,
      result: finalResult,
    });

    workflowState = { status: 'completed', currentStep: 'done', results: finalResult };
    return finalResult;
  } catch (error) {
    const errorMessage = (error as Error).message;
    await act.obsFailRun({
      runId: obsRunId,
      accountId: account_id,
      errorMessage,
    });
    workflowState = {
      status: 'failed',
      currentStep: 'error',
      error: errorMessage,
    };
    throw error;
  }
}
