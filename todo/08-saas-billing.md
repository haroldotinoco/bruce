# Fase 8 — Camada SaaS e Billing

**Status:** Não iniciado  
**Prioridade:** Baixa (opcional para POC/MVP)  
**Duração estimada:** 2–3 dias  
**Responsável:** Business / Backend  
**Dependências:** Fases 0–5 (monorepo, auth, plan limits)  
**Nota:** Esta fase é APENAS necessária para produção com pagamentos. Para POC/MVP interno, pule direto à Fase 9.

---

## Visão Geral

BruceAI é um SaaS com planos escalonados (free/pro/enterprise). Esta fase implementa:

1. **Stripe integration** — produtos, preços, billing meter
2. **Webhook handler** — atualizar planos conforme pagamentos
3. **Usage metering** — registrar ações cobráveis
4. **Billing portal** — link Stripe self-service para usuários
5. **Revenue tracking** — dashboard de MRR, churn, etc.

**Objetivo:** Monetizar a plataforma sem reescrever código de negócio.

---

## Decisão: Pular para POC?

Se estiver em fase de MVP/POC:
- Use plan limits genéricos (Fase 5)
- Ignore Stripe totalmente
- Pule para Fase 9 (testing)
- Implemente billing quando tiver tração (depois de launch)

Se já tem willingness-to-pay:
- Implemente esta fase
- Use Stripe Billing para metering automático

**Recomendação:** POC sem Stripe → launch → Stripe se tiver demanda.

---

## 1. Setup Stripe

### 1.1 Criar Conta Stripe

1. Ir para [stripe.com](https://stripe.com)
2. Criar conta de negócio
3. Copiar `STRIPE_SECRET_KEY` e `STRIPE_PUBLISHABLE_KEY`
4. Habilitar Billing (Billing → Metered Billing)

### 1.2 Criar Produtos e Preços

Via Stripe CLI ou Dashboard:

```bash
# Plans — Products
stripe products create \
  --name="BruceAI Free" \
  --metadata[tier]=free

stripe products create \
  --name="BruceAI Pro" \
  --metadata[tier]=pro

stripe products create \
  --name="BruceAI Enterprise" \
  --metadata[tier]=enterprise

# Prices — Monthly recurring
stripe prices create \
  --product=prod_bruce_free \
  --unit_amount=0 \
  --currency=usd \
  --recurring[interval]=month

stripe prices create \
  --product=prod_bruce_pro \
  --unit_amount=99900 \ # $999/month
  --currency=usd \
  --recurring[interval]=month

stripe prices create \
  --product=prod_bruce_enterprise \
  --unit_amount=0 \ # Negotiated, use $0 + usage
  --currency=usd \
  --recurring[interval]=month
```

### 1.3 Criar Billing Meters

Billing meters medem uso real (ex: "500 oportunidades escaneadas este mês"):

```bash
# Meter: opportunity scans
stripe billing_meter_events create \
  --event_name=opportunity_scans \
  --customer=cus_xyz \
  --value=1 \
  --timestamp=$(date +%s)
```

---

## 2. Integração com Bruce

### 2.1 Setup Stripe Client

Arquivo: `packages/stripe-client/src/index.ts`

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || '',
  {
    apiVersion: '2024-04-10',
    typescript: true,
  },
);

/**
 * Mapeamento de plans para Stripe products
 */
export const PLAN_TO_STRIPE_PRODUCT = {
  free: 'prod_bruce_free',
  pro: 'prod_bruce_pro',
  enterprise: 'prod_bruce_enterprise',
};

/**
 * Mapeamento de eventos cobráveis para meters
 */
export const BILLING_EVENTS = {
  opportunity_scan: 'opportunity_scans',
  gtm_campaign: 'gtm_campaigns',
  health_check: 'health_checks',
  ai_credit_used: 'ai_credits',
};
```

### 2.2 Webhook Handler em bruce-core

Arquivo: `apps/bruce-core/src/api/webhooks/stripe.handler.ts`

```typescript
import { Hono } from 'hono';
import { stripe } from '@bruce/stripe-client';
import { getDB } from '@bruce/db';
import { eq } from 'drizzle-orm';
import { accounts } from '@bruce/db/schema';

const stripeWebhook = new Hono();

// Tipos do Stripe
interface StripeEvent {
  type: string;
  data: {
    object: any;
  };
}

