import Redis from 'ioredis';

let singleton: Redis | undefined;

/**
 * Shared Redis connection for BullMQ. Must use `maxRetriesPerRequest: null` per BullMQ requirements.
 */
export function getBullRedisConnection(): Redis {
  if (!singleton) {
    const url = process.env.REDIS_URL ?? 'redis://127.0.0.1:6379';
    singleton = new Redis(url, {
      maxRetriesPerRequest: null,
    });
  }
  return singleton;
}

export function resetBullRedisConnectionForTests(): void {
  singleton = undefined;
}
