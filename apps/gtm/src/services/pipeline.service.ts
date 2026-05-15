import { startSingleAgentPipelineWorkflow } from '@bruce/events';
import { logger } from '@bruce/logger';
import { gtmPipelineWorkflow } from '../temporal/workflows.js';
import { GTM_TASK_QUEUE } from '../temporal/config.js';
import { getTemporalClient } from '../temporal/client.js';

export async function startGtmPipeline(params: {
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
        moduleName: 'gtm',
        taskQueue: GTM_TASK_QUEUE,
        workflow: gtmPipelineWorkflow,
      },
      params,
    );
  } catch (error) {
    logger.error({ error }, 'Failed to start gtm workflow');
    throw error;
  }
}
