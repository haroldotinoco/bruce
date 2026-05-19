export const brandAidOpenApi = {
  openapi: '3.0.0',
  info: { title: 'BruceAI Brand-Aid API', version: '1.0.0' },
  servers: [{ url: process.env.API_URL ?? 'http://localhost:3004' }],
  paths: {
    '/health': { get: { responses: { '200': { description: 'OK' } } } },
    '/pipeline': { post: { security: [{ bearerAuth: [] }], responses: { '202': { description: 'Started' } } } },
    '/bootstrap/start-from-prompt': {
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Synthesize opportunity + add-venture artifacts and start brand pipeline',
        responses: { '202': { description: 'Bootstrap started' }, '403': { description: 'Disabled' } },
      },
    },
    '/jobs/{id}': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Workflow status' } } } },
    '/workflows': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Workflow runs' } } } },
    '/workflows/{run_id}': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Workflow run detail' } } } },
    '/packages': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Brand package list' } } } },
    '/packages/{id}': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Brand package detail' } } } },
    '/packages/{id}/moodboard': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Moodboard references' } } } },
    '/packages/{id}/logo-studies': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Logo study assets' } } } },
    '/packages/{id}/critique': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Critique score and iterations' } } } },
    '/packages/{id}/brand-imagery': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Brand imagery assets' } } } },
    '/packages/{id}/brandbook': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Brand book exports' } } } },
    '/packages/{id}/export-manifest': { get: { security: [{ bearerAuth: [] }], responses: { '200': { description: 'Export manifest and asset manifest' } } } },
  },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
  },
};
