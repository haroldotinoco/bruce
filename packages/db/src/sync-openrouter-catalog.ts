import { sql } from 'drizzle-orm';
import { db } from './client.js';
import { openrouterModels } from './schema/platform.js';

type OpenRouterModelRow = {
  id: string;
  canonical_slug?: string | null;
  [key: string]: unknown;
};

type ModelsApiResponse = {
  data?: OpenRouterModelRow[];
};

/**
 * Fetches all models from OpenRouter and upserts into `platform.openrouter_models`.
 * `OPENROUTER_API_KEY` is optional but recommended for rate limits.
 */
export async function syncOpenRouterCatalogFromApi(): Promise<{
  upserted: number;
  syncedAt: Date;
}> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  const key = process.env.OPENROUTER_API_KEY;
  if (key) {
    headers.Authorization = `Bearer ${key}`;
  }

  const res = await fetch('https://openrouter.ai/api/v1/models', { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter GET /models failed: ${res.status} ${text}`);
  }

  const body = (await res.json()) as ModelsApiResponse;
  const rows = body.data;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('OpenRouter /models returned no data array');
  }

  const syncedAt = new Date();
  const batchSize = 200;
  let upserted = 0;

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map((m) => {
      const id = typeof m.id === 'string' ? m.id : String(m.id);
      const canonical =
        typeof m.canonical_slug === 'string' ? m.canonical_slug : null;
      return {
        id,
        canonical_slug: canonical,
        payload: m as Record<string, unknown>,
        synced_at: syncedAt,
      };
    });

    await db
      .insert(openrouterModels)
      .values(batch)
      .onConflictDoUpdate({
        target: openrouterModels.id,
        set: {
          canonical_slug: sql`excluded.canonical_slug`,
          payload: sql`excluded.payload`,
          synced_at: sql`excluded.synced_at`,
        },
      });

    upserted += batch.length;
  }

  return { upserted, syncedAt };
}
