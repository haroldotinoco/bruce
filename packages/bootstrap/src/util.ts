import { createHash } from 'crypto';

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

export function parseUuid(value: string): string | null {
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRe.test(value) ? value : null;
}

export function promptHash(prompt: string): string {
  return createHash('sha256').update(prompt).digest('hex').slice(0, 16);
}

export function slugNickname(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export function syntheticMeta(prompt: string): Record<string, unknown> {
  return {
    synthetic: true,
    source: 'start_from_prompt',
    prompt_hash: promptHash(prompt),
    prompt_preview: prompt.slice(0, 200),
  };
}

export function isBootstrapFromPromptEnabled(): boolean {
  const raw = process.env.BOOTSTRAP_FROM_PROMPT_ENABLED?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

export function useHeuristicSynthesis(): boolean {
  const raw = process.env.BOOTSTRAP_SYNTHESIS_MODE?.trim().toLowerCase();
  return raw === 'heuristic' || raw === 'mock';
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}
