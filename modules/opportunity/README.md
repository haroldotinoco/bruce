# Opportunity Module

## Overview

The Opportunity module is responsible for continuous market discovery, analysis, scoring, and prioritization of potential venture creation opportunities. It operates on a weekly discovery cycle that identifies new market opportunities in the portfolio's focus areas, rigorously analyzes them, scores them against standard criteria, and advances the highest-quality opportunities to the AddVenture module for structuring.

**Core Purpose:** Systematically identify and qualify market opportunities so that the portfolio can make data-driven decisions on which problems to solve and which markets to enter.

---

## Module Architecture

### Agents (4)

**1. market-scanner**
- Scans news, research, regulatory, and funding sources for market signals
- Identifies emerging problems and market opportunities
- Outputs: List of discovered opportunities with discovery confidence scores
- Triggered: Weekly Monday 6:00 AM UTC

**2. opportunity-analyst**
- Conducts deep market research on discovered opportunities
- Estimates market size (TAM/SAM/SOM) with confidence
- Analyzes competitive landscape
- Validates customer pain points and willingness-to-pay
- Outputs: Detailed analysis with data quality scores
- Triggered: After market-scanner completes

**3. scoring-agent**
- Scores opportunities across 4 dimensions: market size, urgency, competition, strategic fit
- Each dimension scored 0-25 points
- Applies bonuses/penalties for special conditions
- Outputs: Total score (0-100) with recommendation (advance/reconsider/reject)
- Triggered: After opportunity-analyst completes

**4. prioritization-agent**
- Ranks scored opportunities relative to each other
- Decides which opportunities qualify for advancement to AddVenture
- Manages volume (max 25 per cycle, holds excess for future cycles)
- Outputs: Ranked opportunity list with advancement decisions
- Triggered: After scoring-agent completes all opportunities

---

## Workflows

### 1. weekly-discovery-cycle.workflow.json
**Trigger:** Scheduled (every Monday 6:00 AM UTC)

**Pipeline:** market-scanner → opportunity-analyst → scoring-agent → prioritization-agent → output-to-bruce-core

**Duration Target:** 45 minutes

**Volume Target:** 8-25 opportunities discovered, ~3 advanced per cycle (15-25% advancement rate)

**Key Behavior:**
- Scans weekly according to discovery policy (geographic scope, industry verticals, source preferences)
- Analyzes all discovered opportunities for depth
- Scores all analyzed opportunities
- Ranks and forwards results to Bruce Core/AddVenture

### 2. opportunity-screening.workflow.json
**Trigger:** Manual (ad-hoc opportunity submission)

**Pipeline:** validate → deep-analysis → scoring

**Duration Target:** 20 minutes

**Use Case:** Portfolio founder submits an opportunity externally; manual screening workflow ensures it receives analysis

### 3. opportunity-scoring.workflow.json
**Trigger:** Manual (re-evaluation of existing analysis)

**Pipeline:** validate-analysis → score → emit-result

**Duration Target:** 10 minutes

**Use Case:** An analyzed opportunity needs rescoring (e.g., new market signal emerged, policy change)

---

## Quality gate and retries (implemented)

The Temporal workflow `opportunityScreeningWorkflow` in `apps/opportunity` enforces a configurable score threshold before prioritization:

| Rule | Behavior |
|------|------------|
| Pass | `total_score >= OPPORTUNITY_PASS_SCORE` (default 70, env) |
| Low score | If `total_score < OPPORTUNITY_LOW_SCORE_THRESHOLD` (default 50), skip improvement loops and start a **new candidate** (varied search seed + fresh market-scanner run) |
| Mid score | If score is in `[low threshold, pass)`, re-run **opportunity-analyst** then **scoring-agent** with feedback from the prior scoring output, up to `OPPORTUNITY_MAX_IMPROVE_ATTEMPTS` (default 3) **without** a new market scan |
| Exhausted improvements | After max improvement attempts without pass, start a **new candidate** (new market scan) |
| Outer cap | At most `OPPORTUNITY_MAX_QUALITY_CANDIDATES` new candidates per input slot; if none pass, the workflow fails with an explicit error |

Prioritization uses `OPPORTUNITY_MINIMUM_ADVANCEMENT_SCORE` (default 75) for the prioritization agent context. See `.env.example` (`OPPORTUNITY_*`).

