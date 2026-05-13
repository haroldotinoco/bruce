import { logger } from '@bruce/logger';
import type { DlqJobPayload } from './create-module-worker.js';
import { getDeadLetterQueue, getBruceQueueForSubscriber } from './bruce-queues.js';
import { InterModuleJobDataSchema } from './inter-module-job.js';

function subscriberFromSourceQueue(sourceQueue: string | undefined): string {
  if (!sourceQueue) return '';
  if (sourceQueue.startsWith('bruce-events-')) return sourceQueue.slice('bruce-events-'.length);
  if (sourceQueue.startsWith('bruce-events:')) return sourceQueue.slice('bruce-events:'.length);
  return '';
}

/**
 * Re-queue every job currently waiting in the DLQ back to its original per-subscriber queue.
 */
export async function retryDLQ(): Promise<number> {
  const dlq = getDeadLetterQueue();
  const jobs = await dlq.getJobs(['waiting', 'delayed']);
  let moved = 0;

  for (const job of jobs) {
    const data = job.data as DlqJobPayload;
    if (!data?.jobName || data.jobData === undefined) {
      logger.warn({ jobId: job.id }, 'Skipping DLQ job with unexpected shape');
      continue;
    }

    const parsed = InterModuleJobDataSchema.safeParse(data.jobData);
    const subscriber = parsed.success
      ? parsed.data.subscriber
      : subscriberFromSourceQueue(data.sourceQueue);

    if (!subscriber) {
      logger.warn({ jobId: job.id }, 'Could not resolve subscriber for DLQ job');
      continue;
    }

    const target = getBruceQueueForSubscriber(subscriber);
    await target.add(data.jobName, data.jobData);
    await job.remove();
    moved += 1;
    logger.info(
      { jobId: job.id, subscriber, jobName: data.jobName },
      'Requeued job from DLQ',
    );
  }

  return moved;
}
