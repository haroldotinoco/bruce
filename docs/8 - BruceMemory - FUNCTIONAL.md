# Bruce Memory — Functional Documentation

## 1. Overview

Bruce Memory is a strategic intelligence system that captures, curates, and synthesizes cross-venture learning from every Bruce cycle. Rather than storing isolated venture records, it recognizes patterns across opportunities, GTM strategies, product architectures, branding, traction signals, failure modes, and success factors. This accumulated learning is fed back into Opportunity, BrandAid, Builder, GTM, StartupOps, and Portfolio to inform better decisions.

---

## 2. Objective

The objective of Bruce Memory is:

> **to systematically capture learning from every venture, synthesize it into actionable patterns, and make that pattern library available to all Bruce modules to improve decision quality on subsequent ventures.**

Success is measured by:

- The quantity and quality of patterns discovered per cycle.
- The confidence levels of patterns (patterns based on 50 ventures have higher confidence than patterns based on 2).
- The rate at which new patterns are discovered (early cycles discover fast; later cycles discover slower as saturation increases).
- The impact of pattern recommendations on decision quality (do ventures that follow Memory recommendations have higher success rates?).
- The reduction in cycle time for decision-making (can modules make faster decisions because Memory answers questions immediately?).

---

## 3. Main Flow

The Bruce Memory operational cycle repeats continuously:

```
Feed ──► Ingest ──► Extract ──► Cluster ──► Synthesize ──► Query ──► [consume] ──► [repeat]
```

### 3.1 Feed (continuous)

**Input**: Decision artifacts and learnings from all modules.

**Agents**: Memory Feeders (lightweight agents in each module)

**Process**:
- Every time a decision is made (Portfolio allocates resources, BrandAid produces a brand, Builder ships code), a brief learning artifact is created.
- This artifact is sent to Bruce Memory.
- Artifacts include:
  - What the decision was
  - Why it was made
  - What happened as a result (immediate + eventual outcome)
  - Surprising insights
  - Contradictions to previous patterns

**Examples**:
- Portfolio kills Venture X: "Killed due to zero traction in 8 weeks. What we learned: [user acquisition model never worked] [founder too inexperienced] [market timing was wrong]"
- GTM launches strategy Y: "Launched TikTok influencer strategy for Gen Z product. CAC $3, month-1 retention 18%. Viral metrics strong initially but dropped off."
- Builder ships architecture Z: "Built microservices on Kubernetes. Deployment complexity high initially but operations improved after 6 weeks. Recommend for ventures expecting >100k daily users."

**Output**: Continuous stream of learning artifacts, stored in time-series.

### 3.2 Ingest (periodic: weekly)

**Input**: Learning artifacts from all modules.

**Agents**: Pattern Extractor

**Process**:
- Retrieve all learning artifacts from the past week.
- Normalize them into a standard learning schema (see section 4 below).
- Enrich with context:
  - What was the venture's stage?
  - What was the outcome (success/failure/pivot/kill)?
  - Who were the key actors?
  - How confident is this learning (based on what percentage of ventures exhibit this pattern)?

**Output**: Standardized learning records, indexed and queryable.

### 3.3 Extract (periodic: weekly)

**Input**: Standardized learning records.

**Agents**: Pattern Extractor (continued)

**Process**:
- Analyze learning records for patterns:
  - Do 3+ ventures exhibit the same pattern?
  - Do we see causal relationships (when X happens, Y follows)?
  - Do we see correlations (ventures with trait A tend to have outcome B)?
  - Are there contradictions (Venture C succeeded with approach X, but Venture D failed with approach X; why?)?

- For each potential pattern, extract:
  - The pattern statement
  - Ventures that exhibit it
  - Strength (how many ventures)
  - Caveats (where does it not apply?)
  - Confidence level

**Output**: Pattern library with metadata.

### 3.4 Cluster (periodic: bi-weekly)

**Input**: Pattern library.

**Agents**: Cross-Venture Analyst

