import { text, timestamp } from 'drizzle-orm/pg-core';
import { bruceCore } from './bruce-core.js';

export const organizations = bruceCore.table('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan').notNull().default('free'),
  stripe_customer_id: text('stripe_customer_id'),
  status: text('status').notNull().default('active'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deleted_at: timestamp('deleted_at', { withTimezone: true }),
});
