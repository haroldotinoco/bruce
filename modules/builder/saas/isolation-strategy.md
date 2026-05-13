# Builder Tenant Isolation Strategy

## Overview

The builder module maintains strict tenant isolation for MVP specifications, sprint plans, architecture documents, and technical specifications. Each account operates in a fully isolated environment with no cross-account data access or leakage.

---

## Database Isolation

### Partition Key: `account_id`

All builder-related data is partitioned by `account_id` at the database level:

- **mvp_specifications** table:
  - Primary partition: `account_id`
  - Secondary partition: `venture_id`
  - Fields: spec_id, brand_id, technical_stack, feature_list, acceptance_criteria
  - Queries always include `WHERE account_id = ? AND venture_id = ?`
  - Row-level security enforces account-level boundaries

- **technical_architectures** table:
  - Primary partition: `account_id`
  - Fields: architecture_id, spec_id, system_diagram, tech_decisions, infrastructure
  - Never exposes architecture from account A to account B
  - Versioning: track all architecture iterations within account scope

- **sprint_plans** table:
  - Primary partition: `account_id`
  - Fields: sprint_id, spec_id, sprint_number, start_date, end_date, stories, tasks
  - Multiple sprints per spec, but all isolated by account_id
  - Secondary index on venture_id within account partition

- **feature_backlog** table:
  - Primary partition: `account_id`
  - Fields: feature_id, spec_id, feature_name, description, priority, status
  - Prevents features/backlog from different accounts from being queried together
  - Soft-delete only for audit trail

- **acceptance_criteria** table:
  - Primary partition: `account_id`
  - Fields: criteria_id, story_id, criterion_text, acceptance_level
  - Linked to stories within same account scope
  - Cross-venture queries blocked at application layer

- **development_roadmap** table:
  - Primary partition: `account_id`
  - Fields: roadmap_id, spec_id, phase, timeline, deliverables, dependencies
  - Account-specific roadmaps never intermingled

### Access Control Example

```sql
-- All queries enforce account_id partition
SELECT * FROM mvp_specifications
WHERE account_id = :account_id
  AND venture_id = :venture_id
  AND spec_id = :spec_id;

-- Application layer MUST validate account_id from JWT before executing queries
-- Missing account_id filter results in authorization failure
```

---

## Temporal Isolation

### Builder Workflow Lifecycle

Each builder workflow is isolated by `account_id:venture_id`:

1. **Activation Trigger**: brand.completed event (from brand-aid module)
   - Validation: Event includes account_id + venture_id
   - Isolation: Only matching account's ventures are processed
   - No cross-account event leakage

2. **MVP Specification Creation** (Step 1)
   - Input: brand identity + venture data from account
   - Workflow ID includes account_id prefix
   - Specification stored in account partition
   - No global specification state

3. **Technical Architecture Definition** (Step 2)
   - Architecture diagrams: Stored in account-partitioned storage
   - Tech stack selection: Account-specific recommendations
   - Infrastructure planning: Isolated by account_id
   - No architecture sharing between accounts

4. **Feature Prioritization & Backlog** (Step 3)
   - Feature list: Derived from MVP spec + brand messaging
   - Backlog ranking: Account-specific (no global backlogs)
   - Backlog items: Partitioned by account_id
   - Cross-account feature comparison impossible

5. **Sprint Planning** (Step 4)
   - Sprint creation: Per spec, per account
   - Story assignment: Within account's team
   - Sprint boards: Isolated by account_id:venture_id
   - No cross-account sprint visibility

6. **Acceptance Criteria & Handoff** (Step 5)
   - Criteria definition: Per story per account
   - GTM handoff: Sends to account's GTM module
   - No criteria leakage between accounts

### Workflow State Management

```typescript
// workflowStateIsolation.ts
interface WorkflowState {
  workflow_id: string; // Format: wf_{account_id}_{venture_id}_{timestamp}
  account_id: string; // Always required
  venture_id: string; // Always required
  current_step: string;
  step_data: object;
  created_at: Date;
  updated_at: Date;
}

// Correlation ID enforces isolation
export function generateWorkflowId(
  accountId: string,
  ventureId: string
): string {
  return `wf_${accountId}_${ventureId}_${Date.now()}`;
}

// Fetch workflow state with mandatory account validation
export async function getWorkflowState(
  accountId: string,
  ventureId: string,
  workflowId: string
): Promise<WorkflowState | null> {
  const db = getDatabase();

  // Query includes account_id in WHERE clause
  const state = await db.query(
    `SELECT * FROM workflow_state
     WHERE workflow_id = ?
       AND account_id = ?
       AND venture_id = ?`,
    [workflowId, accountId, ventureId]
  );

  return state[0] || null;
}
```

---

## File Storage Isolation

### S3 Architecture

