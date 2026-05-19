import { sql } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';
import { ventureAdditionWorkflow } from '../temporal/workflows.js';
import { ADD_VENTURE_TASK_QUEUE } from '../temporal/config.js';
import { getTemporalClient } from '../temporal/client.js';

const { pipelineRuns } = schema;

function parseUuid(value: string): string | null {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRe.test(value) ? value : null;
}

async function createPendingPipelineRun(params: {
  accountId: string;
  ventureId: string;
  opportunityId: string;
  temporalWorkflowId: string;
  projectNickname?: string;
}): Promise<string | null> {
  const accountUuid = parseUuid(params.accountId);
  if (!accountUuid) {
    // `account_id` column is uuid in add_venture.pipeline_runs; skip insert
    // when callers use a non-UUID accountId (tests, legacy flows). The
    // workflow still runs with `pipelineRunId` undefined.
    logger.warn(
      { accountId: params.accountId },
      'accountId is not a UUID; skipping pipeline_runs insert',
    );
    return null;
  }
  const ventureUuid = parseUuid(params.ventureId);
  const opportunityUuid = parseUuid(params.opportunityId);

  return await withAccountContext(params.accountId, async (tx) => {
    const [row] = await tx
      .insert(pipelineRuns)
      .values({
        account_id: accountUuid,
        venture_id: ventureUuid ?? null,
        opportunity_id: opportunityUuid ?? null,
        project_nickname: params.projectNickname ?? null,
        temporal_workflow_id: params.temporalWorkflowId,
        status: 'pending',
        created_at: sql`CURRENT_TIMESTAMP`,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .returning({ id: pipelineRuns.id });
    return row?.id ?? null;
  });
}

export async function startVentureStructuringWorkflow(params: {
  accountId: string;
  ventureId: string;
  opportunityId: string;
  opportunity: Record<string, unknown>;
  correlationId?: string;
  projectNickname?: string;
  forcedBrandName?: string;
}) {
  const client = await getTemporalClient();
  const workflowId = `add-venture-${params.accountId}-${params.ventureId}-${Date.now()}`;

  let pipelineRunId: string | null = null;
  try {
    pipelineRunId = await createPendingPipelineRun({
      accountId: params.accountId,
      ventureId: params.ventureId,
      opportunityId: params.opportunityId,
      temporalWorkflowId: workflowId,
      projectNickname: params.projectNickname,
    });
  } catch (err) {
    logger.warn({ err }, 'Failed to create pending pipeline_runs row (continuing)');
  }

  try {
    const handle = await client.workflow.start(ventureAdditionWorkflow, {
      taskQueue: ADD_VENTURE_TASK_QUEUE,
      workflowId,
      args: [
        {
          account_id: params.accountId,
          venture_id: params.ventureId,
          opportunity_id: params.opportunityId,
          opportunity: params.opportunity,
          correlation_id: params.correlationId,
          project_nickname: params.projectNickname,
          pipeline_run_id: pipelineRunId ?? undefined,
          forced_brand_name: params.forcedBrandName?.trim() || undefined,
        },
      ],
      memo: {
        account_id: params.accountId,
        venture_id: params.ventureId,
        module_name: 'add-venture',
        ...(params.projectNickname ? { project_nickname: params.projectNickname } : {}),
        ...(pipelineRunId ? { pipeline_run_id: pipelineRunId } : {}),
        ...(params.correlationId ? { correlation_id: params.correlationId } : {}),
      },
    });

    return {
      workflow_id: workflowId,
      pipeline_run_id: pipelineRunId,
      status: 'queued' as const,
      execution_id: handle.firstExecutionRunId,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to start venture structuring workflow');
    throw error;
  }
}
