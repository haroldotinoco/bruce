import { logger } from '@bruce/logger';

const DEFAULT_SERPER_URL = 'https://google.serper.dev/search';

export type SerperSearchResult = {
  organic?: Array<{ title?: string; link?: string; snippet?: string }>;
  error?: string;
};

/**
 * Serper.dev Google search (POST JSON). Set SERPER_API_KEY in env.
 * @see https://serper.dev
 */
export async function searchSerper(query: string): Promise<SerperSearchResult | null> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey || !query.trim()) {
    return null;
  }

  const url = process.env.SERPER_API_URL ?? DEFAULT_SERPER_URL;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({ q: query, num: 8 }),
    });

    if (!res.ok) {
      const text = await res.text();
      logger.warn({ status: res.status, text: text.slice(0, 200) }, 'Serper request failed');
      return { error: `HTTP ${res.status}` };
    }

    return (await res.json()) as SerperSearchResult;
  } catch (error) {
    logger.warn({ error }, 'Serper request error');
    return { error: (error as Error).message };
  }
}
