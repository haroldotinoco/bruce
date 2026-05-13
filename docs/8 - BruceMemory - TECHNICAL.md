# Bruce Memory — Technical Documentation

## 1. System Architecture

Bruce Memory is designed as a **pattern storage and retrieval system** that continuously ingests learning artifacts, extracts patterns, maintains pattern quality, and serves queries to all downstream modules. The architecture separates learning ingestion, pattern extraction, synthesis, and query serving into distinct layers.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│      Query API · Pattern Browser · Intelligence UI       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                 ORCHESTRATION LAYER                      │
│        NestJS Backend · Job Queue · State Manager        │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  INGESTION PIPELINE                      │
│     Learning Stream · Normalization · Storage            │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│               PATTERN EXTRACTION LAYER                   │
│   Pattern Discovery · Clustering · Synthesis · Curation │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                RETRIEVAL & QUERY LAYER                   │
│    Pattern Search · Vector Embeddings · Recommendation  │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│               STORAGE & INTEGRATION                      │
│    MongoDB · Vector DB · Module APIs · Integration      │
└─────────────────────────────────────────────────────────┘
```

## 2. Architectural Layers

### Layer A — Learning Ingestion (Continuous)

**Purpose**: Continuously collect learning artifacts from all Bruce modules.

**Method**: Pub/sub stream processing (RabbitMQ, Kafka, or Redis Streams)

**Input**: Learning events from all modules:
- Opportunity SaaS: "Pursued opportunity X. Outcome: Y. Learning: Z"
- BrandAid: "Created brand with approach X. Perception feedback: Y"
- Builder: "Used tech stack X. Maintenance cost: Y"
- GTM: "Executed strategy X. CAC: Y. Retention: Z"
- StartupOps: "Venture exhibited metrics X. Outcome after 6 weeks: Y"
- Portfolio: "Killed venture with profile X. Reason: Y"

**Normalization**: All incoming learning is normalized to a standard schema:

```json
{
  "event_id": "uuid",
  "venture_id": "uuid",
  "source_module": "string",
  "event_type": "decision|outcome|observation|signal",
  "learning_narrative": "string",
  "timestamp": "ISO8601",
  "venture_stage": "1–5",
  "venture_outcome": "success|failure|pivot|kill|ongoing",
  "quantitative_data": { "[metric_name]": "number" },
  "confidence": "0–100",
  "tags": ["string"],
  "related_ventures": ["uuid"],
  "priority": "high|medium|low"
}
```

**Storage**: MongoDB collection `learning_events` with time-series indexing.

**Key constraint**: Learning artifacts should be created within hours of the outcome being known, while context is fresh.

### Layer B — Pattern Extraction (Periodic: Weekly)

**Purpose**: Identify patterns across multiple learning records.

**Frequency**: Weekly extraction cycles; incremental updates on top of historical patterns.

**Agents**: Pattern Extractor (LLM + statistical analysis)

**Process**:

1. **Retrieve recent learning records**:
   - All records from past week
   - Filter by tag/category (e.g., "GTM_strategy", "build_architecture")

2. **Candidate pattern generation**:
   - Use LLM to identify potential patterns in narrative text
   - Apply statistical clustering on quantitative data
   - Look for repeated phrases, concepts, outcomes

3. **Pattern evidence gathering**:
   - For each candidate pattern, count how many ventures exhibit it
   - Verify the pattern holds across multiple ventures (minimum 2–3)
   - Compute confidence: `confidence = evidence_count / similar_ventures_total`

4. **Pattern metadata**:
   - Pattern statement (concise, actionable)
   - Category (opportunity, GTM, build, brand, etc.)
   - Strength (strong if 50+ ventures, moderate if 5–20, weak if 2–5)
   - Applicable scope (when does this pattern hold?)
   - Caveats (where doesn't it apply?)

5. **Conflict detection**:
   - Does this new pattern contradict an existing pattern?
   - If yes, flag for manual review; keep both patterns with context notes

6. **Update existing patterns**:
   - If similar pattern exists, merge evidence
   - Increment evidence count
   - Recalculate confidence
   - Update status (active/under review/archived based on confidence)

**Output**: Pattern database updates, new pattern creation, pattern confidence updates.

**Output Schema**:

```json
{
  "id": "uuid",
  "pattern_statement": "string",
  "pattern_category": "opportunity|gtm|build|brand|traction_signal|failure_signal|success_factor",
  "evidence_ventures": ["uuid"],
  "evidence_count": "number",
  "confidence": "0–100",
  "strength": "strong|moderate|weak",
  "applicability": {
    "stage": "1–5 (or 1–5)",
    "venture_type": "string (optional)",
    "geography": "string (optional)",
    "constraints": ["string"]
  },
  "caveats": ["string"],
  "recommendations": ["string"],
  "contradicting_patterns": ["pattern_id"],
  "supporting_patterns": ["pattern_id"],
  "created_at": "ISO8601",
  "last_updated": "ISO8601",
  "status": "active|under_review|archived",
  "creation_cycle": "number (which extraction cycle)"
}
```

### Layer C — Pattern Synthesis (Periodic: Bi-weekly)

**Purpose**: Group related patterns into coherent clusters and generate cross-venture syntheses.

**Frequency**: Bi-weekly synthesis cycles.

**Agents**: Cross-Venture Analyst (LLM reasoning engine)

**Process**:

1. **Retrieve all active patterns**:
   - Filter by status = "active"
   - Exclude low-confidence patterns (<40%)

2. **Semantic clustering**:
   - Use vector embeddings to group related patterns
   - Example: Patterns about "freemium models," "onboarding speed," and "signup-to-paid conversion" cluster together

3. **Cluster synthesis**:
   - For each cluster, identify the primary pattern (most evidence/strongest)
   - Identify supporting patterns (complementary)
   - Identify conflicting patterns (note the context for each)
   - Create cluster narrative (synthesis of all patterns)

4. **Cross-venture comparison**:
   - Identify venture groups with similar traits
   - Compare their outcomes (e.g., ventures with founder A + tech stack X vs founder B + tech stack X)
   - Quantify difference (3x success rate, 2x faster PMF, etc.)

5. **Recommendation generation**:
   - For each cluster, generate actionable recommendations
   - Example: "Cluster: Freemium models. Recommendation: Prioritize <3 min onboarding to maximize month-1 retention."

**Output**: PatternCluster documents, CrossVentureLearning documents.

**Output Schema**:

```json
{
  "id": "uuid",
  "cluster_name": "string",
  "description": "string",
  "patterns": ["pattern_id"],
  "primary_pattern_id": "pattern_id",
  "supporting_pattern_ids": ["pattern_id"],
  "conflicting_pattern_ids": ["pattern_id"],
  "conflict_context": ["string"],
  "synthesis_narrative": "string",
  "recommendations": ["string"],
  "applicable_domain": "string",
  "venture_examples": ["uuid"],
  "created_at": "ISO8601",
  "last_updated": "ISO8601"
}
```

### Layer D — Intelligence Synthesis (Periodic: Monthly)

**Purpose**: Create actionable intelligence snapshots and module-specific guidance.

**Frequency**: Monthly synthesis cycles.

**Agents**: Intelligence Synthesizer (LLM reasoning engine)

**Process**:

1. **Aggregate cluster learnings**:
   - Synthesize clusters by module (opportunities for Opportunity SaaS, GTM strategies for GTM, etc.)
   - Identify top 3–5 insights per module

2. **Generate module-specific briefs**:
   - "For Opportunity SaaS: We've learned that marketplace opportunities require 2x runway. Solo-founder ventures have 2.5x lower success. Recommend filtering on team strength and category."
   - "For Builder: Monolithic architectures reach unmaintainability at 100k lines. Recommend microservices strategy earlier for ventures expecting scale."

3. **Detect contradictions**:
   - Identify patterns that conflict
   - Document when each pattern applies
   - Flag for potential human review

4. **Meta-insights**:
   - "Bruce's hit rate has improved 8% since last month. Key factor: better opportunity screening due to Memory insights."
   - "We've discovered 15 new patterns this month. Pattern discovery velocity is slowing (was 20 last month), suggesting we're reaching saturation."

5. **Generate recommender rules**:
   - If (venture_type = "fintech" AND positioning != "trust-first") → flag as risky
   - If (founder_experience = "none" AND venture_type = "marketplace") → recommend extra screening
   - If (onboarding_time > 3_minutes AND model = "freemium") → predict low month-1 retention

**Output**: IntelligenceSnapshot, recommender rules, module-specific guidance.

**Output Schema**:

```json
{
  "id": "uuid",
  "period_start": "ISO8601",
  "period_end": "ISO8601",
  "generated_at": "ISO8601",
  "new_patterns": ["pattern_id"],
  "patterns_updated": ["pattern_id"],
  "patterns_downgraded": ["pattern_id"],
  "patterns_archived": ["pattern_id"],
  "module_guidance": {
    "opportunity_saas": ["string"],
    "builder": ["string"],
    "gtm": ["string"],
    "brandaid": ["string"],
    "startupops": ["string"],
    "portfolio": ["string"]
  },
  "top_clusters_this_period": ["cluster_id"],
  "contradiction_flags": [
    {
      "pattern_a_id": "uuid",
      "pattern_b_id": "uuid",
      "context": "string"
    }
  ],
  "meta_insights": ["string"],
  "pattern_discovery_velocity": "number (patterns per week)",
  "system_health_trend": "improving|stable|declining"
}
```

### Layer E — Retrieval & Query (Real-time)

**Purpose**: Answer queries from any Bruce module about learned patterns.

**Frequency**: Real-time, sub-100ms responses.

**Agents**: Memory Curator (query engine + LLM reasoning)

**Storage**:
- **Document store** (MongoDB): Full pattern documents, clusters, learnings
- **Vector DB** (Pinecone, Weaviate, or Milvus): Embeddings of pattern statements for semantic search
- **Search index** (Elasticsearch): Full-text search on patterns, tags, recommendations

**Query Types**:

#### Query Type 1: Exact Pattern Match
```
Q: "What do we know about freemium models with <3 min onboarding?"
A: [PatternCluster: "Freemium models with fast onboarding"]
   - Pattern A: "<3 min onboarding increases month-1 retention 5x"
   - Confidence: 85% (observed in 12 ventures)
   - Recommendation: Prioritize <3 min onboarding
