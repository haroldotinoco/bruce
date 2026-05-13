import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { LLMClient, mergeLlmJsonWithDefaults } from './client.js';

vi.mock('@bruce/observability', () => ({
  recordLlmUsage: vi.fn().mockResolvedValue(undefined),
}));

describe('LLMClient (OpenRouter mock)', () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENROUTER_API_KEY;
  const originalLlmMode = process.env.LLM_PROVIDER_MODE;
  const originalStruct = process.env.BRUCE_LLM_STRUCTURED_OUTPUTS;

  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = 'test-key';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env.OPENROUTER_API_KEY = originalKey;
    process.env.LLM_PROVIDER_MODE = originalLlmMode;
    process.env.BRUCE_LLM_STRUCTURED_OUTPUTS = originalStruct;
  });

  it('validates structured JSON from OpenRouter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
      }),
    } as unknown as Response);

    const client = new LLMClient('openrouter', 'openai/gpt-oss-120b:free');
    const schema = z.object({ ok: z.literal(true) });
    const out = await client.callAgent('system', 'user', schema);
    expect(out.ok).toBe(true);
  });

  it('defaults omitted provider to openrouter when model is passed, ignoring LLM_PROVIDER_MODE', () => {
    process.env.LLM_PROVIDER_MODE = 'openai';
    const client = new LLMClient(undefined, 'openai/gpt-4o');
    expect((client as unknown as { provider: string }).provider).toBe('openrouter');
  });

  it('mergeOutput fills missing keys before Zod parse', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
      }),
    } as unknown as Response);

    const client = new LLMClient('openrouter', 'openai/gpt-oss-120b:free');
    const schema = z.object({
      ok: z.literal(true),
      id: z.string(),
    });
    const out = await client.callAgent('system', 'user', schema, {
      mergeOutput: { id: 'filled' },
    });
    expect(out).toEqual({ ok: true, id: 'filled' });
  });

  it('mergeLlmJsonWithDefaults deep-merges nested objects', () => {
    const m = mergeLlmJsonWithDefaults(
      { a: { x: 1 }, b: 2 },
      { a: { y: 2 } }
    ) as { a: { x: number; y: number }; b: number };
    expect(m.a.x).toBe(1);
    expect(m.a.y).toBe(2);
    expect(m.b).toBe(2);
  });

  it('adds a JSON hint to system prompt when json_object mode is used and prompts omit "json"', async () => {
    process.env.BRUCE_LLM_STRUCTURED_OUTPUTS = '0';
    let capturedBody: Record<string, unknown> | undefined;
    globalThis.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      return {
        ok: true,
        text: async () => '',
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
        }),
      } as unknown as Response;
    });

    const client = new LLMClient('openrouter', 'openai/gpt-4o');
    const schema = z.object({ ok: z.literal(true) });
    await client.callAgent('Pure ranking rules. No API.', 'Process the following input:\n\n{}', schema);

    const messages = capturedBody?.messages as Array<{ role: string; content: string }>;
    const combined = messages?.map((m) => m.content).join('\n') ?? '';
    expect(combined.toLowerCase()).toContain('json');
    expect(capturedBody?.response_format).toEqual({ type: 'json_object' });
  });

  it('sends zodResponseFormat (json_schema) to OpenRouter when structured outputs are enabled', async () => {
    let capturedBody: Record<string, unknown> | undefined;
    globalThis.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      return {
        ok: true,
        text: async () => '',
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
        }),
      } as unknown as Response;
    });

    const client = new LLMClient('openrouter', 'openai/gpt-4o');
    const schema = z.object({ ok: z.literal(true) });
    await client.callAgent('You return JSON for tests.', 'input', schema, {
      responseSchemaName: 'test_agent',
    });
    const rf = capturedBody?.response_format as Record<string, unknown> | undefined;
    expect(rf?.type).toBe('json_schema');
    const js = rf?.json_schema as Record<string, unknown> | undefined;
    expect(js?.name).toBe('test_agent');
    expect(js?.strict).toBe(true);
  });

  it('falls back to json_object when structured request fails (e.g. 400)', async () => {
    let n = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      n += 1;
      if (n === 1) {
        return { ok: false, status: 400, text: async () => 'no structured' } as unknown as Response;
      }
      return {
        ok: true,
        text: async () => '',
        json: async () => ({
          choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
        }),
      } as unknown as Response;
    });

    const client = new LLMClient('openrouter', 'openai/gpt-4o');
    const schema = z.object({ ok: z.literal(true) });
    const out = await client.callAgent('s', 'u', schema, { responseSchemaName: 'x' });
    expect(out.ok).toBe(true);
    expect(n).toBe(2);
  });
});
