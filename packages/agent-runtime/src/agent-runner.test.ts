import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it, vi } from 'vitest';
import type { LLMClient } from '@bruce/llm';
import { AgentLoader } from './agent-loader.js';
import { AgentRunner } from './agent-runner.js';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const modulesDir = path.join(repoRoot, 'modules');

const ctx = {
  accountId: '00000000-0000-0000-0000-000000000001',
  ventureId: '00000000-0000-0000-0000-000000000099',
  executionId: '00000000-0000-0000-0000-000000000002',
  module: 'opportunity',
  correlationId: 'corr-test',
};

const addVentureCtx = {
  ...ctx,
  module: 'add-venture',
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

  it('normalizes partial Add-Venture volume outputs before validation', async () => {
    const mockLlm = {
      callAgent: vi.fn().mockResolvedValue({
        data_gaps: [{ gap: 'Validate segment size' }],
      }),
      callAgentWithTools: vi.fn(),
    };
    const runner = new AgentRunner({
      agentLoader: new AgentLoader(modulesDir),
      createLlm: () => mockLlm as unknown as LLMClient,
    });
    const result = await runner.run(
      'add-venture',
      'customer-market-architect',
      {
        venture_id: addVentureCtx.ventureId,
        opportunity_id: 'opp-1',
        briefing: {},
        vol_1_opportunity: {},
      },
      addVentureCtx,
    );

    expect(result.success).toBe(true);
    expect(result.output).toMatchObject({
      venture_id: addVentureCtx.ventureId,
      volume_number: 2,
      volume_title: 'Customer & Market Architecture',
      data_gaps: ['Validate segment size'],
    });
  });

  it('repairs opportunity-analyst-vol1 when LLM returns strings instead of nested objects', async () => {
    const mockLlm = {
      callAgent: vi.fn().mockResolvedValue({
        venture_id: addVentureCtx.ventureId,
        volume_number: 1,
        content: {
          problem_anatomy: 'Problem described as a single paragraph.',
          market_readiness: 'Market is emerging.',
          addressable_market: 'Large TAM.',
          opportunity_thesis: 'Strong wedge opportunity.',
        },
        validation_roadmap: 'Run customer interviews',
        confidence_score: 72,
      }),
      callAgentWithTools: vi.fn(),
    };
    const runner = new AgentRunner({
      agentLoader: new AgentLoader(modulesDir),
      createLlm: () => mockLlm as unknown as LLMClient,
    });
    const result = await runner.run(
      'add-venture',
      'opportunity-analyst-vol1',
      {
        briefing: {
          venture_id: addVentureCtx.ventureId,
          opportunity_id: 'opp-1',
          problem_context: {},
          market_context: {},
          customer_context: {},
          key_assumptions: [],
          data_gaps: [],
        },
        analysis_parameters: { depth_level: 'standard' },
      },
      addVentureCtx,
    );

    expect(result.success).toBe(true);
    const content = (result.output as { content: Record<string, unknown> }).content;
    expect(content.problem_anatomy).toMatchObject({
      core_problem: 'Problem described as a single paragraph.',
    });
    expect(content.market_readiness).toMatchObject({
      maturity_stage: 'Market is emerging.',
    });
    expect(Array.isArray((result.output as { validation_roadmap: unknown[] }).validation_roadmap)).toBe(
      true,
    );
  });

  it('repairs value-proposition-designer when differentiation_strategy is an object', async () => {
    const mockLlm = {
      callAgent: vi.fn().mockResolvedValue({
        venture_id: addVentureCtx.ventureId,
        volume_number: 3,
        core_value_proposition: 'One wallet for every bet.',
        differentiation_strategy: {
          speed: 'Instant deposits',
          trust: 'Licensed operator positioning',
        },
        value_proposition_canvas: {
          customer_pains: ['Slow payouts'],
          customer_gains: ['Instant play'],
          pain_relievers: [],
          gain_creators: [],
        },
        positioning_statement: {
          for_target: 'Bettors',
          product_name: 'B4U.bet',
          category: 'Sportsbook',
          key_benefit: 'Fast payouts',
          primary_differentiator: 'Speed',
          proof_point: 'Licensed',
        },
        confidence_score: 70,
      }),
      callAgentWithTools: vi.fn(),
    };
    const runner = new AgentRunner({
      agentLoader: new AgentLoader(modulesDir),
      createLlm: () => mockLlm as unknown as LLMClient,
    });
    const result = await runner.run(
      'add-venture',
      'value-proposition-designer',
      {
        venture_id: addVentureCtx.ventureId,
        opportunity_id: 'opp-1',
        briefing: {},
        vol_1_opportunity: {},
        vol_2_customer_market: {},
      },
      addVentureCtx,
    );

    expect(result.success).toBe(true);
    const strategy = (result.output as { differentiation_strategy: unknown[] }).differentiation_strategy;
    expect(Array.isArray(strategy)).toBe(true);
    expect(strategy.length).toBeGreaterThan(0);
    expect(strategy[0]).toMatchObject({ differentiator: expect.any(String) });
  });
});
