# BruceAI POC Stack: Complete Free-Tier Architecture

## Overview

This is a production-grade, zero-cost infrastructure stack for running BruceAI as a multi-tenant SaaS with all 9 modules. Every service uses free or near-free tiers of modern platforms. **Estimated cost: $0/month until ~100 active users.**

---

## 1. Compute & Hosting

### Railway (Primary: Backend APIs)
**Cost:** $5/month free credit (effectively free for POC)
**Usage:** Backend services for all 9 modules (NestJS APIs)

**Deployment Strategy:**
- One Railway project per module (or one project with multiple services)
- Each module runs as a separate NestJS service with auto-scaling off (free tier)
- Database connection pooling via Neon
- Uses Railway's built-in PostgreSQL support (but we override with Neon)

**Configuration:**
```yaml
# railway.toml example for a module service
[build]
  builder = "docker"

[deploy]
  startCommand = "npm run start:prod"
  restartPolicyType = "on-failure"
```

**Why Railway over Heroku:**
- Heroku killed free tier in Nov 2022
- Railway's free tier is genuinely usable ($5 credit + generous limits)
- Better DX with git auto-deploy and environment variables

---

### Fly.io (Secondary: Temporal Workers)
**Cost:** Free tier provides 3 shared VMs
**Usage:** Temporal.io self-hosted deployment

**Deployment Strategy:**
- Single Fly.io app with `fly-postgres=false` (uses Neon instead)
- Auto-scaling set to 1 replica for free tier
- Use spot pricing if traffic spikes (pay only for overage)

**Why Fly.io for Temporal:**
- Free tier allows persistent apps (unlike Heroku)
- Global edge deployment (lower latency for worldwide users)
- 3 shared CPU cores + 256MB RAM per app (enough for single Temporal server)

---

### Render (Fallback)
**Cost:** Free tier (deploys sleep after 15 min inactivity)
**Usage:** Backup deployment or CI/CD helper services

**Limitation:** Free tier services spin down after inactivity. NOT suitable for production APIs unless paired with Render's paid tier ($7+/month).

---

## 2. Database

### Neon PostgreSQL (Primary Persistence)
**Cost:** Free tier: 0.5 GB storage, 5 GB bandwidth, 1 compute instance
**Usage:** All persistent state across all modules

**Schema Strategy:**
- Single Neon project (`bruceai-prod`)
- Separate schemas per module: `opportunity`, `brand_aid`, `builder`, `venture`, `dossier`, `health`, `pattern`, `learning`, `memory`
- No database per tenant (too expensive to scale)
- Instead: Row-Level Security (RLS) with `account_id` on every table

**Why PostgreSQL > MongoDB for POC:**
1. **Free tier is 10x better:** Neon 0.5GB vs MongoDB Atlas 0.5GB (Atlas adds $0.30/10GB quickly)
2. **Better operator experience:** Simpler backup/restore, branching for dev/staging, PITR
3. **Neon branching:** Create dev/staging branches in seconds, no extra cost
4. **Full-text search built-in:** Replaces Elasticsearch entirely (GIN indexes on tsvector columns)
5. **JSON support:** `JSONB` type for semi-structured data (e.g., vendor configs, job metadata)

**Connections:**
```
# Use PgBouncer for connection pooling
DATABASE_URL=postgresql://user:pass@pg-pool.neon.tech/bruceai?sslmode=require
```

Neon automatically provides pooled connections via `?sslmode=require` parameter.

---

## 3. Cache & Queues

### Upstash Redis (Ephemeral State + Job Queues)
**Cost:** Free tier: 10,000 commands/day, 256MB storage
**Usage:** Session state, job queues (via BullMQ), rate limiting, plan limit counters

**Key Features:**
- Serverless Redis (no VM to maintain)
- Global read replicas (CDN-like caching)
- Built-in authentication (no firewall rules)

**Job Queue Pattern (BullMQ on Upstash):**
```javascript
// One queue per module-task combination
const opportunityScanQueue = new Queue('opportunity:scan', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3,
  },
});

// BullMQ handles retries, exponential backoff, and persistence
```

**Rate Limiting:**
```
INCR {account_id}:rate:api
EXPIRE {account_id}:rate:api 60
```

