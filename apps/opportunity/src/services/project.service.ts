import { and, eq, like, sql } from 'drizzle-orm';
import { db, schema } from '@bruce/db';
import { logger } from '@bruce/logger';
import { createProject, type NicknameLookup } from '@bruce/project-store';

const { projects } = schema;

function ventureUuidOrNull(ventureId?: string): string | null {
  if (!ventureId) return null;
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRe.test(ventureId) ? ventureId : null;
}

/**
 * Create a `platform.projects` row + `.projects/<nickname>/meta.json` folder for
 * a new opportunity scan. Returns the unique nickname that should be threaded
 * through the rest of the workflow (observability + agent ExecutionContext).
 */
export async function createOpportunityProject(params: {
  accountId: string;
  ventureId?: string;
  title?: string;
}): Promise<{ nickname: string }> {
  const { accountId, ventureId, title } = params;

  const lookup: NicknameLookup = async (prefix) => {
    const rows = await db
      .select({ nickname: projects.nickname })
      .from(projects)
      .where(
        and(
          eq(projects.account_id, accountId),
          like(projects.nickname, `${prefix}%`),
        ),
      );
    return rows.map((r) => r.nickname);
  };

  const { nickname } = await createProject({
    accountId,
    ventureId,
    title,
    lookup,
    persist: async (candidate) => {
      await db.insert(projects).values({
        account_id: accountId,
        nickname: candidate,
        venture_id: ventureUuidOrNull(ventureId),
        title: title ?? null,
        created_at: sql`CURRENT_TIMESTAMP`,
      });
    },
  });

  logger.info(
    { accountId, ventureId, nickname },
    'Opportunity project nickname reserved',
  );
  return { nickname };
}
