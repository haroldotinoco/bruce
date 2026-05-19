import type { LogValue } from '@bruce/contracts/observability';
import { v } from '@bruce/contracts/observability';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];
}

function truncateJson(value: unknown, maxLen = 1200): string {
  try {
    const text = JSON.stringify(value);
    return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
  } catch {
    return String(value);
  }
}

function referenceDisplayUrl(ref: Record<string, unknown>): string {
  return stringValue(ref.persisted_url, stringValue(ref.image_url, stringValue(ref.thumbnail_url)));
}

function paletteFromVisualSystem(visualSystem: unknown): string[] {
  const palette = asRecord(asRecord(visualSystem).color_palette);
  const colors: string[] = [];
  for (const key of ['primary_colors', 'secondary_colors', 'neutral_palette'] as const) {
    const list = palette[key];
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const hex = stringValue(asRecord(item).hex);
      if (hex) colors.push(hex);
    }
  }
  return colors.slice(0, 8);
}

export function moodboardObsFields(moodboard: unknown): Record<string, LogValue> {
  const root = asRecord(moodboard);
  const clusters = Array.isArray(root.clusters) ? root.clusters : [];
  const refs: Record<string, unknown>[] = [];
  for (const cluster of clusters) {
    const row = asRecord(cluster);
    const list = Array.isArray(row.references) ? row.references : [];
    for (const ref of list) {
      if (ref && typeof ref === 'object') refs.push(ref as Record<string, unknown>);
    }
  }
  const imageUrls = refs.map(referenceDisplayUrl).filter(Boolean).slice(0, 8);

  const fields: Record<string, LogValue> = {
    reference_count: v.integer(refs.length),
    moodboard_images: v.array(imageUrls, 'image_url'),
  };
  const limitations = stringValue(root.limitations);
  if (limitations) fields.limitations = v.text(limitations);
  return fields;
}

export function creativeDirectionObsFields(creativeDirection: unknown): Record<string, LogValue> {
  const cd = asRecord(creativeDirection);
  const summary = stringValue(
    cd.creative_territory,
    stringValue(cd.visual_direction_summary, truncateJson(creativeDirection, 800)),
  );
  return {
    creative_territory: v.longText(summary || 'Creative direction generated.'),
    visual_mood: v.tags(stringArray(cd.visual_mood).slice(0, 6)),
  };
}

export function visualSystemObsFields(visualSystem: unknown): Record<string, LogValue> {
  const colors = paletteFromVisualSystem(visualSystem);
  return {
    palette: v.tags(colors.length ? colors : ['#0f172a', '#64748b']),
    typography: v.text(stringValue(asRecord(asRecord(visualSystem).typography).primary_typeface, 'See package detail')),
  };
}

export function assetImageObsFields(
  assets: Array<{ url?: string }>,
  fieldName: string,
): Record<string, LogValue> {
  const urls = assets.map((a) => stringValue(a.url)).filter(Boolean).slice(0, 6);
  return {
    [fieldName]: v.array(urls, 'image_url'),
    asset_count: v.integer(assets.length),
  };
}

export function critiqueObsFields(critique: unknown): Record<string, LogValue> {
  const scores = asRecord(asRecord(critique).scores);
  const overall = scores.overall;
  const score = typeof overall === 'number' ? Math.round(overall) : 0;
  return {
    score: v.score(score, { outOf: 100, threshold: 75, passed: score >= 75 }),
    focus: v.text(stringValue(asRecord(critique).iteration_recommendations, 'See critique in package detail.')),
  };
}