```

#### Query Type 2: Similarity Match (Vector Search)
```
Q: "I'm building a marketplace for freelance writers. What's the success rate?"
A: [Similar ventures found via embedding search]
   - Venture A (freelance designers marketplace): Failed, kill reason = unit economics
   - Venture B (freelance editors marketplace): Pivoted at 6 weeks
   - Venture C (freelance writers SaaS): Succeeded
   - Pattern: Marketplaces for writers have lower retention (churn causes unit economics to break)
   - Recommendation: Focus on retention strategy early
```

#### Query Type 3: Context-Aware Recommendation
```
Q: "What GTM strategy should I use for a B2B SaaS targeting SMBs?"
A: [Synthesis from clusters + LLM reasoning]
   - Similar ventures: [List]
   - Best GTM: Inbound content + LinkedIn outreach
   - Expected CAC: $8–15
   - Expected month-1 retention: ~40%
   - Runway to PMF: 4–5 months
   - Watch out for: "Partnerships with existing players" often fail; validate early
```

#### Query Type 4: Failure Risk Assessment
```
Q: "Portfolio is evaluating whether to kill Venture X (marketplace, solo founder, zero traction 8 weeks)"
A: [Pattern match against failure signals]
   - This profile matches 15 killed ventures
   - Kill rate: 93% (14 out of 15 killed, 1 survived)
   - Confidence: 88%
   - Time-to-kill for this profile: average 8.2 weeks
   - Recommendation: High confidence kill recommendation
