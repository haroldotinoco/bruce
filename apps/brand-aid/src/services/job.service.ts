import { logger } from '@bruce/logger';
import { queryState } from '../temporal/workflows.js';
import { getTemporalClient } from '../temporal/client.js';

export async function getWorkflowStatus(workflowId: string) {
  const client = await getTemporalClient();
  try {
    const handle = client.workflow.getHandle(workflowId);
    const state = await handle.query(queryState);
    const description = await handle.describe();
    const statusName = description.status.name;
    let result: unknown | undefined;
    if (statusName === 'COMPLETED') {
      try {
        result = await handle.result();
      } catch (e) {
        logger.warn({ e, workflowId }, 'Could not load workflow result');
      }
    }
    return {
      workflow_id: workflowId,
      status: statusName,
      state,
      ...(result !== undefined ? { result } : {}),
    };
  } catch (error) {
    logger.error({ error, workflowId }, 'Failed to get workflow status');
    throw error;
  }
}
