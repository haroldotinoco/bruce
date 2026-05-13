# Opportunity Module Onboarding Flow

New accounts activate the Opportunity API through a standardized setup process.

## Overview

Once a user signs up via Clerk and creates a BruceAI account, they can immediately start using the Opportunity API:

1. Account creation (via bruce-core onboarding)
2. API key generation
3. First scan submission
4. Results retrieval
5. Advance top opportunity to AddVenture

---

## Phase 1: API Key Generation

After account creation, the user must generate an API key to authenticate requests.

**Dashboard Flow:**
User navigates to: `https://app.bruceai.com/settings/api-keys`

**Backend Action (POST /api-keys):**
```typescript
// POST /settings/api-keys
const generateApiKey = async (req, res) => {
  const { account_id } = req.auth;  // From Clerk token

  // Generate a random key (store hashed version)
  const apiKey = generateRandomKey();  // e.g., "opp_sk_live_abc123def456..."
  const hashedKey = hashWithArgon2(apiKey);

  // Store in database
  await db.query(
    `INSERT INTO opportunity.api_keys (account_id, key_hash, created_at, last_used_at)
     VALUES ($1, $2, NOW(), NULL)`,
    [account_id, hashedKey]
  );

  // Return unhashed key (only shown once)
  res.json({
    api_key: apiKey,
    account_id,
    created_at: new Date(),
    message: 'Store this key securely. You will not see it again.'
  });
};
```

**Rate Limits:**
- Max 10 API keys per account
- Old keys can be revoked via DELETE /api-keys/{key_id}

---

## Phase 2: First Scan Submission

User makes their first API call to create a scan.

**Request:**
```bash
curl -X POST https://api.opportunity.bruceai.com/v1/scans \
  -H "Authorization: Bearer opp_sk_live_abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{
    "themes": ["AI compliance automation", "developer tools"],
    "filters": {
      "geography": "global",
      "min_tam_usd": 100000000
    },
    "webhook_url": "https://yourapp.com/webhooks/opportunity"
  }'
```

**Backend Processing:**
```typescript
// POST /v1/scans
const createScan = async (req, res) => {
  const { account_id } = req.auth;
  const { themes, filters, webhook_url } = req.body;

  // Validate request
  if (!themes || themes.length === 0 || themes.length > 5) {
    return res.status(400).json({ error: 'invalid_themes' });
  }

  // Check plan limits
  const account = await db.query(
    'SELECT plan FROM accounts WHERE account_id = $1',
    [account_id]
  );
  const limits = PLAN_LIMITS[account.plan];

  const thisMonth = new Date().toISOString().slice(0, 7);
  const usage = await db.query(
    `SELECT scans_run FROM opportunity.usage_tracking
     WHERE account_id = $1 AND period = $2`,
    [account_id, thisMonth]
  );

  if (usage.rows.length > 0 && usage.rows[0].scans_run >= limits.scans_per_month) {
    return res.status(402).json({
      error: 'plan_limit_reached',
      message: `${account.plan} plan allows ${limits.scans_per_month} scans/month`,
      reset_at: new Date(thisMonth + '-01').setMonth(new Date().getMonth() + 1)
    });
  }

  // Create scan record
  const scanId = generateId('scan');
  await db.query(
    `INSERT INTO opportunity.scans (account_id, scan_id, status, themes, filters, webhook_url, created_at)
     VALUES ($1, $2, 'queued', $3, $4, $5, NOW())`,
    [account_id, scanId, JSON.stringify(themes), JSON.stringify(filters), webhook_url]
  );

  // Cache scan in Redis
  await redis.set(
    `${account_id}:opp:scan:${scanId}:status`,
    'queued',
    'EX',
    86400  // 1 day TTL
  );

  // Enqueue to BullMQ
  const scanQueue = new Queue(`bruce-opportunity:scan:${account_id}`);
  await scanQueue.add(
    'run-scan',
    {
      account_id,
      scan_id: scanId,
      themes,
      filters,
      scan_depth: limits.scan_depth
    },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    }
  );

  // Emit billing event
  await stripe.billing.meterEventAdjustment.create({
    event_name: 'opportunity_scans',
    timestamp: Math.floor(Date.now() / 1000),
    value: 1,
    identifier: account_id
  });

  res.status(202).json({
    id: scanId,
    status: 'queued',
    themes,
    created_at: new Date(),
    estimated_duration_seconds: limits.scan_depth === 'basic' ? 120 : 300
  });
};
```

