import { Observable, of, timer, map } from 'rxjs';

export function withLatency<T>(data: T, minMs = 180, maxMs = 520): Observable<T> {
  const d = Math.floor(minMs + Math.random() * (maxMs - minMs));
  return timer(d).pipe(map(() => data));
}

export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function pick<T>(rand: () => number, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)];
}

export function randomId(prefix = 'id', rand?: () => number): string {
  const r = rand ? rand() : Math.random();
  return `${prefix}_${Math.floor(r * 1e9).toString(36)}`;
}

export function daysAgoIso(n: number, rand?: () => number): string {
  const jitterHours = rand ? rand() * 24 : 0;
  const d = new Date(Date.now() - n * 86_400_000 - jitterHours * 3_600_000);
  return d.toISOString();
}

export function minutesAgoIso(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString();
}

export const ALSO_PASSTHROUGH = undefined;

export { of };
