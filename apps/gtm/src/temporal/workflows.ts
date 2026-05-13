import {
  defineQuery,
  proxyActivities,
  setHandler,
  uuid4,
  workflowInfo,
} from '@temporalio/workflow';
import type * as Activities from './activities.js';

export interface GtmPipelineState {
  status: 'starting' | 'running' | 'completed' | 'failed';
  currentStep: string;
  results?: unknown;
  error?: string;
}

let workflowState: GtmPipelineState = {
  status: 'starting',
  currentStep: 'init',
};

export const queryState = defineQuery<GtmPipelineState>('state');

const act = proxyActivities<typeof Activities>({
  startToCloseTimeout: '20 minutes',
  retry: {
    initialInterval: '1 second',
    maximumInterval: '1 minute',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

const STEP_CHANNEL_STRATEGIST = 'channel_strategist';

const TOP_LEVEL_STEPS = [
  {
    key: STEP_CHANNEL_STRATEGIST,
    label: 'Channel strategist',
    icon: 'megaphone',
    description: 'Run GTM channel strategist agent.',
    agentIds: ['channel-strategist'],
  },
];

export async function gtmPipelineWorkflow(input: {
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
    module: 'gtm',
    workflowType: 'gtmPipelineWorkflow',
    temporalWorkflowId: wfId,
    ventureId: venture_id,
    title: `GTM pipeline · ${wfId.slice(-8)}`,
    steps: TOP_LEVEL_STEPS,
  });

  try {
    workflowState = { status: 'running', currentStep: STEP_CHANNEL_STRATEGIST };

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: account_id,
      key: STEP_CHANNEL_STRATEGIST,
      status: 'running',
      startedAt: new Date().toISOString(),
    });

    const result = await act.runChannelStrategistAgent({
      accountId: account_id,
      ventureId: venture_id,
      agentInput: agent_input,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_CHANNEL_STRATEGIST,
    });

    await act.obsUpdateStep({
      runId: obsRunId,
      accountId: account_id,
      key: STEP_CHANNEL_STRATEGIST,
      status: 'done',
      finishedAt: new Date().toISOString(),
      fields: {
        agent: { kind: 'text_short', value: 'channel-strategist' },
      },
    });

    await act.emitGtmPipelineCompleted({
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
