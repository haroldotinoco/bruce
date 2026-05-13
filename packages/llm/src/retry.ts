import { logger } from '@bruce/logger';

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, attempt);
        logger.warn(
          {
            attempt: attempt + 1,
            maxRetries,
            waitTime,
            error: lastError.message,
          },
          'Retry after error'
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}
