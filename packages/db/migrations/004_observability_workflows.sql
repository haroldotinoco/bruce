-- Universal observability tables for structured workflow / step / log state.
-- Used by every Bruce module to back the dashboard's workflow-detail view.

CREATE SCHEMA IF NOT EXISTS observability;

CREATE TABLE IF NOT EXISTS observability.workflow_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module TEXT NOT NULL,
    workflow_type TEXT,
    temporal_workflow_id TEXT,
    account_id TEXT NOT NULL,
    venture_id UUID,
    status TEXT NOT NULL DEFAULT 'queued',
    title TEXT NOT NULL,
    subtitle TEXT,
    progress DOUBLE PRECISION NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    result_json JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_account ON observability.workflow_runs(account_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_module ON observability.workflow_runs(module);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON observability.workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_started_at ON observability.workflow_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_temporal ON observability.workflow_runs(temporal_workflow_id);

CREATE TABLE IF NOT EXISTS observability.workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES observability.workflow_runs(id) ON DELETE CASCADE,
    parent_step_id UUID REFERENCES observability.workflow_steps(id) ON DELETE CASCADE,
    seq INTEGER NOT NULL DEFAULT 0,
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    duration_ms INTEGER,
    progress_fraction DOUBLE PRECISION,
    attempt_current INTEGER,
    attempt_max INTEGER,
    attempt_reason TEXT,
    quality_gate_json JSONB,
    fields_json JSONB,
    agent_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_run ON observability.workflow_steps(run_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_parent ON observability.workflow_steps(parent_step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_run_started ON observability.workflow_steps(run_id, started_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_steps_run_parent_key
    ON observability.workflow_steps(run_id, COALESCE(parent_step_id, '00000000-0000-0000-0000-000000000000'::uuid), key);

CREATE TABLE IF NOT EXISTS observability.step_log_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_id UUID NOT NULL REFERENCES observability.workflow_steps(id) ON DELETE CASCADE,
    run_id UUID NOT NULL REFERENCES observability.workflow_runs(id) ON DELETE CASCADE,
    at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    level TEXT NOT NULL,
    message TEXT,
    fields_json JSONB,
    agent_id TEXT,
    attempt INTEGER
);

CREATE INDEX IF NOT EXISTS idx_step_log_entries_step_at ON observability.step_log_entries(step_id, at);
CREATE INDEX IF NOT EXISTS idx_step_log_entries_run_at ON observability.step_log_entries(run_id, at);

ALTER TABLE observability.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE observability.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE observability.step_log_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS observability_workflow_runs_policy ON observability.workflow_runs;
CREATE POLICY observability_workflow_runs_policy ON observability.workflow_runs
    FOR ALL
    USING (account_id = current_setting('app.current_account_id', true))
    WITH CHECK (account_id = current_setting('app.current_account_id', true));

DROP POLICY IF EXISTS observability_workflow_steps_policy ON observability.workflow_steps;
CREATE POLICY observability_workflow_steps_policy ON observability.workflow_steps
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM observability.workflow_runs r
        WHERE r.id = run_id
          AND r.account_id = current_setting('app.current_account_id', true)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM observability.workflow_runs r
        WHERE r.id = run_id
          AND r.account_id = current_setting('app.current_account_id', true)
      )
    );

DROP POLICY IF EXISTS observability_step_log_entries_policy ON observability.step_log_entries;
CREATE POLICY observability_step_log_entries_policy ON observability.step_log_entries
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM observability.workflow_runs r
        WHERE r.id = run_id
          AND r.account_id = current_setting('app.current_account_id', true)
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM observability.workflow_runs r
        WHERE r.id = run_id
          AND r.account_id = current_setting('app.current_account_id', true)
      )
    );

INSERT INTO migrations (name) VALUES ('004_observability_workflows') ON CONFLICT (name) DO NOTHING;
