import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildEvalInventory, listEvaluationModules } from './discovery.js';

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');

describe('eval discovery', () => {
  it('discovers every module with runnable .eval.json scenarios', () => {
    expect(listEvaluationModules(repoRoot)).toEqual(
      expect.arrayContaining(['add-venture', 'brand-aid', 'builder', 'opportunity', 'portfolio']),
    );
  });

  it('reports eval inventory and coverage levels', () => {
    const inventory = buildEvalInventory(repoRoot);
    const gtm = inventory.find((entry) => entry.module_name === 'gtm');
    const portfolio = inventory.find((entry) => entry.module_name === 'portfolio');

    expect(gtm?.coverage_level).toBe('partial');
    expect(portfolio?.eval_count).toBeGreaterThan(0);
  });
});
