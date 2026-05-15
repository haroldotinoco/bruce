import type { ZodSchema } from 'zod';
import type { LLMClient } from '@bruce/llm';

export interface AgentCapabilities {
  model: string;
  provider: string;
  temperature?: number;
  maxTokens?: number;
  stateless: boolean;
  retryPolicy?: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelayMs: number;
  };
}

export interface AgentSpec {
  id: string;
  module: string;
  name: string;
  description: string;
  skillPrompt: string;
  constraints: string | null;
  capabilities: AgentCapabilities;
  inputSchema: ZodSchema;
  outputSchema: ZodSchema;
  tools: ToolDefinition[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface ExecutionContext {
  accountId: string;
  ventureId?: string;
  executionId: string;
  module: string;
  correlationId: string;
  /** Observability `workflow_runs.id` for LLM usage attribution. */
  observabilityRunId?: string;
  /** `workflow_steps.key` for the step that triggered this agent call. */
  observabilityStepKey?: string;
  /** Parent step key when the step is nested (e.g. slot under market_scanner). */
  observabilityParentStepKey?: string;
  /**
   * Opt-in deliverable sink: when set, the runner writes the validated agent
   * output to `.projects/<nickname>/<module>/<agentId>/output.json` after a
   * successful run. Leave undefined to disable (no behavior change).
   */
  projectNickname?: string;
}

export interface AgentExecutionResult<T> {
  success: boolean;
  output?: T;
  error?: string;
  attempts: number;
  executionTimeMs: number;
}

export type AgentRunnerDeps = {
  agentLoader?: AgentLoaderLike;
  createLlm?: (capabilities: AgentCapabilities) => LLMClient;
};

export type AgentLoaderLike = {
  loadAgent(module: string, agentId: string): Promise<AgentSpec>;
  clearCache(): void;
};