**Scaling plan:** When 10k commands/day isn't enough (~50+ concurrent users), upgrade to paid tier ($0.20/10k commands).

---

## 4. Object Storage

### Cloudflare R2 (Logos, PDFs, Artifacts)
**Cost:** Free tier: 10 GB storage, 1M Class A operations/month (uploads/deletes)
**Usage:** All generated artifacts, PDFs, logos, brand books, code bundles

**Bucket Structure:**
```
bruceai-assets/
  {account_id}/
    opportunity/{scan_id}/*.json
    brand-aid/{brand_job_id}/*.json, *.pdf, *.svg
    builder/{build_job_id}/*.json, *.zip
    venture/{venture_id}/*.json
    ...
```

**Why R2 > AWS S3:**
- S3 free tier: only 12 months, then $0.023/GB
- R2 free tier: forever 10GB + reasonable egress
- Egress: R2 has free egress to Cloudflare IPs (your origins), only charges for Internet egress
- Same API as S3 (drop-in replacement)

**Signed URLs:** All downloads via time-limited signed URLs (1 hour expiry).

---

## 5. Vector Database

### Qdrant (Semantic Search for bruce-memory)
**Cost:** Free tier: self-hosted on Railway or in-memory
**Usage:** Vector embeddings for intelligence snapshots and semantic search

**Deployment Options:**

**Option A: Qdrant on Railway (Recommended)**
```dockerfile
# Use official Qdrant Docker image
FROM qdrant/qdrant:latest
```
- Single instance on Railway ($5 credit)
- Data stored in ephemeral storage (NOT persistent)
- OK for POC: bruce-memory is regenerable from source data

**Option B: Chroma In-Memory (Simplest POC)**
```python
import chromadb

client = chromadb.Client()  # In-memory, resets on restart
collection = client.create_collection("bruce-memory")
```
- No external service to manage
- Perfect for testing embeddings without infrastructure
- Limitation: loses data on restart

**Why NOT Pinecone/Milvus:**
- Pinecone: $70/month minimum (too expensive for POC)
- Milvus: needs Kubernetes cluster (too complex)
- Qdrant: free, lightweight, can run anywhere

**Collections:**
```
opportunity-scans        # Markets, competitors, opportunities
brand-intelligence      # Brand insights, guidelines, visual references
venture-intelligence    # Company data, financials, team
health-metrics          # Industry health reports, trends
pattern-analysis        # Extracted patterns across all data
```

---

## 6. Workflow Orchestration

### Decision: BullMQ vs Temporal.io for POC

**Use BullMQ if:**
- Simple, sequential workflows (opportunity scans, brand jobs, health checks)
- Job pipeline: Queue → Process → Done
- Retries and rate limiting are enough
- **Cost:** $0 (runs on Upstash Redis)

**Use Temporal.io if:**
- Complex workflows with multiple stages, compensation logic, long-running sagas
- Need time-travel debugging and replay
- Multiple conditional branches and human workflows (builder, dossier)
- **Cost:** $5/month free credit on Railway

**Hybrid Recommendation for POC:**
- **BullMQ:** opportunity, brand-aid, health (simple jobs)
- **Temporal.io:** builder, dossier, bruce-core (complex multi-stage workflows)

### BullMQ Setup
```typescript
// packages/shared/src/queues/index.ts
import Queue from 'bull';
import IORedis from 'ioredis';

const redis = new IORedis(process.env.UPSTASH_REDIS_URL);

export const opportunityQueue = new Queue('opportunity:scan', redis);
export const brandQueue = new Queue('brand-aid:job', redis);
export const healthQueue = new Queue('health:report', redis);
```

**Job Processing:**
```typescript
opportunityQueue.process(async (job) => {
  const { accountId, scanId } = job.data;
  // Process scan
  job.progress(50);
  // Upload results to R2
  job.progress(100);
  return { success: true, resultsPath: 's3://...' };
});
```

### Temporal.io Setup (Alternative for Complex Workflows)
```bash
# Self-hosted on Fly.io/Railway
docker-compose up -d

# Access UI at http://localhost:8080
```

See `temporal-setup.md` for full deployment guide.

---

## 7. Authentication & Authorization

