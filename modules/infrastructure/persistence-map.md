# Persistence Map: Data Backend Routing for All Modules

## Overview

Every piece of data in BruceAI routes to exactly one backend. This document maps each module's state to storage layers.

**Key principle:** Persistent state → Neon PostgreSQL | Ephemeral state → Upstash Redis | Artifacts → Cloudflare R2 | Vectors → Qdrant

---

## Module 1: Opportunity

Discovers market opportunities, competitors, and market gaps.

### PostgreSQL Schema
```sql
CREATE SCHEMA opportunity;

CREATE TABLE opportunity.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  market_query TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  total_opportunities INT,
  total_competitors INT,
  research_artifact_path TEXT,
  temporal_workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_opp_scan_account ON opportunity.scans(account_id, created_at DESC);

CREATE TABLE opportunity.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  scan_id UUID NOT NULL REFERENCES opportunity.scans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  market_size NUMERIC(15,2),
  growth_rate NUMERIC(5,2),
  competition_level TEXT,
  relevance_score NUMERIC(3,2),
  research_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_opp_scan_relevance ON opportunity.opportunities(scan_id, relevance_score DESC);

CREATE TABLE opportunity.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  scan_id UUID NOT NULL REFERENCES opportunity.scans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  funding_stage TEXT,
  market_position NUMERIC(3,2),
  key_differentiators TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE opportunity.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity.competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY scan_isolation ON opportunity.scans USING (account_id = current_setting('app.current_account_id')::UUID);
CREATE POLICY opp_isolation ON opportunity.opportunities USING (account_id = current_setting('app.current_account_id')::UUID);
CREATE POLICY comp_isolation ON opportunity.competitors USING (account_id = current_setting('app.current_account_id')::UUID);
```

### Persistence Map

| Data | Backend | Location | TTL | Notes |
|------|---------|----------|-----|-------|
| Scan metadata (name, query, status) | Neon PostgreSQL | `opportunity.scans` | Permanent | Updated as scan progresses |
| Discovered opportunities (ranked) | Neon PostgreSQL | `opportunity.opportunities` | Permanent | 100-1000 per scan |
| Competitors data | Neon PostgreSQL | `opportunity.competitors` | Permanent | 10-100 per scan |
| Scan execution state | Upstash Redis | `{account_id}:opp:scan:{scan_id}:state` | 24h | JSON with progress, current stage |
| Scan results cache | Upstash Redis | `{account_id}:opp:scan:{scan_id}:results` | 6h | Deduped results before DB insert |
| Raw research documents | Cloudflare R2 | `opportunity/{account_id}/{scan_id}/research-raw.json` | 30 days | Unprocessed market data |
| Ranked opportunities export | Cloudflare R2 | `opportunity/{account_id}/{scan_id}/ranked-opportunities.json` | 30 days | Final CSV/JSON export |
| Intelligence vectors | Qdrant | collection: `opportunity-scans` | Permanent | Account metadata filter |

### BullMQ Queue Pattern
```typescript
const opportunityQueue = new Queue('opportunity:scan', redis);

opportunityQueue.process(
  1, // Max 1 concurrent job (serial processing)
  async (job: Job<{ accountId: string; scanId: string }>) => {
    const { accountId, scanId } = job.data;

    // Stage 1: Research (40% progress)
    await runMarketResearch(scanId);
    job.progress(40);

    // Stage 2: Ranking (80% progress)
    const opportunities = await rankOpportunities(scanId);
    job.progress(80);

    // Stage 3: Store results
    await db.saveOpportunities(accountId, scanId, opportunities);
    await uploadToR2(scanId);
    job.progress(100);

    return { opportunitiesFound: opportunities.length };
  }
);
```

### API Endpoint Example
```typescript
// POST /api/opportunity/scans
const scan = await db.create('opportunity.scans', {
  account_id: accountId,
  name: req.body.name,
  market_query: req.body.query,
  status: 'queued',
});

await opportunityQueue.add({ accountId, scanId: scan.id });
return res.json({ scan_id: scan.id, status: 'queued' });
```

