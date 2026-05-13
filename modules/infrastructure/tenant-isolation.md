# Tenant Isolation Strategy

## Overview

BruceAI is a multi-tenant SaaS. Every account is completely isolated at the database, cache, and storage layers. A user should never see another account's data, even by accident.

**Core principle:** Every piece of data is tagged with `account_id`. Every query filters by `account_id`. No exceptions.

---

## Database Layer: PostgreSQL (Neon)

### Strategy: Row-Level Security (RLS)

Row-Level Security is a PostgreSQL feature that automatically filters rows based on user context. Every table has an RLS policy that enforces `account_id` matching.

### Implementation

#### 1. Set Account Context on Every Request

In your NestJS middleware, set the current account ID as a session variable:

```typescript
// packages/auth/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private db: DatabaseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = req.user; // from Clerk JWT
    const accountId = user.organizationId; // Clerk org = BruceAI account

    // Set session variable for RLS
    await this.db.query(
      "SET app.current_account_id = $1",
      [accountId]
    );

    // Attach to request for logging
    req.accountId = accountId;

    next();
  }
}
```

Apply globally in your app module:
```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
```

#### 2. Create RLS Policies on All Tables

```sql
-- Example: opportunity.scans table
ALTER TABLE opportunity.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY scans_isolation ON opportunity.scans
  USING (account_id = current_setting('app.current_account_id')::UUID);

-- Policy automatically filters:
-- SELECT * FROM opportunity.scans;
-- → Only returns rows where account_id = current session's account

-- All other tables follow the same pattern:
ALTER TABLE opportunity.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY opportunities_isolation ON opportunity.opportunities
  USING (account_id = current_setting('app.current_account_id')::UUID);

ALTER TABLE opportunity.competitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY competitors_isolation ON opportunity.competitors
  USING (account_id = current_setting('app.current_account_id')::UUID);

-- ... repeat for all tables in all schemas
```

**Important:** RLS applies to ALL queries, including:
- `SELECT` (filtered rows)
- `UPDATE` (can't update other account's rows)
- `DELETE` (can't delete other account's rows)
- `INSERT` with RETURNING (automatically inserts with current account_id)

#### 3. Enforce account_id in Schema

Every table **must** have:
```sql
account_id UUID NOT NULL REFERENCES accounts(id)
```

Never allow NULL account_id. This prevents data orphaning.

#### 4. Create Composite Indexes

Performance is critical. Every query filters by account_id. Index accordingly:

```sql
-- Primary pattern: (account_id, created_at DESC)
CREATE INDEX idx_scans_account_created ON opportunity.scans(account_id, created_at DESC);
CREATE INDEX idx_opportunities_account_relevance ON opportunity.opportunities(account_id, relevance_score DESC);
CREATE INDEX idx_jobs_account_status ON jobs(account_id, status);

-- For full-text search:
CREATE INDEX idx_companies_account_search ON venture.companies USING GIN(account_id, search_vector);

-- For bulk operations:
CREATE INDEX idx_usage_account_month ON usage_events(account_id, date_trunc('month', created_at));
```

### Verification

To verify RLS is working:

```sql
-- Set to account 1
SET app.current_account_id = '12345678-1234-5678-1234-567812345678';
SELECT COUNT(*) FROM opportunity.scans; -- Shows only account 1's scans

-- Set to account 2
SET app.current_account_id = '87654321-4321-8765-4321-876543218765';
SELECT COUNT(*) FROM opportunity.scans; -- Shows only account 2's scans (different count)

-- Try to attack (won't work):
SELECT * FROM opportunity.scans WHERE account_id != current_setting('app.current_account_id')::UUID;
-- Returns 0 rows (RLS filters it out automatically)
```

### No Shared Tables

**Rule:** Never create a table without `account_id` column.

**Bad (DO NOT DO THIS):**
```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY,
  setting_name TEXT,
  value TEXT
);
```

This has no account_id. If you need global settings, use:
```sql
CREATE TABLE account_settings (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id),
  setting_name TEXT,
  value TEXT
);

ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY settings_isolation ON account_settings
  USING (account_id = current_setting('app.current_account_id')::UUID);
```

---

## Cache Layer: Upstash Redis

### Strategy: Key Prefix Enforcement

Redis has no built-in RLS. Isolation is enforced via **naming conventions**. Every key must start with `{account_id}:`.

### Implementation

#### 1. Key Naming Convention

```
{account_id}:{module}:{resource}:{identifier}:{property}

Examples:
12345678:opp:scan:scan-uuid:state          // Opportunity scan state
12345678:brand:job:brand-uuid:stage        // Brand job stage
12345678:build:cache:build-uuid:progress   // Build progress
12345678:company:data:company-id:full      // Company cache
12345678:rate:api                          // API rate limit
12345678:limits:check                      // Plan usage counter
```

