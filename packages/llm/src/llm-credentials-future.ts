/**
 * BYOK / per-venture LLM credentials — **not implemented** (registry + product wiring pending).
 *
 * Intended evolution:
 * 1. Resolve keys from DB or vault keyed by `ventureId` (and optionally `accountId`), using
 *    `bruce-model-registry.json` → `credential_pools.venture` as the source-of-truth marker.
 * 2. Thread an optional `apiKeyOverride` (or provider-specific secret handle) from
 *    `ExecutionContext` into `createLLMClient` / provider constructors so OpenRouter and others
 *    can use tenant keys before falling back to communal env vars (`credential_pools.platform`).
 * 3. Fallback order: venture → org/account → platform (`resolvePlatformOpenRouterApiKeyEnv()`).
 */
export type LlmCredentialRequest = {
  provider: 'openrouter' | 'anthropic' | 'openai' | string;
  accountId?: string;
  ventureId?: string;
};

/** Placeholder for `getLlmCredentials(req): Promise<string | undefined>` — implement with vault/DB. */
export type GetLlmCredentials = (
  req: LlmCredentialRequest
) => Promise<string | undefined>;
