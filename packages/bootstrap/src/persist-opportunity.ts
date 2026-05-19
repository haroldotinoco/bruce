import { sql } from 'drizzle-orm';
import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';
import { obsCompleteRun, obsStartRun } from '@bruce/observability';
import { parseUuid, syntheticMeta } from './util.js';

const { scans, opportunities } = schema;

export async function persistSyntheticOpportunityRun(params: {
  accountId: string;
  ventureId: string;
  prompt: string;
  scanResults: Record<string, unknown>;
  ventureHandoff: Record<string, unknown>;
  correlationId: string;
}): Promise<{ scanId: string; observabilityRunId: string; temporalWorkflowId: string }> {
  const ventureUuid = parseUuid(params.ventureId);
  const temporalWorkflowId = `bootstrap-opportunity-${params.ventureId}-${Date.now()}`;

  const obsRunId = await obsStartRun({
    accountId: params.accountId,
    module: 'opportunity',
    workflowType: 'bootstrapSyntheticOpportunity',
    temporalWorkflowId,
    correlationId: params.correlationId,
    ventureId: params.ventureId,
    title: 'Synthetic opportunity (start from prompt)',
    subtitle: 'Bootstrap backfill',
  });

  const scanId = await withAccountContext(params.accountId, async (tx) => {
    const [row] = await tx
      .insert(scans)
      .values({
        account_id: params.accountId,
        venture_id: ventureUuid ?? null,
        temporal_workflow_id: temporalWorkflowId,
        themes: ['start_from_prompt'],
        status: 'completed',
        result_json: {
          ...params.scanResults,
          ...syntheticMeta(params.prompt),
        },
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .returning({ id: scans.id });

    if (!row?.id) throw new Error('Failed to insert synthetic opportunity scan');

    const ranked = Array.isArray(params.scanResults.ranked_opportunities)
      ? (params.scanResults.ranked_opportunities as Array<Record<string, unknown>>)
      : [params.ventureHandoff];

    for (const item of ranked.slice(0, 5)) {
      const title = typeof item.title === 'string' ? item.title : 'Synthetic opportunity';
      const desc =
        typeof item.description === 'string'
          ? item.description
          : typeof item.problem_statement === 'string'
            ? item.problem_statement
            : JSON.stringify(item).slice(0, 2000);
      await tx.insert(opportunities).values({
        account_id: params.accountId,
        venture_id: ventureUuid ?? null,
        title,
        description: desc,
        status: 'scored',
        research_data: { ...item, ...syntheticMeta(params.prompt) },
        tags: ['start_from_prompt', 'synthetic'],
      });
    }

    return row.id;
  });

  await obsCompleteRun({
    runId: obsRunId,
    accountId: params.accountId,
    result: {
      scan_id: scanId,
      status: 'completed',
      venture_handoff: params.ventureHandoff,
      results: params.scanResults,
      ...syntheticMeta(params.prompt),
    },
  });

  logger.info(
    { scanId, obsRunId, ventureId: params.ventureId },
    '[bootstrap] persisted synthetic opportunity run',
  );

  return { scanId, observabilityRunId: obsRunId, temporalWorkflowId };
}
