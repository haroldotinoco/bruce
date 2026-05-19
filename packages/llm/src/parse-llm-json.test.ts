import { describe, expect, it } from 'vitest';
import { parseJsonFromLlmText, repairTruncatedJson } from './parse-llm-json.js';

describe('repairTruncatedJson', () => {
  it('closes a truncated array inside an object', () => {
    const broken = '{"all_candidates":[{"name":"Alpha"},{"name":"Beta"';
    const repaired = repairTruncatedJson(broken);
    expect(JSON.parse(repaired)).toEqual({
      all_candidates: [{ name: 'Alpha' }, { name: 'Beta' }],
    });
  });
});

describe('parseJsonFromLlmText', () => {
  it('parses fenced JSON', () => {
    const value = parseJsonFromLlmText('```json\n{"ok":true}\n```');
    expect(value).toEqual({ ok: true });
  });

  it('repairs truncated JSON from LLM output', () => {
    const truncated =
      '{"top_candidates":[{"name":"B4U","overall_score":90,"rationale":"short"}],"all_candidates":[' +
      '{"name":"One"},{"name":"Two"},{"name":"Three"';
    const value = parseJsonFromLlmText(truncated) as {
      top_candidates?: { name: string }[];
      all_candidates: { name: string }[];
    };
    expect(value.all_candidates.length).toBeGreaterThanOrEqual(2);
    expect(value.top_candidates?.[0]?.name).toBe('B4U');
  });
});
