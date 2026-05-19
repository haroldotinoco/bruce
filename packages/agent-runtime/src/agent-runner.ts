import { z } from 'zod';
import {
  createLLMClient,
  getDefaultFallbackAgentModel,
  type LLMClient,
  type LlmUsageContext,
} from '@bruce/llm';
import { logger } from '@bruce/logger';
import { writeDeliverable } from '@bruce/project-store';
import { agentLoader } from './agent-loader.js';
import type {
  AgentCapabilities,
  AgentExecutionResult,
  AgentRunnerDeps,
  AgentSpec,
  ExecutionContext,
} from './types.js';
import type { AgentLoaderLike } from './types.js';

const INNER_LLM_RETRIES = 1;

/** OpenRouter upstream 429s need longer backoff than generic transient errors. */
function isRateLimitedError(error: Error): boolean {
  const msg = error.message.toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('rate-limited') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  );
}

function retryDelayMs(error: Error, attempt: number, policy: AgentCapabilities['retryPolicy']): number {
  const base =
    Math.pow(policy?.backoffMultiplier ?? 2, attempt - 1) * (policy?.initialDelayMs ?? 1000);
  if (isRateLimitedError(error)) {
    return Math.max(base, 5_000 * attempt);
  }
  return base;
}

export class AgentRunner {
  private readonly loader: AgentLoaderLike;
  private readonly createLlm: (capabilities: AgentCapabilities) => LLMClient;

  constructor(deps?: AgentRunnerDeps) {
    this.loader = deps?.agentLoader ?? agentLoader;
    this.createLlm =
      deps?.createLlm ??
      ((cap) =>
        createLLMClient(cap.provider ?? 'openrouter', cap.model ?? getDefaultFallbackAgentModel()));
  }

  async run<T = unknown>(
    module: string,
    agentId: string,
    input: unknown,
    context: ExecutionContext
  ): Promise<AgentExecutionResult<T>> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    const spec = await this.loader.loadAgent(module, agentId);
    const retryPolicy = spec.capabilities.retryPolicy ?? {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelayMs: 1000,
    };

    const normalizedInput = spec.runtimeHooks?.normalizeInput?.(input, context) ?? input;
    let validatedInput: unknown;
    try {
      validatedInput = spec.inputSchema.parse(normalizedInput);
    } catch (error) {
      logger.error(
        { error, module, agentId, correlationId: context.correlationId },
        'Input validation failed'
      );
      return {
        success: false,
        error: `Input validation failed: ${(error as Error).message}`,
        attempts: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }

    for (let attempt = 1; attempt <= retryPolicy.maxAttempts; attempt++) {
      try {
        logger.debug(
          {
            module,
            agentId,
            attempt,
            maxAttempts: retryPolicy.maxAttempts,
            correlationId: context.correlationId,
          },
          'Executing agent'
        );

        const output = await this.executeWithTools<T>(spec, validatedInput, context);

        if (context.projectNickname) {
          try {
            const target = await writeDeliverable(
              context.projectNickname,
              module,
              agentId,
              'output.json',
              output,
            );
            logger.debug(
              { module, agentId, target, correlationId: context.correlationId },
              'Agent output persisted to project store',
            );
          } catch (writeError) {
            logger.warn(
              {
                error: (writeError as Error).message,
                module,
                agentId,
                projectNickname: context.projectNickname,
                correlationId: context.correlationId,
              },
              'Failed to write agent output to project store (continuing)',
            );
          }
        }

        logger.debug(
          { module, agentId, executionTimeMs: Date.now() - startTime, correlationId: context.correlationId },
          'Agent execution successful'
        );

        return {
          success: true,
          output,
          attempts: attempt,
          executionTimeMs: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as Error;
        logger.warn(
          { error: lastError.message, module, agentId, attempt, correlationId: context.correlationId },
          'Agent execution failed, retrying...'
        );

        if (attempt < retryPolicy.maxAttempts) {
          const delayMs = retryDelayMs(lastError, attempt, retryPolicy);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    return {
      success: false,
      error: `Agent execution failed after ${retryPolicy.maxAttempts} attempts: ${lastError?.message}`,
      attempts: retryPolicy.maxAttempts,
      executionTimeMs: Date.now() - startTime,
    };
  }

  private async executeWithTools<T>(
    spec: AgentSpec,
    input: unknown,
    context: ExecutionContext
  ): Promise<T> {
    const inputJson = JSON.stringify(input, null, 2);
    // OpenAI/Azure (via OpenRouter) require the word "json" in messages when using response_format json_object.
    const userMessage = `Process the following JSON input:\n\n${inputJson}`;

    const llm = this.createLlm(spec.capabilities);
    const systemPrompt = spec.constraints
      ? `${spec.skillPrompt}\n\n## Runtime Constraints\n\n${spec.constraints}`
      : spec.skillPrompt;
    const mergeOutput = spec.runtimeHooks?.fallbackOutput?.(input, context);
    const usageContext: LlmUsageContext | undefined =
      context.observabilityRunId && context.observabilityStepKey
        ? {
            accountId: context.accountId,
            correlationId: context.correlationId,
            module: context.module,
            agentId: spec.id,
            provider: spec.capabilities.provider ?? 'openrouter',
            model: spec.capabilities.model,
            observability: {
              runId: context.observabilityRunId,
              stepKey: context.observabilityStepKey,
              parentStepKey: context.observabilityParentStepKey,
            },
          }
        : undefined;

    const opts = {
      temperature: spec.capabilities.temperature,
      maxTokens: spec.capabilities.maxTokens,
      retries: INNER_LLM_RETRIES,
      mergeOutput,
      usageContext,
      responseSchemaName: spec.id,
    };

    const outputSchema = mergeOutput ? z.unknown() : spec.outputSchema;

    if (spec.tools.length > 0) {
      const raw = await llm.callAgentWithTools(
        systemPrompt,
        userMessage,
        spec.tools,
        outputSchema as z.ZodSchema<unknown>,
        opts
      );
      const normalized = spec.runtimeHooks?.normalizeOutput?.(raw, input, context) ?? raw;
      return spec.outputSchema.parse(normalized) as T;
    }

    const raw = await llm.callAgent(
      systemPrompt,
      userMessage,
      outputSchema as z.ZodSchema<unknown>,
      opts
    );
    const normalized = spec.runtimeHooks?.normalizeOutput?.(raw, input, context) ?? raw;
    return spec.outputSchema.parse(normalized) as T;
  }
}
