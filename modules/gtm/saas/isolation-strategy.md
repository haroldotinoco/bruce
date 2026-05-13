# GTM Module Tenant Isolation Strategy

The GTM module enforces strict multi-tenant isolation for campaign data, analytics, ad account credentials, and growth experiment results. No customer data, campaign performance metrics, or external API credentials leak across accounts.

## Database Layer (PostgreSQL + Neon RLS)

All GTM data is partitioned by `account_id` and `venture_id`:

**Tables:**
- `gtm.strategies` — GTM strategy documents with `account_id`, `venture_id` partition keys
- `gtm.campaigns` — campaign definitions, timelines, and metadata with `account_id`, `venture_id`
- `gtm.campaign_analytics` — performance metrics (impressions, clicks, conversions) with `account_id`, `venture_id`
- `gtm.channels` — channel configurations (credentials, quotas, settings) with `account_id`, `venture_id`
- `gtm.experiments` — A/B tests and growth experiments with `account_id`, `venture_id`
- `gtm.analytics_webhooks` — webhook configurations for inbound analytics events
- `gtm.external_credentials` — encrypted ad platform credentials (Google Ads, Facebook, LinkedIn)

**Row-Level Security (RLS):**
```sql
CREATE POLICY strategy_isolation ON gtm.strategies
  USING (account_id = current_setting('app.current_account_id')::text
    AND venture_id = current_setting('app.current_venture_id')::text);

CREATE POLICY campaign_isolation ON gtm.campaigns
  USING (account_id = current_setting('app.current_account_id')::text
    AND venture_id = current_setting('app.current_venture_id')::text);

CREATE POLICY campaign_analytics_isolation ON gtm.campaign_analytics
  USING (account_id = current_setting('app.current_account_id')::text
    AND venture_id = current_setting('app.current_venture_id')::text);

CREATE POLICY channels_isolation ON gtm.channels
  USING (account_id = current_setting('app.current_account_id')::text
    AND venture_id = current_setting('app.current_venture_id')::text);

CREATE POLICY experiment_isolation ON gtm.experiments
  USING (account_id = current_setting('app.current_account_id')::text
    AND venture_id = current_setting('app.current_venture_id')::text);

CREATE POLICY credential_isolation ON gtm.external_credentials
  USING (account_id = current_setting('app.current_account_id')::text);
```

Before each request, the application sets both context variables:
```sql
SET app.current_account_id = '{account_id}';
SET app.current_venture_id = '{venture_id}';
```

This prevents any query from returning cross-account or cross-venture data, even if a query lacks explicit filtering.

## Temporal Workflow Isolation

Campaign execution workflows (launch, pause, resume, conclude) are isolated per-account per-venture:

```typescript
// Each venture has its own Temporal namespace
const workflowNamespace = `gtm:${account_id}:${venture_id}`;

// Campaign launch workflow
const campaignWorkflow = await client.workflow.start(CampaignLifecycleWorkflow, {
  taskQueue: 'gtm-campaigns',
  workflowId: `campaign:${campaign_id}`,
  namespace: workflowNamespace,
  input: {
    account_id,
    venture_id,
    campaign_id,
    scheduled_start: new Date('2026-04-15')
  }
});

// No workflow from account A can access or observe workflows from account B
```

Campaign state transitions and event emissions (e.g., `campaign.launched`, `campaign.paused`) are scoped to the account/venture namespace, preventing cross-account workflow interference.

## Redis Cache Isolation

All cache keys are namespaced by both account_id and venture_id:

```
{account_id}:{venture_id}:gtm:campaign:{campaign_id}:{field}
{account_id}:{venture_id}:gtm:channel:{channel_id}:{field}
{account_id}:{venture_id}:gtm:analytics:{period}
{account_id}:{venture_id}:gtm:experiment:{experiment_id}:{field}

Examples:
- org_abc123:venture_xyz:gtm:campaign:camp_001:status
- org_abc123:venture_xyz:gtm:campaign:camp_001:performance
- org_abc123:venture_xyz:gtm:channel:channel_email:spend_today
- org_abc123:venture_xyz:gtm:analytics:2026-04
- org_abc123:venture_xyz:gtm:experiment:exp_001:results
```

When retrieving a cache key, the application validates that the key prefix matches the requesting account and venture before returning data:

```typescript
const getCachedCampaign = async (account_id: string, venture_id: string, campaign_id: string) => {
  const key = `${account_id}:${venture_id}:gtm:campaign:${campaign_id}:status`;
  const data = await redis.get(key);

  if (!data) return null;

  // Double-check account_id and venture_id match
  if (!key.startsWith(`${account_id}:${venture_id}:`)) {
    throw new UnauthorizedError('Cache key account/venture mismatch');
  }

  return JSON.parse(data);
};
```

## Cross-Module Event Isolation

The GTM module receives events from other modules and publishes events to downstream consumers:

