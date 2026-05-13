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
  const workflowId = `brand-aid-${params.accountId}-${params.ventureId}-${Date.now()}`;
  try {
    const handle = await client.workflow.start(brandAidPipelineWorkflow, {
      taskQueue: BRAND_AID_TASK_QUEUE,
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
        module_name: 'brand-aid',
      },
    });
    return {
      workflow_id: workflowId,
      status: 'queued' as const,
      execution_id: handle.firstExecutionRunId,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to start brand-aid workflow');
    throw error;
  }
}
