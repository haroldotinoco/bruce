import { UnrecoverableError, Worker } from 'bullmq';
import type { InterModuleEvent } from '@bruce/contracts';
import { InterModuleEventSchema } from '@bruce/contracts';
import { logger } from '@bruce/logger';
import { getBullRedisConnection } from './bullmq-connection.js';
import { bruceQueueNameForSubscriber, getDeadLetterQueue } from './bruce-queues.js';
import { InterModuleJobDataSchema } from './inter-module-job.js';
import {
  dlqEnqueueFailedTotal,
  eventProcessedTotal,
  eventProcessingSeconds,
  eventUnexpectedTotal,
} from './metrics.js';

export interface DlqJobPayload {
  jobData: unknown;
  failedReason: string;
  sourceQueue: string;
  jobName: string;
}

export function createModuleEventWorker(
  subscriberModule: string,
  handler: (event: InterModuleEvent) => Promise<void>,
  options?: { expectedEventTypes?: string[] },
): Worker {
  const connection = getBullRedisConnection();
  const queueName = bruceQueueNameForSubscriber(subscriberModule);

  const worker = new Worker(
    queueName,
    async (job) => {
      const parsed = InterModuleJobDataSchema.safeParse(job.data);
      if (!parsed.success) {
        throw new UnrecoverableError(
          `Invalid job payload: ${parsed.error.flatten().toString()}`,
        );
      }

      const envelopeParse = InterModuleEventSchema.safeParse(parsed.data.envelope);
      if (!envelopeParse.success) {
        throw new UnrecoverableError(
          `Invalid envelope: ${envelopeParse.error.flatten().toString()}`,
        );
      }

      const envelope = envelopeParse.data;
      const start = Date.now();
      const expectedEventTypes = options?.expectedEventTypes;
      if (expectedEventTypes?.length && !expectedEventTypes.includes(envelope.event_type)) {
        eventUnexpectedTotal.labels(envelope.event_type, subscriberModule).inc();
        logger.error(
          {
            event_id: envelope.event_id,
            event_type: envelope.event_type,
            expected_event_types: expectedEventTypes,
            subscriber: subscriberModule,
            correlation_id: envelope.correlation_id,
          },
          'Module event worker received unexpected event type',
        );
        throw new UnrecoverableError(
          `Unexpected event_type ${envelope.event_type} for ${subscriberModule}; expected ${expectedEventTypes.join(', ')}`,
        );
      }

      try {
        await handler(envelope);
        eventProcessedTotal.labels(envelope.event_type, 'success').inc();
        const durationMs = Date.now() - start;
        eventProcessingSeconds.labels(envelope.event_type).observe(durationMs / 1000);
        logger.info(
          {
            event_id: envelope.event_id,
            event_type: envelope.event_type,
            module: envelope.module,
            venture_id: envelope.venture_id,
            correlation_id: envelope.correlation_id,
            duration_ms: durationMs,
            status: 'success',
            subscriber: subscriberModule,
          },
          'Module event processed',
        );
      } catch (e) {
        eventProcessedTotal.labels(envelope.event_type, 'failed').inc();
        logger.error(
          {
            err: e,
            event_id: envelope.event_id,
            event_type: envelope.event_type,
            correlation_id: envelope.correlation_id,
            subscriber: subscriberModule,
          },
          'Module event handler failed',
        );
        throw e;
      }
    },
    {
      connection,
      concurrency: 5,
      lockDuration: 30_000,
      stalledInterval: 30_000,
    },
  );

  worker.on('failed', (job, err) => {
    if (!job) return;
    const attempts = job.opts.attempts ?? 3;
    const exhausted = job.attemptsMade >= attempts;
    const unrecoverable = err instanceof UnrecoverableError;
    if (!exhausted && !unrecoverable) return;

    const reason = err instanceof Error ? err.message : String(err);
    logger.error(
      {
        jobId: job.id,
        queueName,
        attemptsMade: job.attemptsMade,
        reason,
      },
      'Module event job exhausted retries; copying to DLQ',
    );

    const dlq = getDeadLetterQueue();
    const payload: DlqJobPayload = {
      jobData: job.data,
      failedReason: reason,
      sourceQueue: queueName,
      jobName: job.name,
    };

    void dlq
      .add('dlq', payload, { removeOnComplete: { age: 86_400 } })
      .catch((e) => {
        dlqEnqueueFailedTotal.labels(queueName).inc();
        logger.error({ e, jobId: job.id, queueName }, 'Failed to enqueue DLQ job');
      });
  });

  return worker;
}
