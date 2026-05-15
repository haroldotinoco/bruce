-- Add cross-system traceability IDs to workflow runs.

ALTER TABLE observability.workflow_runs
  ADD COLUMN IF NOT EXISTS correlation_id TEXT;

CREATE INDEX IF NOT EXISTS idx_workflow_runs_correlation
  ON observability.workflow_runs(correlation_id);

INSERT INTO migrations (name) VALUES ('007_observability_traceability') ON CONFLICT (name) DO NOTHING;
