# Portfolio Module: Onboarding Flow

## Overview

Portfolio onboarding activates governance for an account, configuring review cycles, risk parameters, and baseline health assessments. Triggered by pro/enterprise upgrade or manual activation.

---

## Activation Triggers

### 1. Subscription Upgrade
- **Event**: `subscription.plan_changed` → tier = "pro" or "enterprise"
- **Handler**: Portfolio onboarding service listens to billing events
- **Automatic**: Yes (background job)
- **User Notification**: Email confirmation that Portfolio is now enabled

### 2. Manual Activation
- **Endpoint**: `POST /portfolio/onboarding/activate`
- **Auth**: Account owner or admin
- **Payload**: Basic account info (account_id, initial config if provided)
- **Response**: Onboarding workflow ID and next steps

---

## Onboarding Steps

### Step 1: Initialization (Immediate)

**Objective**: Create tenant record and establish baseline configuration

**Code**:
```typescript
import { initializeTenantContext } from '@bruce/portfolio/onboarding';

async function initializePortfolioTenant(
  accountId: string,
  planTier: 'pro' | 'enterprise'
) {
  // Validate account exists in auth system
  const account = await authService.getAccount(accountId);
  if (!account) throw new Error('Account not found');

  // Create tenant context record
  const tenantConfig = {
    account_id: accountId,
    plan_tier: planTier,
    review_cycle_weeks: planTier === 'enterprise' ? 1 : 2,
    max_ventures_in_review: planTier === 'enterprise' ? null : 5,
    allocation_model: 'linear',
    risk_appetite: 'moderate',
    kill_threshold_health_score: 40,
    scale_threshold_health_score: 80,
    pause_threshold_health_score: 50,
    governance_report_recipients: [account.owner_email],
    governance_report_frequency: 'bi-weekly',
    audit_trail_enabled: true,
    risk_monitoring_enabled: planTier === 'enterprise',
    webhook_enabled: false,
    webhook_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Persist to database (partitioned by account_id)
  await db.insert('portfolio_tenants', tenantConfig);

  // Initialize Redis namespace
  await redis.set(
    `portfolio:${accountId}:onboarding:status`,
    'initialized',
    { ex: 86400 } // 24 hour expiry
  );

  return tenantConfig;
}
```

**Outputs**:
- Tenant record in `portfolio_tenants` table
- Redis cache entry for onboarding status
- Initial audit trail entry

---

### Step 2: Portfolio Configuration (User Input)

**Objective**: Capture account-specific governance preferences

**Configuration Options**:
- Review cadence (2, 4 weeks for pro; 1-4 weeks for enterprise)
- Risk appetite (conservative/moderate/aggressive)
- Kill decision thresholds
- Report recipients
- Custom allocation rules (enterprise only)

**Code**:
```typescript
async function capturePortfolioConfig(
  accountId: string,
  config: Partial<TenantConfig>
) {
  // Validate thresholds make logical sense
  if (config.kill_threshold_health_score !== undefined &&
      config.pause_threshold_health_score !== undefined) {
    if (config.kill_threshold_health_score >= config.pause_threshold_health_score) {
      throw new Error('Kill threshold must be below pause threshold');
    }
  }

  // Update tenant record
  await db.update(
    'portfolio_tenants',
    { account_id: accountId },
    {
      ...config,
      updated_at: new Date().toISOString()
    }
  );

  // Log configuration change to audit trail
  await auditService.logEvent({
    account_id: accountId,
    event_type: 'portfolio_config_updated',
    changes: config,
    timestamp: new Date().toISOString()
  });

  // Invalidate cached config
  await redis.del(`portfolio:${accountId}:config`);

  return { success: true, message: 'Configuration saved' };
}
```

**User Experience**:
- Onboarding form or API call with configuration schema validation
- Preview of governance timeline based on selected review cadence
- Confirmation of kill/pause/scale thresholds with explanations

