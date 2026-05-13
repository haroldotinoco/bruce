# BruceMemory Query Policy

## Who Can Query

### Authorized Callers
- All BruceAI modules (opportunity, add-venture, brand-aid, builder, gtm, startup-ops, portfolio, bruce-core)
- Authorized human users via API (with authentication)
- Inter-module API calls (with module credentials)

### Rate Limits
- Per module: 100 requests per hour
- Per user: 50 requests per hour
- Burst limit: max 10 requests per minute from single caller
- Exceeding limits: caller placed in queue, oldest requests processed first

### Authentication and Authorization
- All queries must include requesting_module or user_id
- Module-to-module calls use service account credentials
- Human users require API key (managed by bruce-core)
- Unauthorized queries rejected with 403 Forbidden

## Query Standards

### Valid Query Format
- Question must be minimum 10 characters, maximum 500 characters
- Question must be natural language or semantic search
- Optional context fields: venture_id, current_stage, market_segment, filters
- All queries must have query_id (UUID or caller-generated ID)

### Query Content Rules
- Queries must request ONLY pattern information (not recommendations)
- Queries about specific venture private data: Check privacy rules; refuse if data would expose proprietary info
- Queries asking for recommendations: Redirect caller to appropriate recommendation agent
- Malformed queries: Return error with explanation and retry guidance

## Response Standards

### Confidence Thresholds
- Default minimum confidence: 0.5 (only return patterns with >= 0.5 confidence)
- If no results at 0.5: Agent may lower to 0.3 and flag "low_confidence_results" in response
- NEVER return patterns with confidence < 0.3 (even if requested)
- Response must always include confidence_overall (minimum of pattern confidence and evidence confidence)

### Result Limits
- Maximum 5 patterns per response (ranked by relevance_score × confidence)
- Return max 3 suggested_related_queries if no results
- Synthesis text: 2-3 sentences maximum
- Response must include latency_ms (for performance monitoring)

### Response SLA
- Response time: < 30 seconds (hard limit)
- If approaching timeout: return best available results rather than timing out
- Timeout response includes "timeout: true" and available partial results

### No Results Handling
- If no patterns match at confidence >= 0.5: return no_results: true
- Include up to 3 suggested_related_queries to help caller rephrase
- Example: "Try asking about 'B2B SaaS GTM channels' or 'developer-focused sales strategies'"
- Do NOT return empty array and no_results: false (misleading)

## Privacy and Security in Responses

### Data Sanitization
- Response must NOT expose individual venture names (use IDs in supporting_ventures array)
- Patterns must be anonymized as per privacy-policy
- Do NOT return learning record details; only aggregate pattern level
- Customer names or proprietary details never in response

### Sensitive Pattern Handling
- Patterns from kill postmortems: Include in results if matching query, but anonymized
- Patterns about private metrics (CAC, LTV, burn): OK to return, already anonymized in storage
- Patterns requesting competitor analysis: Return if available; do NOT expose data sources

### Audit Logging
- All queries logged with: query_id, requesting_module/user, question, response time, patterns returned
- Logs retained for 90 days for audit
- Unusual access patterns (e.g., repeated high-volume requests) flagged for manual review

## Escalation and Edge Cases

### When to Refuse Query
- Query about specific named venture's private data: Refuse with "This query seeks private venture data. Per privacy policy, individual venture details are not surfaced via query-agent."
- Query asking for recommendation rather than pattern: Return "That requires a recommendation. Please contact [appropriate-agent]."
- Query syntax malformed: Return error explaining valid format

### When to Escalate
- Query requesting data not in pattern store: Return no_results: true with suggested alternatives
- Caller exceeds rate limit: Queue query, return 429 (Too Many Requests), expected wait time
- Suspected adversarial query (e.g., repeated queries trying to extract private data): Log and escalate to bruce-core security

### Query Latency Issues
- If vector search taking > 15 seconds: Return best available results early rather than waiting
- If vector DB unavailable: Return cached patterns from last successful extraction (with "cached_results: true" flag)
- Persistent latency issues escalated to infrastructure team

## Monitoring and Performance

### Metrics Tracked
- Query volume per module (for capacity planning)
- Average latency (target < 300ms)
- Pattern hit rate (% queries returning results)
- No-results queries (for pattern completeness analysis)

### Health Checks
- Vector DB connectivity: Checked every 60 seconds
- Pattern store freshness: Checked hourly (most recent pattern update timestamp)
- Query response time: Sampled (1% of queries)

### Performance Optimization
- Cache frequently accessed patterns (top 10% of queries)
- Batch vector searches for high-volume periods
- Pre-compute common query embeddings (e.g., "GTM patterns", "unit economics patterns")
