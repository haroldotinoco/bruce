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
export {
  getLifecycleEdges,
  getOrchestrationModule,
  ORCHESTRATION_REGISTRY,
} from './orchestration-registry.js';
export type {
  LifecycleModel,
  OrchestrationModule,
  OrchestrationModuleName,
  OrchestrationRegistry,
} from './orchestration-registry.js';
export {
  EVENT_ROUTING_POLICY,
  getEventRoutingPolicy,
  isTerminalEvent,
} from './routing-policy.js';
export type { EventRoutingKind, EventRoutingPolicy } from './routing-policy.js';
export { startSingleAgentPipelineWorkflow } from './pipeline-template.js';
export type {
  PipelineWorkflowStartParams,
  PipelineWorkflowStartResult,
  SingleAgentPipelineTemplate,
  TemporalWorkflowStarter,
} from './pipeline-template.js';
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
  eventUnexpectedTotal,
  getMetricsRegistry,
} from './metrics.js';
