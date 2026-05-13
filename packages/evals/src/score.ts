import type { ScoringMetric } from './types.js';

function getAtPath(obj: unknown, path: string | undefined): unknown {
  if (!path || obj === null || obj === undefined) return undefined;
  const parts = path.split('.').filter(Boolean);
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function tokenJaccard(a: string, b: string): number {
  const ta = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const tb = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  if (ta.size === 0 && tb.size === 0) return 1;
  let inter = 0;
  for (const t of ta) {
    if (tb.has(t)) inter += 1;
  }
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Score actual vs expected using metric definitions (no LLM embeddings — semantic uses token Jaccard).
 */
export async function scoreOutput(
  actual: Record<string, unknown>,
  expected: Record<string, unknown>,
  scoring: Record<string, ScoringMetric>,
): Promise<Record<string, number>> {
  const scores: Record<string, number> = {};

  for (const [metricKey, metric] of Object.entries(scoring)) {
    const expPath = metric.expectedPath ?? metricKey;
    const actPath = metric.actualPath ?? expPath;

    if (metric.type === 'numeric_range') {
      const expectedVal = Number(getAtPath(expected, expPath));
      const actualVal = Number(getAtPath(actual, actPath));
      const tol = (metric.tolerance_percent ?? 10) / 100;
      if (!Number.isFinite(expectedVal) || !Number.isFinite(actualVal)) {
        scores[metricKey] = 0;
        continue;
      }
      const tolerance = Math.abs(expectedVal) * tol;
      const diff = Math.abs(actualVal - expectedVal);
      scores[metricKey] = diff <= tolerance ? 1 : Math.max(0, 1 - diff / (tolerance || 1));
    } else if (metric.type === 'exact_match') {
      const ev = getAtPath(expected, expPath);
      const av = getAtPath(actual, actPath);
      scores[metricKey] = ev === av ? 1 : 0;
    } else if (metric.type === 'semantic_similarity') {
      const ev = String(getAtPath(expected, expPath) ?? '');
      const av = String(getAtPath(actual, actPath) ?? '');
      const sim = tokenJaccard(ev, av);
      const th = metric.threshold ?? 0.75;
      scores[metricKey] = sim >= th ? 1 : sim;
    }
  }

  return scores;
}
