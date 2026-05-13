/**
 * Helpers for Row-Level Security context (see `app.current_account_id` in migrations).
 * Prefer `withAccountContext` from `./client.js` so queries run in the same transaction.
 */
export function describeRls(): string {
  return 'RLS policies compare tenant rows to current_setting(\'app.current_account_id\', true) (Clerk org id text) — set via withAccountContext()';
}
