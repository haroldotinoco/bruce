import { getTemporalClient } from './temporal.js';
import { queryState } from '../temporal/workflows.js';

const statusToJob: Record<string, 'queued' | 'running' | 'completed' | 'failed'> = {
  UNSPECIFIED: 'queued',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'failed',
  TERMINATED: 'failed',
  CONTINUED_AS_NEW: 'running',
  TIMED_OUT: 'failed',
  PAUSED: 'running',
  UNKNOWN: 'failed',
};

export async function getWorkflowJobStatus(jobId: string): Promise<{
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  workflow_status: string;
  state: unknown;
}> {
  const client = await getTemporalClient();
  const handle = client.workflow.getHandle(jobId);
  const description = await handle.describe();
  const state = await handle.query(queryState);

  const name = description.status.name;
  const status = statusToJob[name] ?? 'running';

  return {
    job_id: jobId,
    status,
    workflow_status: name,
    state,
  };
}