```

**Query Response Schema**:

```json
{
  "query_id": "uuid",
  "query_text": "string",
  "timestamp": "ISO8601",
  "matched_patterns": [
    {
      "pattern_id": "uuid",
      "pattern_statement": "string",
      "match_type": "exact|semantic|contextual",
      "relevance_score": "0–100",
      "confidence": "0–100",
      "evidence_ventures": ["uuid"],
      "recommendation": "string"
    }
  ],
  "conflicting_patterns": [
    {
      "pattern_id": "uuid",
      "context": "string"
    }
  ],
  "overall_recommendation": "string",
  "response_time_ms": "number"
}
```

## 3. Core Data Schema

### 3.1 LearningRecord

```json
{
  "id": "uuid",
  "venture_id": "uuid",
  "source_module": "opportunity|brandaid|builder|gtm|startupops|portfolio|other",
  "event_type": "decision|outcome|observation|failure_signal|success_signal",
  "learning_narrative": "string (500+ chars, detailed narrative)",
  "quantitative_data": {
    "[metric_name]": {
      "value": "number",
      "unit": "string",
      "context": "string"
    }
  },
  "timestamp": "ISO8601",
  "stage": "1–5",
  "venture_outcome": "success|failure|pivot|kill|ongoing",
  "confidence": "0–100",
  "tags": ["string"],
  "related_ventures": ["uuid"],
  "narrative_embedding": "vector (generated via embedding model)",
  "created_at": "ISO8601",
  "created_by_agent": "string"
}
```

### 3.2 Pattern

```json
{
  "id": "uuid",
  "pattern_statement": "string",
  "pattern_embedding": "vector",
  "pattern_category": "opportunity|gtm|build|brand|traction_signal|failure_signal|success_factor",
  "evidence_ventures": ["uuid"],
  "evidence_count": "number",
  "confidence": "0–100",
  "strength": "strong|moderate|weak",
  "applicability": {
    "stage": "1–5 or range",
    "venture_type": ["string"],
    "geography": ["string"],
    "additional_constraints": ["string"]
  },
  "caveats": ["string"],
  "recommendations": ["string"],
  "contradicting_pattern_ids": ["uuid"],
  "supporting_pattern_ids": ["uuid"],
  "created_at": "ISO8601",
  "last_updated": "ISO8601",
  "last_evidence_added": "ISO8601",
  "status": "active|under_review|archived",
  "confidence_trend": "improving|stable|declining"
}
```

### 3.3 PatternCluster

```json
{
  "id": "uuid",
  "cluster_name": "string",
  "description": "string",
  "pattern_ids": ["uuid"],
  "primary_pattern_id": "uuid",
  "supporting_pattern_ids": ["uuid"],
  "conflicting_pattern_ids": ["uuid"],
  "conflict_resolutions": [
    {
      "pattern_a_id": "uuid",
      "pattern_b_id": "uuid",
      "context_for_a": "string",
      "context_for_b": "string"
    }
  ],
  "synthesis_narrative": "string",
  "recommendations": ["string"],
  "applicable_domains": ["string"],
  "example_ventures": ["uuid"],
  "created_at": "ISO8601",
  "last_updated": "ISO8601"
}
```

### 3.4 CrossVentureLearning

```json
{
  "id": "uuid",
  "learning_statement": "string",
  "ventures_compared": {
    "baseline_group": ["uuid"],
    "comparison_group": ["uuid"]
  },
  "metric_compared": "string",
  "baseline_value": "number",
  "comparison_value": "number",
  "difference_magnitude": "number (ratio or percentage)",
  "statistical_confidence": "0–100",
  "interpretation": "string",
  "recommendations": ["string"],
  "caveats": ["string"],
  "created_at": "ISO8601"
}
```

### 3.5 IntelligenceSnapshot

```json
{
  "id": "uuid",
  "period_start": "ISO8601",
  "period_end": "ISO8601",
  "generated_at": "ISO8601",
  "new_patterns": ["pattern_id"],
  "updated_patterns": ["pattern_id"],
  "downgraded_patterns": ["pattern_id"],
  "archived_patterns": ["pattern_id"],
  "module_guidance": {
    "[module_name]": ["string"]
  },
  "top_clusters": ["cluster_id"],
  "contradictions_detected": ["{ pattern_a_id, pattern_b_id, context }"],
  "pattern_discovery_velocity": "number",
  "system_insights": ["string"],
  "confidence_calibration_check": "string"
}
```

## 4. Technology Stack

### Storage & Databases

| Component               | Technology                                             |
| ----------------------- | ------------------------------------------------------ |
| **Document store**      | MongoDB (Mongoose) for patterns, clusters, learnings   |
| **Vector database**     | Pinecone, Weaviate, or Milvus for semantic search      |
| **Full-text search**    | Elasticsearch for pattern search and discovery         |
| **Time-series data**    | MongoDB with time-series indexing for learning events  |
| **Caching**             | Redis for frequently-accessed patterns                 |

### AI Services

| Service                            | Role                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------ |
| **OpenAI API (Reasoning)**         | Pattern extraction, synthesis, recommendation generation, query answering                       |
| **Embeddings API (text-embedding-3)** | Generate embeddings for patterns and queries for semantic search |

### Indexing & Search

| Component            | Technology                                                           |
| -------------------- | -------------------------------------------------------------------- |
| **Vector indexing**  | HNSW (Hierarchical Navigable Small World) for sub-100ms retrieval    |
| **Full-text index**  | Elasticsearch inverted index for rapid pattern discovery             |
| **Time-series index**| MongoDB time-series index for efficient learning event queries        |

### Orchestration

| Component               | Technology                                             |
| ----------------------- | ------------------------------------------------------ |
| **Backend**             | Node.js / NestJS                                       |
| **Job Queue**           | Bull / BullMQ (Redis) for async extraction, synthesis  |
| **Stream Processing**   | RabbitMQ, Kafka, or Redis Streams for learning ingestion |
| **State Management**    | Redis for caching and session management               |

## 5. API Design (High-Level)

### Learning Ingestion

| Endpoint                               | Method | Description                                    |
| -------------------------------------- | ------ | ---------------------------------------------- |
| `/memory/learning/ingest`              | POST   | Ingest learning artifact from module            |
| `/memory/learning/:id`                 | GET    | Retrieve specific learning record               |
| `/memory/learning`                     | GET    | List recent learning records                    |

### Pattern & Cluster Management

| Endpoint                               | Method | Description                                    |
| -------------------------------------- | ------ | ---------------------------------------------- |
| `/memory/patterns`                     | GET    | List all active patterns                        |
| `/memory/patterns/:id`                 | GET    | Retrieve specific pattern with evidence         |
| `/memory/clusters`                     | GET    | List all pattern clusters                       |
| `/memory/clusters/:id`                 | GET    | Retrieve cluster with synthesis                 |

### Query & Intelligence

| Endpoint                               | Method | Description                                    |
| -------------------------------------- | ------ | ---------------------------------------------- |
| `/memory/query`                        | POST   | Query for patterns relevant to a context        |
| `/memory/search`                       | POST   | Full-text search for patterns                   |
| `/memory/semantic-search`              | POST   | Vector semantic search for similar patterns     |
| `/memory/recommendation`               | POST   | Get recommendations for a venture context       |
| `/memory/intelligence`                 | GET    | Get latest IntelligenceSnapshot                 |
| `/memory/contradiction`                | GET    | Get documented pattern contradictions           |

### Analytics & Reporting

| Endpoint                               | Method | Description                                    |
| -------------------------------------- | ------ | ---------------------------------------------- |
| `/memory/stats`                        | GET    | Memory statistics (pattern count, confidence, velocity) |
| `/memory/health`                       | GET    | Memory system health and consistency            |
| `/memory/report/:period`               | GET    | Generate intelligence report for period        |

## 6. Operational Flows

### Learning Ingestion Flow

```
[Module: GTM]
    │ (event: "Executed TikTok strategy, CAC $3")
    ▼