---

### Step 3: First Portfolio Baseline Review

**Objective**: Snapshot current portfolio health and establish decision baseline

**Triggers**:
- Automatically after Step 2 completion
- User can trigger manually if needed

**Code**:
```typescript
import { initiatePortfolioReview } from '@bruce/portfolio/reviews';

async function firstPortfolioReview(accountId: string) {
  // Fetch all ventures for account from StartupOps
  const ventures = await startupOpsService.getVentures(accountId);

  if (!ventures || ventures.length === 0) {
    // No ventures yet; schedule review for when ventures exist
    await scheduleNextReview(accountId, 7); // 7 days from now
    return { message: 'No ventures to review; review scheduled for later' };
  }

  // Create review record
  const review = await db.insert('portfolio_reviews', {
    account_id: accountId,
    review_id: `rev_${generateId()}`,
    review_cycle_number: 1,
    status: 'in_progress',
    started_at: new Date().toISOString(),
    workflow_id: `portfolio-review-${accountId}-${new Date().toISOString().split('T')[0]}`
  });

  // Kick off review workflow
  await workflowService.startWorkflow({
    workflow_id: review.workflow_id,
    account_id: accountId,
    agents: ['portfolio-analyst', 'risk-monitor', 'allocation-agent'],
    context: {
      ventures,
      tenant_config: await getTenantConfig(accountId)
    }
  });

  return review;
}
```

**Review Components**:
1. **Portfolio Analyst**: Analyzes each venture's metrics (funding, burn, ARR, user growth)
2. **Risk Monitor**: Assesses risk factors (market, team, execution)
3. **Allocation Agent**: Computes current vs. optimal resource allocation
4. **Governance Decision Agent**: Generates initial recommendations (no decisions yet)
5. **Portfolio Reporter**: Compiles findings into report

**Outputs**:
- Baseline health scores for each venture
- Current allocation snapshot
- Risk factor assessment
- Governance report (read-only, no decisions recorded)

---

### Step 4: Governance Report Template Setup

**Objective**: Configure report generation, distribution, and custom fields

**Code**:
```typescript
async function setupReportTemplate(
  accountId: string,
  templateConfig: {
    recipients: string[];
    frequency: 'weekly' | 'bi-weekly' | 'monthly';
    includeMetrics: string[];
    customFields?: Record<string, unknown>;
  }
) {
  // Validate recipients
  for (const recipient of templateConfig.recipients) {
    if (!isValidEmail(recipient)) {
      throw new Error(`Invalid email: ${recipient}`);
    }
  }

  // Save template
  await db.insert('portfolio_report_templates', {
    account_id: accountId,
    template_id: `tpl_${generateId()}`,
    recipients: templateConfig.recipients,
    frequency: templateConfig.frequency,
    include_metrics: templateConfig.includeMetrics,
    custom_fields: templateConfig.customFields || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Schedule first report generation
  const nextReportDate = calculateNextReportDate(templateConfig.frequency);
  await redis.set(
    `portfolio:${accountId}:next-report:scheduled`,
    nextReportDate,
    { ex: 86400 * 365 }
  );

  return { message: 'Report template saved', next_report: nextReportDate };
}
```

**Template Options**:
- Standard metrics (health scores, allocation, risk levels)
- Custom fields (company-specific KPIs)
- Distribution list
- Format (email, dashboard link, PDF export)

---

### Step 5: Recurring Review Cycle Scheduling

**Objective**: Establish automated governance workflow schedule

