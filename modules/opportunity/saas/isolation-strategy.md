# Opportunity Module Tenant Isolation Strategy

The Opportunity module enforces strict multi-tenant isolation to ensure no scan results, opportunities, or usage data leaks across accounts.

## Database Layer (PostgreSQL + Neon RLS)

All opportunity data is partitioned by `account_id`:

**Tables:**
- `opportunity.scans` — scan jobs with `account_id` partition key
- `opportunity.opportunities` — discovered opportunities with `account_id`
- `opportunity.usage_tracking` — monthly usage counters with `account_id`
- `opportunity.webhooks` — per-account webhook configurations

**Row-Level Security (RLS):**
```sql
CREATE POLICY scan_isolation ON opportunity.scans
  USING (account_id = current_setting('app.current_account_id')::text);

CREATE POLICY opportunity_isolation ON opportunity.opportunities
  USING (account_id = current_setting('app.current_account_id')::text);

CREATE POLICY usage_isolation ON opportunity.usage_tracking
  USING (account_id = current_setting('app.current_account_id')::text);
```

Before each request, the application sets:
```sql
SET app.current_account_id = '{account_id}';
```

This prevents any query from returning cross-account data, even if a query is written without explicit account filtering.

## Object Storage Isolation (Cloudflare R2)

All scan results are stored in R2 under:
```
s3://bruce-opportunity/{account_id}/scans/{scan_id}/

Examples:
- s3://bruce-opportunity/org_abc123/scans/scan_001/results.json
- s3://bruce-opportunity/org_abc123/scans/scan_001/analysis.pdf
- s3://bruce-opportunity/org_abc123/scans/scan_001/export.csv
```

**Access Control:**
- R2 bucket policy restricts all reads/writes to authenticated requests
- Presigned URLs (signed with account_id) are returned to clients
- Presigned URLs expire after 1 hour (configurable)
- Deletion of objects requires explicit per-account authorization

```typescript
// Generate presigned download URL
const presignedUrl = await r2.getObject({
  bucket: 'bruce-opportunity',
  key: `${account_id}/scans/${scan_id}/results.json`,
  expiresIn: 3600  // 1 hour
});
```

## Redis Cache Isolation

All cache keys are namespaced by account_id:
```
{account_id}:opp:scan:{scan_id}:{field}
{account_id}:opp:opportunity:{opp_id}:{field}
{account_id}:opp:usage:{period}

Examples:
- org_abc123:opp:scan:scan_001:status
- org_abc123:opp:scan:scan_001:progress
- org_abc123:opp:opportunity:opp_xyz:score_breakdown
- org_abc123:opp:usage:2026-04
```

When retrieving a cache key, the application validates that the key prefix matches the requesting account before returning data.

```typescript
// Cache retrieval with isolation check
const getCachedScan = async (account_id: string, scan_id: string) => {
  const key = `${account_id}:opp:scan:${scan_id}:status`;
  const data = await redis.get(key);
  if (!data) return null;

  // Double-check account_id in key matches requester
  if (!key.startsWith(account_id + ':')) {
    throw new UnauthorizedError('Cache key account mismatch');
  }

  return JSON.parse(data);
};
```

## Job Queue Isolation (BullMQ + Upstash)

Scan jobs are queued per-account:
```
bruce-opportunity:scan:{account_id}

Examples:
- bruce-opportunity:scan:org_abc123
- bruce-opportunity:scan:org_xyz789
```

Each account's queue is isolated:
- Workers poll only their authorized queues (verified via service token)
- Job data includes account_id; workers validate it matches their context
- Failed jobs are stored in account-specific dead-letter queues

```typescript
// Enqueue a scan
const scanQueue = new Queue(`bruce-opportunity:scan:${account_id}`, {
  connection: redisClient,
  settings: {
    lockDuration: 30000,
    lockRenewTime: 15000
  }
});

const job = await scanQueue.add(
  'run-scan',
  {
    account_id,
    scan_id: 'scan_001',
    themes: ['AI compliance']
  },
  {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
);
```

## API Layer Isolation