---

## Module 2: Brand Aid

Builds comprehensive brand strategies, visual identity systems, brand books.

### PostgreSQL Schema
```sql
CREATE SCHEMA brand_aid;

CREATE TABLE brand_aid.brand_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  target_audience TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  current_stage TEXT,
  strategy_artifact_path TEXT,
  brand_book_artifact_path TEXT,
  temporal_workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE brand_aid.brand_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  brand_job_id UUID NOT NULL REFERENCES brand_aid.brand_jobs(id),
  element_type TEXT NOT NULL, -- 'tagline', 'color_palette', 'typography', 'visual_style'
  content JSONB NOT NULL,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE brand_aid.design_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  brand_job_id UUID NOT NULL REFERENCES brand_aid.brand_jobs(id),
  token_name TEXT NOT NULL, -- e.g., 'color.primary', 'spacing.unit'
  value TEXT NOT NULL,
  token_format TEXT, -- 'css', 'json', 'figma'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE brand_aid.brand_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_aid.brand_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_aid.design_tokens ENABLE ROW LEVEL SECURITY;
```

### Persistence Map

| Data | Backend | Location | TTL | Notes |
|------|---------|----------|-----|-------|
| Brand job record (name, status, stage) | Neon PostgreSQL | `brand_aid.brand_jobs` | Permanent | Single record per job |
| Brand elements (taglines, colors, typography) | Neon PostgreSQL | `brand_aid.brand_elements` | Permanent | 10-50 per brand job |
| Design tokens (CSS variables) | Neon PostgreSQL | `brand_aid.design_tokens` | Permanent | 50-200 per brand job |
| Current pipeline stage | Upstash Redis | `{account_id}:brand:{brand_id}:stage` | 48h | String: discovery/strategy/design/export |
| Brand exploration cache | Upstash Redis | `{account_id}:brand:{brand_id}:exploration` | 12h | Intermediate brand direction options |
| Raw brand strategy doc | Cloudflare R2 | `brand-aid/{account_id}/{brand_job_id}/brand-strategy.json` | 30 days | Full brand strategy as JSON |
| Logo files | Cloudflare R2 | `brand-aid/{account_id}/{brand_job_id}/logo.svg` | 30 days | SVG + PNG variants |
| Brand book PDF | Cloudflare R2 | `brand-aid/{account_id}/{brand_job_id}/brand-book.pdf` | 30 days | Final brand book document |
| Visual system spec | Cloudflare R2 | `brand-aid/{account_id}/{brand_job_id}/visual-system.json` | 30 days | Colors, typography, components |
| Design tokens (CSS) | Cloudflare R2 | `brand-aid/{account_id}/{brand_job_id}/design-tokens.{css,json}` | 30 days | Multiple formats for different tools |
| Brand intelligence vectors | Qdrant | collection: `brand-intelligence` | Permanent | Brand positioning, market context |

### BullMQ Queue Pattern
```typescript
const brandQueue = new Queue('brand-aid:job', redis);

brandQueue.process(async (job) => {
  const { accountId, brandJobId } = job.data;

  // Stage 1: Brand Discovery (20%)
  await redis.set(`${accountId}:brand:${brandJobId}:stage`, 'discovery');
  const briefing = await runBrandDiscovery(accountId, brandJobId);
  job.progress(20);

  // Stage 2: Strategy Development (50%)
  await redis.set(`${accountId}:brand:${brandJobId}:stage`, 'strategy');
  const strategy = await generateBrandStrategy(briefing);
  job.progress(50);

  // Stage 3: Visual Design (80%)
  await redis.set(`${accountId}:brand:${brandJobId}:stage`, 'design');
  const designs = await generateVisualSystem(strategy);
  job.progress(80);

  // Stage 4: Export (100%)
  await redis.set(`${accountId}:brand:${brandJobId}:stage`, 'export');
  await saveBrandToDB(accountId, brandJobId, strategy, designs);
  await uploadBrandBookToR2(accountId, brandJobId);
  job.progress(100);

  return { success: true };
});
```