---

## Key Contracts (Schemas)

### Input Contracts

**market-scanner input:** valid-scan-input.json
- Scan themes, geographic filters, industry filters
- Date range and source preferences
- Quality requirements and volume targets

### Output Contracts

**market-research.schema.json**
- Discovered opportunities with problem statement, segment, pain points
- Market signals and sources
- Discovery confidence scores

**opportunity-score.schema.json**
- Dimension scores (market size, urgency, competition, strategic fit)
- Total score and recommendation
- Rationale for each dimension

**opportunity.schema.json**
- Core opportunity entity
- Problem statement, target segment, market size estimate
- Competition landscape
- Discovery source and date

---

## State Management

### Module-Level State (module-state.schema.json)
- Active opportunities and their statuses
- Last scan timestamp and frequency settings
- Filter settings (min TAM, geographic focus, industry filters, auto-reject criteria)
- Statistics (total discovered, advanced, rejected, avg advancement rate)

### Execution-Level State (execution-state.schema.json)
- Current scan status and opportunities in progress
- Scored queue (opportunities waiting for prioritization)
- Processing errors and failures
- Enables recovery and monitoring

---

## Policies

### discovery-policy.md
**Scope & Frequency:**
- Weekly discovery every Monday 9:00 AM UTC
- 8-25 opportunities target per cycle
- 52 cycles/year with 4 weeks off for review

**Source Selection:**
- Approved sources: TechCrunch, VentureBeat, Gartner, Forrester, SEC, LinkedIn, Crunchbase, etc.
- Excluded: Social media rumors, unverified claims, press releases alone
- Source concentration cap: No single source >30%

**Opportunity Criteria:**
- Specific problem (measurable, not vague)
- Identifiable segment (not "everyone")
- ≥2 independent market signals
- TAM > $10M and < $10B
- Market is emerging or established (not purely speculative)

**Quality Thresholds:**
- Minimum discovery confidence: 0.6 (60%)
- TAM must have ≥2 data sources
- Minimum 1 competitor identified

**Geographic Prioritization:**
- Tier 1 (priority): USA, UK, Germany
- Tier 2 (secondary): Canada, France, Nordics, Singapore, Australia
- Tier 3 (emerging): India, Brazil, Mexico, UAE, Saudi Arabia

**Auto-Exclusion (Hard Filters):**
- Illegal activities, exploitation, mature monopolies, $500M+ capital requirements

**Soft Filters (Flag for Review):**
- Heavy regulation (FDA/pharma), embargoed countries, blockchain/crypto, hardware-dependent

### scoring-policy.md
**Scoring Framework:**

| Dimension | Range | Key Factors |
|-----------|-------|-------------|
| Market Size | 0-25 | TAM/SAM/SOM with confidence penalty |
| Urgency | 0-25 | Market stage, demand signals, competitive activation |
| Competition | 0-25 | Direct competitors, differentiation, barriers, defensibility |
| Strategic Fit | 0-25 | Portfolio alignment, capital efficiency, team fit, exit potential |

**Recommendation Logic:**
- **75-100:** ADVANCE (automatic) → Send to AddVenture
- **60-74:** RECONSIDER (automatic) → Hold for portfolio review
- **<60:** REJECT (automatic) → Archive

**Bonuses:**
- Multiple market signals (+2): 3+ independent signals
- Unique defensibility (+2): Clear differentiation with sustainable moat
- Regulatory tailwind (+1): Regulatory change actively driving market
- Founder-submitted (+1): Portfolio founder identifies opportunity
- **Max: +3 points total**

**Penalties:**
- High regulatory ambiguity (-3): >50% uncertainty on compliance path
- Major execution dependencies (-3): Breakthrough required in non-core area
- High CAC (-2): Estimated CAC > $150K with LTV/CAC < 3
- Analysis confidence gaps (-2 to -3): Material data gaps
- Portfolio concentration (-2): Similar opportunity in portfolio last 12 months
- **Max: -5 points total**

---

## End-to-End Weekly Cycle Flow

### Monday 6:00 AM UTC — Scanning Phase