#### 2. Enforce in Code

Create a helper to ensure consistency:

```typescript
// packages/cache/redis.utils.ts
export class RedisKeyBuilder {
  static accountKey(
    accountId: string,
    module: string,
    resource: string,
    identifier: string,
    property: string
  ): string {
    return `${accountId}:${module}:${resource}:${identifier}:${property}`;
  }

  static opportunityState(accountId: string, scanId: string) {
    return this.accountKey(accountId, 'opp', 'scan', scanId, 'state');
  }

  static brandStage(accountId: string, brandId: string) {
    return this.accountKey(accountId, 'brand', 'job', brandId, 'stage');
  }

  // Add more helpers for each module
}

// Usage:
const key = RedisKeyBuilder.opportunityState(accountId, scanId);
await redis.set(key, JSON.stringify(state), 'EX', 86400); // 24h TTL

// Never do this:
// await redis.set(`scan:${scanId}:state`, ...); // WRONG - no account_id
```

#### 3. Enforce at Query Time

```typescript
// In your Redis wrapper, validate before every operation
async set(key: string, value: any, ...args: any[]) {
  if (!key.startsWith(this.accountId)) {
    throw new Error(
      `Key "${key}" doesn't start with account prefix "${this.accountId}:"`
    );
  }
  return this.redis.set(key, value, ...args);
}

async get(key: string) {
  if (!key.startsWith(this.accountId)) {
    throw new Error(
      `Key "${key}" doesn't start with account prefix "${this.accountId}:"`
    );
  }
  return this.redis.get(key);
}
```

#### 4. Upstash ACL (Additional Security Layer)

Upstash supports fine-grained ACLs. Create a separate token per environment:

```bash
# Production token (read/write to prod account only)
UPSTASH_REDIS_TOKEN_PROD=<token that can only access prod keys>

# Staging token
UPSTASH_REDIS_TOKEN_STAGING=<token that can only access staging keys>

# This prevents accidental staging data bleed into production
```

### No Shared Keys

**Rule:** No key without `{account_id}:` prefix.

**Bad (DO NOT DO THIS):**
```javascript
await redis.set('global_config', {...}); // NO - shared across all accounts
await redis.get('all_users_count');      // NO - leaks usage data
```

**Good:**
```javascript
await redis.set(`${accountId}:config`, {...});
await redis.get(`${accountId}:usage:count`);
```

### TTL Policy

Every ephemeral key has a TTL. No key lives forever in Redis (unless explicitly needed):

```typescript
// Short-lived: job progress, in-flight state (24-48h)
await redis.set(progressKey, progress, 'EX', 86400);

// Medium-lived: scan results, brand cache (6-12h)
await redis.set(cacheKey, results, 'EX', 43200);

// Monthly: plan limits (reset at month boundary)
await redis.set(limitKey, count, 'EXAT', nextMonthTimestamp);

// Long-lived: rate limit counters (1 minute)
await redis.set(rateLimitKey, count, 'EX', 60);

// Never use PERSIST (no TTL)
// Every key must have a TTL
```

---

## Object Storage: Cloudflare R2

### Strategy: Path Prefix Enforcement

All objects must be stored under `{account_id}/` path. Downloads must use signed URLs with expiry.

### Implementation

#### 1. Bucket Structure

```
bruceai-assets/
  account-1/
    opportunity/
      scan-uuid/
        research-raw.json
        ranked-opportunities.json
    brand-aid/
      brand-uuid/
        brand-strategy.json
        logo.svg
    ...
  account-2/
    opportunity/
      scan-uuid/
        ...