---

## Module 3: Builder

Generates functional specs, BDD tests, architecture diagrams, code scaffolds.

### PostgreSQL Schema
```sql
CREATE SCHEMA builder;

CREATE TABLE builder.build_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[], -- ['nodejs', 'react', 'postgresql']
  status TEXT NOT NULL DEFAULT 'queued',
  current_stage TEXT,
  build_artifact_path TEXT,
  temporal_workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE builder.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  build_job_id UUID NOT NULL REFERENCES builder.build_jobs(id),
  deliverable_type TEXT NOT NULL, -- 'functional_spec', 'bdd_spec', 'architecture', 'code'
  format TEXT, -- 'markdown', 'yaml', 'json', 'zip'
  artifact_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE builder.build_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder.deliverables ENABLE ROW LEVEL SECURITY;
```

### Persistence Map

| Data | Backend | Location | TTL | Notes |
|------|---------|----------|-----|-------|
| Build job metadata | Neon PostgreSQL | `builder.build_jobs` | Permanent | Single record per build |
| Deliverables references | Neon PostgreSQL | `builder.deliverables` | Permanent | 5-10 per build job |
| Current build stage | Upstash Redis | `{account_id}:build:{build_id}:stage` | 72h | String: design/spec/bdd/arch/code |
| Build compilation cache | Upstash Redis | `{account_id}:build:{build_id}:cache` | 48h | Compiled intermediates |
| Functional specification | Cloudflare R2 | `builder/{account_id}/{build_job_id}/functional-spec.json` | 30 days | Complete feature list + user flows |
| BDD specification | Cloudflare R2 | `builder/{account_id}/{build_job_id}/bdd-spec.yaml` | 30 days | Gherkin feature files |
| Architecture diagram | Cloudflare R2 | `builder/{account_id}/{build_job_id}/architecture-spec.json` | 30 days | System design, data flow |
| Generated code scaffold | Cloudflare R2 | `builder/{account_id}/{build_job_id}/code-bundle.zip` | 30 days | Starter project with routes/models |
| QA test report | Cloudflare R2 | `builder/{account_id}/{build_job_id}/qa-report.json` | 30 days | Test coverage, edge cases |
| Security report | Cloudflare R2 | `builder/{account_id}/{build_job_id}/security-report.json` | 30 days | OWASP Top 10 checks |

### Temporal.io Workflow Pattern
```typescript
// Builder uses Temporal due to complexity
export async function buildWorkflow(input: BuildInput): Promise<BuildResult> {
  const accountId = input.accountId;
  const buildId = input.buildId;

  try {
    // Stage 1: Analysis
    const analysis = await activities.analyzeRequirements(input);

    // Stage 2: Specification
    const specs = await activities.generateSpecifications(analysis);

    // Stage 3: Architecture
    const architecture = await activities.designArchitecture(specs);

    // Stage 4: Code Generation
    const codeBundle = await activities.generateCode(architecture);

    // Stage 5: QA & Security
    const qaReport = await activities.runQA(codeBundle);
    const securityReport = await activities.runSecurityAnalysis(codeBundle);

    // Stage 6: Package
    const result = await activities.packageDeliverables(
      specs,
      architecture,
      codeBundle,
      qaReport,
      securityReport
    );

    return result;
  } catch (err) {
    await activities.notifyFailure(accountId, buildId, err.message);
    throw err;
  }
}
```

---

## Module 4: Add Venture

Compiles comprehensive venture dossiers (8 volumes) with market analysis, financial data, team profiles.

