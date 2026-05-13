import { logger } from '@bruce/logger';
import { getDeadLetterQueue } from './bruce-queues.js';

/**
 * Periodically logs when the DLQ has jobs (Better Stack / @bruce/monitoring hook point).
 * Returns a disposer to stop the interval.
 */
export function startDlqMonitor(intervalMs = 60_000): () => void {
  const id = setInterval(() => {
    void (async () => {
      try {
        const dlq = getDeadLetterQueue();
        const counts = await dlq.getJobCounts('waiting', 'delayed', 'paused');
        const total = counts.waiting + counts.delayed + counts.paused;
        if (total > 0) {
          logger.warn(
            {
              dlq: 'bruce-events-dlq',
              waiting: counts.waiting,
              delayed: counts.delayed,
              paused: counts.paused,
            },
            'Dead letter queue has pending events',
          );
        }
      } catch (e) {
        logger.error({ e }, 'DLQ monitor tick failed');
      }
    })();
  }, intervalMs);

  return () => clearInterval(id);
}
