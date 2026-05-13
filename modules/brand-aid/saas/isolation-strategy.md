# Brand-Aid Tenant Isolation Strategy

## Overview

The brand-aid module maintains strict tenant isolation across database, file storage, temporal workflows, and cache layers. Each account operates in a fully isolated environment with no cross-account data leakage.

---

## Database Isolation

### Partition Key: `account_id`

All brand-related data is partitioned by `account_id` at the database level:

- **brand_briefs** table:
  - Primary partition: `account_id`
  - Secondary partition: `venture_id`
  - Queries always include `WHERE account_id = ?`
  - Row-level security enforces account-level read/write boundaries

- **brand_identities** table:
  - Primary partition: `account_id`
  - Fields: brand_id, brand_name, visual_direction, color_palette, typography
  - Secondary index on `venture_id` within account scope
  - Isolation: Brand from account A is never queryable from account B

- **naming_records** table:
  - Primary partition: `account_id`
  - Tracks: generated names, selected names, naming rationale
  - Soft-delete only (is_deleted flag) to preserve audit history
  - Foreign key references require account_id match validation

- **brand_guidelines** table:
  - Primary partition: `account_id`
  - Stores finalized brand guidelines documents
  - Asset references (URLs, file paths) scoped to account's S3 prefix
  - Versioning: track_changes tracks all revisions with creator_id

- **tone_of_voice_styles** table:
  - Primary partition: `account_id`
  - Account-specific tone definitions and examples
  - Prevents tone bleeding across ventures

- **visual_identity_templates** table:
  - Primary partition: `account_id`
  - Shared templates within account, isolated from other accounts
  - Template modifications are account-specific, never global

### Access Control

```sql
-- Example: Ensure all queries enforce account isolation
SELECT * FROM brand_identities
WHERE account_id = :account_id AND venture_id = :venture_id;

-- Anti-pattern: Missing account_id filter will fail at application layer
-- All endpoints validate account_id from JWT before executing queries
```

---

## File Storage Isolation

### S3 Architecture

```
s3://brand-aid-assets/
├── account_{account_id}/
│   ├── venture_{venture_id}/
│   │   ├── brand-briefs/
│   │   │   └── {brief_id}/
│   │   │       ├── source-venture-data.json
│   │   │       └── brand-brief-document.pdf
│   │   ├── visual-identity/
│   │   │   └── {brand_id}/
│   │   │       ├── color-palette.json
│   │   │       ├── typography-specs.json
│   │   │       ├── logo-variations/
│   │   │       └── icon-library/
│   │   ├── naming-workshop/
│   │   │   └── {brand_id}/
│   │   │       ├── generated-names.json
│   │   │       ├── shortlist.json
│   │   │       └── final-selection.json
│   │   ├── brand-guidelines/
│   │   │   └── {brand_id}/
│   │   │       ├── guidelines-v1.pdf
│   │   │       ├── guidelines-v1.figma
│   │   │       └── brand-assets/
│   │   └── messaging-framework/
│   │       └── {brand_id}/
│   │           ├── core-messaging.json
│   │           ├── tone-of-voice.json
│   │           └── messaging-examples.md
```

### Isolation Enforcement

- **Bucket policy**: Only requests with account_id in path prefix are allowed
- **Signed URLs**: All S3 access via pre-signed URLs that encode account_id and venture_id
- **Key patterns**: S3 keys always include `account_{account_id}` to prevent enumeration
- **Access logs**: CloudTrail logs all access with account_id for audit
- **Backup**: Account-specific backups, never cross-mingled

### Example: Generating Signed URLs

```typescript
// getSignedBrandAssetUrl.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getSignedBrandAssetUrl(
  accountId: string,
  ventureId: string,
  assetPath: string,
  expirationSeconds: number = 3600
): Promise<string> {
  const s3Client = new S3Client({ region: process.env.AWS_REGION });

  // Enforce account isolation in key
  const key = `account_${accountId}/venture_${ventureId}/${assetPath}`;

  const command = new GetObjectCommand({
    Bucket: process.env.BRAND_AID_BUCKET!,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: expirationSeconds,
  });
}
```

---

## Temporal Isolation

### Brand Creation Workflow

Each brand creation workflow is isolated by `account_id:venture_id`:

1. **Brand Brief Creation** (Step 1)
   - Input: venture_id from add-venture module
   - Isolation: Only that account's venture is queried
   - Idempotency: Scoped by account_id + venture_id

2. **Naming Workshop** (Step 2)
   - name-generator: Uses account's naming preferences
   - name-critic: Evaluates against account's brand voice
   - name-selector: Records selection in account-partitioned table
   - No cross-account name leakage

3. **Visual Identity Direction** (Step 3)
   - Prompt generation: Uses account-specific brand brief
   - Color/typography selection: Stored in account partition
   - Template selection: From account's available template library

4. **Messaging Framework** (Step 4)
   - Core messaging: Derived from venture hypothesis + brand identity
   - Tone of voice: Account-specific definitions
   - Messaging examples: Stored per brand_id within account

