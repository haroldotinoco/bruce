# StartupOps Onboarding Flow

## Overview

The StartupOps onboarding flow activates continuous operational health monitoring for a venture. It is triggered either automatically during GTM launch or manually by the account holder. The flow establishes data connections, calculates initial health baselines, configures anomaly detection, and schedules recurring monitoring jobs.

## Activation Triggers

### Automatic Trigger: GTM Launch

When a venture transitions to "launched" in GTM module:

```typescript
// GTM module event listener
on('gtm.venture.launched', async (event) => {
  const { account_id, venture_id, gtm_metrics } = event.payload;

  // Trigger StartupOps onboarding
  await startupOpsQueue.enqueue({
    type: 'onboard_venture',
    account_id,
    venture_id,
    trigger: 'gtm_launch',
    initial_gtm_data: gtm_metrics
  });
});
```

### Manual Trigger: Account Activation

User explicitly enables StartupOps monitoring via dashboard:

```typescript
// POST /api/startup-ops/ventures/{venture_id}/activate
router.post('/ventures/:venture_id/activate', async (req, res) => {
  const { account_id, venture_id } = req.params;

  // Validate account subscription includes StartupOps
  const plan = await getPlan(account_id);
  if (!['pro', 'enterprise'].includes(plan)) {
    return res.status(403).json({ error: 'StartupOps requires Pro plan or higher' });
  }

  await startupOpsQueue.enqueue({
    type: 'onboard_venture',
    account_id,
    venture_id,
    trigger: 'manual_activation'
  });

  res.json({ status: 'onboarding_started' });
});
```

## Step 1: Data Source Connection

User connects required data sources for operational monitoring.

### Connection UI Flow

1. **Analytics Connector** (Activation, Retention, Product Quality)
   - Supported: Mixpanel, Amplitude, Segment
   - User selects provider and authenticates via OAuth
   - System validates API access and retrieves workspace metadata

2. **Financial Connector** (Revenue, Financial Sustainability)
   - Supported: Stripe
   - User enters Stripe API key (encrypted)
   - System validates connectivity and lists connected accounts

3. **GTM Connector** (Market Fit, Revenue)
   - Supported: Salesforce, HubSpot, Pipedrive
   - User authorizes via OAuth or API key
   - System retrieves pipeline, cohort, and segment data

### Connection Implementation

```typescript
interface DataSourceConnection {
  venture_id: string;
  account_id: string;
  provider: 'mixpanel' | 'amplitude' | 'stripe' | 'salesforce' | 'hubspot';
  credential_encrypted: string;
  workspace_id?: string;
  connected_at: Date;
  validated_at: Date;
}

async function connectDataSource(
  account_id: string,
  venture_id: string,
  provider: string,
  credential: object
): Promise<DataSourceConnection> {
  // Encrypt credential with account-specific key
  const encrypted = await encryptWithAccountKey(account_id, credential);

  // Validate connectivity
  const isValid = await validateDataSourceAccess(provider, credential);
  if (!isValid) {
    throw new Error(`Failed to authenticate with ${provider}`);
  }

  // Store connection
  const connection = await db.startupOps.dataSourceConnections.create({
    account_id,
    venture_id,
    provider,
    credential_encrypted: encrypted,
    connected_at: new Date(),
    validated_at: new Date()
  });

  // Index for monitoring jobs
  await redis.zadd(
    `startup-ops:${account_id}:connected-ventures`,
    Date.now(),
    venture_id
  );

  return connection;
}
```

## Step 2: First Health Baseline Run

After data sources are connected, StartupOps calculates initial health scores across all 6 dimensions.

### Baseline Calculation

```typescript
async function calculateInitialHealthBaseline(
  account_id: string,
  venture_id: string
): Promise<HealthScore> {
  const connections = await getDataSourceConnections(account_id, venture_id);

  // Fetch metrics from each data source
  const metrics = {
    activation: await fetchActivationMetrics(connections.analytics),
    retention: await fetchRetentionMetrics(connections.analytics),
    revenue: await fetchRevenueMetrics(connections.financial, connections.gtm),
    product_quality: await fetchQualityMetrics(connections.analytics),
    financial_sustainability: await fetchFinancialMetrics(connections.financial),
    market_fit: await fetchMarketFitMetrics(connections.gtm)
  };

  // Score each dimension (0-100)
  const dimensionScores = {
    activation: scoreActivation(metrics.activation),
    retention: scoreRetention(metrics.retention),
    revenue: scoreRevenue(metrics.revenue),
    product_quality: scoreProductQuality(metrics.product_quality),
    financial_sustainability: scoreFinancialSustainability(metrics.financial_sustainability),
    market_fit: scoreMarketFit(metrics.market_fit)
  };

  // Calculate weighted overall health
  const weights = {
    activation: 0.15,
    retention: 0.20,
    revenue: 0.25,
    product_quality: 0.15,
    financial_sustainability: 0.15,
    market_fit: 0.10
  };

  const overall = Object.entries(dimensionScores).reduce(
    (sum, [dim, score]) => sum + (score * weights[dim]),
    0
  );

  // Store baseline
  const healthScore = await db.startupOps.healthScores.create({
    account_id,
    venture_id,
    timestamp: new Date(),
    score: overall,
    dimensions: dimensionScores,
    is_baseline: true,
    metrics_snapshot: metrics
  });

  // Publish event
  await eventBus.publish('startup-ops.baseline.calculated', {
    account_id,
    venture_id,
    overall,
    dimensionScores
  });

  return healthScore;
}
```

