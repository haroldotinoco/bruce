-- Opportunity: text account ids (Clerk org) + scans table for persisted workflow results

DROP POLICY IF EXISTS opportunity_opportunities_policy ON opportunity.opportunities;
DROP POLICY IF EXISTS opportunity_analysis_results_policy ON opportunity.analysis_results;

ALTER TABLE opportunity.opportunities
  ALTER COLUMN account_id TYPE TEXT USING account_id::text;

ALTER TABLE opportunity.analysis_results
  ALTER COLUMN account_id TYPE TEXT USING account_id::text;

CREATE POLICY opportunity_opportunities_policy ON opportunity.opportunities
  FOR ALL
  USING (account_id = current_setting('app.current_account_id', true))
  WITH CHECK (account_id = current_setting('app.current_account_id', true));

CREATE POLICY opportunity_analysis_results_policy ON opportunity.analysis_results
  FOR ALL
  USING (account_id = current_setting('app.current_account_id', true))
  WITH CHECK (account_id = current_setting('app.current_account_id', true));

CREATE TABLE IF NOT EXISTS opportunity.scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id TEXT NOT NULL,
  venture_id UUID,
  temporal_workflow_id TEXT,
  themes JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'running',
  result_json JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_opportunity_scans_account_id ON opportunity.scans(account_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_scans_created_at ON opportunity.scans(created_at DESC);

ALTER TABLE opportunity.scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS opportunity_scans_policy ON opportunity.scans;
CREATE POLICY opportunity_scans_policy ON opportunity.scans
  FOR ALL
  USING (account_id = current_setting('app.current_account_id', true))
  WITH CHECK (account_id = current_setting('app.current_account_id', true));

INSERT INTO migrations (name) VALUES ('003_opportunity_multitenancy_scans') ON CONFLICT (name) DO NOTHING;
