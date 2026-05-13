/**
 * Temporal visibility (custom search attributes) is cluster-specific.
 *
 * Workflow executions started from `venture.service` include `memo` (account_id, venture_id, module_name)
 * so they appear in Temporal UI without extra cluster config.
 *
 * For **advanced search** in Temporal UI (filter by account_id / venture_id), register Keyword attributes once per namespace:
 *
 * ```bash
 * temporal operator search-attribute create \
 *   --namespace default \
 *   --name AccountId \
 *   --type Keyword
 *
 * temporal operator search-attribute create \
 *   --namespace default \
 *   --name VentureId \
 *   --type Keyword
 *
 * temporal operator search-attribute create \
 *   --namespace default \
 *   --name CorrelationId \
 *   --type Keyword
 *
 * temporal operator search-attribute create \
 *   --namespace default \
 *   --name ModuleName \
 *   --type Keyword
 * ```
 *
 * Then `upsertSearchAttributes` in workflows can use `AccountId`, `VentureId`, etc. (see Temporal TS SDK docs).
 */
export const TEMPORAL_SEARCH_ATTRIBUTES_DOC = true;