### PostgreSQL Schema
```sql
CREATE SCHEMA venture;

CREATE TABLE venture.dossier_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  company_website TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  dossier_artifact_path TEXT,
  temporal_workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE venture.dossier_volumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  dossier_job_id UUID NOT NULL REFERENCES venture.dossier_jobs(id),
  volume_number INT NOT NULL, -- 1-8
  volume_title TEXT NOT NULL,
  content_summary TEXT,
  artifact_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(dossier_job_id, volume_number)
);

ALTER TABLE venture.dossier_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE venture.dossier_volumes ENABLE ROW LEVEL SECURITY;
```

### Persistence Map

| Data | Backend | Location | TTL | Notes |
|------|---------|----------|-----|-------|
| Dossier job metadata | Neon PostgreSQL | `venture.dossier_jobs` | Permanent | Single record per dossier |
| Volume references | Neon PostgreSQL | `venture.dossier_volumes` | Permanent | 8 volumes per dossier |
| Dossier execution state | Upstash Redis | `{account_id}:dossier:{dossier_id}:state` | 48h | Current volume being compiled |
| Intermediate data cache | Upstash Redis | `{account_id}:dossier:{dossier_id}:cache` | 24h | Market data, news, financials |
| Complete dossier PDF | Cloudflare R2 | `venture/{account_id}/{dossier_id}/dossier-complete.json` | 30 days | Full dossier as structured JSON |
| Dossier PDF export | Cloudflare R2 | `venture/{account_id}/{dossier_id}/dossier.pdf` | 30 days | Printable PDF format |
| Volume 1: Executive Summary | Cloudflare R2 | `venture/{account_id}/{dossier_id}/volumes/vol-1.json` | 30 days | Company overview, financials |
| Volume 2: Market Analysis | Cloudflare R2 | `venture/{account_id}/{dossier_id}/volumes/vol-2.json` | 30 days | TAM, SAM, competitors |
| Volume 3: Product & Technology | Cloudflare R2 | `venture/{account_id}/{dossier_id}/volumes/vol-3.json` | 30 days | Product roadmap, tech stack |
| Volume 4: Business Model | Cloudflare R2 | `venture/{account_id}/{dossier_id}/volumes/vol-4.json` | 30 days | Revenue streams, pricing |
| Volume 5: Team & Organization | Cloudflare R2 | `venture/{account_id}/{dossier_id}/volumes/vol-5.json` | 30 days | Leadership, org structure |
| Volume 6: Financial Projections | Cloudflare R2 | `venture/{account_id}/{dossier_id}/volumes/vol-6.json` | 30 days | 5-year projections, unit economics |
| Volume 7: Risk & Mitigation | Cloudflare R2 | `venture/{account_id}/{dossier_id}/volumes/vol-7.json` | 30 days | Risks, competitive threats |
| Volume 8: Investment Thesis | Cloudflare R2 | `venture/{account_id}/{dossier_id}/volumes/vol-8.json` | 30 days | Why invest, stage recommendations |
| Venture intelligence | Qdrant | collection: `venture-intelligence` | Permanent | Company profiles, financials, team |

### Temporal.io Workflow
```typescript
export async function compileVentureDossierWorkflow(
  input: DossierInput
): Promise<DossierResult> {
  const volumes: Volume[] = [];

  for (let i = 1; i <= 8; i++) {
    const volume = await activities.compileVolume(
      input.accountId,
      input.dossier_id,
      i
    );
    volumes.push(volume);
  }

  const result = await activities.packageDossier(volumes);
  return result;
}
```

---

## Module 5: Venture Records

Core venture data store: company profiles, funding data, team members, relationships.

