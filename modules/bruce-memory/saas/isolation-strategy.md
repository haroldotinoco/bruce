# BruceMemory Tenant Isolation Strategy

BruceMemory's cross-venture learning system requires strict tenant isolation to protect proprietary venture data while enabling legitimate cross-venture pattern discovery. This document outlines the isolation model across all BruceMemory subsystems.

## Overview

Tenant isolation in BruceMemory operates at multiple layers:
1. Vector Database isolation via namespacing
2. Pattern library tagging and filtering
3. Query scoping and access control
4. Learning ingestion verification
5. Intelligence synthesis containment

## Vector Database Isolation

### Namespace Architecture
- **Primary Namespace**: Each account receives a dedicated namespace in the vector database (Pinecone or equivalent)
- **Namespace Naming**: `account_id` (e.g., `acme-corp-prod`, `techstartup-2024`)
- **Isolation Level**: Complete data separation at the database layer
- **Access Control**: Only authenticated requests with valid tenant credentials can access the namespace

### Vector Embedding Storage
- All venture learnings are embedded and stored within the account's namespace
- Cross-venture patterns generated for an account are re-indexed within that account's namespace only
- Embeddings are never copied or shared across namespaces

### Scale Considerations
- Namespaces support growth up to plan limits (10GB for Pro, unlimited for Enterprise)
- Vector similarity search is scoped to the requesting account's namespace
- Separate connection pools per namespace prevent resource contention

## Pattern Library Isolation

### Pattern Tagging Strategy
- **Account Tagging**: Every pattern includes the generating account's `account_id`
- **Venture Tagging**: Patterns tagged with both `venture_id` (source) and `account_id` (owner)
- **Pattern Type Tags**:
  - `account-local`: Generated from single account's learnings
  - `cross-account`: (Enterprise only) Anonymized patterns surfaced across accounts
  - `global`: Pre-computed synthetic patterns from aggregate data

### Cross-Venture Pattern Access
- **Pro Plan**: Patterns only from learnings within the account's venture portfolio
- **Enterprise Plan**: Access to cross-venture patterns within the same account's ventures
- **Anonymized Global Patterns**: Optional, requires explicit opt-in consent
  - No specific venture attribution visible
  - No account identifiers exposed
  - Confidence scores indicate pattern strength across anonymized datasets

### Pattern Visibility Rules
```
Pro Plan Visibility:
  - Can see: Patterns from own ventures (account_id = requesting_account_id)
  - Cannot see: Patterns from other accounts' ventures

Enterprise Plan Visibility:
  - Can see: All patterns within own account's venture portfolio
  - Can see: Cross-venture patterns within own ecosystem (if enabled)
  - Can optionally see: Anonymized global patterns (with consent)
  - Cannot see: Other accounts' venture-specific data or raw learnings
```

## Query Isolation

### Natural Language Query Scoping
- All queries are automatically scoped to the requesting account's namespace
- Query context includes `account_id` and `venture_filter` (optional)
- Vector similarity search only compares against embeddings in the account's namespace
- Results filtered by account ownership tags before response

### Query Processing Flow
1. Authenticate request and extract `account_id`
2. Parse natural language query
3. Scope vector search to `account_id` namespace
4. Apply pattern visibility rules based on plan type
5. Filter results to remove any cross-account references
6. Return only account-scoped patterns

### Query Result Filtering
- Raw learning records excluded from all query results (read-only access)
- Only synthesized patterns and intelligence returned
- Pattern details include confidence scores but hide source venture details for cross-account patterns

### Rate Limiting
- Per-account query rate limits enforced at request level
- Query quota tracked and reported in tenant context
- Limits prevent data exfiltration via exhaustive searches

## Learning Ingestion Isolation

### Ingestion Verification
- Every learning record ingested must include:
  - `account_id` (from authenticated context, cannot be overridden)
  - `venture_id` (must belong to authenticated account)
  - `learning_content` (validated and sanitized)
  - `timestamp` (server-assigned)

