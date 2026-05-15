import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildBehaviorRuleCatalog } from './behavior-catalog.js';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const modulesDir = path.join(repoRoot, 'modules');

describe('buildBehaviorRuleCatalog', () => {
  it('catalogs workflow manifest status and behavior-rule markers by module', () => {
    const catalog = buildBehaviorRuleCatalog(modulesDir);
    const addVenture = catalog.modules.find((module) => module.module === 'add-venture');
    const workflow = addVenture?.workflows.find(
      (entry) => entry.workflowId === 'venture-structuring-pipeline',
    );

    expect(workflow).toMatchObject({
      manifestStatus: 'design',
      runtimeAlignment: 'diverges_from_temporal_implementation',
    });
    expect(workflow?.retryPolicies).toBeGreaterThan(0);
    expect(workflow?.escalationStates).toBeGreaterThan(0);
  });

  it('requires every workflow manifest to declare a status', () => {
    const catalog = buildBehaviorRuleCatalog(modulesDir);
    const workflows = catalog.modules.flatMap((module) => module.workflows);

    expect(workflows.length).toBeGreaterThan(0);
    expect(workflows.every((workflow) => workflow.manifestStatusDeclared)).toBe(true);
  });

  it('classifies constraints and known compatibility shims for agents', () => {
    const catalog = buildBehaviorRuleCatalog(modulesDir);
    const addVenture = catalog.modules.find((module) => module.module === 'add-venture');
    const briefing = addVenture?.agents.find(
      (entry) => entry.agentId === 'briefing-interpreter',
    );

    expect(briefing?.constraints.enforcement).toBe('prompt_only');
    expect(briefing?.compatibilityShims).toContain('agent-runner-output-merge');
  });
});