```
s3://builder-specs/
├── account_{account_id}/
│   ├── venture_{venture_id}/
│   │   ├── mvp-specs/
│   │   │   └── {spec_id}/
│   │   │       ├── specification.md
│   │   │       ├── specification.pdf
│   │   │       └── specification.json
│   │   ├── technical-architecture/
│   │   │   └── {spec_id}/
│   │   │       ├── architecture-diagram.drawio
│   │   │       ├── architecture.md
│   │   │       ├── tech-stack-rationale.md
│   │   │       ├── infrastructure-plan.md
│   │   │       └── dependencies.json
│   │   ├── feature-backlog/
│   │   │   └── {spec_id}/
│   │   │       ├── backlog-ranked.json
│   │   │       ├── backlog.md
│   │   │       └── feature-definitions.json
│   │   ├── sprint-plans/
│   │   │   ├── sprint-1/
│   │   │   │   ├── sprint-plan.md
│   │   │   │   ├── sprint-board.json
│   │   │   │   ├── stories.json
│   │   │   │   └── tasks.json
│   │   │   ├── sprint-2/
│   │   │   └── sprint-3/
│   │   ├── acceptance-criteria/
│   │   │   ├── {story_id}.json
│   │   │   └── {story_id}_acceptance_checklist.md
│   │   └── development-roadmap/
│   │       ├── roadmap.md
│   │       ├── roadmap.json
│   │       └── phase-timelines.md
```

### Isolation Enforcement

- **Bucket policies**: S3 ACLs restrict access to account-specific prefixes
- **Signed URLs**: All asset access via pre-signed URLs that encode account_id
- **Key patterns**: All keys include `account_{account_id}` prefix
- **Access logs**: CloudTrail audits all requests with account context
- **Backup isolation**: Per-account backups, never commingled
- **Cross-account prevention**: IAM policies prevent cross-account access

### Signed URL Generation

```typescript
// getSignedSpecAssetUrl.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getSignedSpecAssetUrl(
  accountId: string,
  ventureId: string,
  specId: string,
  assetPath: string,
  expirationSeconds: number = 3600
): Promise<string> {
  const s3Client = new S3Client({ region: process.env.AWS_REGION });

  // Key enforces account:venture isolation
  const key = `account_${accountId}/venture_${ventureId}/mvp-specs/${specId}/${assetPath}`;

  const command = new GetObjectCommand({
    Bucket: process.env.BUILDER_SPECS_BUCKET!,
    Key: key,
  });

  // Signed URL expires after specified duration
  return getSignedUrl(s3Client, command, {
    expiresIn: expirationSeconds,
  });
}

// Example: Generating signed URL for sprint plan
const sprintUrl = await getSignedSpecAssetUrl(
  "acc_123",
  "ven_456",
  "spec_789",
  "sprint-plans/sprint-1/sprint-plan.md"
);
```

---

## Redis Cache Isolation

### Cache Key Structure

All Redis keys include account and venture identifiers:

```
builder:{account_id}:{venture_id}:{resource_type}:{resource_id}
```

### Examples

```
builder:acc_123:ven_456:spec:spec_789
builder:acc_123:ven_456:architecture:arch_001
builder:acc_123:ven_456:sprint:sprint_1
builder:acc_123:ven_456:backlog:feat_list_001
```

### Cache Isolation

- **Key namespace**: Account:venture prefix prevents key collisions
- **TTL**: Specs cache for 24 hours, active sprints for 6 hours
- **Access control**: Redis ACLs restrict to account-level operations
- **Eviction**: If cache fills, only same-account entries are evicted
- **Pub/Sub**: Channel names include account_id prefix for sprint updates

### Cache Implementation

```typescript
// cacheBuilderSpec.ts
export async function cacheSpecDraft(
  accountId: string,
  ventureId: string,
  specId: string,
  spec: MVPSpecification,
  ttlSeconds: number = 86400
): Promise<void> {
  const redis = getRedisClient();
  const key = `builder:${accountId}:${ventureId}:spec:${specId}`;

  await redis.setex(key, ttlSeconds, JSON.stringify(spec));
}

export async function getSpecDraft(
  accountId: string,
  ventureId: string,
  specId: string
): Promise<MVPSpecification | null> {
  const redis = getRedisClient();
  const key = `builder:${accountId}:${ventureId}:spec:${specId}`;

  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

// Sprint board updates via isolated Pub/Sub channels
export async function publishSprintUpdate(
  accountId: string,
  ventureId: string,
  sprintId: string,
  update: SprintUpdate
): Promise<void> {
  const redis = getRedisClient();
  const channel = `builder:${accountId}:${ventureId}:sprint:${sprintId}:updates`;

  await redis.publish(channel, JSON.stringify(update));
}
```

---

## Cross-Module Data Boundaries

### Upstream: brand-aid Module

- **Input event**: brand.completed
  - Includes: account_id, venture_id, brand_id
  - Isolation: Builder validates account_id matches JWT before processing
  - Data contract: All brand inputs include account context

- **Brand reference**: builder stores brand_id but does NOT replicate brand data
  - Prevents data consistency issues
  - brand_id serves as foreign key (account:venture aware)

