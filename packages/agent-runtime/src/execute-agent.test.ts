import { beforeEach, describe, expect, it, vi } from 'vitest';

const emitEvent = vi.fn().mockResolvedValue({});

vi.mock('@bruce/events', () => ({
  emitEvent: (...args: unknown[]) => emitEvent(...args),
}));

describe('executeAgent', () => {
  beforeEach(() => {
    emitEvent.mockClear();
  });

  it('emits started and completed lifecycle (skipQueue)', async () => {
    const { executeAgent } = await import('./execute-agent.js');

    const result = await executeAgent(
      'test-agent',
      async () => ({ ok: true }),
      {
        agentId: 'test-agent',
        module: 'test',
        input: { x: 1 },
        correlationId: 'corr-x',
        accountId: 'org_a',
        ventureId: 'vent_b',
      },
    );

    expect(result).toEqual({ ok: true });
    expect(emitEvent).toHaveBeenCalledTimes(2);
    expect(emitEvent.mock.calls[0]?.[0]).toBe('test.test-agent.started');
    expect(emitEvent.mock.calls[1]?.[0]).toBe('test.test-agent.completed');
  });

  it('emits failed on error', async () => {
    const { executeAgent } = await import('./execute-agent.js');

    await expect(
      executeAgent(
        'bad-agent',
        async () => {
          throw new Error('boom');
        },
        {
          agentId: 'bad-agent',
          module: 'test',
          input: {},
          correlationId: 'corr-y',
          accountId: 'org_a',
          ventureId: 'vent_b',
        },
      ),
    ).rejects.toThrow('boom');

    expect(emitEvent).toHaveBeenCalledTimes(2);
    expect(emitEvent.mock.calls[0]?.[0]).toBe('test.bad-agent.started');
    expect(emitEvent.mock.calls[1]?.[0]).toBe('test.bad-agent.failed');
  });
});
