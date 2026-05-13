import { createHash } from 'node:crypto';
import { emitEvent } from '@bruce/events';
import { logger } from '@bruce/logger';

export interface ExecuteAgentOptions {
  agentId: string;
  module: string;
  input: object;
  correlationId: string;
  accountId: string;
  ventureId: string;
  llmModel?: string;
}

export async function executeAgent<T>(
  agentId: string,
  agentFunction: (input: object) => Promise<T>,
  options: ExecuteAgentOptions,
): Promise<T> {
  const startTime = Date.now();
  const inputHash = createHash('sha256')
    .update(JSON.stringify(options.input))
    .digest('hex')
    .slice(0, 8);

  logger.info(
    {
      agent_id: agentId,
      input_hash: inputHash,
      module: options.module,
      account_id: options.accountId,
      venture_id: options.ventureId,
      correlation_id: options.correlationId,
    },
    'Agent started',
  );

  await emitEvent(`${options.module}.${agentId}.started`, options.module, {
    input_hash: inputHash,
    timestamp: new Date().toISOString(),
    llm_model: options.llmModel,
  }, {
    ventureId: options.ventureId,
    correlationId: options.correlationId,
    severity: 'info',
    skipQueue: true,
    warnWhenNoSubscribers: false,
  });

  try {
    const result = await agentFunction(options.input);
    const durationMs = Date.now() - startTime;
    const outputHash = createHash('sha256')
      .update(JSON.stringify(result))
      .digest('hex')
      .slice(0, 8);

    logger.info(
      {
        agent_id: agentId,
        duration_ms: durationMs,
        output_hash: outputHash,
        correlation_id: options.correlationId,
      },
      'Agent completed',
    );

    await emitEvent(
      `${options.module}.${agentId}.completed`,
      options.module,
      {
        output_hash: outputHash,
        duration_ms: durationMs,
        status: 'success',
      },
      {
        ventureId: options.ventureId,
        correlationId: options.correlationId,
        severity: 'info',
        skipQueue: true,
        warnWhenNoSubscribers: false,
      },
    );

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const err = error instanceof Error ? error : new Error(String(error));

    logger.error(
      {
        err,
        agent_id: agentId,
        duration_ms: durationMs,
        account_id: options.accountId,
        venture_id: options.ventureId,
        correlation_id: options.correlationId,
      },
      'Agent failed',
    );

    await emitEvent(
      `${options.module}.${agentId}.failed`,
      options.module,
      {
        error_message: err.message,
        duration_ms: durationMs,
        retry_count: 0,
      },
      {
        ventureId: options.ventureId,
        correlationId: options.correlationId,
        severity: 'error',
        skipQueue: true,
        warnWhenNoSubscribers: false,
      },
    );

    throw error;
  }
}
