import { bootstrapFromPrompt, type BootstrapHooks } from '@bruce/bootstrap';
import { startBrandAidPipeline } from './pipeline.service.js';

const hooks: BootstrapHooks = {
  startVentureStructuring: async () => {
    throw new Error('Add-venture start is not available from brand-aid bootstrap');
  },
  startBrandAidPipeline: async (params) => {
    const result = await startBrandAidPipeline({
      accountId: params.accountId,
      ventureId: params.ventureId,
      agentInput: params.agentInput,
      correlationId: params.correlationId,
      projectNickname: params.projectNickname,
    });
    return {
      workflow_id: result.workflow_id,
      execution_id: result.execution_id,
      status: result.status,
    };
  },
};

export function bootstrapBrandAidFromPrompt(
  params: Parameters<typeof bootstrapFromPrompt>[0],
) {
  return bootstrapFromPrompt(params, hooks);
}
