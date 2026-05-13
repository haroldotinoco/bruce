import { Hono } from 'hono';
import { Webhook } from 'svix';
import { pool } from '@bruce/db';
import { logger } from '@bruce/logger';

export const clerkWebhookRoutes = new Hono();

clerkWebhookRoutes.post('/clerk', async (c) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET ?? '';
  if (!secret) {
    logger.error({}, 'CLERK_WEBHOOK_SECRET not configured');
    return c.json({ error: 'Webhook not configured' }, 503);
  }

  const body = await c.req.text();
  const svixId = c.req.header('svix-id');
  const svixTimestamp = c.req.header('svix-timestamp');
  const svixSignature = c.req.header('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return c.json({ error: 'Missing Svix headers' }, 400);
  }

  let evt: { type: string; data: Record<string, unknown> };
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch (error) {
    logger.error({ error }, 'Svix webhook verification failed');
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { type, data } = evt;

  if (type === 'organization.created' || type === 'organization.updated') {
    const id = String(data.id ?? '');
    const name = String(data.name ?? '');
    const slug = String(data.slug ?? '');
    const publicMeta = data.public_metadata as { plan?: string } | undefined;
    const plan = publicMeta?.plan ?? 'free';

    if (!id) {
      return c.json({ error: 'Missing organization id' }, 400);
    }

    try {
      await pool.query(
        'select bruce_core.upsert_organization_from_clerk($1::text, $2::text, $3::text, $4::text)',
        [id, name, slug, plan]
      );
      logger.info({ orgId: id, type }, 'Clerk organization upserted');
      return c.json({ ok: true });
    } catch (error) {
      logger.error({ error }, 'upsert_organization_from_clerk failed');
      return c.json({ error: 'Failed to persist organization' }, 500);
    }
  }

  if (type === 'organization.deleted') {
    const id = String(data.id ?? '');
    if (!id) {
      return c.json({ error: 'Missing organization id' }, 400);
    }

    try {
      await pool.query('select bruce_core.soft_delete_organization_from_clerk($1::text)', [id]);
      logger.info({ orgId: id }, 'Clerk organization soft-deleted');
      return c.json({ ok: true });
    } catch (error) {
      logger.error({ error }, 'soft_delete_organization_from_clerk failed');
      return c.json({ error: 'Failed to update organization' }, 500);
    }
  }

  return c.json({ ok: true });
});