**Inbound Events (GTM consumes):**
- `brand-aid.brand_identity.created` — triggers GTM strategy onboarding
- `startup-ops.venture.created` — triggers GTM module activation for new ventures
- `add-venture.venture.activated` — triggers channel assessment workflow

All event processing includes account_id and venture_id validation:

```typescript
// Event listener with isolation check
eventEmitter.on('brand-aid.brand_identity.created', async (event) => {
  const { account_id, venture_id, brand_id } = event.data;

  // Verify account context
  if (event.account_id !== account_id) {
    throw new Error('Event account mismatch');
  }

  // Verify venture context
  if (event.venture_id !== venture_id) {
    throw new Error('Event venture mismatch');
  }

  // Safe to process
  await initializeGTMStrategy({ account_id, venture_id, brand_id });
});
```

**Outbound Events (GTM publishes):**
- `gtm.campaign.launched` — consumed by portfolio, analytics services
- `gtm.campaign.paused` — consumed by portfolio
- `gtm.report.generated` — consumed by portfolio, startup-ops
- `gtm.experiment.completed` — consumed by portfolio, analytics services

All published events include account_id and venture_id headers:

```typescript
const publishCampaignLaunchedEvent = async (campaign) => {
  await eventBus.publish({
    event_type: 'gtm.campaign.launched',
    account_id: campaign.account_id,
    venture_id: campaign.venture_id,
    data: {
      campaign_id: campaign.id,
      campaign_name: campaign.name,
      launched_at: new Date(),
      channels: campaign.channels
    },
    timestamp: Date.now()
  });
};
```

Downstream consumers validate account_id and venture_id before processing GTM events, preventing cross-account data contamination.

## External API Isolation (Ad Platforms & Analytics)

Ad platform credentials (Google Ads, Facebook Ads, LinkedIn Ads) and analytics platform tokens (Google Analytics, HubSpot) are stored encrypted in the database:

**Credential Storage:**
```typescript
// Encrypt credentials before storage
const encryptedCredential = await crypto.encrypt(
  JSON.stringify({
    platform: 'google_ads',
    customer_id: 'xxxx-xxxx-xxxx',
    access_token: 'gads_...',
    refresh_token: 'gads_refresh_...'
  }),
  masterKey
);

await db.query(
  `INSERT INTO gtm.external_credentials
   (account_id, venture_id, platform, encrypted_data, created_at)
   VALUES ($1, $2, $3, $4, NOW())`,
  [account_id, venture_id, 'google_ads', encryptedCredential]
);
```

**Credential Retrieval with Isolation Check:**
```typescript
const getAdPlatformCredential = async (account_id: string, venture_id: string, platform: string) => {
  const row = await db.query(
    `SELECT encrypted_data FROM gtm.external_credentials
     WHERE account_id = $1 AND venture_id = $2 AND platform = $3`,
    [account_id, venture_id, platform]
  );

  if (!row) throw new Error('Credentials not found');

  const decrypted = await crypto.decrypt(row.encrypted_data, masterKey);
  return JSON.parse(decrypted);
};
```

**API Call Isolation:**
Each API call to ad platforms includes only that venture's credentials and account context:

```typescript
const launchCampaignOnGoogleAds = async (account_id: string, venture_id: string, campaign) => {
  // Fetch only this venture's Google Ads credential
  const credential = await getAdPlatformCredential(account_id, venture_id, 'google_ads');

  // Initialize client with venture-specific token
  const client = new GoogleAdsClient({
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    login_customer_id: credential.customer_id,
    refresh_token: credential.refresh_token
  });

  // Launch campaign (isolated to this venture's ad account)
  const result = await client.campaigns.create({
    parent: credential.customer_id,
    campaign: {
      name: campaign.name,
      status: 'ENABLED',
      advertising_channel_type: 'SEARCH'
    }
  });

  // Record the external campaign ID scoped to this venture
  await db.query(
    `INSERT INTO gtm.campaigns (account_id, venture_id, campaign_id, external_campaign_id)
     VALUES ($1, $2, $3, $4)`,
    [account_id, venture_id, campaign.id, result.resource_name]
  );
};
```

**Analytics Webhook Isolation:**
Webhooks from analytics platforms (Google Analytics, HubSpot) are routed to per-venture ingestion endpoints:

```typescript
// Webhook endpoint with account/venture isolation
app.post('/webhooks/analytics/:account_id/:venture_id', async (req, res) => {
  const { account_id, venture_id } = req.params;

  // Verify webhook signature using venture-specific secret
  const secret = await db.query(
    `SELECT webhook_secret FROM gtm.analytics_webhooks
     WHERE account_id = $1 AND venture_id = $2`,
    [account_id, venture_id]
  );

  const signature = req.headers['x-analytics-signature'];
  const expected = crypto
    .createHmac('sha256', secret.webhook_secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (!crypto.timingSafeEqual(signature, expected)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Safe to ingest into venture-specific analytics partition
  await ingestAnalyticsData(account_id, venture_id, req.body);
  res.json({ success: true });
});
```

## API Layer Isolation

