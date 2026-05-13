import { jsonb, numeric, pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const opportunitySchema = pgSchema('opportunity');

export const scans = opportunitySchema.table('scans', {
  id: uuid('id').primaryKey().defaultRandom(),
  account_id: text('account_id').notNull(),
  venture_id: uuid('venture_id'),
  temporal_workflow_id: text('temporal_workflow_id'),
  themes: jsonb('themes').notNull().$type<string[]>().default([]),
  status: text('status').notNull().default('running'),
  result_json: jsonb('result_json').$type<unknown>(),
  error_message: text('error_message'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const opportunities = opportunitySchema.table('opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  account_id: text('account_id').notNull(),
  venture_id: uuid('venture_id'),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  priority: text('priority').default('medium'),
  status: text('status').default('open'),
  estimated_impact: text('estimated_impact'),
  market_size_estimate: text('market_size_estimate'),
  competitive_advantage: text('competitive_advantage'),
  tags: text('tags').array().notNull().default([]),
  research_data: jsonb('research_data').$type<unknown>(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const analysisResults = opportunitySchema.table('analysis_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  account_id: text('account_id').notNull(),
  opportunity_id: uuid('opportunity_id')
    .notNull()
    .references(() => opportunities.id, { onDelete: 'cascade' }),
  analysis_type: text('analysis_type').notNull(),
  findings: jsonb('findings').$type<unknown>(),
  confidence_score: numeric('confidence_score', { precision: 3, scale: 2 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
