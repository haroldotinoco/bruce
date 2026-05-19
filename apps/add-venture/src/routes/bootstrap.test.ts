import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../services/bootstrap-from-prompt.service.js', () => ({
  bootstrapAddVentureFromPrompt: vi.fn(),
}));

import app from '../app.js';
import { bootstrapAddVentureFromPrompt } from '../services/bootstrap-from-prompt.service.js';

function devJwt(): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'dev_user', org_id: 'org_local_dev' })}.x`;
}

describe('POST /bootstrap/start-from-prompt', () => {
  const prevEnabled = process.env.BOOTSTRAP_FROM_PROMPT_ENABLED;
  const prevAuth = process.env.AUTH_DEV_JWT_ONLY;

  beforeEach(() => {
    process.env.BOOTSTRAP_FROM_PROMPT_ENABLED = 'true';
    process.env.AUTH_DEV_JWT_ONLY = 'true';
    vi.mocked(bootstrapAddVentureFromPrompt).mockResolvedValue({
      venture_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      correlation_id: 'corr-1',
      workflow_id: 'wf-test-1',
      poll_url: '/jobs/wf-test-1',
      synthetic: { opportunity_scan_id: 'scan-1' },
    });
  });

  afterEach(() => {
    process.env.BOOTSTRAP_FROM_PROMPT_ENABLED = prevEnabled;
    process.env.AUTH_DEV_JWT_ONLY = prevAuth;
    vi.resetAllMocks();
  });

  it('forwards forced_brand_name to bootstrap service', async () => {
    const res = await app.request('http://localhost/bootstrap/start-from-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${devJwt()}`,
      },
      body: JSON.stringify({
        prompt: 'A B2B compliance automation platform for fintech startups with dashboards.',
        venture_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        forced_brand_name: 'b4u.bet',
      }),
    });
    expect(res.status).toBe(202);
    expect(bootstrapAddVentureFromPrompt).toHaveBeenCalledWith(
      expect.objectContaining({ forcedBrandName: 'b4u.bet' }),
    );
  });

  it('returns 202 when bootstrap succeeds', async () => {
    const res = await app.request('http://localhost/bootstrap/start-from-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${devJwt()}`,
      },
      body: JSON.stringify({
        prompt: 'A B2B compliance automation platform for fintech startups with dashboards.',
        venture_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      }),
    });
    expect(res.status).toBe(202);
    const json = (await res.json()) as { workflow_id: string };
    expect(json.workflow_id).toBe('wf-test-1');
  });
});
