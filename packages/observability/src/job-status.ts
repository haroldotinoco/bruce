export type StandardJobStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'not_found'
  | 'state_unavailable'
  | 'upstream_unavailable';

export interface StandardJobErrorResponse {
  error: {
    code: Exclude<StandardJobStatus, 'queued' | 'running' | 'completed' | 'failed'>;
    message: string;
  };
}

export function standardJobErrorResponse(error: unknown): {
  httpStatus: 404 | 502;
  body: StandardJobErrorResponse;
} {
  const message = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : '';

  if (
    name === 'JobNotFoundError' ||
    /not found/i.test(message) ||
    /5 NOT_FOUND/.test(message)
  ) {
    return {
      httpStatus: 404,
      body: {
        error: {
          code: 'not_found',
          message: 'Job not found',
        },
      },
    };
  }

  if (/state.*unavailable|query/i.test(message)) {
    return {
      httpStatus: 502,
      body: {
        error: {
          code: 'state_unavailable',
          message: 'Workflow state is temporarily unavailable. Poll again shortly.',
        },
      },
    };
  }

  return {
    httpStatus: 502,
    body: {
      error: {
        code: 'upstream_unavailable',
        message: 'Unable to load job status from the workflow service. Try again shortly.',
      },
    },
  };
}
