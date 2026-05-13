/**
 * LLMs often wrap JSON in markdown fences or add prose. Extract a parseable JSON value.
 */
export function parseJsonFromLlmText(text: string): unknown {
  const trimmed = text.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```/m.exec(trimmed);
  const candidate = fence ? fence[1]!.trim() : trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(candidate.slice(start, end + 1)) as unknown;
  }
  return JSON.parse(candidate) as unknown;
}
