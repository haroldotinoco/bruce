import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { describe, expect, it, vi } from 'vitest';
import type { LLMClient } from '@bruce/llm';
import { AgentLoader } from './agent-loader.js';
import { AgentRunner } from './agent-runner.js';
import type { AgentSpec } from './types.js';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const modulesDir = path.join(repoRoot, 'modules');

const ctx = {
  accountId: '00000000-0000-0000-0000-000000000001',
  ventureId: '00000000-0000-0000-0000-000000000099',
  executionId: '00000000-0000-0000-0000-000000000002',
  module: 'opportunity',
  correlationId: 'corr-test',
};

describe('AgentRunner', () => {
  it('returns validation error when input is invalid', async () => {
    const runner = new AgentRunner({ agentLoader: new AgentLoader(modulesDir) });
    const result = await runner.run('opportunity', 'market-scanner', {}, ctx);
    expect(result.success).toBe(false);
    expect(result.attempts).toBe(0);
    expect(result.error).toMatch(/Input validation failed/i);
  });

  it('returns success when LLM client resolves (no tools.json definitions — plain callAgent)', async () => {
    const mockLlm = {
      callAgent: vi.fn().mockResolvedValue({ scan_id: 's1', opportunities_found: [] }),
      callAgentWithTools: vi.fn(),
    };
    const runner = new AgentRunner({
      agentLoader: new AgentLoader(modulesDir),
      createLlm: () => mockLlm as unknown as LLMClient,
    });
    const result = await runner.run(
      'opportunity',
      'market-scanner',
      { scan_id: 's1' },
      ctx
    );
    expect(result.success).toBe(true);
    expect(mockLlm.callAgent).toHaveBeenCalled();
    expect(mockLlm.callAgentWithTools).not.toHaveBeenCalled();
    expect(mockLlm.callAgent.mock.calls[0]?.[0]).toContain('Runtime Constraints');
  });

  it('retries up to 3 times on LLM failure', async () => {
    let calls = 0;
    const mockLlm = {
      callAgent: vi.fn().mockImplementation(async () => {
        calls += 1;
        if (calls < 3) throw new Error('simulated failure');
        return { scan_id: 's1', opportunities_found: [] };
      }),
      callAgentWithTools: vi.fn(),
    };
    const runner = new AgentRunner({
      agentLoader: new AgentLoader(modulesDir),
      createLlm: () => mockLlm as unknown as LLMClient,
    });
    const result = await runner.run(
      'opportunity',
      'market-scanner',
      { scan_id: 's1' },
      ctx
    );
    expect(result.success).toBe(true);
    expect(mockLlm.callAgent).toHaveBeenCalledTimes(3);
  });

  it('invokes optional runtime hooks without knowing agent-specific rules', async () => {
    const mockLlm = {
      callAgent: vi.fn().mockResolvedValue({
        payload: 'raw',
      }),
      callAgentWithTools: vi.fn(),
    };
    const spec: AgentSpec = {
      id: 'generic-agent',
      module: 'generic',
      name: 'Generic agent',
      description: 'Generic agent',
      skillPrompt: 'Return JSON.',
      constraints: null,
      capabilities: {
        model: 'test-model',
        provider: 'openrouter',
        stateless: true,
        retryPolicy: {
          maxAttempts: 1,
          backoffMultiplier: 2,
          initialDelayMs: 1,
        },
      },
      inputSchema: z.object({ id: z.string() }),
      outputSchema: z.object({
        id: z.string(),
        payload: z.string(),
        normalized: z.boolean(),
      }),
      tools: [],
      runtimeHooks: {
        fallbackOutput: (input) => ({ id: (input as { id: string }).id, payload: 'fallback' }),
        normalizeOutput: (output, input) => ({
          id: (input as { id: string }).id,
          ...(output as Record<string, unknown>),
          normalized: true,
        }),
      },
    };
    const runner = new AgentRunner({
      agentLoader: {
        loadAgent: vi.fn().mockResolvedValue(spec),
        clearCache: vi.fn(),
      },
      createLlm: () => mockLlm as unknown as LLMClient,
    });
    const result = await runner.run('generic', 'generic-agent', { id: 'input-1' }, ctx);

    expect(result.success).toBe(true);
    expect(result.output).toMatchObject({
      id: 'input-1',
      payload: 'raw',
      normalized: true,
    });
  });
});
