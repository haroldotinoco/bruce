import {
  defineQuery,
  proxyActivities,
  setHandler,
  uuid4,
  workflowInfo,
} from '@temporalio/workflow';
import type * as Activities from './activities.js';

export interface BuilderPipelineState {
  status: 'starting' | 'running' | 'completed' | 'failed';
  currentStep: string;
  results?: unknown;
  error?: string;
}

let workflowState: BuilderPipelineState = {
  status: 'starting',
  currentStep: 'init',
};

export const queryState = defineQuery<BuilderPipelineState>('state');

const act = proxyActivities<typeof Activities>({
  startToCloseTimeout: '20 minutes',
  retry: {
    initialInterval: '1 second',
    maximumInterval: '1 minute',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

const STEP_SOLUTION_ARCHITECT = 'solution_architect';

const TOP_LEVEL_STEPS = [
  {
    key: STEP_SOLUTION_ARCHITECT,
    label: 'Solution architect',
    icon: 'hammer',
    description: 'Run builder solution architect agent.',
    agentIds: ['solution-architect'],
  },
];

export async function builderPipelineWorkflow(input: {
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
    module: 'builder',
    workflowType: 'builderPipelineWorkflow',
    temporalWorkflowId: wfId,
    ventureId: venture_id,
    title: `Builder pipeline · ${wfId.slice(-8)}`,
    steps: TOP_LEVEL_STEPS,
  });

  try {
    workflowState = { status: 'running', currentStep: STEP_SOLUTION_ARCHITECT };

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: account_id,
      key: STEP_SOLUTION_ARCHITECT,
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    const result = await act.runSolutionArchitectAgent({
      accountId: account_id,
      ventureId: venture_id,
      agentInput: agent_input,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_SOLUTION_ARCHITECT,
    });

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: account_id,
      key: STEP_SOLUTION_ARCHITECT,
      status: 'done',
      finishedAt: new Date().toISOString(),
      fields: {
        agent: { kind: 'text_short', value: 'solution-architect' },
      },
    });

    await act.emitBuilderPipelineCompleted({
      accountId: account_id,
      ventureId: venture_id,
      result,
      agentInput: agent_input,
      correlationId,
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