stripeWebhook.post('/stripe', async (c) => {
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();

  // Validar assinatura
  let event: StripeEvent;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig || '',
      process.env.STRIPE_WEBHOOK_SECRET || '',
    ) as StripeEvent;
  } catch (err) {
    return c.json({ error: 'Webhook signature failed' }, 400);
  }

  const db = getDB();

  // Handler: invoice.paid → upgrade account
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    try {
      // Buscar account pelo stripe_customer_id
      const account = await db
        .select()
        .from(accounts)
        .where(eq(accounts.stripe_customer_id, customerId))
        .run();

      if (!account || account.length === 0) {
        console.warn(`Account not found for customer ${customerId}`);
        return c.json({ ok: true }); // Não falhar webhook
      }

      const accountId = account[0].account_id;

      // Extrair plano da subscription
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string,
      );

      const plan = (
        subscription.metadata?.plan || 'pro'
      ) as 'free' | 'pro' | 'enterprise';

      // Atualizar account.plan
      await db
        .update(accounts)
        .set({ plan, updated_at: new Date() })
        .where(eq(accounts.account_id, accountId))
        .run();

      logger.info('Account upgraded', {
        account_id: accountId,
        plan,
        invoice_id: invoice.id,
      });

      return c.json({ ok: true });
    } catch (error) {
      logger.error('Failed to process invoice.paid', { error });
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  // Handler: customer.subscription.deleted → downgrade to free
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    try {
      const account = await db
        .select()
        .from(accounts)
        .where(eq(accounts.stripe_customer_id, customerId))
        .run();

      if (!account || account.length === 0) {
        return c.json({ ok: true });
      }

      const accountId = account[0].account_id;

      // Downgrade para free
      await db
        .update(accounts)
        .set({ plan: 'free', updated_at: new Date() })
        .where(eq(accounts.account_id, accountId))
        .run();

      logger.info('Account downgraded to free', { account_id: accountId });

      return c.json({ ok: true });
    } catch (error) {
      logger.error('Failed to process subscription.deleted', { error });
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  // Handler: invoice.payment_failed → send email, disable after 24h
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer as string;

    try {
      const account = await db
        .select()
        .from(accounts)
        .where(eq(accounts.stripe_customer_id, customerId))
        .run();

      if (!account || account.length === 0) {
        return c.json({ ok: true });
      }

      const accountId = account[0].account_id;

      // Enviar email de aviso
      await sendEmail({
        to: account[0].email,
        subject: 'Payment Failed — BruceAI',
        template: 'payment-failed',
        data: {
          account_name: account[0].name,
          invoice_url: invoice.hosted_invoice_url,
        },
      });

      // Agendar desabilitar em 24h
      await scheduleTask({
        type: 'disable-account',
        account_id: accountId,
        delay_ms: 86400000, // 24h
      });

      logger.warn('Payment failed, warned account', { account_id: accountId });

      return c.json({ ok: true });
    } catch (error) {
      logger.error('Failed to process payment_failed', { error });
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  return c.json({ ok: true });
});

export default stripeWebhook;
```

---

## 3. Usage Metering

Cada ação cobrável emite um evento de billing que flui até bruce-core.

### 3.1 Emitir Evento de Billing

Arquivo: `packages/events/src/billing-events.ts`

```typescript
/**
 * Eventos cobráveis — emitidos após ação completar
 */

export async function meterOpportunityScan(
  accountId: string,
  opportunityId: string,
) {
  const account = await getAccount(accountId);

  if (!account || !account.stripe_customer_id) return; // Skip se não tem customer

  // Registrar 1 scan
  await stripe.billing.meterEvents.create({
    event_name: BILLING_EVENTS.opportunity_scan,
    customer: account.stripe_customer_id,
    value: 1,
    timestamp: Math.floor(Date.now() / 1000),
  });

  logger.info('Metered: opportunity scan', {
    account_id: accountId,
    opportunity_id: opportunityId,
  });
}

export async function meterGTMCampaign(
  accountId: string,
  campaignId: string,
) {
  const account = await getAccount(accountId);
  if (!account || !account.stripe_customer_id) return;

  await stripe.billing.meterEvents.create({
    event_name: BILLING_EVENTS.gtm_campaign,
    customer: account.stripe_customer_id,
    value: 1,
    timestamp: Math.floor(Date.now() / 1000),
  });

  logger.info('Metered: GTM campaign', {
    account_id: accountId,
    campaign_id: campaignId,
  });
}

export async function meterHealthCheck(
  accountId: string,
  ventureId: string,
) {
  const account = await getAccount(accountId);
  if (!account || !account.stripe_customer_id) return;

  await stripe.billing.meterEvents.create({
    event_name: BILLING_EVENTS.health_check,
    customer: account.stripe_customer_id,
    value: 1,
    timestamp: Math.floor(Date.now() / 1000),
  });

  logger.info('Metered: health check', {
    account_id: accountId,
    venture_id: ventureId,
  });
}
```

### 3.2 Chamar na Conclusão de Tarefas

```typescript
// Em opportunity module, após scan completar
await executeAgent('opportunity-scanner', async (input) => {
  const result = await scanOpportunity(input);

  // Registrar uso
  if (result.qualified) {
    await meterOpportunityScan(accountId, opportunityId);
  }

  return result;
}, { /* options */ });
```

### 3.3 Definir Eventos por Módulo

Arquivo: `modules/opportunity/saas/billing-events.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Billing Events — Opportunity Module",
  "type": "object",
  "properties": {
    "opportunity_scan": {
      "description": "One opportunity scan executed",
      "unit": "scan",
      "price_per_unit_cents": 50
    }
  }
}
```

Arquivo: `modules/gtm/saas/billing-events.schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Billing Events — GTM Module",
  "type": "object",
  "properties": {
    "gtm_campaign": {
      "description": "One GTM campaign created and launched",
      "unit": "campaign",
      "price_per_unit_cents": 1000
    }
  }
}
```

---

## 4. Plano Limits vs Usage

Fase 5 implementa plan limits (máximo de recursos). Billing aqui rastreia uso real.

**Diferença:**
- **Limits** (Fase 5): Pro plan → máx 10 ventures
- **Usage** (Fase 8): Este mês você usou 7 ventures, vai pagar por eles

```typescript
// Usar em endpoints que devem cobrar antes de executar
app.post('/opportunities/scan', clerkAuth, async (c) => {
  const auth = c.get('auth');
  const account = await getAccount(auth.accountId);

  // Verificar limite (Fase 5)
  const currentScans = await countScansThisMonth(auth.accountId);
  if (currentScans >= PLAN_LIMITS[account.plan].max_opportunities_per_month) {
    return c.json(
      { error: 'Monthly limit exceeded. Upgrade to Pro.' },
      402,
    );
  }

  // Executar scan
  const result = await scanOpportunity(req.body);

  // Registrar uso (Fase 8)
  await meterOpportunityScan(auth.accountId, result.opportunity_id);

  return c.json(result);
});
```

---

## 5. Billing Portal — Self-Service

### 5.1 Criar Sessão do Portal

Arquivo: `apps/bruce-core/src/api/billing/portal.handler.ts`

```typescript
app.post('/billing/portal', clerkAuth, async (c) => {
  const auth = c.get('auth');
  const account = await getAccount(auth.accountId);

  if (!account || !account.stripe_customer_id) {
    return c.json({ error: 'No billing account found' }, 404);
  }

  try {
    // Criar sessão do Stripe Billing Portal
    const session = await stripe.billingPortal.sessions.create({
      customer: account.stripe_customer_id,
      return_url: process.env.APP_URL + '/billing',
    });

    return c.json({ url: session.url });
  } catch (error) {
    logger.error('Failed to create billing portal session', { error });
    return c.json({ error: 'Failed to create portal session' }, 500);
  }
});
```

### 5.2 Frontend

```typescript
// Em React/Vue
async function openBillingPortal() {
  const response = await fetch('/billing/portal', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const { url } = await response.json();
  window.location.href = url;
}
```

**Resultado:** Usuário é levado ao Stripe Portal onde pode:
- Gerenciar pagamentos
- Atualizar plano
- Ver invoices
- Cancelar subscription

---

## 6. Revenue Dashboard (Opcional)

Para monitorar MRR, churn, etc.

### 6.1 Exposição de Métricas Stripe

```typescript
app.get('/admin/revenue/metrics', clerkAuth, adminOnly, async (c) => {
  // Verificar se é admin
  const auth = c.get('auth');
  if (!isAdmin(auth.userId)) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  // Buscar métricas do Stripe
  const subscriptions = await stripe.subscriptions.list({
    limit: 100,
    status: 'active',
  });

  const invoices = await stripe.invoices.list({
    limit: 100,
    status: 'paid',
  });

  // Calcular MRR
  let mrr = 0;
  for (const sub of subscriptions.data) {
    const item = sub.items.data[0];
    if (item && item.price.recurring) {
      mrr += (item.price.unit_amount || 0) / 100;
    }
  }

  // Calcular churn (subs deletadas este mês)
  const thisMonth = new Date();
  thisMonth.setDate(1);

  const cancelledSubs = await stripe.subscriptions.list({
    limit: 100,
    status: 'canceled',
    created: { gte: Math.floor(thisMonth.getTime() / 1000) },
  });

  return c.json({
    mrr,
    active_subscriptions: subscriptions.data.length,
    monthly_churn_rate: (cancelledSubs.data.length / subscriptions.data.length) * 100,
    recent_invoices: invoices.data.length,
  });
});
```

---

## 7. Testes

### 7.1 Teste de Webhook

```typescript
it('should upgrade account when invoice is paid', async () => {
  // Simular webhook Stripe
  const event = {
    type: 'invoice.paid',
    data: {
      object: {
        id: 'inv_123',
        customer: 'cus_xyz',
        subscription: 'sub_123',
      },
    },
  };

  // Mock stripe.subscriptions.retrieve
  vi.spyOn(stripe.subscriptions, 'retrieve').mockResolvedValue({
    metadata: { plan: 'pro' },
  } as any);

  const response = await stripeWebhook.handler(mockRequest(event));

  expect(response.status).toBe(200);

  // Verificar que account foi atualizada
  const account = await getAccount(accountId);
  expect(account.plan).toBe('pro');
});
```

### 7.2 Teste de Metering

```typescript
it('should meter opportunity scan', async () => {
  const spy = vi.spyOn(stripe.billing.meterEvents, 'create');

  await meterOpportunityScan('org_test', 'opp_123');

  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({
      event_name: 'opportunity_scans',
      value: 1,
    }),
  );
});
```

### 7.3 Teste de Portal

```typescript
it('should create billing portal session', async () => {
  const response = await fetch('/billing/portal', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const { url } = await response.json();
  expect(url).toMatch(/^https:\/\/billing\.stripe\.com/);
});
```

---

## 8. Checklist de Implementação

**Stripe Setup:**
- [ ] Conta Stripe criada
- [ ] Secret/publishable keys no .env
- [ ] Produtos (free/pro/enterprise) criados
- [ ] Preços mensais configurados
- [ ] Billing meters definidos
- [ ] Webhooks registrados

**Código:**
- [ ] Stripe client wrapper criado
- [ ] Webhook handler para invoice.paid
- [ ] Webhook handler para subscription.deleted
- [ ] Webhook handler para payment_failed
- [ ] meterOpportunityScan() implementada
- [ ] meterGTMCampaign() implementada
- [ ] meterHealthCheck() implementada
- [ ] POST /billing/portal implementado
- [ ] Admin dashboard de revenue (opcional)

**Testing:**
- [ ] Teste de webhook invoice.paid
- [ ] Teste de webhook subscription.deleted
- [ ] Teste de metering
- [ ] Teste de billing portal

**Produção:**
- [ ] STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET no production .env
- [ ] Webhooks apontam para production domain
- [ ] Email de payment_failed configurado
- [ ] Redirect URLs corretos no Stripe Dashboard

---

## 9. Alternativa: Sem Billing (MVP)

Se não quer monetizar agora:

1. **Fase 5:** Use plan limits hardcoded
2. **Pule Fase 8:** Ignora Stripe
3. **Fase 9:** Testes sem mock de Stripe
4. **Post-launch:** Implemente billing se tiver tração

---

## Pronto para Produção?

✅ **Sim**, quando:
- Criar org no Clerk → webhook → Stripe customer criado
- Ao subscribir no Stripe → webhook → account.plan atualizado
- Ao escanear oportunidade → Stripe meter registra evento
- Usuário acessa /billing/portal → é redirecionado ao Stripe self-service
- Revenue dashboard mostra MRR e churn corretos
- Eventos de DLQ de metering causam alertas