**Process**:
- Group related patterns into clusters:
  - Cluster 1: "Freemium models with fast onboarding"
    - Pattern A: "<3 min onboarding increases month-1 retention 5x"
    - Pattern B: "Freemium model shows 2x higher signup-to-paid conversion than gated model"
    - Pattern C: "For freemium models, month-3 retention critical predictor of LTV"
  - Cluster 2: "Early-stage fundraising signals"
    - Pattern A: "When founder has previous exit, venture 3x more likely to raise Series A"
    - Pattern B: "When venture shows profitability by month 6, fundraising velocity 5x faster"

- Within each cluster, identify:
  - Which patterns are complementary (all point in same direction)
  - Which patterns conflict (some point in different directions)
  - Which pattern is the strongest (most evidence)
  - What's the simplest cluster recommendation?

**Output**: Organized PatternCluster documents.

### 3.5 Synthesize (periodic: monthly)

**Input**: PatternClusters.

**Agents**: Intelligence Synthesizer

**Process**:
- Create cross-cluster synthesis documents:
  - "For B2B SaaS targeting SMBs" (synthesis across opportunity, GTM, build, brand patterns)
  - "Failure modes of marketplace ventures" (synthesis across killed ventures with similar characteristics)
  - "How founder experience correlates with success" (synthesis across all success factor patterns)

- Create recommender outputs:
  - "If you're building a fintech venture, here's what we've learned works"
  - "If you're targeting Gen Z consumers, here's the GTM approach with highest success rate"

- Flag contradictions and uncertainties:
  - "Pattern A and Pattern B contradict each other. Context matters. Here's when each applies."

**Output**: IntelligenceSnapshot documents, recommender rules, contradiction flags.

### 3.6 Query (continuous)

**Input**: Questions from any Bruce module.

**Agents**: Memory Curator (query engine + LLM reasoning)

**Process**:
- When Opportunity SaaS is evaluating a new opportunity, it queries Memory:
  - "Is this opportunity similar to past opportunities? If so, what was their success rate?"
- When Builder is choosing architecture, it queries Memory:
  - "Which tech stack choices have correlated with maintainability?"
- When GTM is planning strategy, it queries Memory:
  - "For ventures like ours, what GTM approach has the best CAC and retention?"
- When Portfolio is evaluating a venture, it queries Memory:
  - "Ventures with this combination of traits have succeeded/failed at this rate. What should our confidence level be?"

