import { describe, expect, it } from 'vitest';
import { startSingleAgentPipelineWorkflow } from './pipeline-template.js';

describe('startSingleAgentPipelineWorkflow', () => {
  it('starts a single-agent module workflow with standard args and memo', async () => {
    const workflow = async () => undefined;
    const starts: unknown[] = [];
    const client = {
      workflow: {
        async start(startedWorkflow: typeof workflow, options: unknown) {
          starts.push({ startedWorkflow, options });
          return { firstExecutionRunId: 'run-123' };
        },
      },
    };

    const result = await startSingleAgentPipelineWorkflow(
      client,
      {
        moduleName: 'builder',
        taskQueue: 'bruce-builder',
        workflow,
        now: () => 12345,
      },
      {
        accountId: 'acct-1',
        ventureId: 'venture-1',
        agentInput: { source: 'test' },
        correlationId: 'corr-1',
      },
    );

    expect(result).toEqual({
      workflow_id: 'builder-acct-1-venture-1-12345',
      status: 'queued',
      execution_id: 'run-123',
    });
    expect(starts).toEqual([
      {
        startedWorkflow: workflow,
        options: {
          taskQueue: 'bruce-builder',
          workflowId: 'builder-acct-1-venture-1-12345',
          args: [
            {
              account_id: 'acct-1',
              venture_id: 'venture-1',
              agent_input: { source: 'test' },
              correlation_id: 'corr-1',
            },
          ],
          memo: {
            account_id: 'acct-1',
            venture_id: 'venture-1',
            module_name: 'builder',
          },
        },
      },
    ]);
  });
});
