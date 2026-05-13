import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAdd = vi.fn().mockResolvedValue(undefined);

vi.mock('./bruce-queues.js', () => ({
  getBruceQueueForSubscriber: vi.fn(() => ({
    add: mockAdd,
  })),
}));

describe('emitEvent', () => {
  beforeEach(() => {
    mockAdd.mockClear();
  });

  it('enqueues one job per routed subscriber with validated envelope', async () => {
    const { emitEvent } = await import('./emit-event.js');

    await emitEvent(
      'opportunity.advanced',
      'opportunity',
      { problem_statement: 'Test', market_segment: 'FinTech' },
      { ventureId: '550e8400-e29b-41d4-a716-446655440000', correlationId: 'corr-1' },
    );

    expect(mockAdd).toHaveBeenCalledTimes(1);
    const firstCall = mockAdd.mock.calls[0];
    expect(firstCall?.[0]).toBe('opportunity:opportunity.advanced');
    expect(firstCall?.[1]).toMatchObject({
      subscriber: expect.any(String),
      envelope: expect.objectContaining({
        event_type: 'opportunity.advanced',
        module: 'opportunity',
        correlation_id: 'corr-1',
      }),
    });
  });

  it('fan-out: venture.qualified targets brand-aid and builder', async () => {
    const { emitEvent } = await import('./emit-event.js');

    await emitEvent('venture.qualified', 'add-venture', { hypothesis: { x: 1 } }, {
      ventureId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(mockAdd).toHaveBeenCalledTimes(2);
    const subscribers = mockAdd.mock.calls.map((c) => (c[1] as { subscriber: string }).subscriber);
    expect(subscribers.sort()).toEqual(['brand-aid', 'builder']);
  });

  it('fan-out: portfolio.pipeline.completed targets bruce-memory and bruce-core', async () => {
    const { emitEvent } = await import('./emit-event.js');

    await emitEvent('portfolio.pipeline.completed', 'portfolio', { result: {} }, {
      ventureId: '550e8400-e29b-41d4-a716-446655440000',
    });

    expect(mockAdd).toHaveBeenCalledTimes(2);
    const subscribers = mockAdd.mock.calls.map((c) => (c[1] as { subscriber: string }).subscriber);
    expect(subscribers.sort()).toEqual(['bruce-core', 'bruce-memory']);
  });
});
