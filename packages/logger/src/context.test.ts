import { describe, expect, it } from 'vitest';
import { logContext, mergeWithLogContext, patchLogContext } from './context.js';

describe('logContext', () => {
  it('propagates correlation_id and module into merged bindings', async () => {
    await logContext.run({ correlationId: 'corr-1', module: 'bruce-core' }, async () => {
      expect(mergeWithLogContext({ extra: true })).toMatchObject({
        correlation_id: 'corr-1',
        module: 'bruce-core',
        extra: true,
      });
    });
  });

  it('allows enriching context after creation', async () => {
    await logContext.run({ correlationId: 'c2', module: 'test' }, async () => {
      patchLogContext({ accountId: 'org_1', ventureId: 'v1' });
      expect(mergeWithLogContext({})).toMatchObject({
        correlation_id: 'c2',
        account_id: 'org_1',
        venture_id: 'v1',
      });
    });
  });
});