1. **market-scanner starts** with context: themes (healthcare-admin, fintech-compliance, saas-infrastructure), filters (min TAM $10M, max $10B), geography (North America, Western Europe)
2. Queries approved sources: TechCrunch, VentureBeat, regulatory publications, funding databases, LinkedIn trends
3. Identifies 8-25 opportunities meeting discovery criteria
4. Returns market research with 2+ sources per opportunity, discovery confidence 0.6+

**Event:** `opportunity.scan.completed`

### Monday 6:45 AM UTC — Analysis Phase

1. **opportunity-analyst receives** discovered opportunities
2. Conducts depth research: market size estimation, competitive analysis, customer validation
3. Estimates TAM/SAM/SOM with confidence level
4. Identifies 1+ competitors
5. Returns detailed analysis with quality score 0.8+ target

**Event:** `opportunity.analyzed` (per opportunity)

### Monday 7:15 AM UTC — Scoring Phase

1. **scoring-agent receives** analyzed opportunities
2. Scores each opportunity across 4 dimensions (0-25 points each)
3. Applies bonuses/penalties based on special conditions
4. Calculates total score and generates recommendation
5. Returns scored opportunities with full dimension breakdown

**Event:** `opportunity.scored` (per opportunity)

### Monday 7:45 AM UTC — Prioritization Phase

1. **prioritization-agent receives** scored opportunities
2. Ranks by score (descending)
3. Categorizes: advance (75+), reconsider (60-74), reject (<60)
4. Ensures geographic/vertical diversity in advanced set
5. Holds excess opportunities for next cycle (never discards)
6. Returns ranked list with advancement decisions

**Event:** `opportunity.ranked`

### Monday 8:00 AM UTC — Output to Bruce Core

1. **Output step** forwards advanced opportunities to Bruce Core/AddVenture module
2. Includes full context: analysis, scoring, ranking, competitive landscape
3. Queues opportunities for structuring based on rank
4. Creates audit trail

**Event:** `opportunity.forwarded` and `opportunity.cycle.complete`

---

## Key Metrics & SLAs

### Discovery Metrics
- **Opportunities per cycle:** 15 ± 5 (target 8-25)
- **Discovery confidence:** 60%+ at 0.7+ (high/medium confidence)
- **Geographic diversity:** ≥3 regions per cycle
- **Vertical diversity:** ≥4 verticals per cycle
- **Source concentration:** No source >30%

### Analysis Metrics
- **Analysis quality:** Avg ≥0.80
- **Data gap rate:** <15% of opportunities
- **TAM confidence:** >0.6 (avoid speculative estimates)

### Scoring Metrics
- **Score distribution target:**
  - Advance (75+): 15-25%
  - Reconsider (60-74): 40-50%
  - Reject (<60): 25-35%
- **Dimension calibration:** All dimensions 20 ± 3 average points (detect bias)

### Pipeline Metrics
- **Cycle duration:** 45 minutes target (Monday 6:00-8:00 AM)
- **Individual step duration:**
  - Scanning: 300 seconds target
  - Analysis: 900 seconds target
  - Scoring: 900 seconds target
  - Prioritization: 300 seconds target

### Advancement Metrics
- **Advancement rate:** 15-25% of discovered → 20% typical
- **Advancement defensibility:** ≥75% of advanced opportunities advance to structuring

---

## Observability

### Events
All events follow naming pattern: `opportunity.[scope].[action]`

Key events:
- `opportunity.scan.started` / `opportunity.scan.completed`
- `opportunity.analyzed` / `opportunity.analysis.failed`
- `opportunity.scored`
- `opportunity.ranked` / `opportunity.prioritization.complete`
- `opportunity.advanced` / `opportunity.rejected` / `opportunity.reconsider`
- `opportunity.cycle.complete` / `opportunity.forwarded`

### Metrics
- Opportunities discovered/analyzed/scored/advanced per cycle
- Discovery confidence distribution
- Geographic/vertical diversity
- Analysis quality scores
- Score distributions and dimension calibration
- Pipeline duration per step
- Advancement rate and defensibility

### Correlation IDs
- **scan_cycle_id:** All opportunities in a 7-day cycle (e.g., `scan-2024-04-01`)
- **opportunity_id:** Unique ID persistent across lifecycle (e.g., `opp-2024-04-001`)
- **trace_id:** Unique trace per cycle per opportunity (e.g., `scan-2024-04-01-opp-001`)

