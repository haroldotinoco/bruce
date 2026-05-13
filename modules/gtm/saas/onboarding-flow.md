# GTM Module Onboarding Flow

This document describes how a venture activates and configures the GTM module, triggering channel assessment, GTM strategy creation, and first campaign setup.

## Activation Triggers

The GTM module is activated in two scenarios:

1. **Brand Identity Completion** — When `brand-aid` module completes brand strategy, GTM is automatically invited
2. **Venture Creation** — When a new venture is added via `add-venture`, GTM setup is queued as a follow-up

### Trigger 1: Brand-Aid Completion

When a venture completes brand identity design in the brand-aid module:

```
Event: brand-aid.brand_identity.created
Payload: {
  account_id: 'org_abc123',
  venture_id: 'venture_xyz789',
  brand_id: 'brand_001',
  brand_name: 'TechFlow',
  target_audience: { ... }
}
```

The GTM module receives this event and initiates onboarding:

```typescript
// gtm/workflows/onboarding.ts
eventEmitter.on('brand-aid.brand_identity.created', async (event) => {
  const { account_id, venture_id, brand_id } = event.data;

  // Check if GTM is enabled for this plan
  const tenant = await getTenantContext(account_id);
  if (!tenant.plan_limits.gtm_access) {
    logger.info(`GTM not available on plan ${tenant.plan}`);
    return;
  }

  // Start Temporal workflow for GTM onboarding
  const client = new TemporalClient({
    namespace: `gtm:${account_id}:${venture_id}`
  });

  const workflowId = `gtm-onboarding:${venture_id}`;

  await client.workflow.start(GTMOnboardingWorkflow, {
    taskQueue: 'gtm-onboarding',
    workflowId,
    input: {
      account_id,
      venture_id,
      brand_id,
      trigger: 'brand_identity_created'
    }
  });

  logger.info(`GTM onboarding initiated for venture ${venture_id}`);
});
```

### Trigger 2: Venture Creation

When a new venture is created:

```
Event: startup-ops.venture.created OR add-venture.venture.activated
Payload: {
  account_id: 'org_abc123',
  venture_id: 'venture_new_001',
  venture_name: 'AI Analytics Startup'
}
```

GTM receives notification and queues onboarding:

```typescript
eventEmitter.on('startup-ops.venture.created', async (event) => {
  const { account_id, venture_id, venture_name } = event.data;

  const tenant = await getTenantContext(account_id);
  if (!tenant.plan_limits.gtm_access) {
    return;
  }

  // Store pending onboarding state
  await db.query(
    `INSERT INTO gtm.onboarding_queue (account_id, venture_id, trigger, created_at)
     VALUES ($1, $2, 'venture_created', NOW())`,
    [account_id, venture_id]
  );

  // Send notification to user: "Ready to set up GTM?"
  await notificationService.send({
    account_id,
    type: 'gtm.onboarding_available',
    title: 'Launch your GTM strategy',
    message: `${venture_name} is ready for go-to-market planning.`
  });
});
```

---

## Onboarding Flow Steps

Once triggered, the GTM onboarding flow consists of 4 phases:

### Phase 1: Channel Assessment (Interactive)

**Trigger:** User clicks "Start GTM Setup" or workflow auto-starts after brand completion

**Flow:**

```typescript
// Step 1a: Load channel assessment form
app.get('/ventures/:venture_id/gtm/onboarding/channels', authMiddleware, async (req, res) => {
  const { account_id, venture_id } = req;

  // Check if venture already has channels configured
  const existing = await db.query(
    `SELECT * FROM gtm.channels WHERE account_id = $1 AND venture_id = $2`,
    [account_id, venture_id]
  );

  if (existing.length > 0) {
    return res.json({
      status: 'completed',
      channels: existing,
      message: 'Channels already configured'
    });
  }

  // Return form structure
  res.json({
    status: 'pending',
    form: {
      title: 'Which channels will you use?',
      options: [
        {
          id: 'email',
          label: 'Email Marketing',
          description: 'Send newsletters and promotional emails',
          setup_time_mins: 15
        },
        {
          id: 'social',
          label: 'Social Media',
          description: 'Manage campaigns on LinkedIn, Twitter, Instagram',
          setup_time_mins: 20
        },
        {
          id: 'paid_search',
          label: 'Paid Search (Google Ads)',
          description: 'Run PPC campaigns on Google Search',
          setup_time_mins: 30
        },
        {
          id: 'display',
          label: 'Display Ads',
          description: 'Banner and programmatic display advertising',
          setup_time_mins: 25
        },
        {
          id: 'organic_search',
          label: 'Organic Search (SEO)',
          description: 'Search engine optimization and content',
          setup_time_mins: 45
        },
        {
          id: 'content',
          label: 'Content Marketing',
          description: 'Blog posts, whitepapers, case studies',
          setup_time_mins: 40
        },
        {
          id: 'affiliate',
          label: 'Affiliate Marketing',
          description: 'Partner commissions and referral programs',
          setup_time_mins: 35
        },
        {
          id: 'direct',
          label: 'Direct Sales',
          description: 'Direct outreach and business development',
          setup_time_mins: 0
        }
      ],
      max_selections: 5  // Based on plan limit
    }
  });
});

// Step 1b: User selects channels and submits
app.post('/ventures/:venture_id/gtm/onboarding/channels', authMiddleware, async (req, res) => {
  const { account_id, venture_id } = req;
  const { selected_channels, setup_preferences } = req.body;

  // Validate selection count against plan limits
  const tenant = await getTenantContext(account_id);
  if (selected_channels.length > tenant.plan_limits.max_channels) {
    return res.status(402).json({
      error: 'plan_limit_exceeded',
      message: `Your plan allows up to ${tenant.plan_limits.max_channels} channels`
    });
  }

  // Insert channel records (not yet connected)
  for (const channel_id of selected_channels) {
    await db.query(
      `INSERT INTO gtm.channels
       (account_id, venture_id, channel_id, status, created_at)
       VALUES ($1, $2, $3, 'configured', NOW())`,
      [account_id, venture_id, channel_id]
    );
  }

  // Store setup preferences
  await db.query(
    `UPDATE ventures SET gtm_channels = $1, updated_at = NOW()
     WHERE account_id = $2 AND id = $3`,
    [JSON.stringify(selected_channels), account_id, venture_id]
  );

  res.json({
    status: 'channels_selected',
    channels: selected_channels,
    next_step: 'gtm_strategy'
  });
});
```

