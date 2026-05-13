import { describe, expect, it } from 'vitest';
import { ensureUnique } from './uniqueness.js';

describe('ensureUnique', () => {
  it('returns the base when no collisions exist', async () => {
    const result = await ensureUnique('romantic_williamson', async () => []);
    expect(result).toBe('romantic_williamson');
  });

  it('appends _1 when the exact base is taken', async () => {
    const result = await ensureUnique('foo_bar', async () => ['foo_bar']);
    expect(result).toBe('foo_bar_1');
  });

  it('skips already-used numeric suffixes', async () => {
    const result = await ensureUnique('foo_bar', async () => [
      'foo_bar',
      'foo_bar_1',
      'foo_bar_4',
    ]);
    expect(result).toBe('foo_bar_5');
  });

  it('ignores prefix matches that are not the exact base or _N pattern', async () => {
    const result = await ensureUnique('foo_bar', async () => [
      'foo_bar_deadbeef',
      'foo_barbaz',
    ]);
    expect(result).toBe('foo_bar');
  });

  it('has no upper bound on the numeric suffix', async () => {
    const result = await ensureUnique('foo_bar', async () => [
      'foo_bar_9999',
    ]);
    expect(result).toBe('foo_bar_10000');
  });

  it('handles very large numeric suffixes', async () => {
    const result = await ensureUnique('foo_bar', async () => [
      'foo_bar_1000000',
    ]);
    expect(result).toBe('foo_bar_1000001');
  });
});
