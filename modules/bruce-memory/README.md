# BruceMemory: Cross-Venture Learning System

## Purpose

BruceMemory is BruceAI's long-term memory system. It extracts patterns from every venture's journey (wins AND failures), synthesizes cross-venture intelligence, and serves that intelligence back to all other modules to improve future decisions.

BruceMemory answers questions like:
- "What patterns do we know about B2B SaaS GTM?"
- "What do successful infrastructure ventures have in common?"
- "What were the red flags in our failed ventures?"
- "Should we enter healthcare software based on what we've learned?"

## Architecture

### Five Specialized Agents

1. **Learning Ingestion Agent**
   - Receives learning records from any module (governance, GTM, portfolio, etc.)
   - Validates, normalizes, and stores learnings
   - Minimum quality standard: 40% confidence, quantitative data, explicit outcome

2. **Pattern Extractor Agent**
   - Runs weekly batch analysis on learning corpus
   - Clusters semantically similar learnings using vector DB
   - Extracts statistically significant patterns (3+ ventures, 60%+ confidence)
   - Tracks pattern staleness and contradictions

3. **Cross-Venture Analyst Agent**
   - Runs bi-weekly comparative analysis across entire portfolio
   - Identifies co-occurring success factors and failure patterns
   - Surfaces market timing signals and resource efficiency patterns
   - Isolates venture-specific factors from market effects

4. **Intelligence Synthesizer Agent**
   - Runs monthly synthesis of pattern library
   - Selects top 10 high-confidence patterns (ranked by confidence × recency)
   - Identifies emerging signals and contradicted patterns
   - Produces strategic implications for Bruce's investment thesis

5. **Query Agent**
   - Serves real-time on-demand queries from other modules
   - Semantic search over pattern library
   - Returns top 5 patterns ranked by relevance and confidence
   - 30-second response SLA, <500ms p95 latency target

## Data Flow

```
Learning Submission (from any module)
         ↓
    Validation & Normalization
         ↓
Vector Embedding & Storage
         ↓
       [WEEKLY BATCH]
    Pattern Extraction
         ↓
Pattern Publication (confidence ≥ 0.6, 3+ ventures)
         ↓
      [BI-WEEKLY]
 Cross-Venture Analysis
         ↓
      [MONTHLY]
Intelligence Synthesis Snapshot
         ↓
     [ON-DEMAND]
 Query Service to Other Modules
```

### Workflow Cadences

| Workflow | Schedule | Duration | SLA |
|----------|----------|----------|-----|
| Learning Ingestion | On-demand | <30s per record | 100 records/day max |
| Pattern Extraction | Weekly (Sun 3 AM) | <15 min | Completion by Sun 6 AM |
| Cross-Venture Analysis | Bi-weekly (1st, 15th 4 AM) | <15 min | Completion by 6 AM |
| Intelligence Synthesis | Monthly (1st 6 AM) | <10 min | Completion by 7 AM |
| On-Demand Query | Real-time | <30s | p95 < 500ms |

## Key Contracts and Schemas

### Input Contracts
- **learning-record.schema.json**: Learning records from source modules
- **memory-query.schema.json**: On-demand pattern queries

### Output Contracts
- **pattern.schema.json**: Extracted patterns (confidence, evidence, applicability)
- **intelligence-snapshot.schema.json**: Monthly intelligence synthesis
- **memory-query.schema.json** (response portion): Query results

### Data Contracts
- **learning-record.schema.json**: Core learning record structure
- **pattern.schema.json**: Pattern store schema
- **intelligence-snapshot.schema.json**: Monthly snapshot schema

All contracts are JSON Schema draft-07 and located in `/contracts/`.

## Privacy and Confidentiality

### What IS Included in Patterns
- Anonymized outcomes ("A B2B SaaS in healthcare..." not "MediLink Connect...")
- Quantitative metrics (CAC, LTV, growth rates)
- Market segment and stage signals
- Temporal patterns

### What IS NOT Included in Patterns
- Founder/team names or personal information
- Customer lists or company names
- Proprietary metrics (revenue, margins)
- Specific acquisition prices or investment terms

### Confidentiality Rules
- Individual learning records: Internal use only, never shared externally
- Patterns: Can be shared with other BruceAI modules; anonymized version can be shared externally
- Kill postmortems: Stored and used for pattern extraction, but venture not named in patterns
- Intelligence snapshots: For authorized leadership only

See `/policies/privacy-policy.md` for complete rules.

## Query Examples

### From Opportunity Module
**"What do we know about GTM strategies for developer tools SaaS?"**
- Returns patterns on developer-first GTM, freemium models, CAC efficiency
- Synthesis: "Developer community building 3-4x more efficient than enterprise sales for this segment"

### From GTM Module
**"What patterns exist around sales cycle length by vertical?"**
- Returns patterns on healthcare (4-6 months), regulated software (long cycles), SMB vs enterprise
- Synthesis: "Enterprise sales cycles 2x longer than SMB. Healthcare adds 3-6 month procurement delays."

### From Portfolio Module
**"Any red flags for supply chain software ventures?"**
- Returns patterns on domain expertise, competitive entrenchment, CAC/LTV sustainability
- Synthesis: "Supply chain ventures without founder logistics background show <5% conversion. CAC/LTV ratios often unsustainable (>0.7)."

## Key Metrics

### Quarterly Health Checks
- **Pattern coverage**: > 15 active patterns across portfolio
- **Learning ingestion**: > 80 learnings per quarter (sustainable rate)
- **Query hit rate**: > 70% of queries return at least 1 pattern
- **Pattern staleness**: < 20% of patterns without update in 6+ months

