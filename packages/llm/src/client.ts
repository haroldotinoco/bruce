import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { recordLlmUsage } from '@bruce/observability';
import { getDefaultFallbackAgentModel } from './model-registry.js';
import { parseJsonFromLlmText } from './parse-llm-json.js';
import { getLLMProvider } from './providers/index.js';
import { withRetry } from './retry.js';
import type { ChatRequest, ChatResponse, ResponseFormat } from './types.js';

/** Passed from AgentRunner for observability / cost attribution. */
export type LlmUsageContext = {
  accountId: string;
  correlationId: string;
  module: string;
  agentId: string;
  provider: string;
  model: string;
  observability?: {
    runId: string;
    stepKey: string;
    parentStepKey?: string;
  };
};

export interface LLMCallOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  retries?: number;
  /**
   * Defaults merged with the parsed LLM JSON before Zod validation (parsed values win).
   * Nested objects are merged recursively so the model can omit empty shells.
   */
  mergeOutput?: Record<string, unknown>;
  /** When set, each successful completion is persisted to `llm_usage_events`. */
  usageContext?: LlmUsageContext;
  /**
   * Name for `zodResponseFormat` / `json_schema.name` (e.g. agent id). Sanitized to allowed chars.
   * Defaults to `bruce_output` when unset.
   */
  responseSchemaName?: string;
}

