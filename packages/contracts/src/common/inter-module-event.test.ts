import { describe, expect, it } from 'vitest';
import { InterModuleEventSchema } from './inter-module-event.js';

describe('InterModuleEventSchema', () => {
  it('validates a complete inter-module event', () => {
    const event = {
      event_id: '550e8400-e29b-41d4-a716-446655440000',
      event_type: 'opportunity.advanced',
      module: 'opportunity',
      timestamp: new Date().toISOString(),
      severity: 'info' as const,
      payload: { problem: 'Test' },
      correlation_id: 'corr-1',
      subscribers: ['add-venture'],
    };

    const result = InterModuleEventSchema.safeParse(event);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const event = {
      event_type: 'opportunity.advanced',
    };

    const result = InterModuleEventSchema.safeParse(event);
    expect(result.success).toBe(false);
  });

  it('rejects invalid severity', () => {
    const event = {
      event_id: '550e8400-e29b-41d4-a716-446655440000',
      event_type: 'opportunity.advanced',
      module: 'opportunity',
      timestamp: new Date().toISOString(),
      severity: 99,
      payload: {},
      correlation_id: 'c1',
      subscribers: [],
    };

    const result = InterModuleEventSchema.safeParse(event);
    expect(result.success).toBe(false);
  });

  it('accepts common dotted event types', () => {
    const types = ['opportunity.advanced', 'venture.qualified', 'brand_assets_generated'];

    for (const event_type of types) {
      const event = {
        event_id: '550e8400-e29b-41d4-a716-446655440000',
        event_type,
        module: 'test',
        timestamp: new Date().toISOString(),
        severity: 'info' as const,
        payload: {},
        correlation_id: 'c1',
        subscribers: [],
      };
      expect(InterModuleEventSchema.safeParse(event).success).toBe(true);
    }
  });
});
