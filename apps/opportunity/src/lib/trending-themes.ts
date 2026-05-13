/**
 * Curated seed of trending themes used when a user kicks off a themed scan
 * without specifying any themes. A future iteration will swap this for an
 * LLM-powered trend-suggester agent; keeping it as a synchronous helper for
 * now means the workflow stays deterministic and replayable.
 *
 * The themes are loosely weighted toward concrete, investable verticals that
 * play well with the market-scanner agent.
 */
const TRENDING_POOL: readonly string[] = [
  'AI infrastructure',
  'developer tools',
  'agentic workflows',
  'vertical SaaS',
  'fintech infrastructure',
  'climate tech',
  'healthcare AI',
  'cybersecurity automation',
  'data platforms',
  'compliance automation',
  'creator tools',
  'edge compute',
  'robotics',
  'biotech platforms',
  'legaltech',
  'devops reliability',
  'supply chain intelligence',
  'education AI',
];

/** How many themes to pick when none were supplied. */
const DEFAULT_COUNT = 4;

/**
 * Pick N distinct trending themes using an unbiased Fisher–Yates shuffle.
 * Deterministic only if you pass a seeded RNG — otherwise uses Math.random.
 */
export function suggestTrendingThemes(
  count: number = DEFAULT_COUNT,
  rng: () => number = Math.random,
): string[] {
  const pool = [...TRENDING_POOL];
  const n = Math.min(Math.max(count, 1), pool.length);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, n);
}