**Response (202 Accepted):**
```json
{
  "id": "scan_abc123",
  "status": "queued",
  "themes": ["AI compliance automation", "developer tools"],
  "created_at": "2026-04-06T12:00:00Z",
  "estimated_duration_seconds": 300
}
```

**Queue Processing:**

```typescript
// BullMQ worker
const scanQueue = new Queue('bruce-opportunity:scan:' + account_id);

scanQueue.process('run-scan', async (job) => {
  const { account_id, scan_id, themes, filters, scan_depth } = job.data;

  try {
    // Update status
    await db.query(
      `UPDATE opportunity.scans SET status = 'running' WHERE scan_id = $1`,
      [scan_id]
    );
    await redis.set(`${account_id}:opp:scan:${scan_id}:status`, 'running');

    // Run AI analysis (integrate with Claude API or internal LLM)
    const results = await runOpportunityScan({
      themes,
      filters,
      scan_depth,
      account_id
    });

    // Store opportunities in database
    for (const opp of results.opportunities) {
      const oppId = generateId('opp');
      await db.query(
        `INSERT INTO opportunity.opportunities
         (account_id, opportunity_id, scan_id, problem_statement, market_segment, score, tam_estimate_usd, recommendation, key_insights, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [
          account_id,
          oppId,
          scan_id,
          opp.problem_statement,
          opp.market_segment,
          opp.score,
          opp.tam_estimate_usd,
          opp.recommendation,
          JSON.stringify(opp.key_insights)
        ]
      );
    }

    // Save results to R2
    const resultsFile = `${account_id}/scans/${scan_id}/results.json`;
    await r2.putObject({
      bucket: 'bruce-opportunity',
      key: resultsFile,
      body: JSON.stringify(results),
      contentType: 'application/json'
    });

    // Update scan status
    await db.query(
      `UPDATE opportunity.scans SET status = 'completed', opportunities_found = $1, completed_at = NOW()
       WHERE scan_id = $2`,
      [results.opportunities.length, scan_id]
    );
    await redis.set(
      `${account_id}:opp:scan:${scan_id}:status`,
      'completed',
      'EX',
      86400
    );

    // Fire webhook if configured
    if (job.data.webhook_url) {
      await sendWebhook({
        account_id,
        scan_id,
        webhook_url: job.data.webhook_url,
        event: 'scan.completed',
        opportunities_found: results.opportunities.length
      });
    }

    return { success: true, opportunities_found: results.opportunities.length };
  } catch (error) {
    await db.query(
      `UPDATE opportunity.scans SET status = 'failed', error_message = $1 WHERE scan_id = $2`,
      [error.message, scan_id]
    );
    throw error;
  }
});
```

---

## Phase 3: Retrieve Scan Results

User polls for scan status and retrieves opportunities.

**Check Scan Status:**
```bash
curl -X GET https://api.opportunity.bruceai.com/v1/scans/scan_abc123 \
  -H "Authorization: Bearer opp_sk_live_abc123def456..."
```

**Response (while running):**
```json
{
  "id": "scan_abc123",
  "status": "running",
  "themes": ["AI compliance automation", "developer tools"],
  "opportunities_found": null,
  "created_at": "2026-04-06T12:00:00Z",
  "estimated_duration_seconds": 300
}
```

**Response (completed):**
```json
{
  "id": "scan_abc123",
  "status": "completed",
  "themes": ["AI compliance automation", "developer tools"],
  "opportunities_found": 8,
  "created_at": "2026-04-06T12:00:00Z",
  "completed_at": "2026-04-06T12:05:30Z",
  "opportunities": [
    {
      "id": "opp_xyz789",
      "problem_statement": "Developers waste 15-20 hours/week on boilerplate code for compliance workflows",
      "market_segment": "FinTech / RegTech",
      "score": 78,
      "tam_estimate_usd": 2500000000,
      "recommendation": "advance",
      "created_at": "2026-04-06T12:05:00Z"
    },
    {
      "id": "opp_abc456",
      "problem_statement": "AI model operators lack visibility into regulatory requirement changes",
      "market_segment": "AI / Compliance",
      "score": 65,
      "tam_estimate_usd": 800000000,
      "recommendation": "hold",
      "created_at": "2026-04-06T12:05:10Z"
    }
  ]
}
```

**Get Detailed Opportunity:**
```bash
curl -X GET https://api.opportunity.bruceai.com/v1/opportunities/opp_xyz789 \
  -H "Authorization: Bearer opp_sk_live_abc123def456..."
