import {
  ApplicationFailure,
  isGrpcServiceError,
  WorkflowFailedError,
} from '@temporalio/client';
import { logger } from '@bruce/logger';
import { queryState } from '../temporal/workflows.js';
import { getTemporalClient } from '../temporal/client.js';

/** Thrown when no workflow exists for the id (distinguish from a failed or misconfigured run). */
export class JobNotFoundError extends Error {
  override readonly name = 'JobNotFoundError';
  constructor(readonly workflowId: string) {
    super(`Workflow not found: ${workflowId}`);
  }
}

function failureFromClientError(err: unknown): { message: string; type?: string } {
  if (err instanceof WorkflowFailedError && err.cause) {
    return failureFromCause(err.cause);
  }
  if (err instanceof Error) {
    return { message: err.message || 'Workflow failed' };
  }
  return { message: String(err) };
}

function failureFromCause(err: Error): { message: string; type?: string } {
  if (err instanceof ApplicationFailure) {
    return {
      message: err.message || 'Application failure',
      type: err.type ?? undefined,
    };
  }
  if ('cause' in err && err.cause instanceof Error) {
    return failureFromCause(err.cause);
  }
  return { message: err.message || 'Workflow failed' };
}

const TERMINAL_FAILURE_STATUSES = new Set([
  'FAILED',
  'CANCELLED',
  'TERMINATED',
  'TIMED_OUT',
]);

export type WorkflowStatusPayload = {
  workflow_id: string;
  status: string;
  state?: unknown;
  result?: unknown;
  failure?: { message: string; type?: string };
  /** Set when a live state query is not available (e.g. transitional or stuck task). */
  state_unavailable?: string;
};

/**
 * Resolves job status for polling. Describe runs first; failed executions return a structured
 * `failure` from the workflow result instead of failing the HTTP handler.
 */
export async function getWorkflowStatus(workflowId: string): Promise<WorkflowStatusPayload> {
  const client = await getTemporalClient();
  const handle = client.workflow.getHandle(workflowId);

  let description: Awaited<ReturnType<typeof handle.describe>>;
  try {
    description = await handle.describe();
  } catch (error) {
    if (isGrpcServiceError(error) && error.code === 5 /* gRPC NOT_FOUND */) {
      throw new JobNotFoundError(workflowId);
    }
    logger.error({ error, workflowId }, 'Failed to describe workflow');
    throw error;
  }

  const statusName = description.status.name;
  const isTerminalFailure = TERMINAL_FAILURE_STATUSES.has(statusName);

  let state: unknown;
  if (!isTerminalFailure) {
    try {
      state = await handle.query(queryState);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : String(error);
      logger.warn({ error, workflowId, status: statusName }, 'Workflow state query failed');
      return {
        workflow_id: workflowId,
        status: statusName,
        state_unavailable: msg.includes('failed state') || msg.includes('Workflow Task')
          ? 'Workflow state is not readable while the run is in an error or transitional state. Poll again shortly.'
          : 'Workflow state is temporarily unavailable.',
      };
    }
  } else {
    try {
      state = await handle.query(queryState);
    } catch {
      // Closed failed runs may not support query depending on server settings; still return failure from result.
    }
  }

  const payload: WorkflowStatusPayload = {
    workflow_id: workflowId,
    status: statusName,
    ...((state as unknown) !== undefined ? { state } : {}),
  };

  if (statusName === 'COMPLETED') {
    try {
      const result = await handle.result();
      return { ...payload, result };
    } catch (error) {
      logger.warn({ error, workflowId }, 'Could not load completed workflow result');
      return { ...payload, failure: failureFromClientError(error) };
    }
  }

  if (isTerminalFailure) {
    try {
      await handle.result();
      return payload;
    } catch (error) {
      return { ...payload, failure: failureFromClientError(error) };
    }
  }

  return payload;
}