### Monthly Intelligence KPIs
- **Key patterns per snapshot**: 5-10 (ranked by confidence)
- **Strategic implications**: 3-6 actionable thesis changes
- **Emerging signals**: 1-3 new patterns with early evidence
- **Synthesis latency**: < 5 minutes

### Real-Time Query Performance
- **Response latency p95**: < 500ms
- **Response latency p99**: < 2 seconds
- **Hit rate**: % of queries returning patterns
- **Timeout rate**: < 0.1% (hard 30-second SLA)

## Configuration

### Minimum Thresholds
- **Learning confidence**: 40% minimum to store; 40-60% flagged for review
- **Pattern evidence**: 3 ventures minimum, 5+ learning records, 60% confidence
- **Pattern publication**: Confidence >= 0.6 to publish (synthesizer uses 0.7)
- **Query results**: Return patterns with confidence >= 0.5 (lower to 0.3 and flag if needed)

### Weighting Rules
- **Recent learnings** (0-2 weeks): Full weight in pattern extraction
- **Fresh learnings** (2-8 weeks): 80% weight
- **Aging learnings** (8 weeks - 18 months): 60% weight
- **Stale learnings** (>18 months): 30% weight (excluded from emerging patterns)

## File Structure

```
bruce-memory/
├── README.md                              (this file)
├── agents/                                (5 specialized agents)
│   ├── learning-ingestion-agent/
│   ├── pattern-extractor/
│   ├── cross-venture-analyst/
│   ├── intelligence-synthesizer/
│   └── query-agent/
├── workflows/                             (5 workflow definitions)
│   ├── learning-ingestion.workflow.json
│   ├── weekly-pattern-extraction.workflow.json
│   ├── monthly-intelligence-synthesis.workflow.json
│   ├── cross-venture-analysis.workflow.json
│   └── on-demand-query.workflow.json
├── contracts/                             (data contracts)
│   ├── learning-record.schema.json
│   ├── pattern.schema.json
│   ├── intelligence-snapshot.schema.json
│   └── memory-query.schema.json
├── state/                                 (module state schemas)
│   ├── module-state.schema.json
│   └── execution-state.schema.json
├── policies/                              (operational policies)
│   ├── learning-policy.md
│   ├── privacy-policy.md
│   └── query-policy.md
├── evaluations/                           (test scenarios)
│   ├── happy-path.md
│   ├── low-confidence-pattern.md
│   ├── query-no-results.md
│   ├── monthly-synthesis.md
│   └── fixtures/
│       ├── learning-record-input.json
│       └── pattern-query-input.json
└── observability/                         (metrics and events)
    ├── events.md
    ├── metrics.md
    └── correlation-ids.md
```

## Integration with Other Modules

### Modules That Send Learnings
- **opportunity**: Venture evaluation insights, hypothesis tests
- **add-venture**: Venture structuring decisions and learnings
- **brand-aid**: Market signal observations, competitive intelligence
- **builder**: Product development learnings, feature validation results
- **gtm**: GTM strategy outcomes, channel performance, sales cycle data
- **startup-ops**: Team composition correlations, hiring impact signals
- **portfolio**: Kill postmortems, scale decisions, portfolio-level patterns

### Modules That Query Memory
- **opportunity**: "What patterns apply to ventures in this market segment?"
- **add-venture**: "What structuring approach worked best for similar ventures?"
- **gtm**: "What GTM channels are most efficient for this business model?"
- **portfolio**: "Are there red flags we should watch for this venture?"
- **bruce-core**: "What intelligence should inform this investment decision?"

### Inter-Module Events
- Learning ingested: `bruce-memory.learning.ingested` → Used by extraction pipeline
- Pattern extracted: `bruce-memory.pattern.extracted` → Consumed by synthesis and query agents
- Intelligence synthesized: `bruce-memory.intelligence.synthesized` → Emitted to bruce-core
- Query served: `bruce-memory.query.served` → For audit and performance tracking

## External Dependencies

### Required Services
- **Vector Database** (Pinecone or Weaviate): For semantic search and clustering of learnings and patterns
- **Persistent Store**: For learning records and pattern library (can be PostgreSQL, S3, or specialized vector DB with persistence)

### Optional Integrations
- **Event Bus** (Kafka, EventBridge): For event-driven workflows
- **Analytics Dashboard**: For metrics visualization
- **Data Warehouse**: For historical trend analysis

## Operational Runbooks

### Normal Operations
- Learning ingestion runs continuously (on-demand)
- Pattern extraction runs weekly Sundays 3 AM (automated)
- Cross-venture analysis runs 1st and 15th of month at 4 AM (automated)
- Intelligence synthesis runs 1st of month at 6 AM (automated)
- Query service runs 24/7 (on-demand)

### When to Investigate
- **No learnings for 7 days**: Check if source modules are submitting learnings
- **0 patterns extracted for 2 weeks**: Check extraction pipeline logs, verify vector DB connectivity
- **Query hit rate drops below 40%**: Pattern coverage gap, investigate topic areas with no results
- **Vector DB latency > 2 seconds**: Check vector DB health, consider index optimization

### Escalation Path
1. Check observability metrics (`/observability/metrics.md`)
2. Review event logs for error events (`/observability/events.md`)
3. Use correlation IDs to trace specific learnings through system (`/observability/correlation-ids.md`)
4. Contact infrastructure team for vector DB issues
5. Contact data team for learning corpus quality issues

## Related Documentation

- **Agent Details**: See individual SKILL.md files in `/agents/` for agent-specific decision rules
- **Data Policies**: See `/policies/` for learning, privacy, and query policies
- **Evaluations**: See `/evaluations/` for test scenarios and expected behaviors
- **Observability**: See `/observability/` for metrics, events, and trace patterns
