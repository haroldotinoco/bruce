import { startSingleAgentPipelineWorkflow } from '@bruce/events';
import { logger } from '@bruce/logger';
import { builderPipelineWorkflow } from '../temporal/workflows.js';
import { BUILDER_TASK_QUEUE } from '../temporal/config.js';
import { getTemporalClient } from '../temporal/client.js';

export async function startBuilderPipeline(params: {
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
        moduleName: 'builder',
        taskQueue: BUILDER_TASK_QUEUE,
        workflow: builderPipelineWorkflow,
      },
      params,
    );
  } catch (error) {
    logger.error({ error }, 'Failed to start builder workflow');
    throw error;
  }
}