### Venture Ownership Validation
- Verify `venture_id` belongs to authenticated `account_id` before accepting
- Reject ingestions claiming ownership of ventures in other accounts
- Audit all ingestion attempts with rejected venture ownership

### Learning Storage
- All learnings stored with `account_id` and `venture_id` tags
- Learnings never visible in query results or intelligence synthesis
- Only processed into patterns after pattern extraction

### Ingestion Rate Limiting
- Monthly ingestion quotas enforced per account
- Concurrent ingestion limits prevent resource exhaustion
- Ingestion events logged for billing and compliance

## Enterprise Cross-Account Patterns

### Anonymized Global Pattern Sharing
- **Opt-In Requirement**: Explicit account consent required
- **Anonymization**: All venture identifiers removed from patterns
- **Confidence Calibration**: Confidence scores adjusted for visibility across accounts
- **Attribution**: Only category/industry tags retained (no company association)

### Global Pattern Generation
- Computed separately from account-specific patterns
- Sourced from all opted-in accounts' learnings
- Updated on monthly synthesis cycle
- Stored in separate global namespace

### Global Pattern Visibility
- Only visible to Enterprise accounts with cross-venture analysis enabled
- Displayed with clear anonymization indicators
- Include synthetic confidence measures
- Exclude any traceable venture or account information

### Consent and Revocation
- Consent stored per account in tenant context
- Can be revoked at any time
- Retroactive removal initiated on revocation
- All future patterns excluded from global generation

## Data Isolation in Intelligence Synthesis

### Synthesis Scoping
- Each synthesis run processes only the account's namespace
- Pattern extraction and analysis limited to account's ventures
- Cross-venture analysis (Enterprise) only across own ventures

### Synthesis Output
- Intelligence synthesis documents tagged with generating `account_id`
- Includes venture-specific insights and patterns
- Cross-venture learnings aggregated within account context only
- No exposure of external account venture data

### Synthesis Distribution
- Sent only to authenticated endpoints for the account
- Webhook delivery scoped to account's registered URLs
- No cross-account synthesis data sharing

## Access Control and Authentication

### API Authentication
- All BruceMemory API calls require valid JWT or API key
- JWT includes `account_id` claim (verified at request start)
- API keys scoped to single account (cannot access other accounts)
- Credential rotation enforced quarterly

### Permission Model
- Account ID extracted from credentials at request layer
- All subsequent operations use extracted account context
- Cannot override or specify different account ID
- Namespace isolation enforced at database driver level

## Audit and Compliance

### Audit Logging
- All access attempts logged with timestamp, account, operation, result
- Failed cross-account access attempts logged as security events
- Learning ingestion audit trail maintained for 2 years
- Query patterns logged for compliance review

### Compliance Verification
- Regular scans verify namespace isolation enforcement
- Cross-account access tests performed monthly
- Audit logs reviewed for unauthorized access attempts
- Compliance reports available to Enterprise accounts

## Testing and Validation

### Isolation Testing
- Automated tests verify no data leakage between namespaces
- Cross-account query attempts rejected consistently
- Venture ownership validation tested with invalid venture IDs
- Pattern visibility rules validated per plan type

### Penetration Testing
- Quarterly security audits of isolation mechanisms
- Attempted privilege escalation tests
- Cross-account access probing tests
- Data exfiltration scenario testing

## Summary Table

| Component | Free | Pro | Enterprise |
|-----------|------|-----|------------|
| Dedicated namespace | No | Yes | Yes |
| Cross-venture patterns | No | No | Yes (own account) |
| Global anonymized patterns | No | No | Optional |
| Query scoping | Basic (3 results) | Full | Full |
| Learning ingestion | No | Yes | Yes |
| Cross-account synthesis | No | No | No |
| Audit access | No | No | Yes |
| Consent management | N/A | N/A | Yes |
