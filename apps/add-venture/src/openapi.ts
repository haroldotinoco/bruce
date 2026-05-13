export const addVentureOpenApi = {
  openapi: '3.0.0',
  info: {
    title: 'BruceAI Add-Venture API',
    version: '1.0.0',
    description: 'Venture structuring pipeline (Temporal + agent runtime).',
  },
  servers: [
    {
      url: process.env.API_URL ?? 'http://localhost:3003',
      description: 'Current server',
    },
  ],
  paths: {
    '/health': {
      get: { summary: 'Health check', responses: { '200': { description: 'OK' } } },
    },
    '/structuring': {
      post: {
        summary: 'Start venture structuring workflow',
        security: [{ bearerAuth: [] }],
        responses: { '202': { description: 'Workflow started' } },
      },
    },
    '/jobs/{id}': {
      get: {
        summary: 'Poll Temporal workflow status',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Status' }, '404': { description: 'Not found' } },
      },
    },
    '/dossiers': {
      get: {
        summary: 'List venture dossiers (thin read-model)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Dossier list' } },
      },
    },
    '/dossiers/{id}': {
      get: {
        summary: 'Get dossier detail (reads dossier.json from disk)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Dossier' }, '404': { description: 'Not found' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
};
