import { startSingleAgentPipelineWorkflow } from '@bruce/events';
import { logger } from '@bruce/logger';
import { startupOpsPipelineWorkflow } from '../temporal/workflows.js';
import { STARTUP_OPS_TASK_QUEUE } from '../temporal/config.js';
import { getTemporalClient } from '../temporal/client.js';

export async function startStartupOpsPipeline(params: {
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
        moduleName: 'startup-ops',
        taskQueue: STARTUP_OPS_TASK_QUEUE,
        workflow: startupOpsPipelineWorkflow,
      },
      params,
    );
  } catch (error) {
    logger.error({ error }, 'Failed to start startup-ops workflow');
    throw error;
  }
}
