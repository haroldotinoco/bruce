import { z } from 'zod';
import { logger } from '@bruce/logger';

export class ValidationError extends Error {
  constructor(
    message: string,
    public issues: z.ZodIssue[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateInput<T>(input: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error({ issues: error.issues }, 'Input validation failed');
      throw new ValidationError('Input validation failed', error.issues);
    }
    throw error;
  }
}

export function validateOutput<T>(output: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(output);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error({ issues: error.issues, output }, 'Output validation failed');
      throw new ValidationError('Output validation failed', error.issues);
    }
    throw error;
  }
}
