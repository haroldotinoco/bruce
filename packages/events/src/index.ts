export { EventBus } from './types.js';
export type { EventHandler } from './types.js';
export {
  getEventBus,
  InMemoryEventBus,
  RedisPubSubEventBus,
  resetEventBusForTests,
} from './event-bus.js';

export {
  getBullRedisConnection,
  resetBullRedisConnectionForTests,
} from './bullmq-connection.js';
export {
  DLQ_QUEUE_NAME,
  bruceQueueNameForSubscriber,
  getDeadLetterQueue,
  getBruceQueueForSubscriber,
  resetBruceQueuesForTests,
} from './bruce-queues.js';
export {
  meterAiCredits,
  meterGTMCampaign,
  meterHealthCheck,
  meterOpportunityScan,
} from './billing-events.js';
export { emitEvent } from './emit-event.js';
export { DEFAULT_EVENT_ROUTING, resolveSubscribers } from './routing.js';
export { createModuleEventWorker } from './create-module-worker.js';
export type { DlqJobPayload } from './create-module-worker.js';
export { startDlqMonitor } from './dlq-monitor.js';
export { retryDLQ } from './dlq-retry.js';
export { InterModuleJobDataSchema } from './inter-module-job.js';
export type { InterModuleJobData } from './inter-module-job.js';
export {
  eventEmittedTotal,
  eventProcessedTotal,
  eventProcessingSeconds,
  getMetricsRegistry,
} from './metrics.js';
