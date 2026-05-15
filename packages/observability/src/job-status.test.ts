import { describe, expect, it } from 'vitest';
import { standardJobErrorResponse } from './job-status.js';

describe('standardJobErrorResponse', () => {
  it('maps not-found errors to a standard 404 response', () => {
    const error = new Error('Workflow not found: abc');
    error.name = 'JobNotFoundError';

    expect(standardJobErrorResponse(error)).toEqual({
      httpStatus: 404,
      body: {
        error: {
          code: 'not_found',
          message: 'Job not found',
        },
      },
    });
  });

  it('maps query/state errors to state_unavailable', () => {
    expect(standardJobErrorResponse(new Error('query rejected'))).toMatchObject({
      httpStatus: 502,
      body: {
        error: {
          code: 'state_unavailable',
        },
      },
    });
  });

  it('maps unknown workflow-service errors to upstream_unavailable', () => {
    expect(standardJobErrorResponse(new Error('connection refused'))).toMatchObject({
      httpStatus: 502,
      body: {
        error: {
          code: 'upstream_unavailable',
        },
      },
    });
  });
});