### PostgreSQL Schema
```sql
CREATE SCHEMA venture;

CREATE TABLE venture.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  website TEXT,
  founded_year INT,
  headquarters TEXT,
  industry TEXT,
  stage TEXT, -- 'pre-seed', 'seed', 'series_a', ...
  employee_count INT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE venture.funding_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES venture.companies(id),
  round_type TEXT NOT NULL,
  amount_raised NUMERIC(15,2),
  currency TEXT DEFAULT 'USD',
  announced_date DATE,
  investors TEXT[], -- investor names/organizations
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE venture.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES venture.companies(id),
  name TEXT NOT NULL,
  title TEXT,
  background TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE venture.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE venture.funding_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE venture.team_members ENABLE ROW LEVEL SECURITY;
```

### Persistence Map

| Data | Backend | Location | TTL | Notes |
|------|---------|----------|-----|-------|
| Company records | Neon PostgreSQL | `venture.companies` | Permanent | Single source of truth |
| Funding rounds | Neon PostgreSQL | `venture.funding_rounds` | Permanent | Multiple per company |
| Team member records | Neon PostgreSQL | `venture.team_members` | Permanent | 5-100+ per company |
| Company cache | Upstash Redis | `{account_id}:company:{company_id}:full` | 7 days | Full company object for API responses |
| Full-text search index | Neon PostgreSQL | GIN index on `companies` via tsvector | Permanent | `tsvector` on name/description |

---

## Module 6: Health

Tracks industry health metrics, market trends, company health scores.

### PostgreSQL Schema
```sql
CREATE SCHEMA health;

CREATE TABLE health.health_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  report_type TEXT NOT NULL, -- 'industry', 'market', 'company'
  subject_id TEXT, -- industry code or company ID
  subject_name TEXT,
  status_score NUMERIC(3,2), -- 0-1 health score
  trend TEXT, -- 'improving', 'stable', 'declining'
  report_artifact_path TEXT,
  temporal_workflow_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE health.health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  report_id UUID NOT NULL REFERENCES health.health_reports(id),
  metric_name TEXT NOT NULL, -- 'funding_activity', 'employee_growth', 'market_cap'
  current_value NUMERIC(15,2),
  previous_value NUMERIC(15,2),
  unit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE health.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE health.health_metrics ENABLE ROW LEVEL SECURITY;
```

### Persistence Map

| Data | Backend | Location | TTL | Notes |
|------|---------|----------|-----|-------|
| Health report metadata | Neon PostgreSQL | `health.health_reports` | Permanent | Monthly or on-demand reports |
| Health metrics | Neon PostgreSQL | `health.health_metrics` | Permanent | 5-20 per report |
| Report execution state | Upstash Redis | `{account_id}:health:{report_id}:state` | 24h | Current analysis stage |
| Health score cache | Upstash Redis | `{account_id}:health:industry:{industry}:score` | 12h | Quick lookup of industry health |
| Full health report | Cloudflare R2 | `health/{account_id}/{report_id}/health-report.json` | 30 days | Complete analysis and metrics |
| Health intelligence vectors | Qdrant | collection: `health-metrics` | Permanent | Trend analysis, pattern detection |

### BullMQ Queue
```typescript
const healthQueue = new Queue('health:report', redis);

healthQueue.process(async (job) => {
  const { accountId, reportType } = job.data;

  const metrics = await collectHealthMetrics(reportType);
  job.progress(50);

  const analysis = await analyzeHealthTrends(metrics);
  job.progress(75);

  await saveHealthReport(accountId, reportType, analysis);
  job.progress(100);

  return { success: true };
});
```

---

## Module 7: Pattern Discovery

Extracts patterns from opportunity scans, brand analysis, venture data.

### PostgreSQL Schema
```sql
CREATE SCHEMA pattern;

CREATE TABLE pattern.patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  pattern_type TEXT NOT NULL, -- 'market', 'brand', 'venture', 'technology'
  title TEXT NOT NULL,
  description TEXT,
  confidence_score NUMERIC(3,2),
  sources JSONB, -- references to source data (scans, reports)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pattern.pattern_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  pattern_id UUID NOT NULL REFERENCES pattern.patterns(id),
  instance_data JSONB, -- specific occurrence of this pattern
  relevance_score NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE pattern.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern.pattern_instances ENABLE ROW LEVEL SECURITY;
```

