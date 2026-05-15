import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { resolveModulesDir } from './agent-loader.js';

export type WorkflowManifestStatus = 'design' | 'runtime' | 'deprecated';
export type ConstraintEnforcement = 'schema_enforced' | 'prompt_only' | 'missing';

export interface AgentBehaviorRuleEntry {
  agentId: string;
  hasSkillPrompt: boolean;
  hasInputSchema: boolean;
  hasOutputSchema: boolean;
  hasTools: boolean;
  constraints: {
    exists: boolean;
    enforcement: ConstraintEnforcement;
    path?: string;
  };
  retryPolicy: unknown;
  qualityTargets: unknown;
  compatibilityShims: string[];
}

export interface WorkflowBehaviorRuleEntry {
  workflowId: string;
  manifestStatus: WorkflowManifestStatus;
  manifestStatusDeclared: boolean;
  runtimeAlignment?: string;
  path: string;
  steps: number;
  retryPolicies: number;
  failurePolicies: number;
  qualityGates: number;
  escalationStates: number;
  eventsEmitted: string[];
}

export interface ModuleBehaviorCatalogEntry {
  module: string;
  agents: AgentBehaviorRuleEntry[];
  workflows: WorkflowBehaviorRuleEntry[];
}

export interface BehaviorRuleCatalog {
  generatedAt: string;
  modulesDir: string;
  modules: ModuleBehaviorCatalogEntry[];
}

export function buildBehaviorRuleCatalog(
  modulesDir: string = resolveModulesDir(),
): BehaviorRuleCatalog {
  return {
    generatedAt: new Date().toISOString(),
    modulesDir,
    modules: listDirectories(modulesDir).map((moduleName) => {
      const moduleDir = path.join(modulesDir, moduleName);
      return {
        module: moduleName,
        agents: readAgentEntries(moduleDir),
        workflows: readWorkflowEntries(moduleDir),
      };
    }),
  };
}

function readAgentEntries(moduleDir: string): AgentBehaviorRuleEntry[] {
  const agentsDir = path.join(moduleDir, 'agents');
  if (!existsSync(agentsDir)) return [];

  return listDirectories(agentsDir).map((agentId) => {
    const agentDir = path.join(agentsDir, agentId);
    const capabilities = readJsonIfExists(path.join(agentDir, 'capabilities.json'));
    const hasInputSchema = existsSync(path.join(agentDir, 'input.schema.json'));
    const hasOutputSchema = existsSync(path.join(agentDir, 'output.schema.json'));
    const constraintsPath = path.join(agentDir, 'constraints.md');
    const hasConstraints = existsSync(constraintsPath);

    return {
      agentId,
      hasSkillPrompt: existsSync(path.join(agentDir, 'SKILL.md')),
      hasInputSchema,
      hasOutputSchema,
      hasTools: existsSync(path.join(agentDir, 'tools.json')),
      constraints: {
        exists: hasConstraints,
        enforcement: classifyConstraintEnforcement(
          hasConstraints,
          hasInputSchema,
          hasOutputSchema,
        ),
        path: hasConstraints ? relativeFromModules(moduleDir, constraintsPath) : undefined,
      },
      retryPolicy: readObjectField(capabilities, 'retry_policy'),
      qualityTargets: readObjectField(capabilities, 'performance_targets'),
      compatibilityShims:
        agentId === 'briefing-interpreter' ? ['agent-runner-output-merge'] : [],
    };
  });
}

function readWorkflowEntries(moduleDir: string): WorkflowBehaviorRuleEntry[] {
  const workflowsDir = path.join(moduleDir, 'workflows');
  if (!existsSync(workflowsDir)) return [];

  return readdirSync(workflowsDir)
    .filter((entry) => entry.endsWith('.workflow.json'))
    .sort()
    .map((entry) => {
      const workflowPath = path.join(workflowsDir, entry);
      const manifest = readJsonIfExists(workflowPath);
      const flattened = flattenJson(manifest);

      return {
        workflowId: readStringField(manifest, 'workflow_id') ?? entry,
        manifestStatus: normalizeManifestStatus(readStringField(manifest, 'manifest_status')),
        manifestStatusDeclared: typeof manifest?.manifest_status === 'string',
        runtimeAlignment: readStringField(manifest, 'runtime_alignment'),
        path: relativeFromModules(moduleDir, workflowPath),
        steps: countWorkflowSteps(manifest),
        retryPolicies: countMatchingKeys(flattened, 'retry_policy'),
        failurePolicies: countMatchingKeys(flattened, 'failure_policy'),
        qualityGates: countSubstringMarkers(flattened, 'quality'),
        escalationStates: countSubstringMarkers(flattened, 'escalat'),
        eventsEmitted: collectEventsEmitted(flattened),
      };
    });
}

function classifyConstraintEnforcement(
  hasConstraints: boolean,
  hasInputSchema: boolean,
  hasOutputSchema: boolean,
): ConstraintEnforcement {
  if (!hasConstraints) return 'missing';
  return hasInputSchema && hasOutputSchema ? 'prompt_only' : 'schema_enforced';
}

function normalizeManifestStatus(value: string | undefined): WorkflowManifestStatus {
  if (value === 'runtime' || value === 'deprecated') return value;
  return 'design';
}

function countWorkflowSteps(manifest: unknown): number {
  if (!manifest || typeof manifest !== 'object') return 0;
  const record = manifest as Record<string, unknown>;
  if (Array.isArray(record.steps)) return record.steps.length;
  if (Array.isArray(record.stages)) return record.stages.length;
  return 0;
}

function countMatchingKeys(entries: Array<[string, unknown]>, key: string): number {
  return entries.filter(([entryKey]) => entryKey === key).length;
}

function countSubstringMarkers(entries: Array<[string, unknown]>, marker: string): number {
  return entries.filter(([key, value]) =>
    `${key} ${String(value)}`.toLowerCase().includes(marker),
  ).length;
}

function collectEventsEmitted(entries: Array<[string, unknown]>): string[] {
  const events = new Set<string>();
  for (const [key, value] of entries) {
    if (key !== 'events_emitted' || !Array.isArray(value)) continue;
    for (const item of value) {
      if (typeof item === 'string') events.add(item);
    }
  }
  return [...events].sort();
}

function flattenJson(value: unknown): Array<[string, unknown]> {
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenJson(item));
  }

  return Object.entries(value).flatMap(([key, nested]) => [
    [key, nested] as [string, unknown],
    ...flattenJson(nested),
  ]);
}

function listDirectories(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((entry) => statSync(path.join(dir, entry)).isDirectory())
    .sort();
}

function readJsonIfExists(filePath: string): Record<string, unknown> | null {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, unknown>;
}

function readObjectField(record: Record<string, unknown> | null, key: string): unknown {
  return record && typeof record[key] === 'object' ? record[key] : undefined;
}

function readStringField(
  record: Record<string, unknown> | null,
  key: string,
): string | undefined {
  return typeof record?.[key] === 'string' ? record[key] : undefined;
}

function relativeFromModules(moduleDir: string, filePath: string): string {
  return path.relative(path.dirname(moduleDir), filePath);
}
