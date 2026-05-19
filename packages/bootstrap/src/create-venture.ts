import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';

const { ventures } = schema;

export async function createVentureForAccount(
  accountId: string,
  name: string,
  description?: string,
): Promise<string> {
  const row = await withAccountContext(accountId, async (tx) => {
    const [inserted] = await tx
      .insert(ventures)
      .values({
        account_id: accountId,
        venture_name: name.trim(),
        description: description?.slice(0, 2000) ?? null,
        stage: 'concept',
      })
      .returning({ id: ventures.id });
    if (!inserted?.id) throw new Error('Failed to create venture');
    return inserted;
  });
  logger.info({ accountId, venture_id: row.id }, '[bootstrap] created venture');
  return row.id;
}