### Phase 2: GTM Strategy Creation

**Trigger:** Automatic after channels are selected

**Flow:**

```typescript
// Step 2a: Generate GTM strategy brief using brand context
export const GTMStrategyGenerationActivity = async (input: {
  account_id: string;
  venture_id: string;
  brand_id: string;
  selected_channels: string[];
}) => {
  const { account_id, venture_id, brand_id, selected_channels } = input;

  // Fetch brand identity from brand-aid
  const brand = await db.query(
    `SELECT * FROM brand_aid.identities WHERE account_id = $1 AND id = $2`,
    [account_id, brand_id]
  );

  // Generate GTM strategy document
  const strategy = {
    venture_id,
    brand_id,
    channels: selected_channels,
    target_audience: brand.target_audience,
    key_messages: [
      `${brand.tagline}`,
      'Unique value proposition for each audience segment'
    ],
    quarterly_goals: {
      q1: {
        awareness_target_reach: 50000,
        consideration_target_leads: 500,
        conversion_target_revenue: '$50K'
      }
    },
    channel_allocation: generateChannelBudget(selected_channels, tenant.plan_limits.max_monthly_spend_usd),
    success_metrics: [
      'Brand awareness growth',
      'Lead generation rate',
      'Customer acquisition cost',
      'Conversion rate by channel'
    ]
  };

  // Store strategy
  const result = await db.query(
    `INSERT INTO gtm.strategies
     (account_id, venture_id, brand_id, strategy_document, status, created_at)
     VALUES ($1, $2, $3, $4, 'draft', NOW())
     RETURNING id`,
    [account_id, venture_id, brand_id, JSON.stringify(strategy)]
  );

  return { strategy_id: result[0].id, strategy };
};

// Step 2b: Create onboarding campaign (first campaign template)
export const CreateFirstCampaignActivity = async (input: {
  account_id: string;
  venture_id: string;
  strategy_id: string;
}) => {
  const { account_id, venture_id, strategy_id } = input;

  const strategy = await db.query(
    `SELECT * FROM gtm.strategies WHERE id = $1`,
    [strategy_id]
  );

  // Create welcome/awareness campaign
  const campaign = {
    venture_id,
    strategy_id,
    name: 'Awareness Campaign - Week 1',
    description: 'Initial launch campaign to build brand awareness',
    channels: strategy.channels,
    status: 'draft',
    estimated_reach: 10000,
    estimated_monthly_spend: 500,
    timeline: {
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // 1 week from now
      end_date: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000)   // 5 weeks from now
    }
  };

  const result = await db.query(
    `INSERT INTO gtm.campaigns
     (account_id, venture_id, strategy_id, campaign_name, campaign_data, status, created_at)
     VALUES ($1, $2, $3, $4, $5, 'draft', NOW())
     RETURNING id`,
    [account_id, venture_id, strategy_id, campaign.name, JSON.stringify(campaign)]
  );

  return { campaign_id: result[0].id, campaign };
};
```

### Phase 3: Analytics Webhook Setup

**Trigger:** Automatic after GTM strategy is created

**Flow:**

