import {
  buildBrandAidAgentInputFromVentureToBrandHandoff,
  buildVentureToBrandHandoff,
  isHandoffStrictValidationEnabled,
  validateVentureToBrandHandoff,
} from '@bruce/handoff';
import { logger } from '@bruce/logger';
import { createVentureForAccount } from './create-venture.js';
import { opportunityIdFromHandoff } from './heuristic.js';
import { persistSyntheticAddVentureRun } from './persist-add-venture.js';
import { persistSyntheticOpportunityRun } from './persist-opportunity.js';
import {
  synthesizeDossierPack,
  synthesizeOpportunityPack,
  type BootstrapTargetModule,
} from './synthesize.js';
import { randomUUID } from 'crypto';
import { isBootstrapFromPromptEnabled, slugNickname } from './util.js';

export class BootstrapError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'BootstrapError';
  }
}

export interface BootstrapFromPromptInput {
  accountId: string;
  targetModule: BootstrapTargetModule;
  prompt: string;
  ventureId?: string;
  ventureName?: string;
  forcedBrandName?: string;
  projectNickname?: string;
  correlationId?: string;
}

export interface BootstrapWorkflowStartResult {
  workflow_id: string;
  execution_id?: string;
  pipeline_run_id?: string | null;
  status: 'queued';
}

export interface BootstrapHooks {
  startVentureStructuring: (params: {
    accountId: string;
    ventureId: string;
    opportunityId: string;
    opportunity: Record<string, unknown>;
    correlationId?: string;
    projectNickname?: string;
    forcedBrandName?: string;
  }) => Promise<BootstrapWorkflowStartResult>;
  startBrandAidPipeline: (params: {
    accountId: string;
    ventureId: string;
    agentInput: Record<string, unknown>;
    correlationId?: string;
    projectNickname?: string;
  }) => Promise<BootstrapWorkflowStartResult>;
}

export interface BootstrapResult {
  venture_id: string;
  correlation_id: string;
  workflow_id: string;
  execution_id?: string;
  poll_url?: string;
  synthetic: {
    opportunity_scan_id?: string;
    opportunity_observability_run_id?: string;
    add_venture_pipeline_run_id?: string | null;
    add_venture_observability_run_id?: string;
  };
}

export async function bootstrapFromPrompt(
  input: BootstrapFromPromptInput,
  hooks: BootstrapHooks,
): Promise<BootstrapResult> {
  if (!isBootstrapFromPromptEnabled()) {
    throw new BootstrapError(403, 'Start from prompt is disabled (set BOOTSTRAP_FROM_PROMPT_ENABLED=true).');
  }

  const prompt = input.prompt.trim();
  if (prompt.length < 20) {
    throw new BootstrapError(400, 'Prompt must be at least 20 characters.');
  }

  const forcedBrandName = input.forcedBrandName?.trim();
  let ventureId = input.ventureId?.trim();
  let ventureName = input.ventureName?.trim() || forcedBrandName;
  if (!ventureId) {
    if (!ventureName) {
      throw new BootstrapError(400, 'Provide venture_id or venture_name to create a venture.');
    }
    ventureId = await createVentureForAccount(input.accountId, ventureName, prompt);
  } else if (!ventureName) {
    ventureName = forcedBrandName || `Venture ${ventureId.slice(0, 8)}`;
  }

  const correlationId = input.correlationId ?? randomUUID();
  const projectNickname =
    input.projectNickname?.trim() || slugNickname(ventureName);

  logger.info(
    { targetModule: input.targetModule, ventureId, correlationId },
    '[bootstrap] start from prompt',
  );

  const opportunityPack = await synthesizeOpportunityPack({
    prompt,
    ventureId,
    ventureName,
    accountId: input.accountId,
    correlationId,
  });

  const opportunityPersisted = await persistSyntheticOpportunityRun({
    accountId: input.accountId,
    ventureId,
    prompt,
    scanResults: opportunityPack.scanResults,
    ventureHandoff: opportunityPack.ventureHandoff,
    correlationId,
  });

  const opportunityId = opportunityIdFromHandoff(opportunityPack.ventureHandoff);
  const synthetic: BootstrapResult['synthetic'] = {
    opportunity_scan_id: opportunityPersisted.scanId,
    opportunity_observability_run_id: opportunityPersisted.observabilityRunId,
  };

  if (input.targetModule === 'add-venture') {
    const opportunity = { ...opportunityPack.ventureHandoff };
    if (forcedBrandName) {
      opportunity.title = forcedBrandName;
    }
    const started = await hooks.startVentureStructuring({
      accountId: input.accountId,
      ventureId,
      opportunityId,
      opportunity,
      correlationId,
      projectNickname,
      forcedBrandName,
    });
    return {
      venture_id: ventureId,
      correlation_id: correlationId,
      workflow_id: started.workflow_id,
      execution_id: started.execution_id,
      poll_url: `/jobs/${started.workflow_id}`,
      synthetic,
    };
  }

  const dossier = await synthesizeDossierPack({
    prompt,
    ventureId,
    ventureName,
    ventureHandoff: opportunityPack.ventureHandoff,
    accountId: input.accountId,
    correlationId,
  });

  const addVenturePersisted = await persistSyntheticAddVentureRun({
    accountId: input.accountId,
    ventureId,
    ventureName,
    opportunityId,
    prompt,
    dossier,
    correlationId,
    projectNickname,
  });

  synthetic.add_venture_pipeline_run_id = addVenturePersisted.pipelineRunId;
  synthetic.add_venture_observability_run_id = addVenturePersisted.observabilityRunId;

  const volumes = dossier.volumes as Record<string, unknown> | undefined;
  const vol2 = (volumes?.vol_2 ?? {}) as Record<string, unknown>;
  const vol3 = (volumes?.vol_3 ?? {}) as Record<string, unknown>;
  const vol6 = (volumes?.vol_6 ?? {}) as Record<string, unknown>;

  const brandHandoff = buildVentureToBrandHandoff({ ventureId, vol2, vol3, vol6 });
  const brandValidation = validateVentureToBrandHandoff(brandHandoff);
  if (!brandValidation.ok) {
    const msg = brandValidation.errors?.join('; ') ?? 'venture-to-brand validation failed';
    if (isHandoffStrictValidationEnabled()) {
      throw new BootstrapError(422, msg);
    }
    logger.warn({ errors: brandValidation.errors }, '[bootstrap] brand handoff validation warnings');
  }

  const agentInput = buildBrandAidAgentInputFromVentureToBrandHandoff(
    brandValidation.normalized ?? brandHandoff,
  );
  if (forcedBrandName) {
    agentInput.forced_brand_name = forcedBrandName;
  }

  const started = await hooks.startBrandAidPipeline({
    accountId: input.accountId,
    ventureId,
    agentInput,
    correlationId,
    projectNickname,
  });

  return {
    venture_id: ventureId,
    correlation_id: correlationId,
    workflow_id: started.workflow_id,
    execution_id: started.execution_id,
    poll_url: `/jobs/${started.workflow_id}`,
    synthetic,
  };
}