### Downstream: GTM Module

- **Output event**: builder.mvp.approved
  - Includes: account_id, venture_id, spec_id, brand_id
  - GTM consumer validates account_id before processing
  - No data is replicated; GTM receives references only

- **Data contract example**:
  ```json
  {
    "event_type": "builder.mvp.approved",
    "account_id": "acc_123",
    "venture_id": "ven_456",
    "spec_id": "spec_789",
    "brand_id": "brand_101",
    "sprint_count": 3,
    "timestamp": "2026-04-06T15:30:00Z"
  }
  ```

---

## Team & User Isolation

### Team Members per Account

```typescript
// teamIsolation.ts
interface TeamMember {
  user_id: string;
  account_id: string; // Always linked to account
  venture_id: string; // Limited to specific ventures
  role: "owner" | "lead" | "developer" | "viewer";
  permissions: string[];
  added_at: Date;
}

// Fetch team members: only same-account users
export async function getTeamMembers(
  accountId: string,
  ventureId: string
): Promise<TeamMember[]> {
  const db = getDatabase();

  const members = await db.query(
    `SELECT * FROM team_members
     WHERE account_id = ? AND venture_id = ?
     ORDER BY added_at`,
    [accountId, ventureId]
  );

  return members;
}

// User access control: enforce account boundary
export async function checkUserAccess(
  accountId: string,
  ventureId: string,
  userId: string,
  action: string
): Promise<boolean> {
  const member = await db.query(
    `SELECT role, permissions FROM team_members
     WHERE account_id = ? AND venture_id = ? AND user_id = ?`,
    [accountId, ventureId, userId]
  );

  if (!member) return false; // User not in this account:venture

  return hasPermission(member.role, member.permissions, action);
}
```

---

## Audit & Compliance

### Data Access Audit

```typescript
// auditBuilderAccess.ts
export async function auditSpecAccess(
  accountId: string,
  userId: string,
  specId: string,
  action: "read" | "write" | "export",
  timestamp: Date
): Promise<void> {
  const auditDb = getAuditDatabase();

  await auditDb.insert("builder_audit_log", {
    account_id: accountId,
    user_id: userId,
    spec_id: specId,
    action,
    timestamp,
    ip_address: getCurrentRequestIP(),
  });
}
```

### Deletion & Purge

- Soft deletes preserve audit trail
- Account deletion cascades to all builder data
- GDPR compliance: Account deletion purges S3 within 30 days
- No cross-account data remains post-deletion

---

## Testing Isolation

### Unit Tests

```typescript
// builder.isolation.test.ts
describe("Builder Tenant Isolation", () => {
  it("should not allow account A to read account B's specs", async () => {
    const specA = await createSpec("account_A", "venture_1");

    const result = await querySpec("account_B", specA.id);

    expect(result).toBeNull();
  });

  it("should isolate sprint planning by account:venture", async () => {
    const sprint1 = await createSprint(
      "acc_1",
      "ven_1",
      "spec_1",
      { name: "Sprint 1 v1" }
    );
    const sprint2 = await createSprint(
      "acc_2",
      "ven_1",
      "spec_1",
      { name: "Sprint 1 v2" }
    );

    const retrieved1 = await getSprint("acc_1", "ven_1", "spec_1");
    const retrieved2 = await getSprint("acc_2", "ven_1", "spec_1");

    expect(retrieved1.name).toBe("Sprint 1 v1");
    expect(retrieved2.name).toBe("Sprint 1 v2");
  });

  it("should enforce S3 key isolation for technical specs", async () => {
    const url = await getSignedSpecAssetUrl(
      "acc_1",
      "ven_1",
      "spec_1",
      "technical-architecture/architecture.md"
    );

    expect(url).toContain("account_acc_1");
    expect(url).toContain("venture_ven_1");
  });

  it("should prevent cross-account team member access", async () => {
    const teamA = await getTeamMembers("acc_1", "ven_1");
    const teamB = await getTeamMembers("acc_2", "ven_1");

    const userIds = new Set([...teamA.map((m) => m.user_id)]);
    expect(
      teamB.some((m) => userIds.has(m.user_id) && m.account_id === "acc_1")
    ).toBe(false);
  });
});
```

---

## Summary

Builder maintains defense-in-depth tenant isolation through:

1. **Database**: Row-level partitioning by account_id with enforced where clauses
2. **Storage**: S3 key prefixes encoding account_id + venture_id, bucket policy enforcement
3. **Cache**: Key namespace isolation by account:venture
4. **Workflows**: Temporal isolation with account_id in correlation IDs
5. **Teams**: User-account-venture relationships enforced at query level
6. **Audit**: Comprehensive logging of all access and modifications
7. **Testing**: Automated isolation verification in test suites

This multi-layer approach ensures that no account can observe, access, or influence another account's MVP specifications, sprint plans, or technical architecture.
