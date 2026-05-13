export type { GetLlmCredentials, LlmCredentialRequest } from './llm-credentials-future.js';
export {
  findBruceModelRegistryPath,
  getDefaultFallbackAgentModel,
  resetModelRegistryCacheForTests,
  resolveOpenRouterModelId,
  resolvePlatformOpenRouterApiKeyEnv,
  type BruceModelRegistryFile,
} from './model-registry.js';
export {
  createLLMClient,
  LLMClient,
  mergeLlmJsonWithDefaults,
  type LlmUsageContext,
} from './client.js';
export { parseJsonFromLlmText } from './parse-llm-json.js';
export type { LLMCallOptions } from './client.js';
export { LLMValidationError, validateStructuredOutput } from './structured-output.js';
export { withRetry } from './retry.js';
export * from './types.js';
export * from './providers/index.js';
