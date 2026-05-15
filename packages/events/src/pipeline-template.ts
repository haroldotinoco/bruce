export interface PipelineWorkflowStartParams {
  accountId: string;
  ventureId: string;
  agentInput: Record<string, unknown>;
  correlationId?: string;
}

export interface PipelineWorkflowStartResult {
  workflow_id: string;
  status: 'queued';
  execution_id: string;
}

export interface SingleAgentPipelineTemplate<TWorkflow> {
  moduleName: string;
  taskQueue: string;
  workflow: TWorkflow;
  workflowIdPrefix?: string;
  now?: () => number;
}

export interface TemporalWorkflowStarter<TWorkflow> {
  workflow: {
    start(
      workflow: TWorkflow,
      options: {
        taskQueue: string;
        workflowId: string;
        args: [
          {
            account_id: string;
            venture_id: string;
            agent_input: Record<string, unknown>;
            correlation_id?: string;
          },
        ];
        memo: {
          account_id: string;
          venture_id: string;
          module_name: string;
        };
      },
    ): Promise<{ firstExecutionRunId: string }>;
  };
}

export async function startSingleAgentPipelineWorkflow<TWorkflow>(
  client: TemporalWorkflowStarter<TWorkflow>,
  template: SingleAgentPipelineTemplate<TWorkflow>,
  params: PipelineWorkflowStartParams,
): Promise<PipelineWorkflowStartResult> {
  const workflowIdPrefix = template.workflowIdPrefix ?? template.moduleName;
  const now = template.now ?? Date.now;
  const workflowId = `${workflowIdPrefix}-${params.accountId}-${params.ventureId}-${now()}`;

  const handle = await client.workflow.start(template.workflow, {
    taskQueue: template.taskQueue,
    workflowId,
    args: [
      {
        account_id: params.accountId,
        venture_id: params.ventureId,
        agent_input: params.agentInput,
        correlation_id: params.correlationId,
      },
    ],
    memo: {
      account_id: params.accountId,
      venture_id: params.ventureId,
      module_name: template.moduleName,
    },
  });

  return {
    workflow_id: workflowId,
    status: 'queued',
    execution_id: handle.firstExecutionRunId,
  };
}
