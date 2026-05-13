import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { schema, withAccountContext } from '@bruce/db';
import { logger } from '@bruce/logger';
import { requireAuth } from '../middleware/auth-local.js';

const { opportunities } = schema;

export const opportunityRoutes = new Hono();

opportunityRoutes.get('/', async (c) => {
  const { accountId } = requireAuth(c);
  const limit = Math.min(Number(c.req.query('limit') ?? 20), 100);

  try {
    const rows = await withAccountContext(accountId, async (tx) => {
      return tx
        .select()
        .from(opportunities)
        .orderBy(desc(opportunities.created_at))
        .limit(limit);
    });

    return c.json({
      data: rows.map((r) => ({
        id: r.id,
        problem_statement: r.description ?? r.title,
        market_segment: r.category ?? 'general',
        score: typeof r.research_data === 'object' && r.research_data && 'total_score' in (r.research_data as object)
          ? Number((r.research_data as { total_score?: number }).total_score ?? 0)
          : 0,
        created_at: r.created_at.toISOString(),
        scan_id: null,
      })),
    });
  } catch (error) {
    logger.error({ error, accountId }, 'List opportunities failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});

opportunityRoutes.get('/:opportunity_id', async (c) => {
  const { accountId } = requireAuth(c);
  const id = c.req.param('opportunity_id');

  try {
    const row = await withAccountContext(accountId, async (tx) => {
      const [r] = await tx
        .select()
        .from(opportunities)
        .where(eq(opportunities.id, id))
        .limit(1);
      return r ?? null;
    });

    if (!row) {
      return c.json({ error: 'Not Found' }, 404);
    }

    return c.json({
      id: row.id,
      problem_statement: row.description ?? row.title,
      market_segment: row.category ?? 'general',
      score: 0,
      created_at: row.created_at.toISOString(),
      key_insights: [],
      competitive_landscape: row.competitive_advantage,
      research_data: row.research_data,
    });
  } catch (error) {
    logger.error({ error, accountId }, 'Get opportunity failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});

opportunityRoutes.post('/:opportunity_id/advance', async (c) => {
  const { accountId } = requireAuth(c);
  const id = c.req.param('opportunity_id');

  try {
    const row = await withAccountContext(accountId, async (tx) => {
      const [r] = await tx
        .select()
        .from(opportunities)
        .where(eq(opportunities.id, id))
        .limit(1);
      return r ?? null;
    });

    if (!row) {
      return c.json({ error: 'Not Found' }, 404);
    }

    return c.json({
      opportunity_id: id,
      status: 'advanced' as const,
      venture_id: row.venture_id,
    });
  } catch (error) {
    logger.error({ error, accountId }, 'Advance opportunity failed');
    return c.json({ error: (error as Error).message }, 500);
  }
});
