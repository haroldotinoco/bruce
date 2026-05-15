import { startSingleAgentPipelineWorkflow } from '@bruce/events';
import { logger } from '@bruce/logger';
import { portfolioPipelineWorkflow } from '../temporal/workflows.js';
import { PORTFOLIO_TASK_QUEUE } from '../temporal/config.js';
import { getTemporalClient } from '../temporal/client.js';

export async function startPortfolioPipeline(params: {
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
        moduleName: 'portfolio',
        taskQueue: PORTFOLIO_TASK_QUEUE,
        workflow: portfolioPipelineWorkflow,
      },
      params,
    );
  } catch (error) {
    logger.error({ error }, 'Failed to start portfolio workflow');
    throw error;
  }
}
