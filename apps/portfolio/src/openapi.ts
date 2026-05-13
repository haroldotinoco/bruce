export const portfolioOpenApi = {
  openapi: '3.0.0',
  info: { title: 'BruceAI Brand-Aid API', version: '1.0.0' },
  servers: [{ url: process.env.API_URL ?? 'http://localhost:3008' }],
  paths: {
    '/health': { get: { responses: { '200': { description: 'OK' } } } },
    '/pipeline': { post: { security: [{ bearerAuth: [] }], responses: { '202': { description: 'Started' } } } },
  },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } },
  },
};
