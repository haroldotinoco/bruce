import type { ModuleEvent } from '@bruce/contracts';

export type EventHandler = (event: ModuleEvent) => Promise<void>;

export abstract class EventBus {
  abstract emit(event: ModuleEvent): Promise<void>;
  abstract subscribe(eventType: string, handler: EventHandler): void;
  abstract close(): Promise<void>;
}
