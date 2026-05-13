export class AgentRuntimeError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AgentRuntimeError';
  }
}

export class AgentNotFoundError extends AgentRuntimeError {
  constructor(module: string, agentId: string) {
    super(`Agent ${agentId} not found in module ${module}`, 'AGENT_NOT_FOUND', { module, agentId });
  }
}

export class AgentExecutionError extends AgentRuntimeError {
  constructor(message: string, attempts: number, details?: unknown) {
    super(message, 'AGENT_EXECUTION_FAILED', { attempts, ...((details as object) ?? {}) });
  }
}

export class ToolExecutionError extends AgentRuntimeError {
  constructor(toolName: string, message: string, details?: unknown) {
    super(`Tool ${toolName} execution failed: ${message}`, 'TOOL_EXECUTION_FAILED', { toolName, ...((details as object) ?? {}) });
  }
}
