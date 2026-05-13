-- OpenRouter model catalog (global, no RLS) + per-request LLM usage telemetry (tenant RLS).

CREATE SCHEMA IF NOT EXISTS platform;

CREATE TABLE IF NOT EXISTS platform.openrouter_models (
    id TEXT PRIMARY KEY,
    canonical_slug TEXT,
    payload JSONB NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_openrouter_models_canonical_slug ON platform.openrouter_models(canonical_slug);
CREATE INDEX IF NOT EXISTS idx_openrouter_models_synced_at ON platform.openrouter_models(synced_at DESC);

CREATE TABLE IF NOT EXISTS observability.llm_usage_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    run_id UUID REFERENCES observability.workflow_runs(id) ON DELETE SET NULL,
    step_id UUID REFERENCES observability.workflow_steps(id) ON DELETE SET NULL,
    module TEXT,
    agent_id TEXT,
    provider TEXT,
    model_id TEXT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    cost_usd DOUBLE PRECISION,
    usage_raw JSONB,
    correlation_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_llm_usage_account_created ON observability.llm_usage_events(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_llm_usage_run_step ON observability.llm_usage_events(run_id, step_id);
CREATE INDEX IF NOT EXISTS idx_llm_usage_module_created ON observability.llm_usage_events(module, created_at DESC);

ALTER TABLE observability.llm_usage_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS observability_llm_usage_events_policy ON observability.llm_usage_events;
CREATE POLICY observability_llm_usage_events_policy ON observability.llm_usage_events
    FOR ALL
    USING (account_id = current_setting('app.current_account_id', true))
    WITH CHECK (account_id = current_setting('app.current_account_id', true));

INSERT INTO migrations (name) VALUES ('005_openrouter_models_llm_usage') ON CONFLICT (name) DO NOTHING;
