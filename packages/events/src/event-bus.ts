import type { ModuleEvent } from '@bruce/contracts';
import { logger } from '@bruce/logger';
import Redis from 'ioredis';
import type { EventHandler } from './types.js';
import { EventBus } from './types.js';

export class InMemoryEventBus extends EventBus {
  private handlers = new Map<string, EventHandler[]>();

  async emit(event: ModuleEvent): Promise<void> {
    logger.info({ event }, 'Emitting event');
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(
      handlers.map((h) => h(event).catch((e) => logger.error({ e }, 'Event handler failed')))
    );
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    logger.debug({ eventType }, 'Subscribed to event type');
  }

  async close(): Promise<void> {
    this.handlers.clear();
  }
}

export class RedisPubSubEventBus extends EventBus {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers = new Map<string, EventHandler[]>();

  constructor(url: string) {
    super();
    this.publisher = new Redis(url);
    this.subscriber = new Redis(url);
    this.subscriber.on('message', (channel, message) => {
      const prefix = 'bruce:events:';
      if (!channel.startsWith(prefix)) return;
      const eventType = channel.slice(prefix.length);
      let ev: ModuleEvent;
      try {
        ev = JSON.parse(message) as ModuleEvent;
      } catch (e) {
        logger.error({ e, channel }, 'Invalid event JSON');
        return;
      }
      const list = this.handlers.get(eventType) || [];
      void Promise.all(
        list.map((h) => h(ev).catch((err) => logger.error({ err }, 'Event handler failed')))
      );
    });
  }

  async emit(event: ModuleEvent): Promise<void> {
    logger.info({ event }, 'Publishing event to Redis');
    await this.publisher.publish(`bruce:events:${event.type}`, JSON.stringify(event));
  }

  subscribe(eventType: string, handler: EventHandler): void {
    const list = this.handlers.get(eventType) ?? [];
    list.push(handler);
    this.handlers.set(eventType, list);

    if (list.length === 1) {
      void this.subscriber.subscribe(`bruce:events:${eventType}`).catch((e) =>
        logger.error({ e }, 'Redis subscribe failed')
      );
    }
  }

  async close(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}

let instance: EventBus | undefined;

export function getEventBus(): EventBus {
  if (!instance) {
    if (process.env.BRUCE_EVENT_BUS === 'redis' && process.env.REDIS_URL) {
      instance = new RedisPubSubEventBus(process.env.REDIS_URL);
    } else {
      instance = new InMemoryEventBus();
    }
  }
  return instance;
}

export function resetEventBusForTests(): void {
  instance = undefined;
}
