import { describe, expect, it } from 'vitest';
import { organizations } from './schema/organizations.js';

describe('organizations schema', () => {
  it('exposes expected tenant columns for billing and plans', () => {
    expect(organizations.id).toBeDefined();
    expect(organizations.plan).toBeDefined();
    expect(organizations.stripe_customer_id).toBeDefined();
    expect(organizations.slug).toBeDefined();
  });
});
