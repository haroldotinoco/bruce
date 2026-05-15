import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { EVENT_ROUTING_POLICY } from './routing-policy.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const scanRoots = ['apps', 'packages']
  .map((segment) => join(repoRoot, segment))
  .filter((path) => existsSync(path));

const ignoredDirectories = new Set(['node_modules', 'dist', '.turbo', '.next', 'coverage']);

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (ignoredDirectories.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...walkFiles(full));
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry) && !entry.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

function literalEmitEvents(): string[] {
  const events = new Set<string>();
  const pattern = /emitEvent\s*\(\s*['"`]([^'"`$]+)['"`]/g;

  for (const file of scanRoots.flatMap(walkFiles)) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(pattern)) {
      if (match[1]) events.add(match[1]);
    }
  }

  return [...events].sort();
}

describe('event routing inventory', () => {
  it('classifies every literal durable emitEvent call', () => {
    const emittedEvents = literalEmitEvents();
    const classifiedEvents = Object.keys(EVENT_ROUTING_POLICY).sort();

    expect(emittedEvents).toEqual(
      expect.arrayContaining([
        'opportunity.advanced',
        'venture.qualified',
        'brand-aid.pipeline.completed',
        'builder.pipeline.completed',
        'gtm.pipeline.completed',
        'startup-ops.pipeline.completed',
        'portfolio.pipeline.completed',
        'bruce-memory.pipeline.completed',
      ]),
    );

    expect(emittedEvents.filter((eventType) => !classifiedEvents.includes(eventType))).toEqual([]);
  });
});
