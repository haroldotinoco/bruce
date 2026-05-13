/**
 * Universal typed value used in structured workflow logs across all Bruce modules.
 *
 * Every "field" emitted by a step or every payload entry of a log message is a
 * `LogValue`: a discriminated kind plus the actual value plus optional metadata
 * the dashboard uses to render it (e.g. variant, threshold, ref kind).
 *
 * The catalog of kinds is intentionally broad so the dashboard can render a
 * type-aware widget instead of a plain `JSON.stringify`.
 */

export type LogValueKind =
  | 'null'
  | 'boolean'
  | 'number'
  | 'integer'
  | 'percent'
  | 'currency'
  | 'duration_ms'
  | 'score'
  | 'text_short'
  | 'text_long'
  | 'markdown'
  | 'code'
  | 'date'
  | 'time'
  | 'datetime'
  | 'timestamp'
  | 'url'
  | 'email'
  | 'image_url'
  | 'video_url'
  | 'color'
  | 'tag'
  | 'tags'
  | 'badge'
  | 'enum'
  | 'id_ref'
  | 'array'
  | 'object'
  | 'json';

export type LogValueVariant = 'success' | 'warn' | 'error' | 'info' | 'neutral';

export interface LogValue {
  kind: LogValueKind;
  value: unknown;
  /** Display unit hint for numeric kinds (e.g. 'ms', '%', 'USD', '/100', 'tokens'). */
  unit?: string;
  /** Visual tone hint (also used to color tags/badges/enums). */
  variant?: LogValueVariant;

  /** Score-only: scale denominator (e.g. 100 for x/100). */
  out_of?: number;
  /** Score-only: passing threshold. */
  threshold?: number;
  /** Score-only: whether the value cleared the threshold. */
  passed?: boolean;

  /** id_ref-only: kind of the referenced entity. */
  ref_kind?: 'opportunity' | 'venture' | 'agent' | 'workflow' | 'scan' | 'job' | string;
  /** id_ref-only: human label to render for the chip. */
  ref_label?: string;
  /** id_ref-only: optional URL the chip should link to. */
  ref_url?: string;

  /** array-only: kind of inner items (renderer hint). */
  item_kind?: LogValueKind;
  /** tags-only: per-tag-string variant override. */
  tone_map?: Record<string, LogValueVariant>;
  /** code-only: source language for syntax highlighting. */
  language?: string;
}

/**
 * Tiny helpers — `v.score(78, { outOf: 100, threshold: 70 })` etc — to keep
 * call sites readable when emitting structured fields.
 */
export const v = {
  null: (): LogValue => ({ kind: 'null', value: null }),
  bool: (value: boolean, variant?: LogValueVariant): LogValue => ({
    kind: 'boolean',
    value,
    variant,
  }),
  number: (value: number, unit?: string): LogValue => ({ kind: 'number', value, unit }),
  integer: (value: number, unit?: string): LogValue => ({ kind: 'integer', value, unit }),
  percent: (value: number): LogValue => ({ kind: 'percent', value, unit: '%' }),
  currency: (value: number, unit = 'USD'): LogValue => ({ kind: 'currency', value, unit }),
  duration: (ms: number): LogValue => ({ kind: 'duration_ms', value: ms, unit: 'ms' }),
  score: (
    value: number,
    opts?: { outOf?: number; threshold?: number; passed?: boolean; variant?: LogValueVariant },
  ): LogValue => ({
    kind: 'score',
    value,
    out_of: opts?.outOf,
    threshold: opts?.threshold,
    passed: opts?.passed,
    variant:
      opts?.variant ??
      (opts?.passed === undefined
        ? undefined
        : opts.passed
          ? 'success'
          : 'warn'),
  }),
  text: (value: string): LogValue => ({ kind: 'text_short', value }),
  longText: (value: string): LogValue => ({ kind: 'text_long', value }),
  markdown: (value: string): LogValue => ({ kind: 'markdown', value }),
  code: (value: string, language?: string): LogValue => ({ kind: 'code', value, language }),
  date: (value: string): LogValue => ({ kind: 'date', value }),
  time: (value: string): LogValue => ({ kind: 'time', value }),
  datetime: (value: string): LogValue => ({ kind: 'datetime', value }),
  timestamp: (value: string | number | Date): LogValue => ({
    kind: 'timestamp',
    value: value instanceof Date ? value.toISOString() : value,
  }),
  url: (value: string): LogValue => ({ kind: 'url', value }),
  email: (value: string): LogValue => ({ kind: 'email', value }),
  image: (url: string): LogValue => ({ kind: 'image_url', value: url }),
  video: (url: string): LogValue => ({ kind: 'video_url', value: url }),
  color: (hex: string): LogValue => ({ kind: 'color', value: hex }),
  tag: (label: string, variant?: LogValueVariant): LogValue => ({
    kind: 'tag',
    value: label,
    variant,
  }),
  tags: (labels: string[], toneMap?: Record<string, LogValueVariant>): LogValue => ({
    kind: 'tags',
    value: labels,
    tone_map: toneMap,
  }),
  badge: (label: string, variant?: LogValueVariant): LogValue => ({
    kind: 'badge',
    value: label,
    variant,
  }),
  enum: (label: string, variant?: LogValueVariant): LogValue => ({
    kind: 'enum',
    value: label,
    variant,
  }),
  idRef: (
    refKind: LogValue['ref_kind'],
    id: string,
    label?: string,
    url?: string,
  ): LogValue => ({
    kind: 'id_ref',
    value: id,
    ref_kind: refKind,
    ref_label: label,
    ref_url: url,
  }),
  array: (items: unknown[], itemKind?: LogValueKind): LogValue => ({
    kind: 'array',
    value: items,
    item_kind: itemKind,
  }),
  object: (value: Record<string, unknown>): LogValue => ({ kind: 'object', value }),
  json: (value: unknown): LogValue => ({ kind: 'json', value }),
};

/** Type guard for a possibly-typed value. */
export function isLogValue(value: unknown): value is LogValue {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.kind === 'string' && 'value' in v;
}
