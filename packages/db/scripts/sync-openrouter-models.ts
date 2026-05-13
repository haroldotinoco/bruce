#!/usr/bin/env node
import { loadRepoEnv } from '@bruce/env';

loadRepoEnv();

import { syncOpenRouterCatalogFromApi } from '../src/sync-openrouter-catalog.js';

async function main(): Promise<void> {
  const { upserted, syncedAt } = await syncOpenRouterCatalogFromApi();
  console.log(
    `[sync-openrouter-models] OK — upserted ${upserted} models at ${syncedAt.toISOString()}`,
  );
}

main().catch((err) => {
  console.error('[sync-openrouter-models]', err);
  process.exit(1);
});
