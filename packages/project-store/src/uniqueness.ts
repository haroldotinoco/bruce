export type NicknameLookup = (prefix: string) => Promise<string[]>;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Ensure the candidate nickname is unique within `lookup`. If not, append the
 * smallest unused `_N` suffix (1..∞ — no upper bound). `lookup` must return
 * every existing nickname that starts with `base` so we can find the max `_N`
 * in one round-trip.
 */
export async function ensureUnique(
  base: string,
  lookup: NicknameLookup,
): Promise<string> {
  const existing = await lookup(base);
  if (existing.length === 0) return base;

  const exactRe = new RegExp(`^${escapeRegex(base)}$`);
  const suffixRe = new RegExp(`^${escapeRegex(base)}_([0-9]+)$`);

  let baseTaken = false;
  let maxN = 0;
  for (const name of existing) {
    if (exactRe.test(name)) {
      baseTaken = true;
      continue;
    }
    const m = suffixRe.exec(name);
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n) && n > maxN) maxN = n;
    }
  }

  if (!baseTaken && maxN === 0) return base;

  return `${base}_${maxN + 1}`;
}