Every GTM API endpoint enforces account_id and venture_id extraction from authentication token and URL parameters:

```typescript
// Middleware: extract and verify account_id and venture_id
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'unauthorized' });

  try {
    const decoded = await clerkClient.verifyToken(token);
    req.account_id = decoded.org_id;
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  // Extract venture_id from URL parameter
  const { venture_id } = req.params;
  if (!venture_id) {
    return res.status(400).json({ error: 'venture_id required' });
  }

  // Verify this account owns this venture
  const venture = await db.query(
    'SELECT id FROM ventures WHERE id = $1 AND account_id = $2',
    [venture_id, req.account_id]
  );

  if (!venture) {
    return res.status(403).json({ error: 'venture not found or not owned' });
  }

  req.venture_id = venture_id;

  // Set database context
  await db.query(
    `SET app.current_account_id = $1; SET app.current_venture_id = $2`,
    [req.account_id, venture_id]
  );

  next();
};

// Every route is wrapped with authMiddleware
app.get('/ventures/:venture_id/campaigns', authMiddleware, async (req, res) => {
  const campaigns = await db.query(
    `SELECT * FROM gtm.campaigns
     WHERE account_id = $1 AND venture_id = $2
     ORDER BY created_at DESC`,
    [req.account_id, req.venture_id]
  );
  res.json(campaigns);
});
```

## Usage Tracking & Metering Isolation

Campaign launches, experiment completions, and report generations are tracked per-account per-venture per-month for billing purposes:

```typescript
const recordCampaignLaunch = async (account_id: string, venture_id: string, campaign) => {
  const period = new Date().toISOString().slice(0, 7);  // 'YYYY-MM'

  // Update usage counters
  await db.query(
    `INSERT INTO gtm.usage_tracking (account_id, venture_id, period, campaigns_launched, updated_at)
     VALUES ($1, $2, $3, 1, NOW())
     ON CONFLICT (account_id, venture_id, period)
     DO UPDATE SET campaigns_launched = campaigns_launched + 1, updated_at = NOW()`,
    [account_id, venture_id, period]
  );

  // Emit to Stripe metering
  await stripe.billing.meterEventAdjustment.create({
    event_name: 'gtm_campaigns_launched',
    timestamp: Math.floor(Date.now() / 1000),
    value: 1,
    identifier: account_id  // Stripe customer ID (at org level)
  });

  // Update venture spend tracking
  if (campaign.estimated_monthly_spend) {
    await db.query(
      `UPDATE gtm.venture_spend_tracking
       SET current_month_spend = current_month_spend + $1
       WHERE account_id = $2 AND venture_id = $3 AND period = $4`,
      [campaign.estimated_monthly_spend, account_id, venture_id, period]
    );
  }
};
```

## Runtime Enforcement Checklist

- [ ] All API routes have `authMiddleware` extracting and validating account_id and venture_id
- [ ] Database RLS is enabled on all tables with (account_id, venture_id) composite partition
- [ ] Every query includes `account_id = current_setting('app.current_account_id')` and `venture_id = current_setting('app.current_venture_id')`
- [ ] Temporal workflows are created in account/venture-scoped namespaces
- [ ] Campaign state transitions emit events scoped to namespace
- [ ] Redis keys include `{account_id}:{venture_id}:` prefix
- [ ] External credentials are encrypted and stored with account_id/venture_id partition
- [ ] Each ad platform API call uses only that venture's credentials
- [ ] Analytics webhooks are routed to account/venture-specific endpoints and verified with venture-specific secrets
- [ ] Inbound cross-module events are validated for account_id and venture_id
- [ ] Outbound events include account_id and venture_id headers
- [ ] Usage tracking is aggregated by account/venture per month
- [ ] Spend tracking is maintained per-venture per-month
- [ ] No account_id or venture_id data in error messages returned to clients (generic error messages only)
- [ ] Audit logs include account_id and venture_id for all sensitive operations
- [ ] Rate limiting is per-account per-venture (e.g., 50 campaign launches/day per venture, 100 API calls/min per account)

## Testing Isolation

Before production deployment, verify:

1. **Database Isolation:**
   - Create campaign in venture A
   - Query campaigns from venture B session (should return empty)
   - Verify RLS blocks cross-venture reads

2. **Temporal Workflows:**
   - Launch campaign workflow for venture A
   - Verify venture B cannot access or observe the workflow
   - Verify workflow state is stored in separate namespace

3. **Cache:**
   - Write cache key for venture A
   - Try to read cache as venture B (should fail)

4. **External Credentials:**
   - Store Google Ads credential for venture A
   - Try to retrieve as venture B (should fail)

5. **Analytics Events:**
   - Send webhook to venture A's ingest endpoint
   - Verify analytics data is isolated to venture A partition

6. **API:**
   - Get access token for account A
   - Try to list campaigns from venture B via URL (API should 403 after ownership check)

---

**Contact:** BruceAI GTM Team
**Last Updated:** 2026-04-06
