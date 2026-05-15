import { access, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { constants as fsConstants } from 'fs';
import { getDefaultFallbackAgentModel, resolveOpenRouterModelId } from '@bruce/llm';
import { logger } from '@bruce/logger';
import { jsonSchemaToZod } from './json-schema-zod.js';
import { AgentNotFoundError } from './errors.js';
import type { AgentCapabilities, AgentSpec, ToolDefinition } from './types.js';

function normalizeCapabilities(raw: unknown): AgentCapabilities {
  const r = raw as Record<string, unknown>;
  const runtime = r.runtime as Record<string, unknown> | undefined;
  const retryPolicy = normalizeRetryPolicy(r.retry_policy ?? runtime?.retry_policy);
  const rawModel = (runtime?.model as string | null | undefined) ?? (r.model as string | null | undefined);
  const model =
    typeof rawModel === 'string' && rawModel.trim() !== ''
      ? rawModel
      : getDefaultFallbackAgentModel();
  const rawProvider = (runtime?.provider as string) ?? (r.provider as string) ?? 'openrouter';
  const provider =
    typeof rawProvider === 'string' && rawProvider.trim() !== '' ? rawProvider.trim() : 'openrouter';
  const temperature = typeof runtime?.temperature === 'number' ? runtime.temperature : undefined;
  const maxTokens =
    typeof runtime?.max_tokens === 'number' ? (runtime.max_tokens as number) : undefined;
  const stateful = r.stateful === true;
  const resolvedModel =
    provider === 'openrouter' ? resolveOpenRouterModelId(model) : model;
  return {
    model: resolvedModel,
    provider,
    temperature,
    maxTokens,
    stateless: !stateful,
    retryPolicy,
  };
}

function normalizeRetryPolicy(raw: unknown): AgentCapabilities['retryPolicy'] {
  const fallback = {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelayMs: 1000,
  };

  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const policy = raw as Record<string, unknown>;
  if (typeof policy.maxAttempts === 'number' || typeof policy.max_retries === 'number') {
    const maxAttempts =
      typeof policy.maxAttempts === 'number'
        ? policy.maxAttempts
        : (policy.max_retries as number) + 1;
    return {
      maxAttempts: clampAttempts(maxAttempts),
      backoffMultiplier:
        typeof policy.backoffMultiplier === 'number' ? policy.backoffMultiplier : 2,
      initialDelayMs:
        typeof policy.initialDelayMs === 'number'
          ? policy.initialDelayMs
          : typeof policy.initial_delay_ms === 'number'
            ? policy.initial_delay_ms
            : 1000,
    };
  }

  const nestedRetryCounts = Object.values(policy)
    .filter((value): value is Record<string, unknown> => Boolean(value) && typeof value === 'object')
    .map((value) => value.max_retries)
    .filter((value): value is number => typeof value === 'number');

  if (nestedRetryCounts.length === 0) {
    return fallback;
  }

  return {
    maxAttempts: clampAttempts(Math.max(...nestedRetryCounts) + 1),
    backoffMultiplier: 2,
    initialDelayMs: 1000,
  };
}

function clampAttempts(value: number): number {
  if (!Number.isFinite(value)) return 3;
  return Math.max(1, Math.min(10, Math.floor(value)));
}

function parametersToOpenApi(params: Record<string, unknown>): {
  properties: Record<string, unknown>;
  required: string[];
} {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const [key, val] of Object.entries(params)) {
    const p = val as Record<string, unknown>;
    const jsType = (p.type as string) ?? 'string';
    const prop: Record<string, unknown> = { type: jsType };
    if (p.description) prop.description = p.description;
    if (p.enum) prop.enum = p.enum;
    if (p.format) prop.format = p.format;
    if (p.default !== undefined) prop.default = p.default;
    properties[key] = prop;
    if (p.required === true) required.push(key);
  }
  return { properties, required };
}

