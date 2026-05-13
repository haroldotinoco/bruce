import { describe, expect, it } from 'vitest';
import { DEFAULT_EVENT_ROUTING, resolveSubscribers } from './routing.js';

describe('resolveSubscribers', () => {
  it('uses explicit subscribers when provided', () => {
    expect(resolveSubscribers('anything', ['a', 'b'])).toEqual(['a', 'b']);
  });

  it('uses default routing for known event types', () => {
    expect(resolveSubscribers('opportunity.advanced')).toEqual(
      DEFAULT_EVENT_ROUTING['opportunity.advanced'],
    );
    expect(resolveSubscribers('venture.qualified')).toEqual(
      DEFAULT_EVENT_ROUTING['venture.qualified'],
    );
    expect(resolveSubscribers('portfolio.pipeline.completed')).toEqual(
      DEFAULT_EVENT_ROUTING['portfolio.pipeline.completed'],
    );
  });

  it('returns empty array for unknown types without explicit subscribers', () => {
    expect(resolveSubscribers('unknown.event')).toEqual([]);
  });
});
