import { z } from 'zod';

export class LLMValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: z.ZodIssue[]
  ) {
    super(message);
    this.name = 'LLMValidationError';
  }
}

export async function validateStructuredOutput<T>(
  output: unknown,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    return schema.parse(output);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new LLMValidationError(`Output validation failed: ${error.message}`, error.issues);
    }
    throw error;
  }
}