Enables end-to-end tracing from discovery → analysis → scoring → advancement

---

## Integration Points

### Input Sources
- News/research platforms (TechCrunch, VentureBeat)
- Market research (Gartner, Forrester, McKinsey)
- Regulatory sources (SEC, CFPB, FDA)
- Funding databases (PitchBook, Crunchbase)
- Social signals (LinkedIn hiring trends)
- Patent filings and academic research

### Output Destinations
- **AddVenture module** (Bruce Core): Receives advanced opportunities for structuring
- **Portfolio leadership:** Reconsider-band opportunities for manual review
- **Archive system:** Rejected opportunities for future reference
- **Metrics/reporting:** All cycle metrics and quality indicators

---

## Policies & Escalation

### Policy Overrides
Portfolio leadership can override policy rules with written justification:
- Request evaluation of specific market (discovery policy override)
- Direct rescoring of opportunity (scoring policy override)
- Accept opportunity below advancement threshold (priority override)

All overrides must be documented with:
1. Written explanation
2. Leadership approval
3. Entry in cycle notes for precedent tracking

### Escalation Rules
Escalate to human review:
1. TAM highly uncertain (can't estimate confidently)
2. Regulatory path unclear or controversial (>50% uncertainty)
3. Opportunity conflicts with portfolio values/mission
4. Cluster of opportunities on same theme (strategic prioritization needed)
5. Directly competitive with existing portfolio company

### Quality Assurance
- **Monthly:** Review score distribution, advancement rate, rejection defensibility
- **Quarterly:** Market trend analysis, competitive landscape review, process improvement
- **Annual:** Audit scored opportunities against actual venture performance

---

## Running the Module

### Automated (Weekly)
```
Every Monday 6:00 AM UTC:
  weekly-discovery-cycle workflow executes automatically
  All 4 agents run in sequence
  Results output to Bruce Core by 8:00 AM UTC
```

### Manual Screening
```
Any time:
  External party submits opportunity
  opportunity-screening workflow triggered
  Opportunity analyzed and scored
  Results returned within 20 minutes
```

### Manual Rescoring
```
Any time:
  Existing analyzed opportunity needs rescoring
  opportunity-scoring workflow triggered
  Re-scored based on new signals or policy change
  Results returned within 10 minutes
```

---

## Success Criteria

A healthy opportunity module demonstrates:

1. **Consistent discovery:** 15 ± 5 opportunities per week
2. **High-quality analysis:** 80%+ analysis quality scores
3. **Calibrated scoring:** Score distribution within target ranges
4. **Defensible decisions:** ≥75% of rejections defensible post-hoc
5. **Rapid execution:** Weekly cycle completes in <45 minutes
6. **Diverse input:** ≥3 geographies, ≥4 verticals, no source >30%
7. **Clear advancement:** 15-25% advancement rate, ≥75% advance
8. **Traceability:** Full audit trail from discovery to advancement

---

## Troubleshooting

**Issue:** Low discovery confidence (<0.6)
- **Cause:** Opportunity based on weak signals or single source
- **Fix:** Require 2+ independent sources per discovery policy

**Issue:** High rejection rate (>35%)
- **Cause:** Scoring dimensions may be too strict
- **Fix:** Quarterly recalibration; review if real market conditions changed

**Issue:** Advancement rate below 15%
- **Cause:** Scoring threshold too high or market has shifted
- **Fix:** Review recent score distribution; may require policy discussion

**Issue:** Analysis quality low (<0.75)
- **Cause:** Data gaps (TAM unestimable, willingness-to-pay untested)
- **Fix:** Escalate to human research or expand data sources

---

## References

- **Discovery Policy:** `policies/discovery-policy.md`
- **Scoring Policy:** `policies/scoring-policy.md`
- **Workflows:** `workflows/*.workflow.json`
- **Contracts:** `contracts/*.schema.json`
- **State:** `state/*.schema.json`
- **Events:** `observability/events.md`
- **Metrics:** `observability/metrics.md`
- **Correlation IDs:** `observability/correlation-ids.md`
- **Evaluations:** `evaluations/happy-path.md`, `evaluations/low-score-rejection.md`