### Clerk (Sign-in, API Keys, Organizations)
**Cost:** Free tier: 10,000 MAU (monthly active users)
**Usage:** User authentication, organization management, API key generation

**Why Clerk:**
- Built-in organizations feature (maps to BruceAI account_id)
- API key management UI
- Role-based access control (Owner, Admin, Developer, Viewer)
- Webhooks for user/org sync
- No need for separate IAM service

**Setup:**
```typescript
// packages/auth/clerk.ts
import { clerkClient } from '@clerk/backend';

const org = await clerkClient.organizations.getOrganization({
  organizationId: accountId,
});
// accountId = Clerk Organization ID

const apiKey = await clerkClient.organizations.createOrganizationInvitation({
  organizationId: accountId,
  emailAddress: 'user@company.com',
  role: 'admin',
});
```

**Webhook Events:**
- `organization.created` → Insert into `accounts` table
- `organization.deleted` → Soft-delete account (keep for audit)
- `user.created` → Sync to user management table

---

## 8. Billing & Metering

### Stripe (Subscription + Usage-Based Billing)
**Cost:** Free until first charge (no setup fees)
**Usage:** Plan management, usage metering, invoicing

**Products:**
```
Free         → $0/month, 10 jobs/day per module
Pro          → $29/month, 100 jobs/day per module
Enterprise   → Custom pricing
```

**Usage Metering:**
- Report job completions to Stripe
- Each module tracks: scans completed, brands processed, builds compiled, dossiers generated
- Stripe automatically aggregates and bills at month-end

**Implementation:**
```typescript
// After job completes successfully
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

await stripe.billing.meterEventAdjustments.create({
  meter: 'jobs_completed',
  event_name: 'opportunity_scan_completed',
  timestamp: Math.floor(Date.now() / 1000),
  quantity: 1,
  customer: accountId, // mapped to Stripe customer ID
});
```

**Webhook Events to Handle:**
- `customer.subscription.created` → Update account plan in Neon
- `customer.subscription.updated` → Update limits
- `invoice.payment_failed` → Warn user, disable API access after 24h
- `charge.refunded` → Refund usage credits

---

## 9. Monitoring & Observability

### Better Stack (Log Aggregation + Uptime)
**Cost:** Free tier: 7 days log retention
**Usage:** Centralized logs from all services + uptime monitoring

**Why Better Stack:**
- Free tier is genuinely useful (vs Datadog $15+/day)
- Single dashboard for logs + uptime
- Slack integration for alerts
- JSON structured logging support

**Setup (Node.js):**
```javascript
import BetterStackLogger from '@better-stack/source';

const logger = new BetterStackLogger({
  sourceToken: process.env.BETTERSTACK_SOURCE_TOKEN,
});

logger.info('Job completed', {
  jobId: job.id,
  accountId: account.id,
  duration: Date.now() - startTime,
});
```

**Uptime Monitoring:**
```
Dashboard:
  https://api.bruceai.app/health     → check every 60s
  https://temporal.bruceai.app       → check every 5m
  https://qdrant.bruceai.app/health  → check every 5m
```

**Alerts:**
- Slack: #infrastructure channel
- SMS: On-call engineer (during POC, just one person)

---

## 10. Email Delivery

### Resend (Transactional Emails)
**Cost:** Free tier: 3,000 emails/month
**Usage:** Job complete notifications, welcome emails, invoice receipts

**Events to Email:**
- Job completed successfully
- Job failed (with error summary)
- Subscription upgraded/downgraded
- Invoice ready
- API key created/rotated