5. **Brand Guidelines Generation** (Step 5)
   - Document generation: Aggregates account-partitioned data
   - Export: To account-isolated S3 prefix
   - Versioning: Each version linked to creator_id within account

### Workflow State Management

- No global workflow state
- Each workflow execution includes `account_id` and `venture_id` in correlation IDs
- Timeouts and retries are account-scoped
- Failed steps don't affect other accounts' workflows

---

## Redis Cache Isolation

### Cache Key Structure

All Redis keys include account and venture identifiers:

```
brand-aid:{account_id}:{venture_id}:{resource_type}:{resource_id}
```

### Examples

```
brand-aid:acc_123:ven_456:brief:brief_789
brand-aid:acc_123:ven_456:naming-draft:gen_001
brand-aid:acc_123:ven_456:visual-direction:vis_001
brand-aid:acc_123:ven_456:guidelines:guide_001
```

### Isolation Guarantees

- **Key space isolation**: Account:venture prefix prevents key collisions
- **TTL management**: Cache entries auto-expire (default: 24 hours for drafts)
- **Access control**: Redis ACLs restrict account-level operations
- **Eviction**: If cache fills, only same-account entries are evicted
- **Pub/Sub isolation**: Channel names include account_id prefix

### Example: Caching Brand Draft State

```typescript
// cacheBrandDraft.ts
export async function cacheBrandDraft(
  accountId: string,
  ventureId: string,
  brandId: string,
  draftState: BrandDraftState,
  ttlSeconds: number = 86400
): Promise<void> {
  const redis = getRedisClient();
  const key = `brand-aid:${accountId}:${ventureId}:draft:${brandId}`;

  await redis.setex(
    key,
    ttlSeconds,
    JSON.stringify(draftState)
  );
}

export async function getBrandDraft(
  accountId: string,
  ventureId: string,
  brandId: string
): Promise<BrandDraftState | null> {
  const redis = getRedisClient();
  const key = `brand-aid:${accountId}:${ventureId}:draft:${brandId}`;

  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}
```

---

## Cross-Module Data Boundaries

### Upstream: add-venture Module

- Reads: venture.approved event (includes account_id, venture_id)
- Isolation: Only ventures from authenticated account are processed
- Validation: Message consumer validates account_id matches JWT claims

### Downstream: builder Module

- Writes: brand.completed event (includes account_id, brand_id, venture_id)
- Consumer isolation: builder module validates account_id before processing
- Data contract: All handoff events include account_id for verification

---

## Audit & Compliance

### Data Access Audit

```typescript
// auditBrandAccess.ts
export async function auditBrandAccess(
  accountId: string,
  userId: string,
  resourceType: string,
  resourceId: string,
  action: "read" | "write" | "delete",
  timestamp: Date
): Promise<void> {
  const auditDb = getAuditDatabase();

  await auditDb.insert("brand_aid_audit_log", {
    account_id: accountId,
    user_id: userId,
    resource_type: resourceType,
    resource_id: resourceId,
    action,
    timestamp,
    ip_address: getCurrentRequestIP(),
  });
}
```

### Deletion Compliance

- Soft deletes for audit trail preservation
- Account deletion cascades to all brand data
- GDPR compliance: Account deletion purges S3 prefix within 30 days
- No cross-account data remains after account deletion

---

## Testing Isolation

### Unit Tests

```typescript
// brand-aid.isolation.test.ts
describe("Brand-Aid Tenant Isolation", () => {
  it("should not allow account A to read account B's brands", async () => {
    const brandA = await createBrand("account_A", "venture_1");

    const result = await queryBrand("account_B", brandA.id);

    expect(result).toBeNull();
  });

  it("should isolate Redis cache by account:venture", async () => {
    const draft1 = { name: "Brand A" };
    const draft2 = { name: "Brand B" };

    await cacheBrandDraft("acc_1", "ven_1", "br_1", draft1);
    await cacheBrandDraft("acc_2", "ven_1", "br_1", draft2);

    const retrieved1 = await getBrandDraft("acc_1", "ven_1", "br_1");
    const retrieved2 = await getBrandDraft("acc_2", "ven_1", "br_1");

    expect(retrieved1).toEqual(draft1);
    expect(retrieved2).toEqual(draft2);
  });

  it("should enforce S3 key prefix isolation", async () => {
    const url1 = await getSignedBrandAssetUrl(
      "acc_1",
      "ven_1",
      "visual-identity/color-palette.json"
    );

    // URL should contain account_1 prefix
    expect(url1).toContain("account_acc_1");
  });
});
```

---

## Summary

Brand-aid maintains defense-in-depth tenant isolation through:

1. **Database**: Row-level partitioning by account_id with enforced where clauses
2. **Storage**: S3 key prefixes encoding account_id, enforced by bucket policies
3. **Cache**: Key namespace isolation by account:venture
4. **Workflows**: Temporal isolation with account_id in correlation IDs
5. **Audit**: Comprehensive logging of all access and modifications
6. **Testing**: Automated isolation verification in test suites

This multi-layer approach ensures that no account can observe, access, or influence another account's brand data.
