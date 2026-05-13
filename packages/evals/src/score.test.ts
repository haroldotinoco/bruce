import { describe, expect, it } from 'vitest';
import { scoreOutput } from './score.js';

describe('scoreOutput', () => {
  it('scores numeric_range within tolerance', async () => {
    const scores = await scoreOutput(
      { tam_estimate: { value: 100 } },
      { tam_estimate: { value: 100 } },
      {
        tam: {
          type: 'numeric_range',
          expectedPath: 'tam_estimate.value',
          actualPath: 'tam_estimate.value',
          tolerance_percent: 20,
        },
      },
    );
    expect(scores.tam).toBe(1);
  });

  it('scores exact_match', async () => {
    const scores = await scoreOutput(
      { tier: 'pro' },
      { tier: 'pro' },
      {
        tier: { type: 'exact_match', expectedPath: 'tier', actualPath: 'tier' },
      },
    );
    expect(scores.tier).toBe(1);
  });
});
