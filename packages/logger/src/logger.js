import pino from 'pino';
const isDev = process.env.NODE_ENV !== 'production';
const pinoLogger = pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
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
    debug: (data, message) => pinoLogger.debug(data, message),
    info: (data, message) => pinoLogger.info(data, message),
    warn: (data, message) => pinoLogger.warn(data, message),
    error: (data, message) => pinoLogger.error(data, message),
};
export { pino };
//# sourceMappingURL=logger.js.map