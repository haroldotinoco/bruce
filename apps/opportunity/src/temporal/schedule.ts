import {
  Connection,
  ScheduleAlreadyRunning,
  ScheduleClient,
  ScheduleOverlapPolicy,
} from '@temporalio/client';
import { logger } from '@bruce/logger';
import { weeklyDiscoveryWorkflow } from './workflows.js';
import { OPPORTUNITY_TASK_QUEUE } from './config.js';

const SCHEDULE_ID = 'bruce-weekly-opportunity-discovery';

/**
 * Registers Monday 06:00 UTC weekly workflow (if not already present).
 * Disabled when ENABLE_WEEKLY_OPPORTUNITY_DISCOVERY is not `true`.
 */
export async function registerWeeklyOpportunitySchedule(): Promise<void> {
  if (process.env.ENABLE_WEEKLY_OPPORTUNITY_DISCOVERY !== 'true') {
    logger.info({}, 'Weekly opportunity schedule skipped (ENABLE_WEEKLY_OPPORTUNITY_DISCOVERY not true)');
    return;
  }

  const address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233';
  const namespace = process.env.TEMPORAL_NAMESPACE ?? 'default';
  const accountId = process.env.WEEKLY_OPPORTUNITY_ACCOUNT_ID ?? 'org_local_dev';
  const themesRaw = process.env.WEEKLY_OPPORTUNITY_THEMES ?? 'healthcare-admin,fintech-compliance,saas-infrastructure';
  const themes = themesRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const connection = await Connection.connect({ address });
  const scheduleClient = new ScheduleClient({ connection, namespace });

  try {
    await scheduleClient.create({
      scheduleId: SCHEDULE_ID,
      spec: {
        timezone: 'UTC',
        calendars: [
          {
            comment: 'Monday 06:00 UTC — weekly discovery cycle',
            second: 0,
            minute: 0,
            hour: 6,
            dayOfWeek: 'MONDAY',
          },
        ],
      },
      action: {
        type: 'startWorkflow',
        workflowType: weeklyDiscoveryWorkflow,
        args: [{ account_id: accountId, themes }],
        taskQueue: OPPORTUNITY_TASK_QUEUE,
      },
      policies: {
        overlap: ScheduleOverlapPolicy.SKIP,
        catchupWindow: '24h',
      },
    });
    logger.info({ scheduleId: SCHEDULE_ID, accountId, themes }, 'Weekly opportunity schedule created');
  } catch (error) {
    if (error instanceof ScheduleAlreadyRunning) {
      logger.info({ scheduleId: SCHEDULE_ID }, 'Weekly opportunity schedule already exists');
      return;
    }
    logger.error({ error }, 'Failed to create weekly opportunity schedule');
    throw error;
  }
}
