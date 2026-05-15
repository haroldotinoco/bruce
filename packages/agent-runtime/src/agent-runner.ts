import type { z } from 'zod';
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

/** LLM often omits IDs and empty context shells; merge before Zod so validation passes. */
function briefingInterpreterMergeOutput(
  input: unknown,
  context: ExecutionContext
): Record<string, unknown> {
  const inp = input as { opportunity?: { opportunity_id?: string } };
  return {
    venture_id: context.ventureId ?? '',
    opportunity_id: inp.opportunity?.opportunity_id ?? '',
    briefing_timestamp: new Date().toISOString(),
    problem_context: {},
    market_context: {},
    customer_context: {},
    competitive_context: {},
  };
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

    let validatedInput: unknown;
    try {
      validatedInput = spec.inputSchema.parse(input);
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
          const delayMs =
            Math.pow(retryPolicy.backoffMultiplier, attempt - 1) *
            retryPolicy.initialDelayMs;
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
    const mergeOutput =
      spec.id === 'briefing-interpreter' ? briefingInterpreterMergeOutput(input, context) : undefined;
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

    if (spec.tools.length > 0) {
      return await llm.callAgentWithTools(
        systemPrompt,
        userMessage,
        spec.tools,
        spec.outputSchema as z.ZodSchema<T>,
        opts
      );
    }

    return await llm.callAgent(
      systemPrompt,
      userMessage,
      spec.outputSchema as z.ZodSchema<T>,
      opts
    );
  }
}

let runnerInstance: AgentRunner | undefined;

export function getAgentRunner(): AgentRunner {
  if (!runnerInstance) {
    runnerInstance = new AgentRunner();
  }
  return runnerInstance;
}