## Step 3: Anomaly Threshold Calibration

System calibrates anomaly detection thresholds based on account plan and baseline data.

### Threshold Configuration

```typescript
async function calibrateAnomalyThresholds(
  account_id: string,
  venture_id: string
): Promise<void> {
  const plan = await getPlan(account_id);

  // Determine default sigma threshold by plan
  const baselineSigma = plan === 'enterprise' ? 2.0 : 2.5; // Enterprise more sensitive

  // Fetch tenant config
  let config = await db.startupOps.tenantConfig.findOne({ account_id });
  if (!config) {
    config = await db.startupOps.tenantConfig.create({
      account_id,
      plan,
      anomaly_detection: {
        enabled: true,
        threshold_sigma: baselineSigma,
        lookback_days: plan === 'enterprise' ? 60 : 30
      },
      health_dimensions_enabled: [
        'activation', 'retention', 'revenue', 'product_quality',
        'financial_sustainability', 'market_fit'
      ],
      monitoring_frequency_hours: plan === 'enterprise' ? 0.25 : 6
    });
  }

  // Allow enterprise accounts to customize
  if (plan === 'enterprise' && req.body.custom_thresholds) {
    config.custom_thresholds = req.body.custom_thresholds;
    await config.save();
  }

  // Cache thresholds for monitoring jobs
  await redis.hset(
    `startup-ops:${account_id}:anomaly-config`,
    `${venture_id}:sigma`,
    config.anomaly_detection.threshold_sigma
  );
  await redis.hset(
    `startup-ops:${account_id}:anomaly-config`,
    `${venture_id}:lookback`,
    config.anomaly_detection.lookback_days
  );

  return config;
}
```

## Step 4: Recurring Monitoring Job Setup

Temporal workflow is created to schedule recurring health checks at the configured frequency.

### Workflow Definition

```typescript
@workflow
async function healthMonitoringWorkflow(
  workflowInput: HealthMonitoringInput
): Promise<void> {
  const {
    account_id,
    venture_ids,
    monitoring_frequency_hours
  } = workflowInput;

  const frequency = Duration.hours(monitoring_frequency_hours);

  while (true) {
    // Wait for monitoring interval
    await sleep(frequency);

    // Execute health check for each venture
    for (const venture_id of venture_ids) {
      try {
        const result = await executeActivity('runHealthCheck', {
          account_id,
          venture_id
        });

        // Check for anomalies
        const anomalies = await executeActivity('detectAnomalies', {
          account_id,
          venture_id,
          current_health: result
        });

        if (anomalies.length > 0) {
          await executeActivity('triggerEscalation', {
            account_id,
            venture_id,
            anomalies
          });
        }
      } catch (error) {
        logger.error(`Health check failed for ${venture_id}`, error);
        // Continue with other ventures
      }
    }
  }
}

// Workflow activity: Run health check
@activity({ startToCloseTimeout: Duration.minutes(10) })
async function runHealthCheck(input: {
  account_id: string;
  venture_id: string;
}): Promise<HealthScore> {
  const { account_id, venture_id } = input;

  // Fetch latest metrics from cache or data sources
  const metrics = await fetchVentureMetrics(account_id, venture_id);

  // Calculate health scores
  const healthScore = await calculateHealthScore(account_id, venture_id, metrics);

  // Store in database
  await db.startupOps.healthScores.create(healthScore);

  return healthScore;
}

// Activity: Detect anomalies
@activity({ startToCloseTimeout: Duration.minutes(5) })
async function detectAnomalies(input: {
  account_id: string;
  venture_id: string;
  current_health: HealthScore;
}): Promise<AnomalyEvent[]> {
  const { account_id, venture_id, current_health } = input;

  // Get anomaly thresholds for account
  const config = await getAnomalyConfig(account_id, venture_id);
  const sigma = config.threshold_sigma;

  // Calculate baseline from historical data
  const lookback = config.lookback_days;
  const baseline = await calculateBaseline(account_id, venture_id, lookback);

  const anomalies: AnomalyEvent[] = [];

  // Check each dimension
  for (const [dimension, currentScore] of Object.entries(current_health.dimensions)) {
    const historicalMean = baseline[dimension].mean;
    const historicalStdDev = baseline[dimension].stdDev;

    const deviation = Math.abs((currentScore - historicalMean) / historicalStdDev);

    if (deviation > sigma) {
      anomalies.push({
        account_id,
        venture_id,
        dimension,
        severity: deviation > sigma * 1.5 ? 'critical' : 'warning',
        detected_value: currentScore,
        baseline_value: historicalMean,
        sigma_deviation: deviation,
        timestamp: new Date()
      });
    }
  }

  // Store anomalies
  if (anomalies.length > 0) {
    await db.startupOps.anomalyEvents.insertMany(anomalies);
  }

  return anomalies;
}

// Activity: Trigger escalation
@activity({ startToCloseTimeout: Duration.minutes(2) })
async function triggerEscalation(input: {
  account_id: string;
  venture_id: string;
  anomalies: AnomalyEvent[];
}): Promise<void> {
  const { account_id, venture_id, anomalies } = input;

  // Get escalation config
  const config = await getEscalationConfig(account_id);

  if (!config.escalation_webhook.enabled) return;

  // Send to each webhook
  for (const webhook_url of config.escalation_webhook.urls) {
    try {
      await fetch(webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id,
          venture_id,
          timestamp: new Date().toISOString(),
          anomalies: anomalies.map(a => ({
            dimension: a.dimension,
            severity: a.severity,
            current_value: a.detected_value,
            baseline_value: a.baseline_value,
            sigma_deviation: a.sigma_deviation
          }))
        })
      });
    } catch (error) {
      logger.error(`Webhook delivery failed for ${webhook_url}`, error);
      // Retry handled by Temporal activity retry policy
    }
  }
}
```

