import { AgentRunner } from './agent-runner.js';
import type { AgentExecutionResult, ExecutionContext } from './types.js';

export interface RunAgentStepParams {
  module: string;
  agentId: string;
  input: unknown;
  context: ExecutionContext;
  runner?: AgentRunner;
}

export async function runAgentStep<T = unknown>({
  module,
  agentId,
  input,
  context,
  runner = new AgentRunner(),
}: RunAgentStepParams): Promise<AgentExecutionResult<T>> {
  const result = await runner.run<T>(module, agentId, input, {
    ...context,
    module,
  });

  if (!result.success) {
    return {
      ...result,
      error: [
        `Agent step failed`,
        `module=${module}`,
        `agentId=${agentId}`,
        `correlationId=${context.correlationId}`,
        result.error,
      ]
        .filter(Boolean)
        .join(' | '),
    };
  }

  return result;
}
