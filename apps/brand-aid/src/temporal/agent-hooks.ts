import type { AgentRuntimeHooks, ExecutionContext } from '@bruce/agent-runtime';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === 'object' && !Array.isArray(item),
      )
    : [];
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function namingAgentDefaults(
  input: unknown,
  context: ExecutionContext,
): Record<string, unknown> {
  const i = asRecord(input);
  const ventureId = context.ventureId ?? stringValue(i.venture_id);
  const forced = stringValue(i.forced_brand_name);
  const handoff = asRecord(i.source_handoff);
  const name =
    forced || stringValue(handoff.venture_name, `Venture ${ventureId.slice(0, 8) || 'brand'}`);
  const brief = {
    name,
    approach: forced ? 'forced' : 'fallback',
    rationale: forced
      ? 'User-provided brand name.'
      : 'Auto-filled by Brand-Aid naming fallback because output was incomplete.',
    domain_status: 'not_checked',
  };

  return {
    top_candidates: [
      {
        rank: 1,
        name,
        overall_score: forced ? 100 : 60,
        rationale: brief.rationale,
        approach: brief.approach,
      },
    ],
    all_candidates: [brief],
    scoring_methodology: forced
      ? 'Skipped - forced brand name.'
      : 'Brand-Aid fallback after incomplete naming output.',
    domain_availability_summary: 'Not checked in fallback path.',
    trademark_flags: [],
    recommendation: 'Review naming output and re-run if alternatives are needed.',
  };
}

function normalizeNamingOutput(
  output: unknown,
  input: unknown,
  context: ExecutionContext,
): unknown {
  const defaults = namingAgentDefaults(input, context);
  const o = { ...defaults, ...asRecord(output) };

  if (!Array.isArray(o.top_candidates) || o.top_candidates.length === 0) {
    o.top_candidates = defaults.top_candidates;
  }

  if (!Array.isArray(o.all_candidates) || o.all_candidates.length < 5) {
    const merged = [
      ...asRecordArray(o.all_candidates),
      ...asRecordArray(defaults.all_candidates),
    ];
    const seen = new Set<string>();
    o.all_candidates = merged.filter((row) => {
      const key = stringValue(row.name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    while (asRecordArray(o.all_candidates).length < 5) {
      const idx = asRecordArray(o.all_candidates).length + 1;
      const top = asRecordArray(o.top_candidates)[0];
      o.all_candidates = [
        ...asRecordArray(o.all_candidates),
        {
          name: `${stringValue(top?.name, 'Brand')} Alt ${idx}`,
          approach: 'fallback',
          domain_status: 'not_checked',
        },
      ];
    }
  }

  if (!stringValue(o.scoring_methodology)) {
    o.scoring_methodology = defaults.scoring_methodology;
  }

  return o;
}

export function getBrandAidAgentRuntimeHooks(
  module: string,
  agentId: string,
): AgentRuntimeHooks | undefined {
  if (module !== 'brand-aid' || agentId !== 'naming-agent') return undefined;
  return {
    fallbackOutput: (input, context) => namingAgentDefaults(input, context),
    normalizeOutput: (output, input, context) => normalizeNamingOutput(output, input, context),
  };
}
