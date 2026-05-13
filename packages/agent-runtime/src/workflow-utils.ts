import { Context } from '@temporalio/activity';
import { logger } from '@bruce/logger';
import type { WorkflowInput } from './workflow-input.js';

/**
 * Run an activity with structured logging (workflow id, correlation_id, timings).
 */
export async function executeActivityWithContext<T>(
  activity: (input: WorkflowInput) => Promise<T>,
  input: WorkflowInput,
  activityName: string,
): Promise<T> {
  const info = Context.current().info;
  const workflowId = info.workflowExecution.workflowId;
  const start = Date.now();

  logger.debug(
    {
      activity_name: activityName,
      workflow_id: workflowId,
      correlation_id: input.correlation_id,
      account_id: input.account_id,
      venture_id: input.venture_id,
    },
    'Activity starting',
  );

  try {
    const result = await activity(input);
    logger.info(
      {
        activity_name: activityName,
        workflow_id: workflowId,
        duration_ms: Date.now() - start,
        correlation_id: input.correlation_id,
      },
      'Activity completed',
    );
    return result;
  } catch (error) {
    logger.error(
      {
        err: error,
        activity_name: activityName,
        workflow_id: workflowId,
        duration_ms: Date.now() - start,
        correlation_id: input.correlation_id,
      },
      'Activity failed',
    );
    throw error;
  }
}