```typescript
// Step 3: Generate webhook credentials and setup instructions
export const AnalyticsWebhookSetupActivity = async (input: {
  account_id: string;
  venture_id: string;
}) => {
  const { account_id, venture_id } = input;

  // Generate unique webhook secret
  const webhook_secret = crypto.randomBytes(32).toString('hex');
  const webhook_url = `https://api.bruceai.com/gtm/webhooks/analytics/${account_id}/${venture_id}`;

  // Store webhook configuration
  await db.query(
    `INSERT INTO gtm.analytics_webhooks
     (account_id, venture_id, webhook_url, webhook_secret, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [account_id, venture_id, webhook_url, webhook_secret]
  );

  // Return setup instructions
  return {
    webhook_url,
    webhook_secret,
    setup_guide: `
      1. In Google Analytics, go to Admin > Events > Create Event
      2. Set webhook URL to: ${webhook_url}
      3. Use secret header: X-Analytics-Signature: ${webhook_secret}
      4. Configure for these events: purchase, lead, view
    `
  };
};
```

### Phase 4: First Campaign Launch

**Trigger:** User manually clicks "Launch Campaign" (not automatic)

**Flow:**

```typescript
// Step 4a: Display campaign review before launch
app.get('/ventures/:venture_id/gtm/campaigns/:campaign_id/review', authMiddleware, async (req, res) => {
  const { account_id, venture_id, campaign_id } = req;

  const campaign = await db.query(
    `SELECT * FROM gtm.campaigns
     WHERE account_id = $1 AND venture_id = $2 AND id = $3`,
    [account_id, venture_id, campaign_id]
  );

  if (!campaign) return res.status(404).json({ error: 'not_found' });

  res.json({
    campaign,
    validation: {
      channels_configured: campaign.channels.length > 0,
      budget_set: campaign.estimated_monthly_spend > 0,
      timeline_valid: campaign.start_date < campaign.end_date,
      ready_to_launch: true
    },
    launch_confirmation: {
      title: `Launch "${campaign.name}"?`,
      description: 'This campaign will be active for all selected channels',
      budget_warning: `Monthly budget: $${campaign.estimated_monthly_spend}`,
      action: 'POST /campaigns/:campaign_id/launch'
    }
  });
});

// Step 4b: Launch campaign
app.post('/ventures/:venture_id/gtm/campaigns/:campaign_id/launch', authMiddleware, async (req, res) => {
  const { account_id, venture_id, campaign_id } = req;

  // Validate plan limits
  const tenant = await getTenantContext(account_id);
  const activeCampaigns = await db.query(
    `SELECT COUNT(*) FROM gtm.campaigns
     WHERE account_id = $1 AND venture_id = $2 AND status = 'active'`,
    [account_id, venture_id]
  );

  if (activeCampaigns[0].count >= tenant.plan_limits.max_active_campaigns) {
    return res.status(402).json({
      error: 'plan_limit_exceeded',
      message: `Your plan allows ${tenant.plan_limits.max_active_campaigns} active campaigns`
    });
  }

  // Start campaign lifecycle workflow
  const client = new TemporalClient({
    namespace: `gtm:${account_id}:${venture_id}`
  });

  const workflowId = `campaign:${campaign_id}`;

  await client.workflow.start(CampaignLifecycleWorkflow, {
    taskQueue: 'gtm-campaigns',
    workflowId,
    input: {
      account_id,
      venture_id,
      campaign_id,
      action: 'launch',
      timestamp: Date.now()
    }
  });

  // Emit campaign launched event
  await eventBus.publish({
    event_type: 'gtm.campaign.launched',
    account_id,
    venture_id,
    data: {
      campaign_id,
      campaign_name: campaign.name,
      launched_at: new Date(),
      channels: campaign.channels
    },
    timestamp: Date.now()
  });

  res.json({
    status: 'launching',
    campaign_id,
    message: 'Campaign is launching across all channels'
  });
});
```

---

## Completion & Next Steps

Once a campaign is launched, the onboarding flow is complete. The venture can now:

1. **Monitor Performance** — Real-time analytics via GET /analytics
2. **Adjust Spend** — Update channel budgets via PATCH /campaigns/{campaign_id}
3. **Launch More Campaigns** — Create additional campaigns up to plan limit
4. **Run Experiments** — A/B test messaging via POST /experiments
5. **Generate Reports** — Weekly governance reports via GET /reports/weekly

---

## Onboarding Flow Diagram

```
User triggers GTM:
  ├─ Brand completed (auto) OR
  └─ Venture created (auto)
        ↓
   [Phase 1: Channel Assessment]
      User selects channels
        ↓
   [Phase 2: GTM Strategy]
      Auto-generate strategy
      Auto-create first campaign
        ↓
   [Phase 3: Analytics Setup]
      Generate webhook URL
      Show setup instructions
        ↓
   [Phase 4: Launch Campaign]
      User reviews campaign
      User clicks "Launch"
      Workflow starts
      Campaign goes live
        ↓
   [Onboarding Complete]
      Venture ready for GTM operations
      Weekly reports will start
```

---

**Contact:** BruceAI GTM Team
**Last Updated:** 2026-04-06
