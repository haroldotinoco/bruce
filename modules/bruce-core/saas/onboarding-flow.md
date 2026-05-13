# Bruce Core Onboarding Flow

New accounts go through a standardized setup process to activate BruceAI and become ready for venture creation.

## Step-by-Step Flow

### Phase 1: Account Creation (Clerk)

**Trigger:** User signs up via bruceai.com/signup

**What Happens:**
1. Clerk creates a new User
2. User creates or joins an Organization (account_id = org ID)
3. Clerk webhook fires to bruce-core backend: `webhooks/clerk/organization.created`

**Backend Action:**
```typescript
// POST /webhooks/clerk/organization.created
const { type, data } = req.body;

if (type === 'organization.created') {
  const account_id = data.id;
  const org_name = data.name;

  // Insert into accounts table (Neon)
  await db.accounts.insert({
    account_id,
    org_name,
    plan: 'free',  // Default to free tier
    created_at: new Date(),
    status: 'onboarding'
  });

  // Create Stripe customer (for billing, even on free tier)
  const customer = await stripe.customers.create({
    metadata: { account_id },
    name: org_name
  });

  await db.accounts.update(account_id, {
    stripe_customer_id: customer.id
  });

  // Enqueue onboarding workflow
  await temporal.client.workflow.start({
    taskQueue: 'bruce-core--' + account_id,
    workflowId: account_id + '--onboarding--initial',
    workflowName: 'OnboardingWorkflow',
    args: [{ account_id, org_name }]
  });
}
```

---

### Phase 2: Temporal Namespace Provisioning (Pro/Enterprise Only)

**Trigger:** During onboarding workflow (triggered by step 1)

**What Happens:**
- For free tier: no namespace provisioning needed (uses default queue)
- For pro/enterprise: provision dedicated Temporal namespace

**Backend Action:**
```typescript
// Inside OnboardingWorkflow
const onboarding = async (account_id: string, org_name: string) => {
  const account = await db.accounts.findById(account_id);

  if (account.plan === 'pro' || account.plan === 'enterprise') {
    // Call Temporal Cloud API to create namespace
    const namespace = `bruce-${account_id}`.substring(0, 32);

    await temporal.namespaceManager.registerNamespace({
      namespace,
      description: `Dedicated namespace for ${org_name}`,
      workflowExecutionRetention: '30d'
    });

    await db.accounts.update(account_id, {
      temporal_namespace: namespace
    });
  }
};
```

---

### Phase 3: Welcome Email + First Venture CTA

**Trigger:** After namespace provisioning (or immediate for free tier)

**What Happens:**
- Send welcome email via Resend
- Email includes magic link to create first venture
- Offer early access to modules if applicable

**Backend Action:**
```typescript
// Send email
const emailResponse = await resend.emails.send({
  from: 'onboarding@bruceai.com',
  to: user.email,
  subject: 'Welcome to BruceAI – Start Your First Venture',
  html: `
    <h1>Welcome, ${org_name}!</h1>
    <p>You're now ready to start your first venture with BruceAI.</p>
    <p>
      <a href="https://app.bruceai.com/ventures/create?account_id=${account_id}">
        Create Your First Venture
      </a>
    </p>
    <p>Your plan: <strong>${account.plan}</strong></p>
    <p>Available modules: ${account.modules_enabled.join(', ')}</p>
  `
});

await db.audit_log.insert({
  account_id,
  event: 'welcome_email.sent',
  metadata: { email_id: emailResponse.id }
});
```

---

### Phase 4: First Venture Auto-Start (Free Tier)

**Trigger:** User clicks "Create First Venture" or API call to POST /ventures

**What Happens:**
1. Venture record created with `account_id`
2. Auto-start opportunity scan (free tier feature)
3. UI redirects to opportunity results page