### Persistence Map

| Data | Backend | Location | TTL | Notes |
|------|---------|----------|-----|-------|
| Pattern definitions | Neon PostgreSQL | `pattern.patterns` | Permanent | Discovered patterns |
| Pattern instances | Neon PostgreSQL | `pattern.pattern_instances` | Permanent | 10-1000+ per pattern |
| Pattern analysis cache | Upstash Redis | `{account_id}:patterns:summary` | 24h | Aggregated pattern data |
| Full pattern report | Cloudflare R2 | `pattern/{account_id}/patterns-{YYYY-MM-DD}.json` | 30 days | All patterns for date range |
| Pattern vectors | Qdrant | collection: `pattern-analysis` | Permanent | For semantic pattern matching |

---

## Module 8: Learning Records

Knowledge base: discovered insights, lessons learned, experiment results.

### PostgreSQL Schema
```sql
CREATE SCHEMA learning;

CREATE TABLE learning.learning_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT, -- 'insight', 'lesson', 'finding', 'decision'
  source_module TEXT, -- which module generated this
  confidence_level TEXT, -- 'low', 'medium', 'high'
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learning.learning_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  record_id_a UUID NOT NULL REFERENCES learning.learning_records(id),
  record_id_b UUID NOT NULL REFERENCES learning.learning_records(id),
  connection_type TEXT, -- 'supports', 'contradicts', 'related'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE learning.learning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning.learning_connections ENABLE ROW LEVEL SECURITY;
```

### Persistence Map

| Data | Backend | Location | TTL | Notes |
|------|---------|----------|-----|-------|
| Learning records | Neon PostgreSQL | `learning.learning_records` | Permanent | Core knowledge base |
| Record connections | Neon PostgreSQL | `learning.learning_connections` | Permanent | Graph of insights |
| Full-text search index | Neon PostgreSQL | GIN tsvector on `learning_records.content` | Permanent | Fast knowledge base search |
| Learning vectors | Qdrant | collection: `learning` | Permanent | For semantic search across insights |

---

## Module 9: Bruce Core (bruce-memory)

Intelligence aggregator: syncs data across modules, maintains semantic knowledge graph.

### PostgreSQL Schema
```sql
CREATE SCHEMA memory;

CREATE TABLE memory.intelligence_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  snapshot_date DATE NOT NULL,
  summary TEXT,
  key_metrics JSONB,
  artifact_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, snapshot_date)
);

CREATE TABLE memory.knowledge_graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  entity_a TEXT NOT NULL, -- entity name/ID
  entity_b TEXT NOT NULL,
  relationship_type TEXT NOT NULL, -- 'competes_with', 'invests_in', 'works_with'
  confidence NUMERIC(3,2),
  source_modules TEXT[], -- ['opportunity', 'brand_aid', 'venture']
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE memory.intelligence_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory.knowledge_graph_edges ENABLE ROW LEVEL SECURITY;
```

### Persistence Map

| Data | Backend | Location | TTL | Notes |
|------|---------|----------|-----|-------|
| Intelligence snapshots | Neon PostgreSQL | `memory.intelligence_snapshots` | Permanent | Daily snapshots |
| Knowledge graph | Neon PostgreSQL | `memory.knowledge_graph_edges` | Permanent | Entity relationships |
| Sync job state | Upstash Redis | `{account_id}:bruce:sync:state` | 24h | Current sync progress |
| Embeddings cache | Upstash Redis | `{account_id}:bruce:embeddings:{entity}` | 7 days | Cached embeddings |
| Daily intelligence snapshot | Cloudflare R2 | `bruce-memory/{account_id}/intelligence-snapshot-{YYYY-MM}.json` | 30 days | Monthly intelligence export |
| Knowledge graph export | Cloudflare R2 | `bruce-memory/{account_id}/knowledge-graph-{YYYY-MM}.json` | 30 days | Graph structure export |
| Intelligence vectors | Qdrant | collection: `bruce-memory` | Permanent | Full knowledge base embeddings |
| Vector search queries | Upstash Redis | `{account_id}:bruce:queries:{query_hash}` | 24h | Recent query embeddings |

