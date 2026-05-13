import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { logger } from '@bruce/logger';

/** Built-in fallbacks when `bruce-model-registry.json` is not found (e.g. trimmed publish). */
const EMBEDDED_ALIASES: Record<string, string> = {
  'claude-opus-4-6': 'anthropic/claude-opus-4-6',
  'claude-sonnet-4-6': 'anthropic/claude-sonnet-4-6',
  'claude-haiku-4-5': 'anthropic/claude-haiku-4-5',
  'gpt-4o': 'openai/gpt-4o',
  o1: 'openai/o1',
  'o1-mini': 'openai/o1-mini',
  'gpt-4-turbo': 'openai/gpt-4-turbo',
  'gpt-4': 'openai/gpt-4o',
};

export interface BruceModelRegistryFile {
  version?: number;
  defaults?: { default_provider?: string; default_model?: string };
  model_aliases?: Record<string, string>;
  providers?: Record<string, { api_key_env?: string; base_url?: string }>;
  credential_pools?: Record<string, unknown>;
  meta?: Record<string, string>;
}

let parsedRegistry: BruceModelRegistryFile | null = null;

/** @internal tests */
export function resetModelRegistryCacheForTests(): void {
  parsedRegistry = null;
}

export function findBruceModelRegistryPath(): string | null {
  const env = process.env.BRUCE_MODEL_REGISTRY_PATH?.trim();
  if (env && existsSync(env)) {
    return env;
  }
  let current = process.cwd();
  for (let i = 0; i < 14; i++) {
    const candidate = join(current, 'bruce-model-registry.json');
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function loadRegistryFile(): BruceModelRegistryFile {
  if (parsedRegistry) {
    return parsedRegistry;
  }
  const path = findBruceModelRegistryPath();
  if (!path) {
    logger.warn({}, 'bruce-model-registry.json not found; using embedded model aliases only');
    parsedRegistry = {};
    return parsedRegistry;
  }
  try {
    const raw = readFileSync(path, 'utf-8');
    parsedRegistry = JSON.parse(raw) as BruceModelRegistryFile;
    logger.debug({ path }, 'Loaded bruce-model-registry.json');
    return parsedRegistry;
  } catch (e) {
    logger.error({ e, path }, 'Failed to read bruce-model-registry.json; using embedded aliases only');
    parsedRegistry = {};
    return parsedRegistry;
  }
}

function mergedAliases(): Record<string, string> {
  const file = loadRegistryFile();
  const fromFile = file.model_aliases ?? {};
  return { ...EMBEDDED_ALIASES, ...fromFile };
}

/**
 * Maps legacy/short model names from agent `capabilities.json` to OpenRouter model IDs.
 * If `raw` already looks like a slug (contains `/`), returns it unchanged.
 */
export function resolveOpenRouterModelId(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes('/')) {
    return trimmed;
  }
  const aliases = mergedAliases();
  const resolved = aliases[trimmed] ?? aliases[trimmed.toLowerCase()];
  if (resolved) {
    return resolved;
  }
  const defaults = loadRegistryFile().defaults?.default_model;
  if (defaults) {
    logger.warn(
      { raw: trimmed, fallback: defaults },
      'Unknown model id for openrouter; using default from bruce-model-registry.json'
    );
    return defaults;
  }
  logger.warn(
    { raw: trimmed },
    'Unknown model id for openrouter; passing through (may fail at API)'
  );
  return trimmed;
}

/**
 * Env var name for the platform OpenRouter key (communal pool).
 * Future BYOK: add `getLlmCredentials({ accountId, ventureId })` that may return a per-venture key,
 * then fall back to `process.env[resolvePlatformOpenRouterApiKeyEnv()]`.
 * See `bruce-model-registry.json` → credential_pools.venture.
 */
export function resolvePlatformOpenRouterApiKeyEnv(): string {
  const file = loadRegistryFile();
  const envName = file.providers?.openrouter?.api_key_env;
  return typeof envName === 'string' && envName.length > 0 ? envName : 'OPENROUTER_API_KEY';
}

/** Last-resort literal when neither env nor registry provide a model id. */
const HARDCODED_LAST_RESORT_MODEL = 'openai/gpt-oss-120b:free';

/**
 * Single source of truth for the fallback model used when an agent's
 * `capabilities.json` omits `runtime.model` or when an LLMClient is constructed
 * without a model. Resolution order:
 *   1. `DEFAULT_FALLBACK_AGENT_MODEL` (env) — lets ops override without code change
 *   2. `bruce-model-registry.json` → `defaults.default_model`
 *   3. `HARDCODED_LAST_RESORT_MODEL`
 */
export function getDefaultFallbackAgentModel(): string {
  const envModel = process.env.DEFAULT_FALLBACK_AGENT_MODEL?.trim();
  if (envModel) {
    return envModel;
  }
  const registryDefault = loadRegistryFile().defaults?.default_model?.trim();
  if (registryDefault) {
    return registryDefault;
  }
  return HARDCODED_LAST_RESORT_MODEL;
}
