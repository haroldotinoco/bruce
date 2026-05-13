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
  const workflowId = `portfolio-${params.accountId}-${params.ventureId}-${Date.now()}`;
  try {
    const handle = await client.workflow.start(portfolioPipelineWorkflow, {
      taskQueue: PORTFOLIO_TASK_QUEUE,
      workflowId,
      args: [
        {
          account_id: params.accountId,
          venture_id: params.ventureId,
          agent_input: params.agentInput,
          correlation_id: params.correlationId,
        },
      ],
      memo: {
        account_id: params.accountId,
        venture_id: params.ventureId,
        module_name: 'portfolio',
      },
    });
    return {
      workflow_id: workflowId,
      status: 'queued' as const,
      execution_id: handle.firstExecutionRunId,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to start portfolio workflow');
    throw error;
  }
}