**Query response includes**:
- Direct pattern matches
- Similar patterns (not exact match but related)
- Confidence level
- Ventures that exhibited the pattern
- Caveats (where it doesn't apply)
- Conflicting patterns (if they exist)

**Output**: Query response, available to requesting module in <100ms.

### 3.7 Consume & Decide (continuous)

**Input**: Query responses from Memory.

**Agents**: All downstream modules (consuming modules)

**Process**:
- Modules use Memory recommendations to inform decisions:
  - Opportunity SaaS: "Memory says ventures in this category have 50% failure rate. Let's apply higher scrutiny."
  - Builder: "Memory says this tech stack has high technical debt. Let's plan for refactoring costs."
  - GTM: "Memory says this GTM approach has CAC $12 on average. Let's budget accordingly."
  - Portfolio: "Memory says ventures with this profile have been killed at 80% rate. Consider kill recommendation."

- Decision is made based on Memory insight + current context.
- Outcome is observed.
- Learning feeds back to Memory (flow continues).

**Output**: Better-informed decisions across all modules.

---

## 4. Learning & Pattern Schema

### 4.1 Learning Record

A learning record captures a single observation:

```json
{
  "id": "uuid",
  "venture_id": "uuid",
  "source_module": "opportunity|brandaid|builder|gtm|startupops|portfolio",
  "event_type": "decision|outcome|observation|failure_signal|success_signal",
  "learning_text": "string (narrative description)",
  "timestamp": "ISO8601",
  "stage": "1|2|3|4|5",
  "outcome": "success|failure|pivot|kill|ongoing",
  "confidence": "0–100",
  "tags": ["string"],
  "ventures_referenced": ["uuid"],
  "contradicts_pattern": "pattern_id (optional)",
  "supports_pattern": "pattern_id (optional)",
  "notes": "string"
}
```

### 4.2 Pattern

A pattern is a generalized observation across multiple ventures:

```json
{
  "id": "uuid",
  "pattern_statement": "string",
  "pattern_category": "opportunity|gtm|build|brand|traction_signal|failure_signal|success_factor",
  "evidence_count": "number (how many ventures exhibit this)",
  "confidence": "0–100",
  "ventures": ["uuid"],
  "strength": "strong|moderate|weak",
  "applicability_scope": "string (when does this apply?)",
  "caveats": ["string"],
  "contradicting_patterns": ["pattern_id"],
  "recommendations": ["string"],
  "created_at": "ISO8601",
  "last_updated": "ISO8601",
  "status": "active|archived|under_review"
}
```

### 4.3 PatternCluster

A group of related patterns:

```json
{
  "id": "uuid",
  "cluster_name": "string",
  "description": "string",
  "patterns": ["pattern_id"],
  "primary_pattern": "pattern_id (strongest/most important)",
  "complementary_patterns": ["pattern_id"],
  "conflicting_patterns": ["pattern_id"],
  "synthesis": "string (narrative summary)",
  "recommendations": ["string"],
  "domain": "string (e.g., 'B2B SaaS targeting SMBs')",
  "created_at": "ISO8601",
  "last_updated": "ISO8601"
}
```

### 4.4 CrossVentureLearning

A synthesis that compares multiple ventures directly:

```json
{
  "id": "uuid",
  "learning_statement": "string",
  "ventures_compared": ["uuid"],
  "category": "opportunity|gtm|build|brand|traction|failure|success",
  "metric": "string (what dimension are we comparing?)",
  "baseline_group": ["uuid"],
  "comparison_group": ["uuid"],
  "baseline_value": "number",
  "comparison_value": "number",
  "difference_magnitude": "number (percentage or ratio)",
  "statistical_confidence": "0–100",
  "interpretation": "string",
  "recommendations": ["string"],
  "caveats": ["string"],
  "created_at": "ISO8601"
}
```

### 4.5 IntelligenceSnapshot

A periodic synthesis of memory state:

```json
{
  "id": "uuid",
  "period_start": "ISO8601",
  "period_end": "ISO8601",
  "generated_at": "ISO8601",
  "new_patterns_discovered": ["pattern_id"],
  "patterns_updated": ["pattern_id"],
  "patterns_downgraded": ["pattern_id"],
  "patterns_archived": ["pattern_id"],
  "key_recommendations": {
    "opportunity_saas": ["string"],
    "builder": ["string"],
    "gtm": ["string"],
    "brandaid": ["string"],
    "startupops": ["string"],
    "portfolio": ["string"]
  },
  "contradictions_detected": [
    {
      "pattern_a": "pattern_id",
      "pattern_b": "pattern_id",
      "context": "string"
    }
  ],
  "meta_insight": "string (overall observation about how Bruce is evolving)"
}
```

---

## 5. Agent Roles

Bruce Memory operates through four specialized agents:

### 5.1 Pattern Extractor

| Property       | Description                                                              |
| -------------- | --------------------------------------------------------------------------- |
| **Role**       | Extract raw patterns from learning records                                |
| **Input**      | Learning records from all modules                                        |
| **Output**     | Pattern library with metadata, confidence levels, caveats                |
| **Authority**  | None; provides pattern data to Cross-Venture Analyst                     |
| **Key tasks**  | Learning ingestion, normalization, pattern identification, clustering    |

### 5.2 Cross-Venture Analyst

| Property       | Description                                                              |
| -------------- | --------------------------------------------------------------------------- |
| **Role**       | Synthesize patterns into coherent clusters and cross-venture learnings  |
| **Input**      | Pattern library, historical patterns, contradiction detection            |
| **Output**     | PatternClusters, CrossVentureLearning documents, synthesis reports       |
| **Authority**  | Can flag patterns as active/archived based on evidence quality           |
| **Key tasks**  | Cluster analysis, synthesis, contradiction resolution, recommendation generation |

### 5.3 Intelligence Synthesizer

| Property       | Description                                                              |
| -------------- | --------------------------------------------------------------------------- |
| **Role**       | Create actionable intelligence snapshots and recommender rules            |
| **Input**      | PatternClusters, cross-venture learnings, query logs                     |
| **Output**     | IntelligenceSnapshot, recommender rules, module-specific guidance        |
| **Authority**  | None; advisory only                                                      |
| **Key tasks**  | Synthesis, recommendation generation, contradiction flagging             |

### 5.4 Memory Curator

| Property       | Description                                                              |
| -------------- | --------------------------------------------------------------------------- |
| **Role**       | Maintain memory quality and respond to queries                            |
| **Input**      | Query requests from any module, pattern library, learning records        |
| **Output**     | Query responses with patterns, recommendations, confidence levels        |
| **Authority**  | Can update pattern confidence based on new evidence; can retire patterns |
| **Key tasks**  | Query processing, pattern retrieval, confidence updates, archival        |

---

## 6. Integration Points

### 6.1 Integration with Opportunity SaaS

| Flow                | Direction               | Content                                                  |
| ------------------- | ----------------------- | -------------------------------------------------------- |
| **Opportunity query** | Opportunity → Memory   | "Is this opportunity type viable? What's the success rate?" |
| **Memory response**   | Memory → Opportunity   | Patterns for similar opportunities, success rates, caveats |
| **Learning feedback** | Opportunity → Memory   | "Pursued this opportunity type. Outcome was X. Learning: Y" |

### 6.2 Integration with Builder

| Flow                | Direction               | Content                                                  |
| ------------------- | ----------------------- | -------------------------------------------------------- |
| **Architecture query** | Builder → Memory       | "Which tech stack correlates with maintainability?"     |
| **Memory response**   | Memory → Builder       | Patterns of successful/failed architectures, lessons    |
| **Learning feedback** | Builder → Memory       | "Chose this architecture. Lesson: X"                    |

### 6.3 Integration with GTM

| Flow                | Direction               | Content                                                  |
| ------------------- | ----------------------- | -------------------------------------------------------- |
| **GTM strategy query** | GTM → Memory          | "What GTM strategy works best for this user segment?"   |
| **Memory response**   | Memory → GTM           | Patterns of successful GTM approaches, CAC/retention data |
| **Learning feedback** | GTM → Memory           | "Executed GTM strategy X. CAC was Y. Retention was Z"   |

### 6.4 Integration with BrandAid

| Flow                | Direction               | Content                                                  |
| ------------------- | ----------------------- | -------------------------------------------------------- |
| **Brand query**      | BrandAid → Memory      | "What brand positioning works for this category?"       |
| **Memory response**   | Memory → BrandAid      | Patterns of successful/failed brand positioning         |
| **Learning feedback** | BrandAid → Memory      | "Positioned brand as X. Brand perception data: Y"       |

### 6.5 Integration with StartupOps

| Flow                | Direction               | Content                                                  |
| ------------------- | ----------------------- | -------------------------------------------------------- |
| **Traction query**   | StartupOps → Memory    | "What early metrics predict success at this stage?"     |
| **Memory response**   | Memory → StartupOps    | Patterns of traction signals and failure indicators      |
| **Learning feedback** | StartupOps → Memory    | "Venture exhibited metric X. Eventual outcome was Y"     |

### 6.6 Integration with Portfolio

| Flow                | Direction               | Content                                                  |
| ------------------- | ----------------------- | -------------------------------------------------------- |
| **Kill query**       | Portfolio → Memory     | "Ventures with this profile, what's their kill rate?"   |
| **Memory response**   | Memory → Portfolio     | Patterns of failure signals and success correlations     |
| **Learning feedback** | Portfolio → Memory     | "Killed venture with profile X. Reason: Y. Learning: Z" |

### 6.7 Integration with Bruce Core

| Flow                | Direction               | Content                                                  |
| ------------------- | ----------------------- | -------------------------------------------------------- |
| **Status query**     | Bruce Core → Memory    | "Memory status: how many patterns? What's latest insight?" |
| **Memory report**    | Memory → Bruce Core    | IntelligenceSnapshot, meta-insights on system evolution  |

---

## 7. Key Workflow Rules

1. **All learning is contributed voluntarily by modules.** Modules must explicitly send learning artifacts to Memory. There's no forced logging.

2. **Patterns require 3+ venture evidence to be considered "active".** A pattern based on 1 venture has confidence <50% and is marked as "under review."

3. **Confidence is dynamic.** As new ventures add evidence, pattern confidence increases. If contradictory evidence appears, confidence decreases.

4. **Patterns are never permanently deleted.** Old patterns are archived, not removed, so history is preserved.

5. **Contradictions are documented, not resolved by deletion.** If Pattern A and Pattern B contradict, both are kept, but the context for when each applies is documented.

6. **Memory is bidirectional.** Learning flows into Memory; intelligence flows back out to inform decisions.

7. **All recommendations are probabilistic.** Memory never says "do this." It says "ventures like yours have succeeded 70% of the time with this approach."

8. **Query responses include confidence levels.** A high-confidence recommendation (based on 50 ventures) is more useful than a low-confidence one (based on 2 ventures).

---

## 8. Success Criteria

Memory's effectiveness is measured by:

### 8.1 Quantitative Metrics

| Metric                         | Target                         | Meaning                                               |
| ------------------------------ | ------------------------------ | ----------------------------------------------------- |
| **Patterns generated per cycle**| 2–5 new patterns per month     | Healthy discovery rate; early saturation               |
| **Pattern confidence growth**   | Average confidence increasing  | Old patterns getting more validated                    |
| **Query response time**         | <100ms for pattern lookup      | Fast decision support                                  |
| **Pattern utilization**         | >70% of decisions reference Memory | High integration with downstream modules             |
| **Decision improvement rate**   | +5–10% per quarter             | Ventures using Memory recommendations succeed more    |

### 8.2 Qualitative Metrics

| Criterion                                           | Success State                                          |
| --------------------------------------------------- | ------------------------------------------------------ |
| **Pattern quality**                                | Patterns are actionable, not vague                     |
| **Contradiction handling**                         | Contradictions explicitly noted with context          |
| **Caveats clarity**                               | Each pattern includes clear limitations               |
| **Recommendation specificity**                     | Recommendations are specific to context, not generic  |
| **Confidence calibration**                        | Confidence levels match actual pattern accuracy       |

---

## 9. Memory Lifecycle

### 9.1 Pattern Lifecycle

```
Under Review (1–2 ventures)
         │
         ▼ (3+ ventures, 50%+ confidence)
    Active (used in decisions)
         │
         ├─ Updates (new evidence) ──► confidence ↑ or ↓
         │
         └─ Conflicts with newer pattern
                  │
                  ▼
            Documented Contradiction
         (both patterns active, context noted)
         │
         └─ After 1 year without supporting evidence
                  │
                  ▼
                Archived (preserved, not used)
```

### 9.2 Memory Evolution

- Month 1–3: Rapid pattern discovery (high-volume learning from initial ventures)
- Month 4–6: Pattern consolidation and conflict resolution
- Month 7+: Saturation (fewer new patterns, more refinement of existing patterns)
- Year 2+: Memory becomes predictive system (new ventures benefit from accumulated knowledge)

---

## 10. Human-in-the-Loop (Optional)

Memory can include human curation:

| Gate                | Trigger                                            | Human Review                          |
| ------------------- | -------------------------------------------------- | ------------------------------------- |
| **Pattern promotion** | Pattern reaches 3+ venture evidence               | Human confirms pattern is valid       |
| **Contradiction**    | Two patterns contradict each other                | Human clarifies when each applies     |
| **Archival**         | Pattern unused for 6 months                       | Human decides if archival is correct  |

These gates can be toggled based on Bruce maturity.
