import type { StepLogger } from './step-logger.js';

/**
 * Wrap a unit of work as a step:
 *  1. start()
 *  2. run fn(step)
 *  3. succeed() with returned fields, or fail() and rethrow.
 */
export async function runStep<T>(
  step: StepLogger,
  fn: (step: StepLogger) => Promise<T>,
): Promise<T> {
  await step.start();
  try {
    const out = await fn(step);
    await step.succeed();
    return out;
  } catch (err) {
    await step.fail(err);
    throw err;
  }
}
