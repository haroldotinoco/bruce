import { beforeEach, describe, expect, it, vi } from 'vitest';

const meterCreate = vi.fn().mockResolvedValue({});

vi.mock('./client.js', () => ({
  getStripe: () => ({
    billing: {
      meterEvents: {
        create: meterCreate,
      },
    },
  }),
}));

vi.mock('@bruce/db', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () =>
            Promise.resolve([
              {
                stripe_customer_id: 'cus_test123',
              },
            ]),
        }),
      }),
    }),
  },
  schema: {
    organizations: {},
  },
}));

describe('metering', () => {
  beforeEach(() => {
    meterCreate.mockClear();
  });

  it('records opportunity_scans meter event', async () => {
    const { meterOpportunityScan } = await import('./metering.js');
    await meterOpportunityScan('org_1', 'opp_1');

    expect(meterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'opportunity_scans',
        payload: expect.objectContaining({
          stripe_customer_id: 'cus_test123',
          value: '1',
        }),
      }),
    );
  });
});
