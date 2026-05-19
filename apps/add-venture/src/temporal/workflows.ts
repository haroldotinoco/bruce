import {
  defineQuery,
  proxyActivities,
  setHandler,
  uuid4,
  workflowInfo,
} from '@temporalio/workflow';
import type * as Activities from './activities.js';
import {
  ADD_VENTURE_PIPELINE_STEPS,
  TOP_LEVEL_STEPS,
  type AddVenturePipelineContext,
} from './pipeline-definition.js';

export interface VentureAdditionState {
  status:
    | 'starting'
    | 'briefing'
    | 'vol1'
    | 'vol2'
    | 'vol3'
    | 'vol4'
    | 'vol5'
    | 'vol6'
    | 'vol7'
    | 'vol8'
    | 'critic'
    | 'composer'
    | 'completed'
    | 'failed';
  currentStep: string;
  results?: unknown;
  error?: string;
}

let workflowState: VentureAdditionState = {
  status: 'starting',
  currentStep: 'init',
};

export const queryState = defineQuery<VentureAdditionState>('state');

const act = proxyActivities<typeof Activities>({
  startToCloseTimeout: '20 minutes',
  retry: {
    initialInterval: '1 second',
    maximumInterval: '1 minute',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

/**
 * Full 11-step venture structuring pipeline: briefing → vol1..vol8 → critic →
 * composer. Every agent's output is auto-persisted to
 * `.projects/<project_nickname>/add-venture/<agent>/output.json` by the agent
 * runner when `projectNickname` is set on the ExecutionContext.
 */
export async function ventureAdditionWorkflow(input: {
  account_id: string;
  venture_id: string;
  opportunity_id: string;
  opportunity: Record<string, unknown>;
  correlation_id?: string;
  project_nickname?: string;
  pipeline_run_id?: string;
  forced_brand_name?: string;
}): Promise<unknown> {
  const {
    account_id,
    venture_id,
    opportunity_id,
    opportunity,
    correlation_id,
    project_nickname: projectNickname,
    pipeline_run_id: pipelineRunId,
    forced_brand_name: forcedBrandName,
  } = input;
  const correlationId = correlation_id ?? uuid4();
  const wfId = workflowInfo().workflowId;
  const forcedName =
    typeof forcedBrandName === 'string' && forcedBrandName.trim().length > 0
      ? forcedBrandName.trim()
      : '';
  const ventureName =
    forcedName ||
    (typeof opportunity.title === 'string' && opportunity.title.length > 0
      ? opportunity.title
      : `Venture ${wfId.slice(-6)}`);
  let activeStep: string | null = null;

  setHandler(queryState, () => workflowState);

  const obsRunId = await act.obsStartRun({
    accountId: account_id,
    module: 'add-venture',
    workflowType: 'ventureAdditionWorkflow',
    temporalWorkflowId: wfId,
    correlationId,
    ventureId: venture_id,
    title: `Add venture · ${ventureName}`,
    subtitle: opportunity_id,
    steps: TOP_LEVEL_STEPS,
  });

  const setStepRunning = (key: string) =>
    (activeStep = key,
    act.obsUpdateStep({
      runId: obsRunId,
      accountId: account_id,
      key,
      status: 'running',
      startedAt: new Date().toISOString(),
    }));

  const setStepDone = (key: string, fields?: Record<string, unknown>) =>
    (activeStep = activeStep === key ? null : activeStep,
    act.obsUpdateStep({
      runId: obsRunId,
      accountId: account_id,
      key,
      status: 'done',
      finishedAt: new Date().toISOString(),
      ...(fields ? { fields: fields as never } : {}),
    }));

  try {
    if (pipelineRunId) {
      await act.markPipelineRunStarted({ accountId: account_id, pipelineRunId });
    }

    const pipelineContext: AddVenturePipelineContext = {
      ventureId: venture_id,
      opportunityId: opportunity_id,
      opportunity,
      ventureName,
      forcedBrandName: forcedName || undefined,
      outputs: {},
    };

    for (const step of ADD_VENTURE_PIPELINE_STEPS) {
      workflowState = { status: step.status, currentStep: step.key };
      await setStepRunning(step.key);
      const rawOutput = await act.runAgentActivity({
        module: 'add-venture',
        agentId: step.agentId,
        input: step.buildInput(pipelineContext),
        context: {
          accountId: account_id,
          ventureId: venture_id,
          correlationId,
          observabilityRunId: obsRunId,
          observabilityStepKey: step.key,
          projectNickname,
        },
      });
      const output = step.postProcess?.(rawOutput, pipelineContext) ?? rawOutput;
      pipelineContext.outputs[step.outputKey] = output;
      await setStepDone(step.key);
    }

    const dossier = pipelineContext.outputs.dossier;
    const vol2 = pipelineContext.outputs.vol2;
    const vol3 = pipelineContext.outputs.vol3;
    const vol5 = pipelineContext.outputs.vol5;
    const vol6 = pipelineContext.outputs.vol6;
    const vol8 = pipelineContext.outputs.vol8;

    const dossierId = await act.persistVentureDossier({
      accountId: account_id,
      ventureId: venture_id,
      ventureName,
      dossier,
      projectNickname,
      pipelineRunId,
    });

    await act.emitVentureStructuringCompleted({
      accountId: account_id,
      ventureId: venture_id,
      pipelineId: dossierId,
      output: dossier,
      vol2,
      vol3,
      vol5,
      vol6,
      vol8,
      correlationId,
      temporalWorkflowId: wfId,
      observabilityRunId: obsRunId,
      projectNickname,
    });

    const finalResult = {
      pipeline_id: dossierId,
      status: 'completed',
      dossier,
      observability_run_id: obsRunId,
      project_nickname: projectNickname,
    };

    await act.obsCompleteRun({
      runId: obsRunId,
      accountId: account_id,
      result: finalResult,
    });

    workflowState = {
      status: 'completed',
      currentStep: 'done',
      results: finalResult,
    };

    return finalResult;
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (activeStep) {
      await act.obsUpdateStep({
        runId: obsRunId,
        accountId: account_id,
        key: activeStep,
        status: 'failed',
        finishedAt: new Date().toISOString(),
        fields: {
          error: { kind: 'text_long', value: errorMessage },
        },
      });
      await act.obsStepEvent({
        runId: obsRunId,
        accountId: account_id,
        stepKey: activeStep,
        level: 'error',
        message: errorMessage,
      });
      activeStep = null;
    }
    if (pipelineRunId) {
      await act.markPipelineRunFailed({
        accountId: account_id,
        pipelineRunId,
        errorMessage,
      });
    }
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
