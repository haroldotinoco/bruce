import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './apps/bruce-core/vitest.config.ts',
  './packages/logger/vitest.config.ts',
  './packages/events/vitest.config.ts',
  './packages/handoff/vitest.config.ts',
  './packages/agent-runtime/vitest.config.ts',
  './packages/stripe-client/vitest.config.ts',
  './packages/llm/vitest.config.ts',
  './packages/auth/vitest.config.ts',
  './packages/contracts/vitest.config.ts',
  './packages/db/vitest.config.ts',
  './packages/evals/vitest.config.ts',
  './apps/opportunity/vitest.config.ts',
]);