### Temporal.io Workflow for Daily Sync
```typescript
export async function dailyBruceMemorySyncWorkflow(
  accountId: string
): Promise<void> {
  // Pull data from all modules
  const opportunities = await activities.fetchOpportunities(accountId);
  const brands = await activities.fetchBrands(accountId);
  const ventures = await activities.fetchVentures(accountId);
  const health = await activities.fetchHealth(accountId);
  const patterns = await activities.fetchPatterns(accountId);

  // Generate intelligence snapshot
  const snapshot = await activities.generateSnapshot(
    opportunities,
    brands,
    ventures,
    health,
    patterns
  );

  // Update knowledge graph
  const graph = await activities.updateKnowledgeGraph(snapshot);

  // Generate embeddings for all entities
  await activities.generateAndStoreEmbeddings(graph);

  // Export to R2
  await activities.exportIntelligenceSnapshot(accountId, snapshot);

  // Update bruce-memory tables
  await activities.updateMemoryDB(accountId, snapshot, graph);
}
```

---

## Cross-Module Patterns

### Full-Text Search (Replaces Elasticsearch)
```sql
-- For modules with searchable content (ventures, learning)
ALTER TABLE venture.companies ADD COLUMN search_vector tsvector;

UPDATE venture.companies
SET search_vector = to_tsvector('english', name || ' ' || COALESCE(description, ''));

CREATE INDEX idx_company_search ON venture.companies USING GIN(search_vector);

-- Query
SELECT * FROM venture.companies
WHERE search_vector @@ plainto_tsquery('english', 'ai-powered')
ORDER BY ts_rank_cd(search_vector, plainto_tsquery('english', 'ai-powered')) DESC;
```

### JSON Storage for Semi-Structured Data
```sql
-- Brand elements, opportunity metadata, etc.
CREATE TABLE brand_aid.brand_elements (
  ...
  content JSONB NOT NULL,
  ...
);

-- Query JSONB
SELECT * FROM brand_aid.brand_elements
WHERE account_id = $1
  AND content->>'type' = 'color_palette'
  AND content->'colors' @> '[{"name": "primary"}]';

-- Index for performance
CREATE INDEX idx_brand_elements_type ON brand_aid.brand_elements USING GIN((content->'type'));
```

### Rate Limiting Pattern
```typescript
// Check before job submission
const currentUsage = await redis.get(
  `${accountId}:limits:${module}:${month}`
);

if (parseInt(currentUsage || '0') >= accountPlan.limit) {
  throw new Error('Job limit exceeded for this month');
}

// Increment after job completes
await redis.incr(`${accountId}:limits:${module}:${month}`);
await redis.expireat(
  `${accountId}:limits:${module}:${month}`,
  nextMonthTimestamp
);
```

---

## Summary: Data Flow

1. **Request arrives** at NestJS API (module service on Railway)
2. **Authentication:** Verify JWT, set `app.current_account_id` for RLS
3. **Job created** in Neon (account_id stored), inserted into jobs table
4. **Job queued** to BullMQ/Temporal with job ID + account ID
5. **Ephemeral state** stored in Redis with `{account_id}:` prefix
6. **Results** uploaded to R2 with `{account_id}/{module}/` path
7. **Vectors** stored in Qdrant with account_id as metadata filter
8. **Intelligence** aggregated daily via bruce-core workflow
9. **Cleanup:** Redis keys expire (TTL), R2 objects lifecycle-deleted after 30 days

Every operation respects tenant isolation. Every table has `account_id`. Every Redis key is prefixed. Every R2 path starts with `{account_id}/`. No data leaks between accounts.