function normalizeTools(raw: unknown): ToolDefinition[] {
  const r = raw as Record<string, unknown>;
  const tools = r.tools as unknown[] | undefined;
  if (!Array.isArray(tools)) return [];

  const mapped = tools.map((item) => {
    const tool = item as Record<string, unknown>;
    const rawName = tool.name ?? tool.tool_id ?? tool.tool_name ?? tool.tool;
    const name =
      typeof rawName === 'string' ? rawName.trim() : String(rawName ?? '').trim();
    if (!name || name === 'undefined') {
      return null;
    }
    const parametersSource =
      (tool.parameters as Record<string, unknown> | undefined) ??
      (tool.input_schema as Record<string, unknown> | undefined) ??
      {};
    const { properties, required } = parametersToOpenApi(parametersSource);
    return {
      name,
      description: String(tool.description ?? tool.tool_name ?? ''),
      parameters: {
        type: 'object' as const,
        properties,
        required,
      },
    };
  });

  return mapped.filter((t): t is ToolDefinition => t !== null);
}

/**
 * Resolves the repo `modules/` directory. When the process cwd is a nested package
 * (e.g. `apps/opportunity` from `pnpm --filter ... run worker`), `cwd/modules` does not exist;
 * we walk up until we find `modules/opportunity` or exhaust the tree.
 * Override with BRUCE_MODULES_DIR for non-standard layouts.
 */
export function resolveModulesDir(): string {
  const env = process.env.BRUCE_MODULES_DIR;
  if (env && env.trim() !== '') {
    return path.resolve(env);
  }
  let current = process.cwd();
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(current, 'modules');
    if (existsSync(path.join(candidate, 'opportunity'))) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  return path.resolve(process.cwd(), 'modules');
}

export class AgentLoader {
  private modulesDir: string;
  private cache: Map<string, AgentSpec> = new Map();

  constructor(modulesDir: string = resolveModulesDir()) {
    this.modulesDir = modulesDir;
  }

  async loadAgent(module: string, agentId: string): Promise<AgentSpec> {
    const cacheKey = `${module}:${agentId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const agentDir = path.join(this.modulesDir, module, 'agents', agentId);

    try {
      await access(agentDir, fsConstants.R_OK);
    } catch {
      throw new AgentNotFoundError(module, agentId);
    }

    try {
      const skillPrompt = await this.loadSkillPrompt(agentDir);
      const constraints = await this.loadConstraints(agentDir);
      const capabilitiesRaw = JSON.parse(await readFile(path.join(agentDir, 'capabilities.json'), 'utf-8'));
      const capabilities = normalizeCapabilities(capabilitiesRaw);
      const inputSchema = await this.loadSchema(agentDir, 'input');
      const outputSchema = await this.loadSchema(agentDir, 'output');
      const tools = await this.loadTools(agentDir);

      const spec: AgentSpec = {
        id: agentId,
        module,
        name: (capabilitiesRaw as { name?: string }).name ?? agentId,
        description: (capabilitiesRaw as { purpose?: string }).purpose ?? `Agent ${agentId} in module ${module}`,
        skillPrompt,
        constraints,
        capabilities,
        inputSchema,
        outputSchema,
        tools,
      };

      this.cache.set(cacheKey, spec);
      logger.debug({ module, agentId }, 'Loaded agent spec');
      return spec;
    } catch (error) {
      if (error instanceof AgentNotFoundError) throw error;
      logger.error({ error, module, agentId }, 'Failed to load agent spec');
      throw error;
    }
  }

  private async loadSkillPrompt(agentDir: string): Promise<string> {
    const p = path.join(agentDir, 'SKILL.md');
    return readFile(p, 'utf-8');
  }

  private async loadConstraints(agentDir: string): Promise<string | null> {
    const p = path.join(agentDir, 'constraints.md');
    try {
      return await readFile(p, 'utf-8');
    } catch {
      return null;
    }
  }

  private async loadSchema(agentDir: string, type: 'input' | 'output'): Promise<import('zod').ZodTypeAny> {
    const p = path.join(agentDir, `${type}.schema.json`);
    const content = await readFile(p, 'utf-8');
    const schemaJson = JSON.parse(content);
    return jsonSchemaToZod(schemaJson);
  }

  private async loadTools(agentDir: string): Promise<ToolDefinition[]> {
    const p = path.join(agentDir, 'tools.json');
    try {
      const content = await readFile(p, 'utf-8');
      return normalizeTools(JSON.parse(content));
    } catch {
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const agentLoader = new AgentLoader();
