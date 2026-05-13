import pino from 'pino';
import { createBetterStackWritable } from './betterstack-writable.js';
import { mergeWithLogContext } from './context.js';

const isDev = process.env.NODE_ENV !== 'production';
const useBetterStack = Boolean(process.env.BETTERSTACK_SOURCE_TOKEN);

const prettyTransport = isDev
  ? pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: false,
        translateTime: 'SYS:standard',
      },
    })
  : undefined;

const betterStackStream = useBetterStack ? createBetterStackWritable() : undefined;

const streams: Array<{ level: string; stream: NodeJS.WritableStream }> = [];

if (prettyTransport) {
  streams.push({ level: 'debug', stream: prettyTransport });
} else {
  streams.push({ level: 'debug', stream: process.stdout });
}

if (betterStackStream) {
  streams.push({ level: 'info', stream: betterStackStream });
}

const logLevel = process.env.LOG_LEVEL || 'info';

const baseLogger =
  streams.length > 1
    ? pino(
        {
          level: logLevel,
          timestamp: pino.stdTimeFunctions.isoTime,
        },
        pino.multistream(streams),
      )
    : pino({
        level: logLevel,
        timestamp: pino.stdTimeFunctions.isoTime,
        transport: isDev
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                singleLine: false,
                translateTime: 'SYS:standard',
              },
            }
          : undefined,
      });

export const logger = {
  debug: (data: Record<string, unknown>, message?: string) =>
    baseLogger.debug(mergeWithLogContext(data), message),
  info: (data: Record<string, unknown>, message?: string) =>
    baseLogger.info(mergeWithLogContext(data), message),
  warn: (data: Record<string, unknown>, message?: string) =>
    baseLogger.warn(mergeWithLogContext(data), message),
  error: (data: Record<string, unknown>, message?: string) =>
    baseLogger.error(mergeWithLogContext(data), message),
};

export { pino };
