import {
  defineQuery,
  proxyActivities,
  setHandler,
  uuid4,
  workflowInfo,
} from '@temporalio/workflow';
import type * as Activities from './activities.js';

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
  heartbeatTimeout: '1 minute',
  retry: {
    initialInterval: '1 second',
    maximumInterval: '1 minute',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

const STEP_BRIEFING = 'briefing_interpreter';
const STEP_VOL1 = 'vol1_opportunity';
const STEP_VOL2 = 'vol2_customer_market';
const STEP_VOL3 = 'vol3_value_proposition';
const STEP_VOL4 = 'vol4_business_model';
const STEP_VOL5 = 'vol5_gtm';
const STEP_VOL6 = 'vol6_narrative';
const STEP_VOL7 = 'vol7_risk_validation';
const STEP_VOL8 = 'vol8_execution_roadmap';
const STEP_CRITIC = 'venture_critic';
const STEP_COMPOSER = 'dossier_composer';

const TOP_LEVEL_STEPS = [
  {
    key: STEP_BRIEFING,
    label: 'Briefing interpreter',
    icon: 'file-text',
    description: 'Interpret the opportunity briefing.',
    agentIds: ['briefing-interpreter'],
  },
  {
    key: STEP_VOL1,
    label: 'Vol 1 · Opportunity',
    icon: 'bar-chart-3',
    description: 'Opportunity diagnosis.',
    agentIds: ['opportunity-analyst-vol1'],
  },
  {
    key: STEP_VOL2,
    label: 'Vol 2 · Customer / Market',
    icon: 'users',
    description: 'Customer segmentation + addressable market.',
    agentIds: ['customer-market-architect'],
  },
  {
    key: STEP_VOL3,
    label: 'Vol 3 · Value proposition',
    icon: 'star',
    description: 'Value proposition design.',
    agentIds: ['value-proposition-designer'],
  },
  {
    key: STEP_VOL4,
    label: 'Vol 4 · Business model',
    icon: 'briefcase',
    description: 'Business model + unit economics.',
    agentIds: ['business-model-modeler'],
  },
  {
    key: STEP_VOL5,
    label: 'Vol 5 · GTM',
    icon: 'rocket',
    description: 'Go-to-market plan.',
    agentIds: ['gtm-planner'],
  },
  {
    key: STEP_VOL6,
    label: 'Vol 6 · Narrative',
    icon: 'megaphone',
    description: 'Brand narrative + positioning.',
    agentIds: ['narrative-strategist'],
  },
  {
    key: STEP_VOL7,
    label: 'Vol 7 · Risk / validation',
    icon: 'shield',
    description: 'Risk + validation plan.',
    agentIds: ['risk-validation-analyst'],
  },
  {
    key: STEP_VOL8,
    label: 'Vol 8 · Execution roadmap',
    icon: 'route',
    description: 'Execution roadmap.',
    agentIds: ['execution-roadmap-planner'],
  },
  {
    key: STEP_CRITIC,
    label: 'Venture critic',
    icon: 'gavel',
    description: 'Critique + overall score.',
    agentIds: ['venture-critic'],
  },
  {
    key: STEP_COMPOSER,
    label: 'Dossier composer',
    icon: 'book',
    description: 'Compose final dossier JSON.',
    agentIds: ['dossier-composer'],
  },
];

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
}): Promise<unknown> {
  const {
    account_id,
    venture_id,
    opportunity_id,
    opportunity,
    correlation_id,
    project_nickname: projectNickname,
    pipeline_run_id: pipelineRunId,
  } = input;
  const correlationId = correlation_id ?? uuid4();
  const wfId = workflowInfo().workflowId;
  const ventureName =
    typeof opportunity.title === 'string' && opportunity.title.length > 0
      ? opportunity.title
      : `Venture ${wfId.slice(-6)}`;

  setHandler(queryState, () => workflowState);

  const obsRunId = await act.obsStartRun({
    accountId: account_id,
    module: 'add-venture',
    workflowType: 'ventureAdditionWorkflow',
    temporalWorkflowId: wfId,
    ventureId: venture_id,
    title: `Add venture · ${ventureName}`,
    subtitle: opportunity_id,
    steps: TOP_LEVEL_STEPS,
  });

  const setStepRunning = (key: string) =>
    act.obsUpdateStep({
      runId: obsRunId,
      accountId: account_id,
      key,
      status: 'running',
      startedAt: new Date().toISOString(),
    });

  const setStepDone = (key: string, fields?: Record<string, unknown>) =>
    act.obsUpdateStep({
      runId: obsRunId,
      accountId: account_id,
      key,
      status: 'done',
      finishedAt: new Date().toISOString(),
      ...(fields ? { fields: fields as never } : {}),
    });

  try {
    if (pipelineRunId) {
      await act.markPipelineRunStarted({ accountId: account_id, pipelineRunId });
    }

    // 1. Briefing interpreter
    workflowState = { status: 'briefing', currentStep: STEP_BRIEFING };
    await setStepRunning(STEP_BRIEFING);
    const briefing = await act.runBriefingInterpreter({
      accountId: account_id,
      ventureId: venture_id,
      opportunityId: opportunity_id,
      opportunity,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_BRIEFING,
      projectNickname,
    });
    await setStepDone(STEP_BRIEFING);

    // 2. Vol 1 — opportunity-analyst-vol1
    workflowState = { status: 'vol1', currentStep: STEP_VOL1 };
    await setStepRunning(STEP_VOL1);
    const vol1 = await act.runOpportunityAnalystVol1({
      accountId: account_id,
      ventureId: venture_id,
      opportunityId: opportunity_id,
      briefingResult: briefing,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_VOL1,
      projectNickname,
    });
    await setStepDone(STEP_VOL1);

    // 3. Vol 2 — customer-market-architect
    workflowState = { status: 'vol2', currentStep: STEP_VOL2 };
    await setStepRunning(STEP_VOL2);
    const vol2 = await act.runCustomerMarketArchitect({
      accountId: account_id,
      ventureId: venture_id,
      opportunityId: opportunity_id,
      briefing,
      vol1,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_VOL2,
      projectNickname,
    });
    await setStepDone(STEP_VOL2);

    // 4. Vol 3 — value-proposition-designer
    workflowState = { status: 'vol3', currentStep: STEP_VOL3 };
    await setStepRunning(STEP_VOL3);
    const vol3 = await act.runValuePropositionDesigner({
      accountId: account_id,
      ventureId: venture_id,
      opportunityId: opportunity_id,
      briefing,
      vol1,
      vol2,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_VOL3,
      projectNickname,
    });
    await setStepDone(STEP_VOL3);

    // 5. Vol 4 — business-model-modeler
    workflowState = { status: 'vol4', currentStep: STEP_VOL4 };
    await setStepRunning(STEP_VOL4);
    const vol4 = await act.runBusinessModelModeler({
      accountId: account_id,
      ventureId: venture_id,
      opportunityId: opportunity_id,
      briefing,
      vol1,
      vol2,
      vol3,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_VOL4,
      projectNickname,
    });
    await setStepDone(STEP_VOL4);

    // 6. Vol 5 — gtm-planner
    workflowState = { status: 'vol5', currentStep: STEP_VOL5 };
    await setStepRunning(STEP_VOL5);
    const vol5 = await act.runGtmPlanner({
      accountId: account_id,
      ventureId: venture_id,
      opportunityId: opportunity_id,
      briefing,
      vol1,
      vol2,
      vol3,
      vol4,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_VOL5,
      projectNickname,
    });
    await setStepDone(STEP_VOL5);

    // 7. Vol 6 — narrative-strategist
    workflowState = { status: 'vol6', currentStep: STEP_VOL6 };
    await setStepRunning(STEP_VOL6);
    const vol6 = await act.runNarrativeStrategist({
      accountId: account_id,
      ventureId: venture_id,
      opportunityId: opportunity_id,
      briefing,
      vol1,
      vol2,
      vol3,
      vol5,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_VOL6,
      projectNickname,
    });
    await setStepDone(STEP_VOL6);

    // 8. Vol 7 — risk-validation-analyst
    workflowState = { status: 'vol7', currentStep: STEP_VOL7 };
    await setStepRunning(STEP_VOL7);
    const vol7 = await act.runRiskValidationAnalyst({
      accountId: account_id,
      ventureId: venture_id,
      opportunityId: opportunity_id,
      vol1,
      vol2,
      vol3,
      vol4,
      vol5,
      vol6,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_VOL7,
      projectNickname,
    });
    await setStepDone(STEP_VOL7);

    // 9. Vol 8 — execution-roadmap-planner
    workflowState = { status: 'vol8', currentStep: STEP_VOL8 };
    await setStepRunning(STEP_VOL8);
    const vol8 = await act.runExecutionRoadmapPlanner({
      accountId: account_id,
      ventureId: venture_id,
      opportunityId: opportunity_id,
      vol1,
      vol2,
      vol3,
      vol4,
      vol5,
      vol7,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_VOL8,
      projectNickname,
    });
    await setStepDone(STEP_VOL8);

    // 10. Venture critic
    workflowState = { status: 'critic', currentStep: STEP_CRITIC };
    await setStepRunning(STEP_CRITIC);
    const critique = await act.runVentureCritic({
      accountId: account_id,
      ventureId: venture_id,
      vol1,
      vol2,
      vol3,
      vol4,
      vol5,
      vol6,
      vol7,
      vol8,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_CRITIC,
      projectNickname,
    });
    await setStepDone(STEP_CRITIC);

    // 11. Dossier composer
    workflowState = { status: 'composer', currentStep: STEP_COMPOSER };
    await setStepRunning(STEP_COMPOSER);
    const dossier = await act.runDossierComposer({
      accountId: account_id,
      ventureId: venture_id,
      opportunityId: opportunity_id,
      ventureName,
      vol1,
      vol2,
      vol3,
      vol4,
      vol5,
      vol6,
      vol7,
      vol8,
      critique,
      correlationId,
      observabilityRunId: obsRunId,
      observabilityStepKey: STEP_COMPOSER,
      projectNickname,
    });
    await setStepDone(STEP_COMPOSER);

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
