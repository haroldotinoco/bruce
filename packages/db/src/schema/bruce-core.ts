import { pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const bruceCore = pgSchema('bruce_core');

export const ventures = bruceCore.table('ventures', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Clerk organization id (e.g. org_xxx), matches app.current_account_id */
  account_id: text('account_id').notNull(),
  venture_name: text('venture_name').notNull(),
  description: text('description'),
  industry: text('industry'),
  stage: text('stage'),
  founder_names: text('founder_names'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
