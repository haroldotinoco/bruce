import { logger } from '@bruce/logger';
import { meterOpportunityScan } from '@bruce/stripe-client';
import {
  opportunityScreeningWorkflow,
  weeklyDiscoveryWorkflow,
} from '../temporal/workflows.js';
import { getOpportunityQualityConfig } from '../config/opportunity-quality.js';
import { OPPORTUNITY_TASK_QUEUE } from '../temporal/config.js';
import { getTemporalClient } from '../temporal/client.js';
import { suggestTrendingThemes } from '../lib/trending-themes.js';
import { createPendingScanRecord } from './scans-list.service.js';
import { createOpportunityProject } from './project.service.js';

/** Same default as `weeklyDiscoveryWorkflow` when no venture is bound. */
const DEFAULT_THEMED_VENTURE_ID = '00000000-0000-4000-8000-000000000001';

export async function startOpportunityScanWorkflow(
  accountId: string,
  ventureId: string,
  opportunities: unknown[],
  correlationId?: string,
  themes?: string[]
) {
  const client = await getTemporalClient();
  const workflowId = `opportunity-scan-${accountId}-${ventureId}-${Date.now()}`;

  const { nickname: projectNickname } = await createOpportunityProject({
    accountId,
    ventureId,
    title: (themes ?? []).length ? (themes ?? []).join(' · ') : undefined,
  });

  try {
    const handle = await client.workflow.start(opportunityScreeningWorkflow, {
      taskQueue: OPPORTUNITY_TASK_QUEUE,
      workflowId,
      args: [
        {
          account_id: accountId,
          venture_id: ventureId,
          opportunities,
          correlation_id: correlationId,
          themes: themes ?? [],
          quality: getOpportunityQualityConfig(),
          project_nickname: projectNickname,
        },
      ],
      memo: {
        account_id: accountId,
        venture_id: ventureId,
        module_name: 'opportunity',
        project_nickname: projectNickname,
        ...(correlationId ? { correlation_id: correlationId } : {}),
      },
    });

    void meterOpportunityScan(accountId, ventureId).catch((err) => {
      logger.warn({ err, accountId, ventureId }, 'meterOpportunityScan failed');
    });

    const scan_id = await createPendingScanRecord({
      accountId,
      temporalWorkflowId: workflowId,
      themes: themes ?? [],
      ventureId,
    });

    return {
      workflow_id: workflowId,
      status: 'queued',
      execution_id: handle.firstExecutionRunId,
      scan_id,
      project_nickname: projectNickname,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to start workflow');
    throw error;
  }
}

/** SaaS contract: themes-only scan (no venture context). */
export async function startThemedDiscoveryScan(
  accountId: string,
  themes: string[],
  correlationId?: string,
  ventureId?: string
) {
  const client = await getTemporalClient();
  const workflowId = `opportunity-weekly-${accountId}-${Date.now()}`;

  // When no themes are supplied, the AI picks a spread of currently trending
  // topics so the market-scanner has meaningful seeds to work with.
  const aiSuggested = themes.length === 0;
  const effectiveThemes = aiSuggested ? suggestTrendingThemes() : themes;
  if (aiSuggested) {
    logger.info(
      { accountId, themes: effectiveThemes },
      'No themes supplied — using AI-suggested trending themes'
    );
  }

  const { nickname: projectNickname } = await createOpportunityProject({
    accountId,
    ventureId,
    title: effectiveThemes.join(' · '),
  });

  try {
    const handle = await client.workflow.start(weeklyDiscoveryWorkflow, {
      taskQueue: OPPORTUNITY_TASK_QUEUE,
      workflowId,
      args: [
        {
          account_id: accountId,
          themes: effectiveThemes,
          correlation_id: correlationId,
          venture_id: ventureId,
          quality: getOpportunityQualityConfig(),
          project_nickname: projectNickname,
        },
      ],
      memo: {
        account_id: accountId,
        module_name: 'opportunity',
        project_nickname: projectNickname,
        ...(correlationId ? { correlation_id: correlationId } : {}),
      },
    });

    const scan_id = await createPendingScanRecord({
      accountId,
      temporalWorkflowId: workflowId,
      themes: effectiveThemes,
      ventureId: ventureId ?? DEFAULT_THEMED_VENTURE_ID,
    });

    return {
      workflow_id: workflowId,
      status: 'queued',
      execution_id: handle.firstExecutionRunId,
      scan_id,
      project_nickname: projectNickname,
      themes: effectiveThemes,
      ai_suggested: aiSuggested,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to start themed workflow');
    throw error;
  }
}
