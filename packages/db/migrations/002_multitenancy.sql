-- Phase 5: Clerk orgs, tenant-scoped RLS using app.current_account_id (text = Clerk org id)

-- Organizations synced from Clerk (org id is TEXT e.g. org_xxx)
CREATE TABLE IF NOT EXISTS bruce_core.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON bruce_core.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON bruce_core.organizations(status);

-- Webhook / service upsert without relying on RLS session context
CREATE OR REPLACE FUNCTION bruce_core.upsert_organization_from_clerk(
  p_id TEXT,
  p_name TEXT,
  p_slug TEXT,
  p_plan TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = bruce_core, public
AS $$
BEGIN
  INSERT INTO bruce_core.organizations (id, name, slug, plan, updated_at)
  VALUES (p_id, p_name, p_slug, COALESCE(NULLIF(TRIM(p_plan), ''), 'free'), CURRENT_TIMESTAMP)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    plan = COALESCE(NULLIF(EXCLUDED.plan, ''), bruce_core.organizations.plan),
    updated_at = CURRENT_TIMESTAMP;
END;
$$;

CREATE OR REPLACE FUNCTION bruce_core.soft_delete_organization_from_clerk(p_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = bruce_core, public
AS $$
BEGIN
  UPDATE bruce_core.organizations
  SET status = 'deleted',
      deleted_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_id;
END;
$$;

-- Ventures: store Clerk org id as text (session variable matches).
-- Must drop RLS policies that reference account_id before ALTER TYPE (PostgreSQL).
DROP POLICY IF EXISTS bruce_core_ventures_policy ON bruce_core.ventures;

ALTER TABLE bruce_core.ventures
  ALTER COLUMN account_id TYPE TEXT USING account_id::text;

CREATE POLICY bruce_core_ventures_select ON bruce_core.ventures
  FOR SELECT
  USING (account_id = current_setting('app.current_account_id', true));

CREATE POLICY bruce_core_ventures_insert ON bruce_core.ventures
  FOR INSERT
  WITH CHECK (account_id = current_setting('app.current_account_id', true));

CREATE POLICY bruce_core_ventures_update ON bruce_core.ventures
  FOR UPDATE
  USING (account_id = current_setting('app.current_account_id', true))
  WITH CHECK (account_id = current_setting('app.current_account_id', true));

CREATE POLICY bruce_core_ventures_delete ON bruce_core.ventures
  FOR DELETE
  USING (account_id = current_setting('app.current_account_id', true));

ALTER TABLE bruce_core.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY bruce_core_organizations_select ON bruce_core.organizations
  FOR SELECT
  USING (id = current_setting('app.current_account_id', true));

CREATE POLICY bruce_core_organizations_update ON bruce_core.organizations
  FOR UPDATE
  USING (id = current_setting('app.current_account_id', true))
  WITH CHECK (id = current_setting('app.current_account_id', true));

INSERT INTO migrations (name) VALUES ('002_multitenancy') ON CONFLICT (name) DO NOTHING;
