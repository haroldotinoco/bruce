import Redis from 'ioredis';
import { logger } from '@bruce/logger';

export class RedisClient {
  private redis: Redis;

  constructor(url?: string) {
    this.redis = new Redis(url || process.env.REDIS_URL || 'redis://localhost:6379');
    this.redis.on('error', (err) => logger.error({ err }, 'Redis error'));
  }

  private makeKey(
    accountId: string,
    module: string,
    resourceType: string,
    resourceId: string,
    field: string
  ): string {
    return `bruce:${module}:${accountId}:${resourceType}:${resourceId}:${field}`;
  }

  async get<T = unknown>(
    accountId: string,
    module: string,
    resourceType: string,
    resourceId: string,
    field: string
  ): Promise<T | null> {
    const key = this.makeKey(accountId, module, resourceType, resourceId, field);
    const value = await this.redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async set(
    accountId: string,
    module: string,
    resourceType: string,
    resourceId: string,
    field: string,
    value: unknown,
    ttlSeconds: number = 3600
  ): Promise<void> {
    const key = this.makeKey(accountId, module, resourceType, resourceId, field);
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async del(
    accountId: string,
    module: string,
    resourceType: string,
    resourceId: string,
    field: string
  ): Promise<void> {
    const key = this.makeKey(accountId, module, resourceType, resourceId, field);
    await this.redis.del(key);
  }

  async invalidateModule(accountId: string, module: string): Promise<void> {
    const pattern = `bruce:${module}:${accountId}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}

let instance: RedisClient | undefined;

export function getRedisClient(): RedisClient {
  if (!instance) {
    instance = new RedisClient();
  }
  return instance;
}
