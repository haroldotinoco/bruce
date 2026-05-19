import { bootstrapFromPrompt, type BootstrapHooks } from '@bruce/bootstrap';
import { startVentureStructuringWorkflow } from './structuring.service.js';

const hooks: BootstrapHooks = {
  startVentureStructuring: async (params) => {
    const result = await startVentureStructuringWorkflow({
      accountId: params.accountId,
      ventureId: params.ventureId,
      opportunityId: params.opportunityId,
      opportunity: params.opportunity,
      correlationId: params.correlationId,
      projectNickname: params.projectNickname,
      forcedBrandName: params.forcedBrandName,
    });
    return {
      workflow_id: result.workflow_id,
      execution_id: result.execution_id,
      pipeline_run_id: result.pipeline_run_id,
      status: result.status,
    };
  },
  startBrandAidPipeline: async () => {
    throw new Error('Brand-aid start is not available from add-venture bootstrap');
  },
};

export function bootstrapAddVentureFromPrompt(
  params: Parameters<typeof bootstrapFromPrompt>[0],
) {
  return bootstrapFromPrompt(params, hooks);
}
