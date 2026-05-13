# Builder Module Correlation IDs

## Purpose
Correlation IDs enable tracing of related events and activities across the entire build pipeline and external systems.

## ID Formats

### build_id
- **Format**: `build-{random_8_char_hex}`
- **Example**: `build-abc12345`
- **Lifecycle**: Created at pipeline initiation, persists through entire build
- **Usage**: Top-level correlation ID for entire build pipeline
- **Propagated to**: All stages, all events, all artifacts

### venture_id
- **Format**: Inherited from opportunity module
- **Example**: `venture-xyz789`
- **Lifecycle**: Fixed for venture
- **Usage**: Links build to parent venture
- **Propagated to**: All build records, all artifacts

### stage_run_id
- **Format**: `{build_id}-stage-{stage_name}-{run_number}`
- **Example**: `build-abc12345-stage-backend-development-1`
- **Lifecycle**: Created when stage starts, persists if rework triggers
- **Usage**: Correlate events within single stage execution
- **Propagated to**: All stage-level events

### test_run_id
- **Format**: `{build_id}-test-run-{iteration}`
- **Example**: `build-abc12345-test-run-1`
- **Lifecycle**: Created when QA testing starts
- **Usage**: Links all test scenarios and results
- **Propagated to**: QA events, test results, rework triggers

### audit_id
- **Format**: `{build_id}-audit-{timestamp_epochms}`
- **Example**: `build-abc12345-audit-1712427600000`
- **Lifecycle**: Created when security audit starts
- **Usage**: Links security findings and recommendations
- **Propagated to**: Security events, vulnerability records

### rework_id
- **Format**: `{build_id}-rework-{stage}-{cycle_number}`
- **Example**: `build-abc12345-rework-qa-testing-1`
- **Lifecycle**: Created when rework triggered
- **Usage**: Links rework analysis, code fixes, and retest
- **Propagated to**: Rework events, failure analysis records

### artifact_id
- **Format**: `artifact-{entity_type}-{sequential_number}`
- **Examples**:
  - `artifact-functional-spec-001`
  - `artifact-bdd-spec-001`
  - `artifact-backend-repo-001`
  - `artifact-qa-report-001`
  - `artifact-security-report-001`
- **Lifecycle**: Created when artifact is produced
- **Usage**: Reference generated files, reports, code
- **Storage**: Artifact registry with metadata

## Correlation Chain Example

A typical build execution produces this correlation chain:

```
build_id: build-abc12345
├── venture_id: venture-xyz789
├── stage_run_id: build-abc12345-stage-functional-validation-1
│   └── artifact_id: artifact-functional-spec-001
├── stage_run_id: build-abc12345-stage-ux-bdd-specification-1
│   └── artifact_id: artifact-bdd-spec-001
├── stage_run_id: build-abc12345-stage-solution-architecture-1
│   └── artifact_id: artifact-architecture-spec-001
├── stage_run_id: build-abc12345-stage-backend-development-1
│   ├── artifact_id: artifact-backend-repo-001
│   └── artifact_id: artifact-backend-tests-001
├── stage_run_id: build-abc12345-stage-frontend-development-1
│   └── artifact_id: artifact-frontend-repo-001
├── test_run_id: build-abc12345-test-run-1
│   ├── artifact_id: artifact-qa-report-001
│   ├── artifact_id: artifact-qa-screenshot-login-001-fail
│   └── rework_id: build-abc12345-rework-qa-testing-1
│       └── stage_run_id: build-abc12345-stage-frontend-development-2
│           └── artifact_id: artifact-frontend-repo-001-rework
├── audit_id: build-abc12345-audit-1712427600000
│   └── artifact_id: artifact-security-report-001
└── stage_run_id: build-abc12345-stage-governance-review-1
    └── artifact_id: artifact-governance-report-001
```

## ID Propagation Rules

### Event Messages
All events must include:
```json
{
  "event_id": "evt-uuid",
  "correlation_ids": {
    "build_id": "build-abc12345",
    "venture_id": "venture-xyz789",
    "stage_run_id": "build-abc12345-stage-backend-development-1",
    "test_run_id": null,
    "audit_id": null,
    "rework_id": null
  }
}
```

### Artifact Metadata
All artifacts must include:
```json
{
  "artifact_id": "artifact-backend-repo-001",
  "artifact_type": "code_repository",
  "correlation_ids": {
    "build_id": "build-abc12345",
    "venture_id": "venture-xyz789",
    "stage_run_id": "build-abc12345-stage-backend-development-1"
  }
}
```

### Log Messages
All logs must include correlation context:
```
[2026-04-06 14:15:23] [build-abc12345][backend-development-1] Starting backend code generation
[2026-04-06 14:20:45] [build-abc12345][backend-development-1] Generated 12 API endpoints
```

## Tracing Example

### Scenario: Rework Loop with Failure
A build goes through rework cycle and fails on retry:

1. **Initial QA Run** (test_run_id-1)
   - Tests execute with build-abc12345-test-run-1
   - 3 scenarios fail

2. **Rework Triggered**
   - rework_id created: build-abc12345-rework-qa-testing-1
   - Frontend-agent stage_run_id: build-abc12345-stage-frontend-development-2
   - Artifacts generated with rework_id

3. **Retest** (test_run_id-2)
   - Tests execute with build-abc12345-test-run-2
   - All related to rework_id and stage_run_id

4. **Tracing Query**
   - Find all events for build-abc12345
   - Filter by rework_id to isolate rework loop
   - Filter by test_run_id to compare QA runs
   - Filter by stage_run_id to trace specific stage

## Implementation Guidelines

### For Frontend Agents
When generating code/artifacts:
```typescript
const artifact = {
  artifact_id: `artifact-${entityType}-${sequence}`,
  correlation_ids: {
    build_id: context.build_id,
    venture_id: context.venture_id,
    stage_run_id: context.stage_run_id
  }
}
```

### For QA Agent
When executing tests:
```typescript
const testResult = {
  test_run_id: context.test_run_id,
  scenario_id: 'BDD-001',
  correlation_ids: {
    build_id: context.build_id,
    test_run_id: context.test_run_id,
    rework_id: context.rework_id || null
  }
}
```

### For Security Agent
When producing reports:
```typescript
const report = {
  audit_id: `${context.build_id}-audit-${Date.now()}`,
  correlation_ids: {
    build_id: context.build_id,
    venture_id: context.venture_id,
    audit_id: audit_id
  }
}
```

## Log Aggregation Queries

### Find all activities for a build
```
correlation_ids.build_id: "build-abc12345"
```

### Find all rework attempts for a build
```
correlation_ids.build_id: "build-abc12345" AND
correlation_ids.rework_id: *
```

### Find all artifacts from a stage
```
correlation_ids.build_id: "build-abc12345" AND
correlation_ids.stage_run_id: "*backend-development*"
```

### Find failed test scenarios and their rework
```
correlation_ids.test_run_id: "build-abc12345-test-run-1" AND
status: "fail"
```

### Trace full build lifecycle
```
correlation_ids.build_id: "build-abc12345"
| sort by timestamp
```

## Retention & Cleanup

- All correlation IDs retained for 1 year
- Artifacts deleted after 90 days (unless flagged for retention)
- Logs compressed after 30 days, retained for 1 year
- Rework records kept for 1 year for learning/metrics
- Security audit records retained per compliance requirements
