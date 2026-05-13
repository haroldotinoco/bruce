import { z } from 'zod';

/**
 * Conversão mínima JSON Schema (draft-07) → Zod para validação em runtime.
 * Tipos não suportados viram z.unknown() ou z.record(z.unknown()).
 */
export function jsonSchemaToZod(schema: unknown): z.ZodTypeAny {
  if (schema === null || typeof schema !== 'object') {
    return z.unknown();
  }

  const s = schema as Record<string, unknown>;

  if (Array.isArray(s.enum) && s.enum.every((e) => typeof e === 'string')) {
    const values = s.enum as [string, ...string[]];
    if (values.length === 0) return z.string();
    return z.enum(values);
  }

  const t = s.type as string | undefined;

  if (s.properties !== undefined && typeof s.properties === 'object') {
    return buildObject(s);
  }

  if (t === 'object') {
    return buildObject(s);
  }

  if (t === 'array') {
    const items = s.items;
    return z.array(jsonSchemaToZod(items));
  }

  if (t === 'string') {
    let out: z.ZodString = z.string();
    if (typeof s.minLength === 'number') out = out.min(s.minLength);
    if (typeof s.maxLength === 'number') out = out.max(s.maxLength);
    return out;
  }

  if (t === 'number') {
    let out: z.ZodNumber = z.number();
    if (typeof s.minimum === 'number') out = out.min(s.minimum);
    if (typeof s.maximum === 'number') out = out.max(s.maximum);
    return out;
  }

  if (t === 'integer') {
    let out: z.ZodNumber = z.number().int();
    if (typeof s.minimum === 'number') out = out.min(s.minimum);
    if (typeof s.maximum === 'number') out = out.max(s.maximum);
    return out;
  }

  if (t === 'boolean') {
    return z.boolean();
  }

  if (t === 'null') {
    return z.null();
  }

  if (Array.isArray(s.allOf) && s.allOf.length > 0) {
    return jsonSchemaToZod(s.allOf[0]);
  }

  return z.unknown();
}

function buildObject(s: Record<string, unknown>): z.ZodTypeAny {
  const props = (s.properties ?? {}) as Record<string, unknown>;
  const required = new Set<string>((s.required as string[]) ?? []);
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, propSchema] of Object.entries(props)) {
    let inner = jsonSchemaToZod(propSchema);
    if (!required.has(key)) {
      // OpenAI structured outputs / zodResponseFormat: `.optional()` alone is deprecated;
      // optional object keys should be `nullish` (undefined | null | T) to round-trip in strict mode.
      inner = inner.nullish();
    }
    shape[key] = inner;
  }

  const obj = z.object(shape);
  return s.additionalProperties === true ? obj.passthrough() : obj;
}