**Implementation:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@bruceai.app',
  to: user.email,
  subject: 'Your opportunity scan is ready',
  html: `<p>Found ${results.count} opportunities</p>`,
});
```

---

## 11. Environment Summary

| Service | Free Tier | Scaling Point | Next Cost |
|---------|-----------|----------------|-----------|
| Railway | $5/month credit | N/A | $7/month per service |
| Neon PostgreSQL | 0.5 GB | ~500GB data | $0.15/GB |
| Upstash Redis | 10k cmds/day | ~1M cmds/month | $0.20/10k cmds |
| Cloudflare R2 | 10 GB, 1M ops/mo | 100+ GB data | $0.015/GB, $0.01/class A |
| Qdrant (Railway) | Included | N/A | $7/month |
| Clerk | 10k MAU | 100+ orgs | $25+/month |
| Stripe | No setup fee | N/A | 2.9% + $0.30 per charge |
| Better Stack | 7d logs | Large volume | $9+/month |
| Resend | 3k emails/mo | High volume | $0.0001/email |

---

## 12. Total Cost Progression

### Phase 0: MVP (0-20 users)
- **Cost: $0/month**
- All free tiers active
- Projected duration: 2-3 months

### Phase 1: Growth (20-100 users)
- **Cost: ~$30-50/month**
- Neon: upgrade to 1GB ($5)
- Upstash: 100k commands/month ($10)
- Better Stack: uptime monitoring ($9)
- Resend: scale to 5k emails ($5)
- Additional Railway services as modules grow ($7 each if needed)

### Phase 2: Scale (100-1000+ users)
- **Cost: $200-500/month**
- Neon: 10-50GB ($15-75)
- Upstash: 1M+ commands ($50+)
- R2: consistent fees ($2-10)
- Stripe processing: 2.9% + $0.30
- Cloudflare Workers for edge functions ($5)
- Datadog + PagerDuty once team grows

---

## 13. Migration Path: When to Leave Free Tiers

**Neon:** Upgrade when hitting 0.5 GB (watch: `SELECT pg_database_size('bruceai');`)

**Upstash:** Monitor at `/admin/redis` dashboard. Upgrade when exceeding 10k commands/day for 3+ consecutive days.

**Qdrant:** If using Railway deployment, already paid via Railway credit. If vectors exceed 256MB, migrate to Qdrant Cloud managed tier ($25/mo).

**Clerk:** At 10k MAU, upgrade to per-user pricing ($0.05-0.50 per active user).

**Railway:** Services auto-scale within free credit. Track usage weekly at `railway.app/dashboard`.

---

## 14. Deployment Checklist

- [ ] Create Railway account, connect GitHub
- [ ] Create Neon project, set up schemas
- [ ] Create Upstash Redis, save connection string
- [ ] Create Clerk organization, set up webhooks
- [ ] Create Stripe account, define products/prices
- [ ] Create Cloudflare account, set up R2 bucket
- [ ] Create Better Stack account, add source token
- [ ] Create Resend account, set up DKIM
- [ ] Create Qdrant instance (Railway or in-memory)
- [ ] Deploy all env vars to Railway
- [ ] Run database migrations: `npm run migrate:prod`
- [ ] Start first module service on Railway
- [ ] Test end-to-end: API → DB → R2 → Email
- [ ] Monitor logs in Better Stack for 24h
- [ ] Invite first beta users via Clerk

---

## 15. Alternative Stacks (If You Prefer Different Vendors)

### Full Supabase Stack
- Replace Clerk → Supabase Auth
- Replace Neon → Supabase PostgreSQL
- Replace Upstash → Supabase Realtime (for WebSocket subscriptions)
- **Cost:** Free tier covers all three, single unified dashboard
- **Tradeoff:** Less flexibility in each layer, but simpler ops

### Hybrid: Firebase + Custom Backend
- Replace Clerk → Firebase Auth
- Replace database → Firebase Firestore
- Keep: Upstash Redis, R2, Temporal.io
- **Cost:** $0 until scale
- **Tradeoff:** Firestore pricing becomes expensive fast at scale

### Docker Compose Local Dev → Fly.io Prod
- Local: Postgres + Redis + Minio (S3 clone)
- Prod: Fly.io for everything
- **Cost:** ~$50-100/month for Fly.io scale
- **Tradeoff:** More infrastructure management, less integration with modern services

---

## Conclusion

This stack is optimized for **startup velocity** and **zero-capital operations**. Every choice prioritizes:

1. **Free tier quality** (not just duration)
2. **No credit card farming** (real free tiers that stay free)
3. **Multi-tenancy from day one** (RLS, tenant isolation, usage metering)
4. **Operational simplicity** (managed services, not VMs to SSH into)
5. **Clean migration path** (same APIs at scale, no rewrite needed)

Ship this POC in 2-3 weeks. Optimize ops in months 2-3. Scale confidently to 1000+ users without changing architecture.