**Backend Action:**
```typescript
// POST /ventures (with auth context: account_id)
const createVenture = async (req, res) => {
  const { account_id } = req.auth;  // From Clerk token
  const { theme, description } = req.body;

  // Validate plan limits
  const activeVentures = await db.ventures.count({
    account_id,
    status: { $in: ['active', 'paused'] }
  });

  const planLimits = PLAN_LIMITS[account.plan];
  if (planLimits.max_active_ventures > 0 &&
      activeVentures >= planLimits.max_active_ventures) {
    return res.status(402).json({
      error: 'plan_limit_reached',
      message: `${account.plan} plan allows max ${planLimits.max_active_ventures} active ventures`
    });
  }

  // Create venture
  const venture = await db.ventures.insert({
    account_id,
    venture_id: generateId(),
    name: `${theme} Venture`,
    description,
    status: 'active',
    created_at: new Date()
  });

  // Auto-trigger opportunity scan for free tier
  if (account.plan === 'free') {
    await temporal.client.workflow.start({
      taskQueue: 'bruce-core--' + account_id,
      workflowId: `${account_id}--${venture.venture_id}--opportunity-scan`,
      workflowName: 'OpportunityScanWorkflow',
      args: [{
        account_id,
        venture_id: venture.venture_id,
        themes: [theme],
        auto_triggered: true
      }]
    });
  }

  res.json(venture);
};
```

---

## API Reference: Post-Onboarding

Once onboarded, accounts can:

### Create Additional Ventures
```bash
curl -X POST https://api.bruceai.com/ventures \
  -H "Authorization: Bearer {clerk_session_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "AI-powered compliance automation",
    "description": "Help fintech companies automate regulatory reporting"
  }'
```

Response:
```json
{
  "venture_id": "vent_abc123",
  "account_id": "org_xyz789",
  "name": "AI-powered compliance automation Venture",
  "status": "active",
  "created_at": "2026-04-06T12:00:00Z",
  "modules": ["opportunity", "add-venture"]
}
```

### Check Account Status
```bash
curl -X GET https://api.bruceai.com/account \
  -H "Authorization: Bearer {clerk_session_token}"
```

Response:
```json
{
  "account_id": "org_xyz789",
  "org_name": "Acme Ventures",
  "plan": "free",
  "status": "active",
  "created_at": "2026-03-15T10:00:00Z",
  "plan_limits": {
    "max_active_ventures": 1,
    "modules_enabled": ["opportunity", "add-venture"],
    "human_gate_notifications": false
  },
  "active_ventures": 1,
  "stripe_customer_id": "cus_123abc"
}
```

---

## Plan Upgrade Flow

When a user upgrades from free → pro/enterprise:

1. User selects plan in dashboard
2. Redirected to Stripe checkout (via Stripe Billing)
3. After payment confirmation (Webhook: `invoice.paid`)
4. `POST /webhooks/stripe/invoice.paid`
   - Update account.plan to 'pro'
   - Unlock additional modules
   - Provision Temporal namespace (if enterprise)
   - Send upgrade confirmation email
   - Update venture access rules

```typescript
const handleInvoicePaid = async (invoice) => {
  const account_id = invoice.metadata.account_id;
  const new_plan = invoice.metadata.plan;  // 'pro' or 'enterprise'

  const account = await db.accounts.update(account_id, {
    plan: new_plan,
    status: 'active'
  });

  // Unlock modules
  account.modules_enabled = PLAN_LIMITS[new_plan].modules_enabled;
  await db.accounts.save(account);

  // Send confirmation
  await resend.emails.send({
    to: account.primary_user.email,
    subject: `Welcome to BruceAI ${new_plan.toUpperCase()}!`,
    html: `Your account has been upgraded. New modules: ${account.modules_enabled.join(', ')}`
  });
};
```

---

## Monitoring & Alerts

During onboarding, monitor:
- **Clerk webhook delivery latency** — alert if > 5s
- **Stripe customer creation failures** — critical
- **Temporal namespace provisioning** — alert if pending > 2min
- **Welcome email bounce rate** — if > 5%, disable auto-send
- **First venture creation rate** — if < 30% create venture within 24h, send reminder

Log all events to structured log store:
```json
{
  "timestamp": "2026-04-06T12:15:00Z",
  "account_id": "org_xyz789",
  "event": "account.onboarding.completed",
  "duration_seconds": 42,
  "modules_enabled": ["opportunity", "add-venture"],
  "plan": "free",
  "status": "success"
}
```

---

**Contact:** Platform Team
**Last Updated:** 2026-04-06
