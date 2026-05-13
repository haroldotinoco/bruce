import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { AgentLoader } from './agent-loader.js';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const modulesDir = path.join(repoRoot, 'modules');

describe('AgentLoader', () => {
  it('loads opportunity/market-scanner from modules/', async () => {
    const loader = new AgentLoader(modulesDir);
    const spec = await loader.loadAgent('opportunity', 'market-scanner');
    expect(spec.id).toBe('market-scanner');
    expect(spec.module).toBe('opportunity');
    expect(spec.capabilities.provider).toBe('openrouter');
    expect(spec.skillPrompt.length).toBeGreaterThan(10);
    expect(spec.tools.length).toBeGreaterThanOrEqual(0);
  });

  it('resolves short OpenRouter model ids for agents defaulting to openrouter (bruce-model-registry.json)', async () => {
    const loader = new AgentLoader(modulesDir);
    const spec = await loader.loadAgent('bruce-core', 'venture-lifecycle-manager');
    expect(spec.capabilities.provider).toBe('openrouter');
    expect(spec.capabilities.model).toBe('anthropic/claude-sonnet-4.6');
  });
});
