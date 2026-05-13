import { loadRepoEnv } from '@bruce/env';
loadRepoEnv();

import { readdir, readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Client } from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '../migrations');

const defaultDatabaseUrl =
  'postgresql://bruce:bruce_dev_password@localhost:5432/bruce_dev';

async function ensureMigrationsTable(client: Client): Promise<void> {
  await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      execution_time_ms INTEGER
    );
  `);
}

async function isMigrationApplied(client: Client, name: string): Promise<boolean> {
  const { rowCount } = await client.query(
    'SELECT 1 FROM migrations WHERE name = $1 LIMIT 1',
    [name]
  );
  return (rowCount ?? 0) > 0;
}

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL ?? defaultDatabaseUrl;
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await ensureMigrationsTable(client);

    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const name = file.replace(/\.sql$/i, '');
      if (await isMigrationApplied(client, name)) {
        console.log(`[db:migrate] skip migrations/${file} (already applied)`);
        continue;
      }
      const sql = await readFile(join(migrationsDir, file), 'utf8');
      await client.query(sql);
      console.log(`[db:migrate] applied packages/db/migrations/${file}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
