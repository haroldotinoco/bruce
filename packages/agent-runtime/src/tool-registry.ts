import { getRedisClient } from '@bruce/redis';
import { getStorageClient } from '@bruce/storage';
import { logger } from '@bruce/logger';
import type { ExecutionContext } from './types.js';
import { ToolExecutionError } from './errors.js';

export type ToolExecutionEnv = {
  context: ExecutionContext;
};

export type ToolImplementation = (input: unknown, env: ToolExecutionEnv) => Promise<unknown>;

export class ToolRegistry {
  private tools: Map<string, ToolImplementation> = new Map();

  constructor() {
    this.registerBuiltinTools();
  }

  private registerBuiltinTools(): void {
    this.register('web_search', async (input: unknown) => {
      const q = input as { query?: string; maxResults?: number };
      logger.info({ query: q.query }, 'Web search requested');
      return { results: [] as unknown[] };
    });

    this.register('db_read', async (input: unknown) => {
      const q = input as { query?: string };
      logger.warn({ query: q.query }, 'DB read requested');
      throw new Error('db_read not yet implemented for safety');
    });

    this.register('db_write', async () => {
      throw new Error('db_write requires explicit authorization');
    });

    this.register('storage_read', async (input: unknown) => {
      const p = input as { key: string };
      const storage = getStorageClient();
      const buf = await storage.download(p.key);
      return buf;
    });

    this.register('storage_write', async (input: unknown, env: ToolExecutionEnv) => {
      const p = input as { key: string; content: string };
      const storage = getStorageClient();
      const accountId = env.context.accountId;
      const module = env.context.module;
      const ventureId = env.context.ventureId ?? 'default';
      const fileKey = await storage.upload(module, accountId, ventureId, p.key, p.content);
      return { fileKey };
    });

    this.register('vector_search', async (input: unknown) => {
      const q = input as { query?: string; topK?: number; module?: string };
      logger.info({ query: q.query }, 'Vector search requested');
      return { results: [] as unknown[] };
    });

    this.register('http_fetch', async (input: unknown) => {
      const p = input as { url: string; method?: string; headers?: Record<string, string>; body?: unknown };
      const response = await fetch(p.url, {
        method: p.method || 'GET',
        headers: p.headers,
        body: p.body !== undefined ? JSON.stringify(p.body) : undefined,
      });
      const contentType = response.headers.get('content-type') ?? '';
      let data: unknown;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      return { status: response.status, data };
    });

    this.register('redis_get', async (input: unknown, env: ToolExecutionEnv) => {
      const p = input as { key: string };
      const redis = getRedisClient();
      const accountId = env.context.accountId;
      const module = env.context.module;
      return redis.get(accountId, module, 'kv', 'default', p.key);
    });

    this.register('redis_set', async (input: unknown, env: ToolExecutionEnv) => {
      const p = input as { key: string; value: unknown; ttl?: number };
      const redis = getRedisClient();
      const accountId = env.context.accountId;
      const module = env.context.module;
      const ttl = typeof p.ttl === 'number' ? p.ttl : 3600;
      await redis.set(accountId, module, 'kv', 'default', p.key, p.value, ttl);
      return { success: true };
    });
  }

  register(name: string, implementation: ToolImplementation): void {
    this.tools.set(name, implementation);
    logger.debug({ name }, 'Registered tool');
  }

  get(name: string): ToolImplementation | undefined {
    return this.tools.get(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  getAll(): Record<string, ToolImplementation> {
    return Object.fromEntries(this.tools);
  }

  async runTool(
    name: string,
    input: unknown,
    env: ToolExecutionEnv
  ): Promise<unknown> {
    const impl = this.tools.get(name);
    if (!impl) {
      throw new ToolExecutionError(name, 'Unknown tool');
    }
    try {
      return await impl(input, env);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new ToolExecutionError(name, msg);
    }
  }
}

let instance: ToolRegistry | undefined;

export function getToolRegistry(): ToolRegistry {
  if (!instance) {
    instance = new ToolRegistry();
  }
  return instance;
}
