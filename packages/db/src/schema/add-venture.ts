import {
  index,
  jsonb,
  numeric,
  pgSchema,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const addVentureSchema = pgSchema('add_venture');

/**
 * Flow-only tracking row for a ventureAdditionWorkflow execution. Full agent
 * outputs live in `.projects/<project_nickname>/add-venture/<agent>/output.json`
 * — this table only stores status/timing for dashboard listing + retries.
 */
export const pipelineRuns = addVentureSchema.table(
  'pipeline_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    account_id: uuid('account_id').notNull(),
    venture_id: uuid('venture_id'),
    opportunity_id: uuid('opportunity_id'),
    project_nickname: text('project_nickname'),
    temporal_workflow_id: text('temporal_workflow_id'),
    status: text('status').notNull().default('pending'),
    error_message: text('error_message'),
    started_at: timestamp('started_at', { withTimezone: true }),
    ended_at: timestamp('ended_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    accountIdx: index('idx_add_venture_pipeline_runs_account_id').on(table.account_id),
    ventureIdx: index('idx_add_venture_pipeline_runs_venture_id').on(table.venture_id),
    projectIdx: index('idx_add_venture_pipeline_runs_project_nickname').on(
      table.project_nickname,
    ),
    statusIdx: index('idx_add_venture_pipeline_runs_status').on(table.status),
  }),
);

/**
 * Thin read-model: one row per composed dossier. Full JSON lives on disk at
 * `.projects/<project_nickname>/add-venture/dossier-composer/dossier.json`.
 * These columns support dashboard listing queries (`GET /dossiers`) without
 * round-tripping through the filesystem for every row.
 */
export const ventureDossiers = addVentureSchema.table(
  'venture_dossiers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    account_id: uuid('account_id').notNull(),
    venture_id: uuid('venture_id'),
    pipeline_run_id: uuid('pipeline_run_id'),
    project_nickname: text('project_nickname'),
    venture_name: text('venture_name'),
    critic_score: numeric('critic_score', { precision: 5, scale: 2 }),
    status: text('status'),
    executive_summary: text('executive_summary'),
    problem_statement: text('problem_statement'),
    target_market: jsonb('target_market').$type<unknown>(),
    competitive_landscape: jsonb('competitive_landscape').$type<unknown>(),
    financial_projections: jsonb('financial_projections').$type<unknown>(),
    team_overview: jsonb('team_overview').$type<unknown>(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    accountIdx: index('idx_venture_dossiers_account_id').on(table.account_id),
    ventureIdx: index('idx_venture_dossiers_venture_id').on(table.venture_id),
    pipelineIdx: index('idx_venture_dossiers_pipeline_run_id').on(table.pipeline_run_id),
    projectIdx: index('idx_venture_dossiers_project_nickname').on(table.project_nickname),
    statusIdx: index('idx_venture_dossiers_status').on(table.status),
  }),
);