```

**Response:**
```json
{
  "id": "opp_xyz789",
  "problem_statement": "Developers waste 15-20 hours/week on boilerplate code for compliance workflows",
  "market_segment": "FinTech / RegTech",
  "score": 78,
  "tam_estimate_usd": 2500000000,
  "recommendation": "advance",
  "created_at": "2026-04-06T12:05:00Z",
  "key_insights": [
    "Market growing 45% YoY",
    "3 well-funded competitors but fragmented by domain",
    "Regulatory tailwinds in US and EU",
    "Developer tooling is fragmented by vertical"
  ],
  "competitive_landscape": "Stripe, Plaid, and open-source alternatives dominate compliance workflows. Landscape is highly fragmented by use case (AML, KYC, reporting, agent monitoring).",
  "validation_flags": [
    "customer_interviews_needed",
    "regulatory_clarification_required",
    "check_enterprise_pricing_models"
  ],
  "score_breakdown": {
    "market_size": 90,
    "urgency": 75,
    "competition": 70,
    "strategic_fit": 72
  }
}
```

---

## Phase 4: Advance Opportunity (Pro/Enterprise)

Advance a top opportunity to the AddVenture module.

**Request:**
```bash
curl -X POST https://api.opportunity.bruceai.com/v1/opportunities/opp_xyz789/advance \
  -H "Authorization: Bearer opp_sk_live_abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{
    "export_format": "json"
  }'
```

**Backend Processing:**
```typescript
// POST /v1/opportunities/{opportunity_id}/advance
const advanceOpportunity = async (req, res) => {
  const { account_id } = req.auth;
  const { opportunity_id } = req.params;
  const { export_format = 'json' } = req.body;

  // Validate plan
  const account = await db.query(
    'SELECT plan FROM accounts WHERE account_id = $1',
    [account_id]
  );

  if (account.plan === 'free') {
    return res.status(402).json({
      error: 'plan_required',
      message: 'Pro plan required to advance opportunities',
      upgrade_url: 'https://app.bruceai.com/settings/billing/upgrade'
    });
  }

  // Check advance limit
  const thisMonth = new Date().toISOString().slice(0, 7);
  const usage = await db.query(
    `SELECT opportunities_advanced FROM opportunity.usage_tracking
     WHERE account_id = $1 AND period = $2`,
    [account_id, thisMonth]
  );

  const limits = PLAN_LIMITS[account.plan];
  if (usage.rows[0].opportunities_advanced >= limits.opportunities_advanced_per_month) {
    return res.status(402).json({
      error: 'advance_limit_reached',
      message: `${account.plan} plan allows ${limits.opportunities_advanced_per_month} advances/month`
    });
  }

  // Get opportunity
  const opp = await db.query(
    `SELECT * FROM opportunity.opportunities WHERE opportunity_id = $1 AND account_id = $2`,
    [opportunity_id, account_id]
  );

  if (!opp.rows.length) {
    return res.status(404).json({ error: 'not_found' });
  }

  // Update opportunity status
  await db.query(
    `UPDATE opportunity.opportunities SET status = 'advanced', advanced_at = NOW() WHERE opportunity_id = $1`,
    [opportunity_id]
  );

  // Emit cross-module event to bruce-core
  const event = {
    account_id,
    event_type: 'opportunity.advanced',
    opportunity: opp.rows[0],
    timestamp: Date.now()
  };

  const eventSignature = signEvent(event, BRUCE_CORE_SECRET);
  await fetch('https://api.bruceai.com/events/consume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': eventSignature
    },
    body: JSON.stringify(event)
  });

  // Emit billing event
  await stripe.billing.meterEventAdjustment.create({
    event_name: 'opportunities_advanced',
    timestamp: Math.floor(Date.now() / 1000),
    value: 1,
    identifier: account_id
  });

  // Export results if requested
  let export_url = null;
  if (export_format !== 'json') {
    const exportFile = `${account_id}/opportunities/${opportunity_id}/export.${export_format}`;
    const exportData = await generateExport(opp.rows[0], export_format);
    await r2.putObject({
      bucket: 'bruce-opportunity',
      key: exportFile,
      body: exportData,
      contentType: mimeType(export_format)
    });

    export_url = await r2.getPresignedUrl(exportFile, 3600);
  }

  res.json({
    opportunity_id,
    status: 'advanced',
    venture_id: null,  // Will be set when AddVenture creates the venture
    export_url,
    created_at: new Date()
  });
};
```

**Response:**
```json
{
  "opportunity_id": "opp_xyz789",
  "status": "advanced",
  "venture_id": null,
  "export_url": "https://r2-presigned-url...",
  "created_at": "2026-04-06T12:15:00Z"
}
```

---

## Phase 5: Usage & Billing

Check usage against plan limits:

**Request:**
```bash
curl -X GET https://api.opportunity.bruceai.com/v1/usage \
  -H "Authorization: Bearer opp_sk_live_abc123def456..."
