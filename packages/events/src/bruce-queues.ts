import { Queue } from 'bullmq';
import { getBullRedisConnection } from './bullmq-connection.js';

export const DLQ_QUEUE_NAME = 'bruce-events-dlq';

const queueCache = new Map<string, Queue>();

/** BullMQ 5+ forbids `:` in queue names (reserved for Redis cluster hash tags). */
export function bruceQueueNameForSubscriber(subscriber: string): string {
  return `bruce-events-${subscriber}`;
}

export function getBruceQueueForSubscriber(subscriber: string): Queue {
  const name = bruceQueueNameForSubscriber(subscriber);
  if (!queueCache.has(name)) {
    queueCache.set(
      name,
      new Queue(name, {
        connection: getBullRedisConnection(),
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { age: 3600, count: 10_000 },
          removeOnFail: false,
        },
      }),
    );
  }
  return queueCache.get(name)!;
}

let dlq: Queue | undefined;

export function getDeadLetterQueue(): Queue {
  if (!dlq) {
    dlq = new Queue(DLQ_QUEUE_NAME, {
      connection: getBullRedisConnection(),
      defaultJobOptions: {
        removeOnComplete: { age: 86_400 },
      },
    });
  }
  return dlq;
}

export function resetBruceQueuesForTests(): void {
  queueCache.clear();
  dlq = undefined;
}