[Learning Ingest API]
    │
    ▼
[Normalize to Learning Record Schema]
    │
    ▼
[MongoDB: learning_events collection]
    │
    └──► [Weekly Pattern Extraction Job]
```

### Pattern Extraction Flow

```
[Scheduled Weekly Job]
    │
    ▼
[Retrieve learning records from past 7 days]
    │
    ▼
[LLM Pattern Candidate Generation]
    │
    ▼
[Count evidence: "Is this pattern in 3+ ventures?"]
    │
    ├─ YES: Confidence ≥ 40%
    │   │
    │   ▼
    │  [Create/Update Pattern]
    │   │
    │   └─► [Check for contradictions]
    │
    └─ NO: Confidence < 40%
        │
        ▼
       [Mark as "under_review"]
```

### Query Flow

```
[Module: Opportunity SaaS]
    │ (query: "Is this marketplace opportunity viable?")
    ▼
[Memory Query API]
    │
    ├─ Vector embedding of query
    │   │
    │   ▼
    │  [Semantic search in Vector DB]
    │
    ├─ Full-text search keywords
    │   │
    │   ▼
    │  [Elasticsearch search]
    │
    └─ Structured filters (category, stage, etc.)
        │
        ▼
    [Merge and rank results]
        │
        ▼
    [LLM synthesis of matched patterns]
        │
        ▼
    [Return QueryResponse]
        │
        ▼
    [Module makes informed decision]
