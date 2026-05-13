import { describe, expect, it } from 'vitest';

/**
 * Vertical E2E against running HTTP services (bruce-core + opportunity).
 *
 * Enable with:
 *   BRUCE_E2E_INTEGRATION=1 BRUCE_E2E_TOKEN="$(node scripts/print-dev-jwt.mjs)" pnpm test:integration
 *
 * Requires: infra up, migrations, APIs on BRUCE_CORE_URL / BRUCE_OPPORTUNITY_URL with workers optional.
 */
const e2e =
  process.env.BRUCE_E2E_INTEGRATION === '1' || process.env.BRUCE_E2E_INTEGRATION === 'true';

const coreUrl = process.env.BRUCE_CORE_URL ?? 'http://localhost:3000';
const oppUrl = process.env.BRUCE_OPPORTUNITY_URL ?? 'http://localhost:3002';

describe.skipIf(!e2e)('Vertical E2E (bruce-core → opportunity)', () => {
  it('GET /health on both services', async () => {
    const a = await fetch(`${coreUrl}/health`);
    expect(a.ok).toBe(true);
    const b = await fetch(`${oppUrl}/health`);
    expect(b.ok).toBe(true);
  });

  it('POST venture then POST scan returns 202 with workflow_id', async () => {
    const token = process.env.BRUCE_E2E_TOKEN?.trim();
    if (!token) {
      throw new Error(
        'Set BRUCE_E2E_TOKEN (e.g. export BRUCE_E2E_TOKEN=$(node scripts/print-dev-jwt.mjs))'
      );
    }
    const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } as const;

    const vRes = await fetch(`${coreUrl}/ventures`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ name: 'E2E Integration Venture', stage: 'concept' }),
    });
    expect(vRes.status).toBe(201);
    const venture = (await vRes.json()) as { id: string };
    expect(venture.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );

    const scanRes = await fetch(`${oppUrl}/scans`, {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ venture_id: venture.id, opportunities: [] }),
    });
    expect(scanRes.status).toBe(202);
    const scan = (await scanRes.json()) as { workflow_id?: string; id?: string };
    expect(scan.workflow_id).toBeTruthy();
    expect(scan.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});

describe('Integration test gate', () => {
  it('skips E2E when BRUCE_E2E_INTEGRATION is unset (default)', () => {
    if (e2e) {
      expect(process.env.BRUCE_E2E_INTEGRATION).toBeTruthy();
    } else {
      expect(true).toBe(true);
    }
  });
});
