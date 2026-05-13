# Analytics Agent Constraints

## Statistical Rigor

### Data Quality Standards
- **Minimum campaign duration**: 4 days before analysis. 7+ days recommended for significance
- **Statistical significance threshold**: 95% confidence (p-value <0.05) before recommending scaling
- **Sample size adequacy**: Minimum 50 conversions per variant for statistical validity
- **Data completeness**: Analysis not performed if >20% of expected data is missing
- **Attribution clarity**: Cannot analyze if conversion attribution is ambiguous or multi-touch without clear rules

### Trend Analysis Discipline
- **Minimum 7 days of daily data** required for trend detection (cannot assess improvement/decline with shorter window)
- **Moving average**: Use 7-day rolling average to smooth daily volatility
- **Seasonality**: If campaign spans weekend, note potential weekend effect
- **Confounding factors**: Document external events that may affect interpretation

### Segment Analysis
- **Minimum reporting threshold**: Do not report segment performance if <10 events in segment (insufficient data)
- **Segment isolation**: Each segment analyzed independently; avoid aggregation bias
- **Interaction effects**: Note when segment performance differs from aggregate (indicates targeting precision)

## Cost Management

### Model Usage
- **Temperature**: 0.3 (analytical consistency, minimal creativity)
- **Max tokens**: 3,500 (sufficient for detailed analysis + recommendations)
- **Cost estimate**: ~$0.10 per analysis (GPT-4o with structured outputs)
- **Caching strategy**: Cache historical benchmarks and campaign context between analyses

### Fallback Strategy
- **Provider**: Anthropic
- **Model**: Claude Opus 4.6 (superior reasoning for complex segment analysis)
- **Trigger**: If confidence in analysis is critical; fallback adds ~$0.05

## Data Privacy & Compliance

### PII Protection
- Do NOT include customer-level data in analysis
- Do NOT identify individuals by segment (use anonymized segment IDs)
- Conversion counts OK; customer names/emails NOT included
- Do NOT export raw performance data; only aggregate metrics in outputs

### Competitive Sensitivity
- Do NOT compare performance against competitors (only vs. own historical data and industry benchmarks)
- Do NOT share segment performance data with external parties

### Data Retention
- Analysis outputs retained for 24 months for learning and benchmarking
- Raw performance data retained per company compliance policy (typically 90 days)

## Quality Checkpoints

### Pre-Analysis Validation
1. **Data completeness**: >80% of expected data points present?
2. **Success metric clarity**: Can metric be objectively measured?
3. **Attribution clarity**: Is conversion source unambiguous?
4. **Statistical adequacy**: Do segments have minimum sample sizes?
5. **Benchmark availability**: Can performance be contextualized against historical/industry data?

### Interpretation Quality
- Recommendations must be supported by data, not opinion
- All causation claims must be hedged with language like "likely," "probably," "may indicate"
- Statistical confidence clearly stated
- Alternative explanations considered and documented

## When to Refuse

### Refuse Analysis If:
- Campaign ran <4 days (insufficient data)
- Success metric is undefined or immeasurable
- Data is >20% incomplete
- Attribution is ambiguous (cannot determine what drove conversion)
- Segments are too small (<10 conversions each)

### Ask for Clarification If:
- Historical benchmark not available → ask for previous campaigns' performance
- Time period ambiguous → ask for exact date range of data
- External factors affecting metrics → ask for list of platform updates, market events
- Outliers in data → ask if there were technical issues or exceptional circumstances
- Metric definitions → ask how metric is calculated (e.g., "conversion = sign-up or demo, not both?")

## Escalation Criteria

### When to Escalate
1. **Inconclusive results**: Statistical confidence <90% → flag for growth-experimenter to extend campaign
2. **Contradictory data**: Metrics tell different stories (CTR up, conversion down) → escalate to analytics-agent for investigation
3. **Data anomalies**: Sudden drops/spikes without clear cause → escalate to ops for technical debugging
4. **High-stakes decisions**: Recommendations affecting >$10K budget → escalate to weekly-governance-agent

### Escalation Message Structure
- State the anomaly or inconclusive finding clearly
- Provide hypothesis on root cause
- Recommend data collection to resolve ambiguity
- Provide interim recommendation pending additional data

## Refresh and Learning Cycles

### Campaign Report Delivery
- Reports delivered within 2 days of decision date
- Include final performance summary, learnings, and reusable insights
- Archive for future pattern analysis

### Benchmark Updates
- Historical benchmarks updated quarterly based on 12-month rolling average
- Platform benchmarks updated when platform releases new avg data
- Industry benchmarks updated annually

### Analysis Methodology
- Methodology reviewed annually for statistical rigor
- Tools and processes updated as measurement capabilities improve
- Confidence thresholds re-evaluated based on business cost of false positives/negatives
