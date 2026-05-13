# Market Scanner Constraints

## Rate Limiting & API Usage

### Web Search
- **Maximum 30 searches per scan cycle** (to stay within rate limits and avoid excessive costs)
- **60 requests/minute** maximum sustained rate
- **10,000 requests/day** maximum quota
- **30-second timeout per search** with exponential backoff (2x multiplier)

### Web Scrape
- **10 requests/minute** maximum sustained rate
- **1,000 requests/day** maximum quota
- **15-second timeout per scrape** with 1.5x exponential backoff

## Cost Management

### Monetary Constraints
- **Target: $0.15 per scan** (estimate based on API usage)
- **Maximum: $0.35 per scan** (hard cap before execution stops)
- **Monthly budget: $120** (assuming 8 cycles/month at target cost)

### Token Budgets
- **Max 4,000 output tokens per scan** (for gpt-4o calls)
- **Approximate 15,000 input tokens** per scan (search results + context)

## Data Quality Guardrails

### Source Validation
- **No dead links**: All URLs must return HTTP 200-299 status
- **No paywalled sources**: Exclude sources requiring authentication (soft constraint - flag if >20% of results)
- **Recent content priority**: Minimum 70% of sources from last 60 days
- **Independent sources**: Each opportunity must have 2+ independent sources (not the same article shared across sites)

### Opportunity Validation
- **Specific problem statements**: No vague or generic problem statements
- **Identifiable segments**: Target customer must be clearly definable
- **Verifiable pain points**: At least 3 pain points with documented signals
- **Realistic market size**: TAM must be > $10M and < $10B (outside range suggests misclassification)

## Escalation Rules

### Automatic Escalation to Human Review
1. **Regulatory ambiguity**: Opportunities where >50% of compliance path is unclear
2. **Marginal confidence**: Discovery confidence between 0.4-0.6 (too uncertain to automatically reject)
3. **Unverified TAM**: Market size estimates with <2 supporting sources
4. **Emerging legal questions**: Opportunities in gray areas (e.g., cryptocurrency regulation, AI liability)
5. **Volume anomalies**: More than 3 opportunities on identical theme in single cycle

### When to Decline Processing
- Opportunities clearly violating auto-exclude criteria (illegal, unethical, hardware-intensive)
- Search queries requesting illegal content or circumventing security
- Attempts to process same scan_id twice (deduplication)

## Content Filtering

### Hard Filters (Auto-Reject)
- Illegal goods or services (drugs, weapons, stolen goods)
- Exploitation or abuse (child safety, trafficking)
- High-fraud industries without legitimate use cases
- Explicitly malicious activities (hacking for unauthorized access, etc.)

### Soft Filters (Flag for Review)
- Heavily regulated industries (pharmaceutical, financial)
- Opportunities in embargoed countries
- Markets with significant IP litigation history
- Opportunities requiring extensive capital + regulatory approval (>$100M startup)

## Execution Constraints

### Timing
- **Maximum 5-minute timeout per search query** (prevents hanging)
- **Target execution time: 5 minutes per scan** (all 15-20 searches + analysis)
- **Absolute timeout: 10 minutes per cycle** (fail-safe to prevent resource exhaustion)

### Output Constraints
- **Minimum 8 opportunities per cycle** (below this, cycle marked as incomplete)
- **Maximum 25 opportunities per cycle** (above this, re-run prioritization)
- **All arrays fully populated**: No null/empty pain_points, sources, etc.

## Hallucination Prevention

### Verification Requirements
- **No fabricated URLs**: Every URL must be validated real and accessible
- **No speculative TAM**: Market size must be grounded in research methodology
- **No invented competitors**: All named competitors must exist and operate in space
- **Source attribution**: Every claim must reference at least one supporting source

### Validation Checklist Before Returning Results
- [ ] All URLs are live and respond with 2xx status
- [ ] All opportunities have 2+ independent sources
- [ ] All TAM estimates have methodology documented
- [ ] All discovery confidence scores have rationale
- [ ] No opportunities with identical titles/problems (deduplication complete)
- [ ] All arrays have content (no empty pain_points, sources, etc.)
- [ ] Scan metadata matches actual execution (searches_executed, sources_reviewed accurate)

## Performance SLAs

### Execution Targets
- **Precision**: 85% of discoveries should advance through screening gate
- **Freshness**: 70% of sources published within 60 days
- **Diversity**: Opportunities span minimum 4 industry verticals
- **Volume**: 15 ± 5 opportunities per cycle (target 15)

### When Performance Dips Below SLA
1. **Precision < 80%**: Increase minimum discovery confidence threshold
2. **Freshness < 65%**: Adjust time_filter to "week" or "month"
3. **Diversity < 4 verticals**: Expand industry_verticals in input
4. **Volume anomaly**: Review search keywords for biasing factors

## Integration Constraints

### Upstream Dependencies
- Requires valid `scan_id` from orchestrator
- Requires network connectivity (graceful degrade if unavailable)
- Depends on external API availability (web search, scrape services)

### Downstream Expectations
- Output must conform exactly to `output.schema.json`
- All URLs must be live for downstream scraping
- All opportunity IDs must be unique (no duplicates)
- Confidence scores must be conservative (underestimate rather than overestimate)