```

## 7. Non-Functional Requirements

| Requirement                  | Target                                         |
| ---------------------------- | ---------------------------------------------- |
| **Query latency**            | <100ms for pattern lookup (P95)                |
| **Ingestion latency**        | <1s from event to stored record                |
| **Extraction cycle time**    | <30 min for weekly pattern extraction          |
| **Synthesis cycle time**     | <1 hour for bi-weekly synthesis                |
| **Pattern search accuracy**  | >80% relevance for top-3 results               |
| **Availability**             | 99.5% uptime                                   |
| **Throughput**               | 1000+ learning events per day                  |
| **Storage efficiency**       | <100MB per 100 active patterns                 |
| **Concurrent queries**       | Support 10+ simultaneous queries               |

## 8. Deployment Considerations

| Concern               | Approach                                                                     |
| --------------------- | ---------------------------------------------------------------------------- |
| **Duplicate patterns**| Deduplication via embedding similarity; merge if >90% similar               |
| **Data freshness**    | Weekly extraction ensures patterns are never >7 days old                     |
| **Search accuracy**   | Regular relevance testing; tune embedding model if accuracy drops           |
| **Cost management**    | Cache frequently-used patterns; batch embedding generation                  |
| **Scaling**           | Vector DB naturally scales; MongoDB sharding by venture_id                  |
| **Monitoring**        | Alert on pattern contradiction increase, confidence degradation, staleness |
| **Curation**          | Monthly review of low-confidence patterns for potential archival            |

## 9. Integration with Bruce Core

Bruce Memory exports a `IntelligenceSnapshot` to Bruce Core monthly:

```
GET /memory/intelligence
Response:
{
  "patterns_active": 47,
  "patterns_high_confidence": 32,
  "pattern_discovery_velocity": 3.2,
  "key_learnings": ["string"],
  "recommendations_by_module": {...},
  "system_improvement_trend": "improving 8% YoY"
}
```

This enables Bruce Core to track whether the system is improving and to adjust strategy based on accumulated learning.
