# Bruce Core Tenant Isolation Strategy

Bruce Core enforces strict multi-tenant isolation at every layer to ensure tenant data is never mixed or accessible across account boundaries.

## Database Layer (PostgreSQL + Neon RLS)

All core tables include an `account_id` column as the primary partition key:
- `ventures` — each venture belongs to exactly one account
- `jobs` — workflow job records
- `events` — audit trail
- `module_config` — per-account module settings

**Row-Level Security (RLS) Policy:**
```sql
CREATE POLICY account_isolation ON ventures
  USING (account_id = current_setting('app.current_account_id')::text)
  WITH CHECK (account_id = current_setting('app.current_account_id')::text);
```

On every database connection, the application layer sets:
```sql
SET app.current_account_id = '{account_id}';
```

This ensures that even if a query runs without explicit `WHERE account_id = ...`, the RLS policy prevents cross-account data leakage.

## Temporal Workflow Isolation

Temporal is used to orchestrate long-running venture workflows (add-venture, builder, gtm, etc.).

**Workflow ID Pattern:**
```
{account_id}--{venture_id}--{workflow_type}

Example: org_abc123--venture_xyz789--builder
```

**Task Queue Pattern:**
```
bruce-core--{account_id}

Example: bruce-core--org_abc123
```

Each account has its own dedicated task queue. Workers poll only queues they are authorized for (verified via service token), preventing cross-account workflow dispatch.

## Redis Cache Isolation

All Redis keys follow the pattern:
```
{account_id}:bruce-core:{resource_type}:{resource_id}:{field}

Examples:
- org_abc123:bruce-core:venture:venture_xyz789:status
- org_abc123:bruce-core:job:job_id_123:output
- org_abc123:bruce-core:module:opportunity:config
```

When a Redis key is requested, the application validates that the requesting account matches the key prefix before returning data.

## Cross-Module Event Isolation

Bruce Core acts as a message bus between modules (opportunity → add-venture, builder → gtm, etc.).

Every event payload includes the account_id:
```json
{
  "account_id": "org_abc123",
  "venture_id": "venture_xyz789",
  "event_type": "opportunity.advanced",
  "data": { ... }
}
```

Consumer modules validate that the event's account_id matches their authenticated context before processing.

## Service Boundary Enforcement

Each module runs as a separate service with its own authentication context. Inter-module communication uses signed JWTs that include:
- `iss`: "bruce-core"
- `sub`: `{account_id}--{venture_id}`
- `aud`: target module name
- `exp`: short TTL (5 minutes)

Receiving modules verify the JWT signature and reject requests from unauthorized accounts.

## Runtime Enforcement Checklist

- [ ] Every database query includes `account_id` in WHERE clause or relies on RLS
- [ ] Temporal task queues are account-specific
- [ ] Redis keys are namespaced by account_id
- [ ] Event payloads include account_id
- [ ] Cross-module JWTs are signed and include account context
- [ ] Webhook callbacks (from modules) include HMAC signatures
- [ ] Logging includes account_id for audit trails
- [ ] No account_id is ever logged in plain text in error messages returned to clients

## Testing Isolation

Before deployment, verify isolation with:
1. Create venture in account A
2. Attempt to query venture from account B (should fail)
3. Check Temporal task queue for account B — should not contain workflows from account A
4. Verify Redis keys from account A are not readable by account B
5. Test webhook signing: bruce-core signs events with account-specific secrets

---

**Contact:** BruceAI Platform Team
**Last Updated:** 2026-04-06
