import { loadRepoEnv } from '@bruce/env';
loadRepoEnv();

import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DefaultLogger, NativeConnection, Runtime, Worker } from '@temporalio/worker';
import { agentLoader } from '@bruce/agent-runtime';
import { logger } from '@bruce/logger';
import * as activities from './activities.js';
import { BRUCE_MEMORY_TASK_QUEUE } from './config.js';

function resolveWorkflowsPath(): string {
  const dir = dirname(fileURLToPath(import.meta.url));
  if (existsSync(join(dir, 'workflows.ts'))) {
    return join(dir, 'workflows.ts');
  }
  return join(dir, 'workflows.js');
}

type TemporalSdkLogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function resolveTemporalSdkLogLevel(): TemporalSdkLogLevel {
  const raw = process.env.TEMPORAL_LOG_LEVEL?.trim().toUpperCase();
  if (
    raw === 'TRACE' ||
    raw === 'DEBUG' ||
    raw === 'INFO' ||
    raw === 'WARN' ||
    raw === 'ERROR'
  ) {
    return raw;
  }
  return 'WARN';
}

export async function startWorker(): Promise<void> {
  Runtime.install({ logger: new DefaultLogger(resolveTemporalSdkLogLevel()) });
  agentLoader.clearCache();

  const address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233';
  const taskQueue = BRUCE_MEMORY_TASK_QUEUE;
  const namespace = process.env.TEMPORAL_NAMESPACE ?? 'default';

  try {
    logger.info({ address, taskQueue, namespace }, 'Starting Temporal worker (bruce-memory)');
    const connection = await NativeConnection.connect({ address });
    const worker = await Worker.create({
      connection,
      namespace,
      taskQueue,
      workflowsPath: resolveWorkflowsPath(),
      activities,
      maxConcurrentActivityTaskExecutions: 50,
      maxConcurrentWorkflowTaskExecutions: 50,
    });
    logger.info({ taskQueue }, 'Worker registered and listening (bruce-memory)');
    await worker.run();
  } catch (error) {
    logger.error({ error, address, taskQueue }, 'Worker failed to start');
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  startWorker().catch((error) => {
    logger.error({ error }, 'Unexpected error in worker startup');
    process.exit(1);
  });
}
