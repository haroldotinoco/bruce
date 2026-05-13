import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  findBruceModelRegistryPath,
  resetModelRegistryCacheForTests,
  resolveOpenRouterModelId,
  resolvePlatformOpenRouterApiKeyEnv,
} from './model-registry.js';

describe('resolveOpenRouterModelId', () => {
  const originalEnv = process.env.BRUCE_MODEL_REGISTRY_PATH;
  const originalCwd = process.cwd();

  beforeEach(() => {
    resetModelRegistryCacheForTests();
    delete process.env.BRUCE_MODEL_REGISTRY_PATH;
  });

  afterEach(() => {
    resetModelRegistryCacheForTests();
    if (originalEnv === undefined) {
      delete process.env.BRUCE_MODEL_REGISTRY_PATH;
    } else {
      process.env.BRUCE_MODEL_REGISTRY_PATH = originalEnv;
    }
    process.chdir(originalCwd);
  });

  it('maps legacy short names from repo registry to OpenRouter slugs', () => {
    expect(resolveOpenRouterModelId('claude-opus-4-6')).toBe('anthropic/claude-opus-4-6');
    expect(resolveOpenRouterModelId('gpt-4o')).toBe('openai/gpt-4o');
  });

  it('passes through values that already look like OpenRouter slugs', () => {
    expect(resolveOpenRouterModelId('openai/gpt-4o')).toBe('openai/gpt-4o');
    expect(resolveOpenRouterModelId('  openai/gpt-4o-mini  ')).toBe('openai/gpt-4o-mini');
  });

  it('uses defaults.default_model from a custom registry file when the id is unknown', () => {
    const dir = mkdtempSync(join(tmpdir(), 'bruce-registry-'));
    const path = join(dir, 'bruce-model-registry.json');
    writeFileSync(
      path,
      JSON.stringify({
        defaults: { default_model: 'openai/gpt-4o-mini' },
        model_aliases: {},
      })
    );
    process.env.BRUCE_MODEL_REGISTRY_PATH = path;
    resetModelRegistryCacheForTests();
    expect(resolveOpenRouterModelId('totally-unknown-model-xyz')).toBe('openai/gpt-4o-mini');
    rmSync(dir, { recursive: true, force: true });
    delete process.env.BRUCE_MODEL_REGISTRY_PATH;
    resetModelRegistryCacheForTests();
  });
});

describe('findBruceModelRegistryPath', () => {
  afterEach(() => {
    delete process.env.BRUCE_MODEL_REGISTRY_PATH;
  });

  it('finds bruce-model-registry.json upward from cwd', () => {
    const found = findBruceModelRegistryPath();
    expect(found).toBeTruthy();
    expect(found!.endsWith('bruce-model-registry.json')).toBe(true);
  });
});

describe('resolvePlatformOpenRouterApiKeyEnv', () => {
  afterEach(() => {
    resetModelRegistryCacheForTests();
  });

  it('defaults to OPENROUTER_API_KEY', () => {
    expect(resolvePlatformOpenRouterApiKeyEnv()).toBe('OPENROUTER_API_KEY');
  });
});
