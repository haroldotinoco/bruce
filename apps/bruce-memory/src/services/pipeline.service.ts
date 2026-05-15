import { startSingleAgentPipelineWorkflow } from '@bruce/events';
import { logger } from '@bruce/logger';
import { bruceMemoryPipelineWorkflow } from '../temporal/workflows.js';
import { BRUCE_MEMORY_TASK_QUEUE } from '../temporal/config.js';
import { getTemporalClient } from '../temporal/client.js';

export async function startBruceMemoryPipeline(params: {
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
        moduleName: 'bruce-memory',
        taskQueue: BRUCE_MEMORY_TASK_QUEUE,
        workflow: bruceMemoryPipelineWorkflow,
      },
      params,
    );
  } catch (error) {
    logger.error({ error }, 'Failed to start bruce-memory workflow');
    throw error;
  }
}
