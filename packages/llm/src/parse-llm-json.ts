/**
 * LLMs often wrap JSON in markdown fences or add prose. Extract a parseable JSON value.
 */
export function parseJsonFromLlmText(text: string): unknown {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```/m.exec(trimmed);
  const candidate = fence ? fence[1]!.trim() : trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  const jsonSlice =
    start >= 0 && end > start ? candidate.slice(start, end + 1) : candidate;

  try {
    return JSON.parse(jsonSlice) as unknown;
  } catch (firstError) {
    try {
      return JSON.parse(repairTruncatedJson(jsonSlice)) as unknown;
    } catch {
      try {
        return JSON.parse(repairTruncatedJson(stripTrailingIncompleteValue(jsonSlice))) as unknown;
      } catch {
        throw firstError;
      }
    }
  }
}

/** Drop a partially written last array element before bracket repair. */
function stripTrailingIncompleteValue(text: string): string {
  const matches = [...text.matchAll(/\}\s*,\s*\{/g)];
  if (matches.length === 0) return text;
  const last = matches[matches.length - 1];
  if (last.index == null) return text;
  return text.slice(0, last.index + 1);
}

/** Close truncated arrays/objects when the model hits max_tokens mid-JSON. */
export function repairTruncatedJson(text: string): string {
  let s = text.trim();
  if (!s) return s;

  let inString = false;
  let escape = false;
  const stack: string[] = [];

  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\') {
        escape = true;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === '{') stack.push('}');
    else if (c === '[') stack.push(']');
    else if ((c === '}' || c === ']') && stack.length > 0 && stack[stack.length - 1] === c) {
      stack.pop();
    }
  }

  if (inString) s += '"';
  s = s.replace(/,\s*([}\]])?$/, '');
  while (stack.length > 0) s += stack.pop();
  return s;
}
