export const startupOpsOpenApi = {
  openapi: '3.0.0',
  info: { title: 'BruceAI Startup-Ops API', version: '1.0.0' },
  servers: [{ url: process.env.API_URL ?? 'http://localhost:3007' }],
  paths: {
    '/health': { get: { responses: { '200': { description: 'OK' } } } },
    '/pipeline': { post: { security: [{ bearerAuth: [] }], responses: { '202': { description: 'Started' } } } },
  },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
  },
};
