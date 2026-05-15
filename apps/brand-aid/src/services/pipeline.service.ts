import { startSingleAgentPipelineWorkflow } from '@bruce/events';
import { logger } from '@bruce/logger';
import { brandAidPipelineWorkflow } from '../temporal/workflows.js';
import { BRAND_AID_TASK_QUEUE } from '../temporal/config.js';
import { getTemporalClient } from '../temporal/client.js';

export async function startBrandAidPipeline(params: {
  accountId: string;
  ventureId: string;
  agentInput: Record<string, unknown>;
  correlationId?: string;
}) {
  const client = await getTemporalClient();
  try {
    return await startSingleAgentPipelineWorkflow(
      client,
      {
        moduleName: 'brand-aid',
        taskQueue: BRAND_AID_TASK_QUEUE,
        workflow: brandAidPipelineWorkflow,
      },
      params,
    );
  } catch (error) {
    logger.error({ error }, 'Failed to start brand-aid workflow');
    throw error;
  }
}
