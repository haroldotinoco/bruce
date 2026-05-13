import { and, count, eq } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';

const { ventures } = schema;
import { getTemporalClient } from './temporal.js';
import { ventureCreationWorkflow } from '../temporal/workflows.js';
import { BRUCE_CORE_TASK_QUEUE } from '../temporal/config.js';

export type VentureRow = InferSelectModel<typeof ventures>;

export type CreateVentureInput = {
  name: string;
  description?: string;
  stage: string;
  industry?: string;
  founder_names?: string;
};

export function ventureIdForTemporal(dbUuid: string): string {
  const hex = dbUuid.replace(/-/g, '').slice(0, 8);
  return `v-${hex}`;
}

export function toVentureResponse(row: VentureRow): {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  stage: string | null;
  founder_names: string | null;
  created_at: string;
  updated_at: string;
} {
  return {
    id: row.id,
    name: row.venture_name,
    description: row.description,
    industry: row.industry,
    stage: row.stage,
    founder_names: row.founder_names,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export async function countVenturesForAccount(accountId: string): Promise<number> {
  return await withAccountContext(accountId, async (tx) => {
    const [row] = await tx
      .select({ c: count() })
      .from(ventures)
      .where(eq(ventures.account_id, accountId));
    return Number(row?.c ?? 0);
  });
}

export async function createVenture(
  accountId: string,
  data: CreateVentureInput
): Promise<VentureRow> {
  return await withAccountContext(accountId, async (tx) => {
    const [row] = await tx
      .insert(ventures)
      .values({
        account_id: accountId,
        venture_name: data.name,
        description: data.description,
        stage: data.stage,
        industry: data.industry,
        founder_names: data.founder_names,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create venture');
    }

    logger.info({ accountId, venture_id: row.id }, 'Venture created');
    return row;
  });
}

export async function getVenture(
  accountId: string,
  ventureId: string
): Promise<VentureRow | null> {
  return await withAccountContext(accountId, async (tx) => {
    const [row] = await tx
      .select()
      .from(ventures)
      .where(and(eq(ventures.id, ventureId), eq(ventures.account_id, accountId)))
      .limit(1);

    return row ?? null;
  });
}

export async function startVentureAnalysisWorkflow(
  accountId: string,
  ventureId: string
): Promise<string> {
  const venture = await getVenture(accountId, ventureId);
  if (!venture) {
    throw new Error('Venture not found');
  }

  const client = await getTemporalClient();
  const workflowId = `venture-analysis-${ventureId}-${Date.now()}`;

  const handle = await client.workflow.start(ventureCreationWorkflow, {
    taskQueue: BRUCE_CORE_TASK_QUEUE,
    workflowId,
    args: [
      {
        account_id: accountId,
        venture_id: ventureIdForTemporal(venture.id),
      },
    ],
    memo: {
      account_id: accountId,
      venture_id: ventureIdForTemporal(venture.id),
      module_name: 'bruce-core',
    },
  });

  logger.info(
    { workflowId, accountId, venture_id: ventureId, runId: handle.firstExecutionRunId },
    'Venture analysis workflow started'
  );

  return workflowId;
}