```

**Response:**
```json
{
  "plan": "free",
  "period_start": "2026-04-01",
  "period_end": "2026-04-30",
  "scans_used": 1,
  "scans_limit": 2,
  "opportunities_discovered": 8,
  "opportunities_advanced": 0,
  "opportunities_advanced_limit": 1
}
```

---

## Rate Limiting

API requests are rate-limited per account:

**Free Tier:**
- 10 requests/minute
- 100 requests/hour

**Pro Tier:**
- 100 requests/minute
- 5,000 requests/hour

**Enterprise:**
- Unlimited (or custom)

**Rate Limit Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1712443200
```

**When limit exceeded (429):**
```json
{
  "error": "rate_limit_exceeded",
  "message": "Free plan allows 10 requests/minute",
  "reset_at": "2026-04-06T12:02:00Z",
  "retry_after_seconds": 60
}
```

---

## Webhook Delivery

If a webhook_url is provided when creating a scan, Opportunity will POST to that URL when the scan completes.

**Webhook Payload:**
```json
{
  "event": "scan.completed",
  "scan_id": "scan_abc123",
  "account_id": "org_xyz789",
  "opportunities_found": 8,
  "timestamp": 1712443200,
  "data": {
    "opportunities": [ ... ]
  }
}
```

**Signature Verification:**

```typescript
const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
hmac.update(JSON.stringify(payload));
const expectedSignature = hmac.digest('hex');

// Compare with X-Opportunity-Signature header
const providedSignature = req.headers['x-opportunity-signature'];
const isValid = crypto.timingSafeEqual(
  Buffer.from(expectedSignature),
  Buffer.from(providedSignature)
);
```

---

## Error Handling

**Invalid Plan Limits:**
```json
{
  "error": "plan_limit_reached",
  "message": "Free plan allows max 2 scans per month",
  "details": {
    "limit": 2,
    "used": 2,
    "reset_at": "2026-05-01"
  }
}
```

**Scan Failed:**
```json
{
  "id": "scan_abc123",
  "status": "failed",
  "error_message": "Theme 'xyz' returned no market signals",
  "completed_at": "2026-04-06T12:10:00Z"
}
```

**Authentication Errors:**
```json
{
  "error": "invalid_api_key",
  "message": "API key is invalid or expired"
}
```

---

## Monitoring & Analytics

Track key metrics:
- **Scans per account** — alerts if 0 scans in 30 days
- **Completion rate** — if < 90%, investigate failures
- **Time-to-complete** — alert if > 2x baseline
- **Webhook delivery** — retry on failure, alert if > 5% delivery failures
- **API error rate** — alert if > 1% of requests fail
- **Plan upgrade funnel** — track free → pro conversion

---

**Contact:** BruceAI Support
**Last Updated:** 2026-04-06
