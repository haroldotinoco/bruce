import { EVENT_ROUTING_POLICY } from './routing-policy.js';

export type LifecycleModel = 'decentralized_event_saga';

export type OrchestrationModuleName =
  | 'opportunity'
  | 'add-venture'
  | 'bruce-core'
  | 'brand-aid'
  | 'builder'
  | 'gtm'
  | 'startup-ops'
  | 'portfolio'
  | 'bruce-memory';

export interface OrchestrationModule {
  module: OrchestrationModuleName;
  appPath: string;
  taskQueue: string;
  workflows: string[];
  startRoutes: string[];
  jobStatusRoutes: string[];
  consumedEvents: string[];
  emittedEvents: string[];
  handoffContracts: string[];
  runtimeRole: 'source' | 'durable_step' | 'parallel_branch' | 'coordinator';
  joinsOn?: string[];
  notes?: string;
}

export interface OrchestrationRegistry {
  lifecycleModel: LifecycleModel;
  lifecycleRoot: OrchestrationModuleName;
  modules: OrchestrationModule[];
}

export const ORCHESTRATION_REGISTRY: OrchestrationRegistry = {
  lifecycleModel: 'decentralized_event_saga',
  lifecycleRoot: 'opportunity',
  modules: [
    {
      module: 'opportunity',
      appPath: 'apps/opportunity',
      taskQueue: 'bruce-opportunity',
      workflows: [
        'opportunityScreeningWorkflow',
        'quickOpportunityScanWorkflow',
        'weeklyDiscoveryWorkflow',
      ],
      startRoutes: ['/scans', '/scans/quick'],
      jobStatusRoutes: ['/jobs/:id', '/workflows', '/workflows/:run_id'],
      consumedEvents: [],
      emittedEvents: ['opportunity.advanced'],
      handoffContracts: ['opportunity-to-venture'],
      runtimeRole: 'source',
    },
    {
      module: 'add-venture',
      appPath: 'apps/add-venture',
      taskQueue: 'bruce-add-venture',
      workflows: ['ventureAdditionWorkflow'],
      startRoutes: ['/structuring'],
      jobStatusRoutes: ['/jobs/:id', '/workflows', '/workflows/:run_id'],
      consumedEvents: ['opportunity.advanced'],
      emittedEvents: ['venture.qualified'],
      handoffContracts: ['opportunity-to-venture', 'venture-to-brand', 'venture-to-builder'],
      runtimeRole: 'durable_step',
    },
    {
      module: 'brand-aid',
      appPath: 'apps/brand-aid',
      taskQueue: 'bruce-brand-aid',
      workflows: ['brandAidPipelineWorkflow'],
      startRoutes: ['/pipeline'],
      jobStatusRoutes: ['/jobs/:id', '/workflows', '/workflows/:run_id'],
      consumedEvents: ['venture.qualified'],
      emittedEvents: ['brand-aid.pipeline.completed'],
      handoffContracts: ['venture-to-brand'],
      runtimeRole: 'parallel_branch',
      notes: 'Completion is a terminal signal unless a future join is introduced.',
    },
    {
      module: 'builder',
      appPath: 'apps/builder',
      taskQueue: 'bruce-builder',
      workflows: ['builderPipelineWorkflow'],
      startRoutes: ['/pipeline'],
      jobStatusRoutes: ['/jobs/:id', '/workflows', '/workflows/:run_id'],
      consumedEvents: ['venture.qualified'],
      emittedEvents: ['builder.pipeline.completed'],
      handoffContracts: ['venture-to-builder', 'builder-to-gtm'],
      runtimeRole: 'durable_step',
    },
    {
      module: 'gtm',
      appPath: 'apps/gtm',
      taskQueue: 'bruce-gtm',
      workflows: ['gtmPipelineWorkflow'],
      startRoutes: ['/pipeline'],
      jobStatusRoutes: ['/jobs/:id', '/workflows', '/workflows/:run_id'],
      consumedEvents: ['builder.pipeline.completed'],
      emittedEvents: ['gtm.pipeline.completed'],
      handoffContracts: ['builder-to-gtm', 'gtm-to-startup-ops'],
      runtimeRole: 'durable_step',
      joinsOn: ['builder.pipeline.completed'],
    },
    {
      module: 'startup-ops',
      appPath: 'apps/startup-ops',
      taskQueue: 'bruce-startup-ops',
      workflows: ['startupOpsPipelineWorkflow'],
      startRoutes: ['/pipeline'],
      jobStatusRoutes: ['/jobs/:id', '/workflows', '/workflows/:run_id'],
      consumedEvents: ['gtm.pipeline.completed'],
      emittedEvents: ['startup-ops.pipeline.completed'],
      handoffContracts: ['gtm-to-startup-ops', 'startup-ops-to-portfolio'],
      runtimeRole: 'durable_step',
    },
    {
      module: 'portfolio',
      appPath: 'apps/portfolio',
      taskQueue: 'bruce-portfolio',
      workflows: ['portfolioPipelineWorkflow'],
      startRoutes: ['/pipeline'],
      jobStatusRoutes: ['/jobs/:id', '/workflows', '/workflows/:run_id'],
      consumedEvents: ['startup-ops.pipeline.completed'],
      emittedEvents: ['portfolio.pipeline.completed'],
      handoffContracts: ['startup-ops-to-portfolio', 'portfolio-to-memory'],
      runtimeRole: 'durable_step',
    },
    {
      module: 'bruce-memory',
      appPath: 'apps/bruce-memory',
      taskQueue: 'bruce-bruce-memory',
      workflows: ['bruceMemoryPipelineWorkflow'],
      startRoutes: ['/pipeline'],
      jobStatusRoutes: ['/jobs/:id', '/workflows', '/workflows/:run_id'],
      consumedEvents: ['portfolio.pipeline.completed'],
      emittedEvents: ['bruce-memory.pipeline.completed'],
      handoffContracts: ['portfolio-to-memory'],
      runtimeRole: 'durable_step',
    },
    {
      module: 'bruce-core',
      appPath: 'apps/bruce-core',
      taskQueue: 'bruce-bruce-core',
      workflows: ['ventureCreationWorkflow'],
      startRoutes: ['/ventures/:id/start-analysis'],
      jobStatusRoutes: ['/jobs/:id', '/workflows', '/workflows/:run_id'],
      consumedEvents: ['portfolio.pipeline.completed'],
      emittedEvents: ['bruce-core.venture.created'],
      handoffContracts: [
        'portfolio-to-bruce-core',
        'module-dispatch-request',
        'venture-status-transition',
      ],
      runtimeRole: 'coordinator',
      notes: 'Core governance remains separate from the Opportunity-to-Memory event saga.',
    },
  ],
};

export function getOrchestrationModule(
  moduleName: OrchestrationModuleName,
): OrchestrationModule | undefined {
  return ORCHESTRATION_REGISTRY.modules.find(({ module }) => module === moduleName);
}

export function getLifecycleEdges(): Array<{
  eventType: string;
  publisher: OrchestrationModuleName;
  subscribers: OrchestrationModuleName[];
  kind: string;
}> {
  return ORCHESTRATION_REGISTRY.modules.flatMap((publisher) =>
    publisher.emittedEvents.map((eventType) => {
      const policy = EVENT_ROUTING_POLICY[eventType];
      return {
        eventType,
        publisher: publisher.module,
        subscribers: (policy?.subscribers ?? []) as OrchestrationModuleName[],
        kind: policy?.kind ?? 'unclassified',
      };
    }),
  );
}
