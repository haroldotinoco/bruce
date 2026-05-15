import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  getLifecycleEdges,
  ORCHESTRATION_REGISTRY,
  type OrchestrationModuleName,
} from './orchestration-registry.js';
import { EVENT_ROUTING_POLICY } from './routing-policy.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

describe('orchestration registry', () => {
  it('keeps module consumed events aligned with default routing subscribers', () => {
    const modulesByName = new Map(
      ORCHESTRATION_REGISTRY.modules.map((module) => [module.module, module]),
    );

    for (const [eventType, policy] of Object.entries(EVENT_ROUTING_POLICY)) {
      for (const subscriber of policy.subscribers as OrchestrationModuleName[]) {
        expect(modulesByName.get(subscriber)?.consumedEvents).toContain(eventType);
      }
    }

    for (const module of ORCHESTRATION_REGISTRY.modules) {
      for (const eventType of module.consumedEvents) {
        expect(EVENT_ROUTING_POLICY[eventType]?.subscribers).toContain(module.module);
      }
    }
  });

  it('classifies every emitted event in the routing policy', () => {
    const routedEvents = new Set(Object.keys(EVENT_ROUTING_POLICY));
    const emittedEvents = ORCHESTRATION_REGISTRY.modules.flatMap(
      (module) => module.emittedEvents,
    );

    expect(emittedEvents.filter((eventType) => !routedEvents.has(eventType))).toEqual([]);
    expect(
      Object.values(EVENT_ROUTING_POLICY).every((policy) => Boolean(policy.classification)),
    ).toBe(true);
  });

  it('matches task queue names from app Temporal config files', () => {
    for (const module of ORCHESTRATION_REGISTRY.modules) {
      const configPath = join(repoRoot, module.appPath, 'src', 'temporal', 'config.ts');
      const configSource = readFileSync(configPath, 'utf8');

      expect(configSource).toContain(`'${module.taskQueue}'`);
    }
  });

  it('describes the current decentralized saga shape explicitly', () => {
    expect(ORCHESTRATION_REGISTRY.lifecycleModel).toBe('decentralized_event_saga');
    expect(ORCHESTRATION_REGISTRY.lifecycleRoot).toBe('opportunity');
    expect(ORCHESTRATION_REGISTRY.lifecycleCorrelationRoot).toBe('correlation_id');
    expect(ORCHESTRATION_REGISTRY.canonicalHandoffEnvelope).toContain('ModuleHandoffEnvelope');
    expect(getLifecycleEdges()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: 'venture.qualified',
          publisher: 'add-venture',
          subscribers: ['brand-aid', 'builder'],
          kind: 'durable_trigger',
          classification: 'durable_downstream_trigger',
        }),
        expect.objectContaining({
          eventType: 'brand-aid.pipeline.completed',
          publisher: 'brand-aid',
          subscribers: [],
          kind: 'terminal_signal',
          classification: 'terminal_lifecycle_signal',
        }),
      ]),
    );
  });

  it('carries runtime readiness, dashboard truth, and trace IDs for every module', () => {
    for (const module of ORCHESTRATION_REGISTRY.modules) {
      expect(module.dashboardReadiness).toMatchObject({
        visibleInNavigation: true,
        generatedManifest: true,
      });
      expect(module.runtimeReadiness.http).toBeTruthy();
      expect(module.runtimeReadiness.temporalWorker).toBeTruthy();
      expect(module.runtimeReadiness.eventWorker).toBeTruthy();
      expect(module.observabilityIdentifiers).toEqual(
        expect.arrayContaining(['correlation_id', 'temporal_workflow_id', 'venture_id']),
      );
      expect(module.correlationRoot).toBe('correlation_id');
    }
  });
});