### Workflow Registration and Start

```typescript
async function setupMonitoringWorkflow(
  account_id: string,
  ventureIds: string[]
): Promise<string> {
  const client = new WorkflowClient();

  const config = await getMonitoringConfig(account_id);

  const handle = await client.start(healthMonitoringWorkflow, {
    taskQueue: 'startup-ops',
    workflowId: `health-monitoring-${account_id}`,
    input: {
      account_id,
      venture_ids: ventureIds,
      monitoring_frequency_hours: config.monitoring_frequency_hours
    }
  });

  // Store workflow reference
  await db.startupOps.monitoringWorkflows.create({
    account_id,
    workflow_id: handle.workflowId,
    venture_ids: ventureIds,
    started_at: new Date(),
    status: 'active'
  });

  return handle.workflowId;
}
```

## Step 5: Onboarding Completion

After all steps succeed, the venture is marked as onboarded and monitoring begins.

```typescript
async function completeOnboarding(
  account_id: string,
  venture_id: string
): Promise<void> {
  // Update venture status
  await db.startupOps.ventureStatus.updateOne(
    { account_id, venture_id },
    {
      status: 'monitoring_active',
      onboarded_at: new Date(),
      first_baseline_at: new Date()
    },
    { upsert: true }
  );

  // Publish completion event
  await eventBus.publish('startup-ops.onboarding.completed', {
    account_id,
    venture_id,
    timestamp: new Date()
  });

  // Send confirmation notification
  await sendOnboardingConfirmation(account_id, venture_id);
}
```

## Error Handling

If any step fails, onboarding is halted and the user is notified:

```typescript
async function handleOnboardingError(
  account_id: string,
  venture_id: string,
  step: string,
  error: Error
): Promise<void> {
  logger.error(`Onboarding failed at ${step}`, { account_id, venture_id, error });

  // Store error state
  await db.startupOps.onboardingErrors.create({
    account_id,
    venture_id,
    step,
    error_message: error.message,
    occurred_at: new Date(),
    recoverable: isRecoverable(step)
  });

  // Notify user
  await sendErrorNotification(account_id, venture_id, step, error);

  // If not recoverable, mark venture as failed
  if (!isRecoverable(step)) {
    await db.startupOps.ventureStatus.updateOne(
      { account_id, venture_id },
      { status: 'onboarding_failed', error_details: error.message }
    );
  }
}
```

## Summary

The StartupOps onboarding flow:
1. Triggered by GTM launch or manual activation
2. Connects required data sources (analytics, financial, GTM)
3. Calculates initial health baseline across 6 dimensions
4. Calibrates anomaly detection thresholds per account plan
5. Sets up recurring Temporal workflow for continuous monitoring
6. Completes with confirmation and begins real-time health monitoring
