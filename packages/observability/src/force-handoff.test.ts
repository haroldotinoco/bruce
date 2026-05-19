import { describe, expect, it } from 'vitest';
import { ForceHandoffError, resolveForceHandoffRoute } from './force-handoff.js';

describe('resolveForceHandoffRoute', () => {
  it('resolves durable downstream targets for a source module', () => {
    expect(resolveForceHandoffRoute('opportunity')).toEqual({
      eventType: 'opportunity.advanced',
      targetModules: ['add-venture'],
    });
    expect(resolveForceHandoffRoute('add-venture')).toEqual({
      eventType: 'venture.qualified',
      targetModules: ['brand-aid', 'builder'],
    });
  });

  it('allows choosing a valid explicit target', () => {
    expect(resolveForceHandoffRoute('portfolio', 'bruce-memory')).toEqual({
      eventType: 'portfolio.pipeline.completed',
      targetModules: ['bruce-memory'],
    });
  });

  it('rejects terminal modules and invalid targets', () => {
    expect(() => resolveForceHandoffRoute('brand-aid')).toThrow(ForceHandoffError);
    expect(() => resolveForceHandoffRoute('builder', 'portfolio')).toThrow(ForceHandoffError);
  });
});
