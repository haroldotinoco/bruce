export const opportunityOpenApi = {
  openapi: '3.0.0',
  info: {
    title: 'BruceAI Opportunity API',
    version: '1.0.0',
    description:
      'Opportunity screening: scans (venture-led or theme-led discovery), job polling with workflow result when completed, opportunities list/advance, usage vs plan limits. Aligns with modules/opportunity/saas/api-contract.yaml (subset implemented).',
  },
  servers: [
    {
      url: process.env.API_URL ?? 'http://localhost:3002',
      description: 'Current server',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/usage': {
      get: {
        summary: 'Monthly scan usage and plan limits',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    plan: { type: 'string' },
                    scans_this_month: { type: 'integer' },
                    scans_limit_month: { type: 'integer' },
                    max_ai_credits_per_month: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/scans': {
      get: {
        summary: 'List scans for the authenticated account',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 20 } },
        ],
        responses: { '200': { description: 'OK' } },
      },
      post: {
        summary: 'Start opportunity screening or themed discovery',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    type: 'object',
                    required: ['venture_id'],
                    properties: {
                      venture_id: { type: 'string' },
                      opportunities: { type: 'array', items: {} },
                      themes: { type: 'array', items: { type: 'string' }, maxItems: 5 },
                    },
                  },
                  {
                    type: 'object',
                    required: ['themes'],
                    properties: {
                      themes: {
                        type: 'array',
                        items: { type: 'string' },
                        minItems: 1,
                        maxItems: 5,
                      },
                      filters: { type: 'object', additionalProperties: true },
                      venture_id: { type: 'string' },
                      webhook_url: { type: 'string', format: 'uri' },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          '202': { description: 'Queued' },
          '402': { description: 'Plan limit exceeded' },
        },
      },
    },
    '/scans/{scan_id}': {
      get: {
        summary: 'Get scan by id (includes persisted result when available)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'scan_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description:
              'OK — includes optional project_nickname (platform.projects) when venture_id is a UUID',
          },
          '404': { description: 'Not Found' },
        },
      },
    },
    '/scans/{scan_id}/restart-downstream': {
      post: {
        summary:
          'Irreversibly wipe Add-Venture, Brand-Aid, and Builder state for the scan venture, then start structuring again via add-venture',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'scan_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['confirm_nickname', 'acknowledge_irreversible'],
                properties: {
                  confirm_nickname: {
                    type: 'string',
                    description: 'Must exactly match platform.projects nickname for this venture',
                  },
                  opportunity_id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Optional persisted opportunity row id (defaults to first ranked)',
                  },
                  rollback_from_step: {
                    type: 'string',
                    description: 'Optional workflow step/agent id selected by the operator',
                  },
                  acknowledge_irreversible: {
                    type: 'boolean',
                    enum: [true],
                    description: 'Must be true',
                  },
                },
              },
            },
          },
        },
        responses: {
          '202': {
            description: 'Structuring workflow queued',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    workflow_id: { type: 'string' },
                    pipeline_run_id: { type: 'string', nullable: true },
                    status: { type: 'string' },
                    execution_id: { type: 'string' },
                    poll_url: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid confirmation or missing project metadata' },
          '401': { description: 'Missing Authorization (needed to forward to add-venture)' },
          '404': { description: 'Scan or opportunity not found' },
          '409': { description: 'Scan not completed or venture missing' },
          '502': { description: 'Downstream structuring failed' },
        },
      },
    },
    '/scans/{scan_id}/opportunities': {
      get: {
        summary: 'Opportunities for a scan (from workflow result JSON)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'scan_id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'min_score', in: 'query', required: false, schema: { type: 'number' } },
        ],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } },
      },
    },
    '/jobs/{id}': {
      get: {
        summary: 'Poll workflow job status; when COMPLETED, includes final workflow result',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'OK (includes `failure` when the workflow run finished with an error, e.g. quality gate)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    workflow_id: { type: 'string' },
                    status: { type: 'string', description: 'Temporal workflow status name' },
                    state: {},
                    result: { description: 'Present when status is COMPLETED' },
                    failure: {
                      type: 'object',
                      description: 'Present when the execution failed, timed out, or was cancelled/terminated',
                      properties: {
                        message: { type: 'string' },
                        type: { type: 'string' },
                      },
                    },
                    state_unavailable: {
                      type: 'string',
                      description: 'When live query state was not available (e.g. transitional)',
                    },
                  },
                },
              },
            },
          },
          '404': { description: 'Workflow not found' },
          '502': { description: 'Could not read workflow status' },
        },
      },
    },
    '/opportunities': {
      get: {
        summary: 'List persisted opportunities',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', default: 20 } },
        ],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/opportunities/{opportunity_id}': {
      get: {
        summary: 'Get opportunity by id',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'opportunity_id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } },
      },
    },
    '/opportunities/{opportunity_id}/advance': {
      post: {
        summary: 'Advance opportunity (minimal stub)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'opportunity_id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } },
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
