/** Minimal OpenAPI 3.0 document for GET /doc (Bruce Core). */
export const bruceCoreOpenApi = {
  openapi: '3.0.0',
  info: {
    title: 'BruceAI Core API',
    version: '1.0.0',
    description: 'Venture management and job polling',
  },
  servers: [
    {
      url: process.env.API_URL ?? 'http://localhost:3000',
      description: 'Current server',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': { description: 'OK' },
        },
      },
    },
    '/ventures': {
      post: {
        summary: 'Create venture',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  stage: { type: 'string' },
                  industry: { type: 'string' },
                  founder_names: { type: 'string' },
                  team_profile: { type: 'object' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Created' }, '400': { description: 'Bad request' } },
      },
    },
    '/ventures/{id}': {
      get: {
        summary: 'Get venture',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } },
      },
    },
    '/ventures/{id}/start-analysis': {
      post: {
        summary: 'Start venture analysis workflow',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '202': { description: 'Queued' } },
      },
    },
    '/jobs/{id}': {
      get: {
        summary: 'Poll workflow job status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
} as const;