**Code**:
```typescript
async function scheduleReviewCycle(accountId: string) {
  const tenantConfig = await getTenantConfig(accountId);

  // Calculate review dates based on cycle weeks
  const today = new Date();
  const cycleIntervalMs = tenantConfig.review_cycle_weeks * 7 * 24 * 60 * 60 * 1000;

  let nextReviewDate = new Date(today.getTime() + cycleIntervalMs);

  // Schedule recurring cron job
  const cronEntry = {
    account_id: accountId,
    job_id: `job_${generateId()}`,
    cron_expression: calculateCronExpression(tenantConfig.review_cycle_weeks),
    job_type: 'portfolio_review',
    enabled: true,
    created_at: new Date().toISOString()
  };

  await db.insert('scheduled_jobs', cronEntry);

  // Cache next review time
  await redis.set(
    `portfolio:${accountId}:next-review:scheduled`,
    nextReviewDate.toISOString(),
    { ex: 86400 * 365 }
  );

  // Create audit entry
  await auditService.logEvent({
    account_id: accountId,
    event_type: 'review_cycle_scheduled',
    cycle_weeks: tenantConfig.review_cycle_weeks,
    first_review_date: nextReviewDate.toISOString(),
    timestamp: new Date().toISOString()
  });

  return {
    message: 'Review cycle scheduled',
    first_review: nextReviewDate,
    interval_weeks: tenantConfig.review_cycle_weeks
  };
}

function calculateCronExpression(weekInterval: number): string {
  // For simplicity: cron runs every Monday at 9 AM
  // Enterprise can customize via custom_allocation_rules
  return '0 9 * * 1'; // Every Monday at 9 AM
}
```

**Schedule Activation**:
- First review scheduled for 1 week after onboarding completion
- Subsequent reviews on cadence (bi-weekly for pro, weekly for enterprise)
- Cron jobs managed by workflow scheduler

---

## Onboarding Completion

**Final Status**: Account is ready for portfolio governance

**Confirmation Email Template**:
```
Subject: Portfolio Governance Activated

Hello [Account Owner],

Your BruceAI portfolio governance engine is now active. Here's your setup summary:

- Review Cadence: [review_cycle_weeks] weeks
- Risk Appetite: [risk_appetite]
- Ventures in Portfolio: [count]
- First Review Scheduled: [next_review_date]
- Governance Reports Sent To: [recipients]

Your portfolio analyst, risk monitor, and allocation agent will review your ventures
every [review_cycle_weeks] weeks and provide recommendations on scale/iterate/pause/kill decisions.

Next Steps:
1. Configure governance report recipients (if not done)
2. Set risk appetite and kill thresholds in Settings
3. Review your first portfolio report when it's generated

Questions? Contact support@bruceai.com
```

**Data Checkpoints**:
- Tenant config persisted
- Report template configured
- Review cycle scheduled
- Baseline review completed
- Audit trail initialized

---

## Rollback (If Needed)

If onboarding fails or account downgrades, clean up:

```typescript
async function rollbackPortfolioOnboarding(accountId: string) {
  // Soft-delete tenant config
  await db.update(
    'portfolio_tenants',
    { account_id: accountId },
    { deleted_at: new Date().toISOString() }
  );

  // Cancel scheduled reviews
  await db.update(
    'scheduled_jobs',
    { account_id: accountId, job_type: 'portfolio_review' },
    { enabled: false }
  );

  // Clear Redis cache
  await redis.del(`portfolio:${accountId}:*`);

  // Log rollback
  await auditService.logEvent({
    account_id: accountId,
    event_type: 'portfolio_onboarding_rolled_back',
    timestamp: new Date().toISOString()
  });
}
```

---

## Summary Timeline

| Step | Trigger | Duration | Output |
|------|---------|----------|--------|
| 1. Initialization | Plan upgrade or manual | < 1 min | Tenant record created |
| 2. Configuration | User input | 5-10 min | Config persisted |
| 3. Baseline Review | Auto after Step 2 | 2-5 min | Health snapshots, audit entry |
| 4. Report Template | User input or default | 2-3 min | Report schedule configured |
| 5. Cycle Scheduling | Auto after Step 4 | < 1 min | Cron jobs activated |

**Total Time**: 15-30 minutes for full onboarding