Every API endpoint enforces account_id extraction from authentication token:

```typescript
// Middleware: extract account_id from Clerk token
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'unauthorized' });

  try {
    const decoded = await clerkClient.verifyToken(token);
    req.account_id = decoded.org_id;  // From Clerk organization
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  // Set database context
  await db.query(`SET app.current_account_id = $1`, [req.account_id]);
  next();
};

// Every route is wrapped with authMiddleware
app.get('/scans', authMiddleware, async (req, res) => {
  // req.account_id is guaranteed to be present and verified
  const scans = await db.query(
    'SELECT * FROM opportunity.scans WHERE account_id = $1',
    [req.account_id]
  );
  res.json(scans);
});
```

## Webhook Delivery Isolation

Webhooks are delivered to per-account URLs with HMAC-SHA256 signatures:

```typescript
// Webhook payload
const payload = {
  event: 'scan.completed',
  scan_id: 'scan_001',
  timestamp: Date.now()
};

// Sign with account-specific secret (stored in database)
const secret = await db.query(
  'SELECT webhook_secret FROM opportunity.webhooks WHERE account_id = $1',
  [account_id]
);

const signature = crypto
  .createHmac('sha256', secret.webhook_secret)
  .update(JSON.stringify(payload))
  .digest('hex');

// Send to account's webhook URL
await fetch(account.webhook_url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Opportunity-Signature': signature,
    'X-Opportunity-Timestamp': Date.now()
  },
  body: JSON.stringify(payload)
});
```

Receiving webhooks (client-side):
```typescript
const verifyWebhookSignature = (payload, signature, secret) => {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(signature, expected);
};
```

## Usage Tracking & Metering Isolation

Usage is tracked per-account per-month:

```typescript
// Record a scan completion
const recordScanCompletion = async (account_id: string, scan_id: string) => {
  const period = new Date().toISOString().slice(0, 7);  // 'YYYY-MM'

  await db.query(
    `INSERT INTO opportunity.usage_tracking (account_id, period, scans_run, updated_at)
     VALUES ($1, $2, 1, NOW())
     ON CONFLICT (account_id, period)
     DO UPDATE SET scans_run = scans_run + 1, updated_at = NOW()`,
    [account_id, period]
  );

  // Emit to Stripe metering
  await stripe.billing.meterEventAdjustment.create({
    event_name: 'opportunity_scans',
    timestamp: Math.floor(Date.now() / 1000),
    value: 1,
    identifier: account_id  // Stripe customer ID
  });
};
```

## Runtime Enforcement Checklist

- [ ] All API routes have `authMiddleware` extracting and validating account_id
- [ ] Database RLS is enabled on all tables with account_id partition
- [ ] Every query includes `account_id = current_setting('app.current_account_id')`
- [ ] R2 objects are stored under `{account_id}/` prefix
- [ ] Presigned URLs expire within 1 hour
- [ ] Redis keys include `{account_id}:` prefix
- [ ] BullMQ queues are per-account
- [ ] Webhook secrets are unique and account-specific
- [ ] Usage tracking is aggregated by account per month
- [ ] Stripe metering includes account identifier
- [ ] No account_id data in error messages returned to clients
- [ ] Audit logs include account_id for all sensitive operations
- [ ] Rate limiting is per-account (e.g., 100 requests/min per account)

## Testing Isolation

Before production deployment, verify:

1. **Database Isolation:**
   - Create scan in account A
   - Query scans from account B session (should return empty)
   - Verify RLS blocks cross-account reads

2. **Object Storage:**
   - Upload file to account A's R2 prefix
   - Try to download via presigned URL from account B (should fail)

3. **Cache:**
   - Write cache key for account A
   - Try to read cache as account B (should fail)

4. **Queue:**
   - Enqueue job for account A
   - Verify account B worker cannot pick up the job

5. **Webhooks:**
   - Generate HMAC signature with account A's secret
   - Verify signature fails with account B's secret

6. **API:**
   - Get access token for account A user
   - Try to list scans from account B (API should 401)

---

**Contact:** BruceAI Platform Team
**Last Updated:** 2026-04-06