```

#### 2. Upload with Account Prefix

```typescript
// packages/storage/r2.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class R2Service {
  async uploadArtifact(
    accountId: string,
    module: string,
    jobId: string,
    filename: string,
    content: Buffer
  ): Promise<string> {
    const key = `${accountId}/${module}/${jobId}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: 'bruceai-assets',
      Key: key,
      Body: content,
      Metadata: {
        'account-id': accountId, // Metadata for audit
      },
    });

    await this.s3Client.send(command);
    return key; // Store path in database
  }

  async getSignedUrl(
    accountId: string,
    objectKey: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<string> {
    // Verify the key belongs to this account
    if (!objectKey.startsWith(`${accountId}/`)) {
      throw new Error('Unauthorized: Cannot access this object');
    }

    const command = new GetObjectCommand({
      Bucket: 'bruceai-assets',
      Key: objectKey,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }
}
```

#### 3. Download with Signed URLs

```typescript
// In your API endpoint
export class ArtifactController {
  async downloadArtifact(
    @Param('jobId') jobId: string,
    @User() user: UserPayload
  ) {
    const job = await this.db.query(
      `SELECT artifact_path FROM jobs
       WHERE id = $1 AND account_id = $2`,
      [jobId, user.accountId]
    );

    if (!job) throw new NotFoundException();

    const signedUrl = await this.r2.getSignedUrl(
      user.accountId,
      job.artifact_path,
      3600 // 1 hour expiry
    );

    return { download_url: signedUrl };
  }
}
```

**Never return the raw S3 path.** Always use signed URLs with expiry (default 1 hour).

#### 4. Lifecycle Rules

Auto-delete old artifacts after 30 days:

```bash
# In Cloudflare R2 bucket settings
Lifecycle Rule:
  Prefix: * (all objects)
  Expiration: 30 days after upload
```

This keeps costs low and satisfies data retention policies.

#### 5. CORS Configuration

If you serve artifacts directly to browsers (PDF view, image preview):

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://app.bruceai.app", "https://staging.bruceai.app"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### Verification

To verify account isolation in R2:

```bash
# List all objects for account-1 (using AWS CLI)
aws s3 ls s3://bruceai-assets/account-1/ --recursive --endpoint-url https://r2.account.com

# Try to list account-2 (should work via direct listing)
aws s3 ls s3://bruceai-assets/account-2/ --recursive --endpoint-url https://r2.account.com

# But unauthenticated download attempts fail (no signed URL = 403)
curl https://bruceai-assets.r2.account.com/account-1/opportunity/scan-1/data.json
# → 403 Forbidden (not signed)
```

---

## Vector Database: Qdrant

### Strategy: Metadata Filtering

Qdrant supports filtering on metadata. Every vector includes `account_id` metadata. All queries filter by account_id automatically.

### Implementation

#### 1. Store Vectors with Account Metadata

```typescript
// packages/vector-db/qdrant.service.ts
import { QdrantClient } from '@qdrant/js-client-rest';

export class QdrantService {
  async upsertVector(
    accountId: string,
    collection: string,
    pointId: string,
    vector: number[],
    payload: Record<string, any>
  ): Promise<void> {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    await client.upsert(collection, {
      points: [
        {
          id: pointId,
          vector: vector,
          payload: {
            account_id: accountId, // Required metadata
            ...payload,
          },
        },
      ],
    });
  }
}
```

#### 2. Query with Account Filter

```typescript
async search(
  accountId: string,
  collection: string,
  query: number[],
  limit: number = 10
): Promise<any[]> {
  const results = await this.qdrant.search(collection, {
    vector: query,
    limit: limit,
    filter: {
      must: [
        {
          key: 'account_id',
          match: {
            value: accountId,
          },
        },
      ],
    },
  });

  return results;
}
```

**Important:** Always include `filter` with account_id. Never do:
```typescript
// BAD - returns results from all accounts
await qdrant.search(collection, { vector: query, limit: 10 });
```

#### 3. Collection Structure

One collection per module, filter by account:

```typescript
// collections:
// - opportunity-scans (all accounts' opportunity vectors)
// - brand-intelligence (all accounts' brand vectors)
// - venture-intelligence (all accounts' venture vectors)
// - health-metrics (all accounts' health vectors)
// - pattern-analysis (all accounts' pattern vectors)
// - learning (all accounts' learning vectors)
// - bruce-memory (all accounts' intelligence vectors)

// When querying:
const results = await qdrant.search('opportunity-scans', {
  vector: queryVector,
  filter: { must: [{ key: 'account_id', match: { value: accountId } }] },
});
```

#### 4. No Cross-Account Vector Mixing

**Rule:** A vector's account_id is immutable. Never query without filtering.

**Bad (DO NOT DO THIS):**
```typescript
// Returns top 10 similar vectors from ALL accounts (privacy violation)
const results = await qdrant.search(collection, { vector: query, limit: 10 });
```

**Good:**
```typescript
// Returns top 10 similar vectors for THIS account only
const results = await qdrant.search(collection, {
  vector: query,
  limit: 10,
  filter: { must: [{ key: 'account_id', match: { value: accountId } }] },
});
```

---

## Workflow Orchestration: Temporal.io

### Strategy: Namespaces and Workflow IDs

Temporal uses namespaces and workflow IDs. Enforce account isolation via naming.

### Implementation

#### 1. Workflow ID Encoding

Every workflow includes the account ID:

```typescript
// Workflow ID format: {account_id}-{module}-{job_id}
const workflowId = `${accountId}-opportunity-${scanId}`;

const handle = await client.start(opportunityWorkflow, {
  taskQueue: 'opportunity-tasks',
  workflowId: workflowId,
  args: [{ accountId, scanId }],
});
```

#### 2. Query Workflows by Account

```typescript
// List only workflows for this account
const accountWorkflows = await client.listWorkflows({
  query: `WorkflowId STARTS_WITH '${accountId}-'`,
});
```

#### 3. Task Queue Isolation (Optional)

Create separate task queues per module (not per account, but good for scaling):

```typescript
// Task queues:
export const TASK_QUEUES = {
  OPPORTUNITY: 'opportunity-tasks',
  BRAND: 'brand-tasks',
  BUILDER: 'builder-tasks',
  HEALTH: 'health-tasks',
};

// Workers subscribe to module-specific queues
const worker = await Worker.create({
  workflowsPath: require.resolve('./workflows'),
  activitiesPath: require.resolve('./activities'),
  taskQueue: TASK_QUEUES.OPPORTUNITY,
});
```

#### 4. Secure Activity Execution

Activities must validate account_id:

```typescript
export const opportunityActivities = {
  async runMarketResearch(
    accountId: string,
    scanId: string
  ): Promise<any> {
    // Validate account has access to this scan
    const scan = await db.query(
      `SELECT * FROM opportunity.scans
       WHERE id = $1 AND account_id = $2`,
      [scanId, accountId]
    );

    if (!scan) throw new Error('Unauthorized or not found');

    // Proceed with research
    return runResearch(scan);
  },
};
```

---

## Cross-Layer Isolation Verification

### Audit Checklist

- [ ] Every table has `account_id UUID NOT NULL` column
- [ ] Every table has RLS enabled with `account_id` policy
- [ ] Every Redis key starts with `{account_id}:`
- [ ] Every R2 object path starts with `{account_id}/`
- [ ] Every Qdrant query filters by account_id metadata
- [ ] Every Temporal workflow ID encodes account_id
- [ ] Middleware sets `app.current_account_id` on every request
- [ ] All API endpoints validate user.organizationId matches request data

### Testing Tenant Isolation

```typescript
// test/isolation.e2e.ts
describe('Tenant Isolation', () => {
  it('Account A cannot see Account B scans', async () => {
    // Create scan for account A
    const scanA = await db.query(
      `INSERT INTO opportunity.scans (account_id, name)
       VALUES ($1, 'Scan A') RETURNING id`,
      [accountIdA]
    );

    // Set session to account B
    await db.query("SET app.current_account_id = $1", [accountIdB]);

    // Try to query as account B
    const result = await db.query(`SELECT * FROM opportunity.scans WHERE id = $1`, [scanA.id]);

    // Should return empty (RLS blocks it)
    expect(result).toHaveLength(0);
  });

  it('Redis key from Account A is inaccessible from Account B', async () => {
    const keyA = `${accountIdA}:opp:scan:123:state`;
    await redisA.set(keyA, 'state');

    // Try to access as account B
    const connection_B = redis.client(accountIdB);
    const valueB = await connection_B.get(keyA);

    // Key exists, but code prevents access due to prefix
    // (Redis itself doesn't block, but our wrapper does)
    expect(() => connection_B.get(keyA)).toThrow('Key doesn't match account prefix');
  });
});
```

---

## Emergency Procedures

### If Data Leak Is Suspected

1. **Stop all writes immediately**
   ```sql
   -- Disable all INSERT/UPDATE/DELETE
   REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM app_user;
   ```

2. **Audit logs**
   ```sql
   -- Check what was accessed when
   SELECT * FROM pg_stat_statements ORDER BY query_start DESC;
   ```

3. **Restore from backup**
   ```bash
   # Neon has automatic daily backups
   # Restore from checkpoint to point-before-incident
   ```

4. **Review RLS policies**
   ```sql
   -- Verify all tables have correct policies
   SELECT table_name, count(*) as policy_count
   FROM information_schema.tables t
   LEFT JOIN pg_policies p ON p.tablename = t.table_name
   WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
   GROUP BY table_name
   HAVING count(*) = 0;  -- Tables with NO policies (red flag)
   ```

---

## Summary

**Database:** Row-Level Security filters all queries by account_id automatically. One policy per table.

**Cache:** Key prefix enforcement via code validation. No key without `{account_id}:` prefix.

**Storage:** Path prefix enforcement. All downloads via signed URLs with expiry.

**Vectors:** Metadata filtering on all queries. All searches filter by account_id.

**Workflows:** Workflow IDs encode account_id. Activity validation on execution.

**No shared data.** No cross-account queries. No exceptions. Every layer enforces isolation. Every request validates account ownership. Ship with confidence.
