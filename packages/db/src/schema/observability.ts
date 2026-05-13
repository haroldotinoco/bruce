import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Universal observability tables — used by every Bruce module to persist
 * the rich step-level state that the dashboard renders (sub-steps, retries,
 * quality gates, typed log entries).
 *
 * Mirrors the contract in @bruce/contracts/observability.
 */
export const observabilitySchema = pgSchema('observability');

export const workflowRuns = observabilitySchema.table(
  'workflow_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    module: text('module').notNull(),
    workflow_type: text('workflow_type'),
    temporal_workflow_id: text('temporal_workflow_id'),
    account_id: text('account_id').notNull(),
    venture_id: uuid('venture_id'),
    status: text('status').notNull().default('queued'),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    progress: doublePrecision('progress').notNull().default(0),
    started_at: timestamp('started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    completed_at: timestamp('completed_at', { withTimezone: true }),
    result_json: jsonb('result_json').$type<unknown>(),
    error_message: text('error_message'),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    accountIdx: index('idx_workflow_runs_account').on(table.account_id),
    moduleIdx: index('idx_workflow_runs_module').on(table.module),
    statusIdx: index('idx_workflow_runs_status').on(table.status),
    startedIdx: index('idx_workflow_runs_started_at').on(table.started_at),
    temporalIdx: index('idx_workflow_runs_temporal').on(
      table.temporal_workflow_id,
    ),
  }),
);

export const workflowSteps = observabilitySchema.table(
  'workflow_steps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    run_id: uuid('run_id')
      .notNull()
      .references(() => workflowRuns.id, { onDelete: 'cascade' }),
    parent_step_id: uuid('parent_step_id').references(
      (): any => workflowSteps.id,
      { onDelete: 'cascade' },
    ),
    seq: integer('seq').notNull().default(0),
    /** Stable per-run key — used for upsert. */
    key: text('key').notNull(),
    label: text('label').notNull(),
    icon: text('icon'),
    description: text('description'),
    status: text('status').notNull().default('pending'),
    started_at: timestamp('started_at', { withTimezone: true }),
    finished_at: timestamp('finished_at', { withTimezone: true }),
    duration_ms: integer('duration_ms'),
    progress_fraction: doublePrecision('progress_fraction'),
    attempt_current: integer('attempt_current'),
    attempt_max: integer('attempt_max'),
    attempt_reason: text('attempt_reason'),
    quality_gate_json: jsonb('quality_gate_json').$type<unknown>(),
    fields_json: jsonb('fields_json').$type<Record<string, unknown>>(),
    agent_ids: text('agent_ids').array().notNull().default([]),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    runIdx: index('idx_workflow_steps_run').on(table.run_id),
    parentIdx: index('idx_workflow_steps_parent').on(table.parent_step_id),
    runStartedIdx: index('idx_workflow_steps_run_started').on(
      table.run_id,
      table.started_at,
    ),
  }),
);

export const stepLogEntries = observabilitySchema.table(
  'step_log_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    step_id: uuid('step_id')
      .notNull()
      .references(() => workflowSteps.id, { onDelete: 'cascade' }),
    run_id: uuid('run_id')
      .notNull()
      .references(() => workflowRuns.id, { onDelete: 'cascade' }),
    at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
    level: text('level').notNull(),
    message: text('message'),
    fields_json: jsonb('fields_json').$type<Record<string, unknown>>(),
    agent_id: text('agent_id'),
    attempt: integer('attempt'),
  },
  (table) => ({
    stepIdx: index('idx_step_log_entries_step_at').on(table.step_id, table.at),
    runIdx: index('idx_step_log_entries_run_at').on(table.run_id, table.at),
  }),
);

/** One row per LLM HTTP completion (tokens + optional cost). */
export const llmUsageEvents = observabilitySchema.table(
  'llm_usage_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    account_id: text('account_id').notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    run_id: uuid('run_id').references(() => workflowRuns.id, { onDelete: 'set null' }),
    step_id: uuid('step_id').references(() => workflowSteps.id, { onDelete: 'set null' }),
    module: text('module'),
    agent_id: text('agent_id'),
    provider: text('provider'),
    model_id: text('model_id'),
    prompt_tokens: integer('prompt_tokens'),
    completion_tokens: integer('completion_tokens'),
    total_tokens: integer('total_tokens'),
    cost_usd: doublePrecision('cost_usd'),
    usage_raw: jsonb('usage_raw').$type<Record<string, unknown>>(),
    correlation_id: text('correlation_id'),
  },
  (table) => ({
    accountCreatedIdx: index('idx_llm_usage_account_created').on(
      table.account_id,
      table.created_at,
    ),
    runStepIdx: index('idx_llm_usage_run_step').on(table.run_id, table.step_id),
    moduleCreatedIdx: index('idx_llm_usage_module_created').on(
      table.module,
      table.created_at,
    ),
  }),
);
