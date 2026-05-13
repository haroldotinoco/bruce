# AddVenture Multi-Tenant Data Isolation Strategy

## Overview

AddVenture implements account-based isolation across database, file storage, and cache layers to ensure strict data separation in a low-cost SaaS POC environment.

## Database Layer (PostgreSQL + Neon RLS)

### Table Structure

```sql
CREATE TABLE dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_volume INT,
  progress_percent INT DEFAULT 0,
  brief_summary TEXT,
  critique_score INT,
  iteration_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  webhook_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dossier_volumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(255) NOT NULL,
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  volume_number INT NOT NULL,
  title VARCHAR(255),
  s3_path VARCHAR(512),
  confidence_score INT,
  generated_at TIMESTAMPTZ,
  UNIQUE(dossier_id, volume_number)
);

CREATE TABLE dossier_iterations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(255) NOT NULL,
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  volumes_iterated INT[] NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row-Level Security (RLS)

Enable RLS on all tables and attach policies:

```sql
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossier_volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossier_iterations ENABLE ROW LEVEL SECURITY;

CREATE POLICY dossier_account_isolation ON dossiers
  USING (account_id = current_user_claim('account_id'));

CREATE POLICY volume_account_isolation ON dossier_volumes
  USING (account_id = current_user_claim('account_id'));

CREATE POLICY iteration_account_isolation ON dossier_iterations
  USING (account_id = current_user_claim('account_id'));
```

**Note:** Set `current_user_claim('account_id')` via JWT claims from Clerk middleware.

### Indexing

```sql
CREATE INDEX idx_dossiers_account_id ON dossiers(account_id);
CREATE INDEX idx_dossiers_status ON dossiers(account_id, status);
CREATE INDEX idx_volumes_dossier ON dossier_volumes(dossier_id);
CREATE INDEX idx_iterations_dossier ON dossier_iterations(dossier_id);
```

## File Storage (Cloudflare R2)

### Path Structure

```
s3://addventure-bucket/
├── {account_id}/
│   └── add-venture/
│       └── {dossier_id}/
│           ├── volume-1.json
│           ├── volume-2.json
│           ├── ...
│           ├── volume-8.json
│           ├── dossier-complete.pdf
│           └── metadata.json
```

### Signed URLs

- All download endpoints return **signed URLs** with 1-hour expiry
- URLs are scoped to specific account paths
- No direct bucket access; all reads through API
- Failed CORS checks prevent cross-account access

### Upload Restrictions

- API pre-signs uploads only for `{account_id}/add-venture/*` paths
- Workers/backend validates `account_id` before generating signed upload URLs
- Dossier metadata stored in PostgreSQL; volume content in R2 (too large for DB rows)

## Cache Layer (Redis/Upstash)

### Key Namespacing

All Redis keys prefixed with account context:

```
{account_id}:addventure:{dossier_id}:progress
{account_id}:addventure:{dossier_id}:volumes:[1-8]
{account_id}:addventure:{dossier_id}:metadata
{account_id}:addventure:{dossier_id}:webhook_state
```

### Cache Lifecycle

- Progress updates written to cache during generation
- Volume results cached with 24-hour TTL
- Dossier metadata cached for 1 hour
- Cache is **authoritative during processing**, DB is eventual consistency
- On cache miss, always check DB with account_id filter

### BullMQ Queue Isolation

Job metadata includes `account_id`:

```typescript
const job = await dossierQueue.add('generate', {
  account_id: 'org_12345',
  dossier_id: dossier.id,
  brief: {...},
  options: {...}
}, {
  jobId: `${account_id}:${dossier.id}`
});
```

Workers consume from single queue but filter and validate account_id on each job.

## Network Layer

### API Authentication

- All endpoints require `Authorization: Bearer {jwt}` or `X-API-Key: {key}`
- JWT validated by Clerk middleware; extracts `account_id` claim
- API keys stored hashed in DB, associated with single account_id
- No cross-account API key usage possible

### Request Validation

Every endpoint validates:

```typescript
// Pseudo-code
const { account_id } = req.user; // from Clerk JWT
const { dossier_id } = req.params;

const dossier = await db.query(
  'SELECT * FROM dossiers WHERE id = ? AND account_id = ?',
  [dossier_id, account_id]
);

if (!dossier) throw new NotFoundError(); // 404, not 403
```

## Cost Optimization

### Minimal Compute

- RLS at database level eliminates need for application-level filtering
- Neon free tier sufficient for POC (up to 3 project branches, 5GB storage)
- Upstash Redis: free tier 30MB sufficient for short-lived job state

### Minimal Storage

- Dossier content (JSON) ~100-200KB per volume
- Free R2: 10GB storage, 1M read/write operations/month
- Estimate: 50 dossiers/month = 10-20MB storage

### Query Efficiency

- `account_id` is first filter on every query
- Index on `(account_id, status)` for list operations
- No expensive joins; dossier metadata is denormalized JSONB

## Security Checklist

- [x] Account_id on every record
- [x] RLS policies enforced at database layer
- [x] Signed URLs expire quickly (1 hour)
- [x] No bucket public access
- [x] Cache keys namespaced by account_id
- [x] JWT validation on every request
- [x] API keys single-account
- [x] Error messages don't leak account info (404 vs 403)
- [x] Backup strategy: Neon automated backups, R2 versioning
- [x] Audit logging on dossier creation/iteration (future)

## Testing Data Isolation

```bash
# Test 1: Invalid cross-account dossier access
curl -H "Authorization: Bearer $JWT_ACCOUNT_A" \
  https://api.addventure.bruceai.com/v1/dossiers/dossier_from_account_b

# Expected: 404 (not 200 or 403)

# Test 2: RLS policy bypass attempt
psql addventure_db -c \
  "SELECT * FROM dossiers WHERE account_id != current_user_claim('account_id');"

# Expected: 0 rows (RLS blocks row)

# Test 3: R2 direct URL access without signature
curl https://addventure-bucket.r2.account.com/org_other/add-venture/dossier_123/volume-1.json

# Expected: 403 Forbidden
```

## Migration Path to Prod

1. Enable encryption at rest in Neon (via managed keys or customer-managed if available)
2. Rotate API keys quarterly
3. Enable Neon read replicas for high-traffic accounts
4. Monitor query performance; add indexes as needed
5. Archive old dossiers (>90 days) to cheaper R2 storage class
6. Implement audit logs in separate table for compliance