/** Defaults first; `parsed` overwrites. Nested plain objects merge recursively. */
export function mergeLlmJsonWithDefaults(
  defaults: Record<string, unknown>,
  parsed: unknown
): unknown {
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return defaults;
  }
  const p = parsed as Record<string, unknown>;
  const out: Record<string, unknown> = { ...defaults };
  for (const [k, v] of Object.entries(p)) {
    if (v === undefined) continue;
    const d = defaults[k];
    if (
      typeof d === 'object' &&
      d !== null &&
      !Array.isArray(d) &&
      typeof v === 'object' &&
      v !== null &&
      !Array.isArray(v)
    ) {
      out[k] = mergeLlmJsonWithDefaults(d as Record<string, unknown>, v) as Record<string, unknown>;
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** OpenAI (and some OpenRouter backends) require the word "json" in messages when using json_object mode. */
function ensureJsonKeywordInPrompts(systemPrompt: string, userMessage: string): string {
  if (/json/i.test(systemPrompt) || /json/i.test(userMessage)) {
    return systemPrompt;
  }
  return `${systemPrompt}\n\nRespond with a single JSON object only (no markdown or prose).`;
}

/** Safe name for `json_schema.name` (OpenAI / OpenRouter structured outputs). */
function toJsonSchemaName(raw: string): string {
  const t = raw.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'bruce_output';
  return t.length > 64 ? t.slice(0, 64) : t;
}

function structuredOutputsEnabledFromEnv(): boolean {
  return process.env.BRUCE_LLM_STRUCTURED_OUTPUTS !== '0';
}

export class LLMClient {
  private provider: string;
  private model: string;

  /**
   * - `new LLMClient()` — uses `LLM_PROVIDER_MODE` (or `openrouter`) for provider; for ad-hoc scripts.
   * - `new LLMClient(provider, model)` — uses the given provider; when `provider` is `undefined`,
   *   defaults to `openrouter` (not env), so agent runs honor `capabilities.json` even if the shell
   *   sets `LLM_PROVIDER_MODE=openai` without `OPENAI_API_KEY`.
   */
  constructor(provider?: string, model?: string) {
    if (arguments.length === 0) {
      this.provider = process.env.LLM_PROVIDER_MODE || 'openrouter';
      this.model = getDefaultFallbackAgentModel();
    } else {
      this.provider = provider ?? 'openrouter';
      this.model = model ?? getDefaultFallbackAgentModel();
    }
  }

  async callAgent<T>(
    systemPrompt: string,
    userMessage: string,
    outputSchema: z.ZodSchema<T>,
    options: LLMCallOptions = {}
  ): Promise<T> {
    const client = getLLMProvider(this.provider);
    const useJsonObjectMode = this.provider === 'openrouter' || this.provider === 'openai';
    const systemForRequest = useJsonObjectMode
      ? ensureJsonKeywordInPrompts(systemPrompt, userMessage)
      : systemPrompt;
    const baseMessages: ChatRequest['messages'] = [
      { role: 'system', content: systemForRequest },
      { role: 'user', content: userMessage },
    ];
    const schemaName = toJsonSchemaName(options.responseSchemaName ?? 'bruce_output');
    const useStructured = useJsonObjectMode && structuredOutputsEnabledFromEnv();

    return withRetry(
      async () => {
        const finish = (raw: unknown): T => {
          const merged = options.mergeOutput
            ? mergeLlmJsonWithDefaults(options.mergeOutput, raw)
            : raw;
          return outputSchema.parse(merged) as T;
        };
        const record = (response: ChatResponse): void => {
          if (options.usageContext) {
            void recordLlmUsage({
              accountId: options.usageContext.accountId,
              correlationId: options.usageContext.correlationId,
              module: options.usageContext.module,
              agentId: options.usageContext.agentId,
              provider: options.usageContext.provider,
              modelId: options.usageContext.model,
              usage: response.usage ?? null,
              observability: options.usageContext.observability,
            });
          }
        };

        if (useStructured) {
          if (this.provider === 'openai' && client.parseWithZod) {
            try {
              const response = await client.parseWithZod({
                model: this.model,
                messages: baseMessages,
                temperature: options.temperature ?? 0.7,
                maxTokens: options.maxTokens ?? 2048,
                topP: options.topP ?? 1,
                zod: outputSchema,
                schemaName,
              });
              record(response);
              const fromParsed = response.choices[0]?.message?.parsed;
              if (fromParsed != null) {
                return finish(fromParsed);
              }
              const content = response.choices[0]?.message?.content;
              if (content) {
                return finish(parseJsonFromLlmText(content) as unknown);
              }
              throw new Error('Empty response from LLM (structured path)');
            } catch {
              /* fallback to json_object */
            }
          } else if (this.provider === 'openrouter') {
            let structFormat: ResponseFormat | null = null;
            try {
              structFormat = zodResponseFormat(outputSchema, schemaName) as unknown as ResponseFormat;
            } catch {
              structFormat = null;
            }
            if (structFormat) {
              try {
                const response = await client.chat({
                  model: this.model,
                  messages: baseMessages,
                  temperature: options.temperature ?? 0.7,
                  maxTokens: options.maxTokens ?? 2048,
                  topP: options.topP ?? 1,
                  responseFormat: structFormat,
                });
                record(response);
                const fromParsed = response.choices[0]?.message?.parsed;
                if (fromParsed != null) {
                  return finish(fromParsed);
                }
                const content = response.choices[0]?.message?.content;
                if (content) {
                  return finish(parseJsonFromLlmText(content) as unknown);
                }
                throw new Error('Empty response from LLM (structured path)');
              } catch {
                /* fallback to json_object */
              }
            }
          }
        }

        const response = await client.chat({
          model: this.model,
          messages: baseMessages,
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? 2048,
          topP: options.topP ?? 1,
          responseFormat: useJsonObjectMode ? { type: 'json_object' } : undefined,
        });

        record(response);

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('Empty response from LLM');
        return finish(parseJsonFromLlmText(content) as unknown);
      },
      options.retries ?? 3
    );
  }

  async callAgentWithTools<T>(
    systemPrompt: string,
    userMessage: string,
    tools: Array<{ name: string; description: string; parameters: object }>,
    outputSchema: z.ZodSchema<T>,
    options: LLMCallOptions = {}
  ): Promise<T> {
    const client = getLLMProvider(this.provider);

    return withRetry(
      async () => {
        const response = await client.chat({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          tools: tools.map((t) => ({
            type: 'function',
            function: {
              name: t.name,
              description: t.description,
              parameters: t.parameters,
            },
          })),
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens ?? 2048,
        });

        if (options.usageContext) {
          void recordLlmUsage({
            accountId: options.usageContext.accountId,
            correlationId: options.usageContext.correlationId,
            module: options.usageContext.module,
            agentId: options.usageContext.agentId,
            provider: options.usageContext.provider,
            modelId: options.usageContext.model,
            usage: response.usage ?? null,
            observability: options.usageContext.observability,
          });
        }

        const toolCall = response.choices[0]?.message?.tool_calls?.[0];
        if (!toolCall?.function?.arguments) throw new Error('No tool call returned');

        const output = parseJsonFromLlmText(toolCall.function.arguments) as unknown;
        const merged = options.mergeOutput
          ? mergeLlmJsonWithDefaults(options.mergeOutput, output)
          : output;
        return outputSchema.parse(merged) as T;
      },
      options.retries ?? 3
    );
  }
}

export function createLLMClient(provider?: string, model?: string): LLMClient {
  return new LLMClient(provider, model);
}
