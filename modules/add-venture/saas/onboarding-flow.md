# Add-Venture Module Onboarding Flow

## Overview

The add-venture module transforms a selected opportunity into a fully-structured venture hypothesis. This document describes the activation flow, triggering conditions, processing steps, and orchestration patterns.

## Activation Trigger

The add-venture module activates automatically when the opportunity module marks an opportunity as "advanced":

- **Event**: `opportunity.advanced`
- **Condition**: Opportunity must have passed initial qualification and be ready for deep analysis
- **Propagation**: Event published to Bruce Core event bus; add-venture module subscribes and initiates workflow

## Onboarding Flow Stages

### Stage 1: Opportunity Context Ingestion

When an `opportunity.advanced` event is received, the module performs initial data gathering:

1. **Fetch opportunity state** from Bruce Core
   - Retrieve opportunity details including market context, preliminary sizing, team scope
   - Validate that required fields are present (name, description, target market)

2. **Load account context** from Bruce Core
   - Retrieve account plan, enabled modules, and configuration
   - Check if venture limit has been reached (fire `bruce-core.venture.limit.exceeded` if needed)

3. **Initialize venture record** in Bruce Core
   - Create venture with status `structuring`
   - Link to source opportunity and account
   - Reserve venture ID for downstream references

**Data Schema**:
```typescript
interface OpportunityContext {
  opportunity_id: string;
  name: string;
  description: string;
  target_market: string;
  market_potential: string;
  preliminary_team_size: number;
  key_risks: string[];
  timeline_estimate: string;
  metadata: Record<string, any>;
}

interface AccountContext {
  account_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  venture_limit: number;
  active_ventures_count: number;
  enabled_modules: string[];
  settings: Record<string, any>;
}
```

### Stage 2: Venture Hypothesis Structuring

Multi-agent orchestration via Temporal workflow. Three sequential agents process the opportunity:

#### Agent 1: Hypothesis Builder
- **Role**: Initial structure generation
- **Input**: Opportunity context
- **Output**: Draft hypothesis with all sections populated
- **Tasks**:
  - Generate executive summary (2-3 paragraphs)
  - Perform market sizing (TAM/SAM/SOM analysis)
  - Define product MVP scope
  - Identify initial team requirements
  - Outline key risk areas

#### Agent 2: Critique Agent
- **Role**: Quality review and consistency checking
- **Input**: Draft hypothesis from Builder
- **Output**: Feedback and improvement suggestions
- **Tasks**:
  - Review for internal consistency
  - Check market sizing against known benchmarks
  - Validate team requirements align with scope
  - Identify missing risk assessment areas
  - Flag unrealistic timelines or assumptions

#### Agent 3: Structuring Agent
- **Role**: Final synthesis and recommendations
- **Input**: Hypothesis + critique feedback
- **Output**: Refined hypothesis + go/no-go recommendation
- **Tasks**:
  - Incorporate critique feedback into final hypothesis
  - Synthesize risk assessment with likelihood/impact scores
  - Generate weighted go/no-go recommendation
  - Prepare rationale document
  - Format output for human review

**Hypothesis Schema**:
```typescript
interface VentureHypothesis {
  executive_summary: string;
  market_sizing: {
    tam: string; // Total addressable market
    sam: string; // Serviceable addressable market
    som: string; // Serviceable obtainable market
    analysis: string;
  };
  team_requirements: TeamRequirement[];
  product_definition: {
    mvp_scope: string;
    key_features: string[];
    target_user: string;
    success_metrics: string[];
  };
  risk_assessment: RiskItem[];
  go_no_go_recommendation: {
    decision: 'go' | 'no_go' | 'conditional';
    confidence: number; // 0-1
    rationale: string;
    conditions?: string[]; // For 'conditional' decision
  };
}

interface TeamRequirement {
  role: string;
  level: 'lead' | 'senior' | 'mid' | 'junior';
  count: number;
  required_skills: string[];
}

interface RiskItem {
  category: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}
```

### Stage 3: Human Gate (Conditional)

If `human_gate_notifications` is enabled in account settings:

1. **Notification dispatch**
   - Send structured review request to designated approvers
   - Include hypothesis summary, go/no-go recommendation, key risks
   - Provide decision deadline (default: 7 days)

2. **Decision states**
   - `pending`: Awaiting human review (workflow paused)
   - `approved`: Human approved venture creation
   - `rejected`: Human rejected venture (venture marked `rejected`)
   - `conditional`: Human approved with modifications needed

3. **Timeout handling**
   - If no decision after deadline, escalate to account owner
   - Option to auto-reject or auto-approve based on plan settings

4. **Modification flow** (if conditional)
   - Return hypothesis to Structuring Agent for updates
   - Re-run human gate with modified version
   - Maximum 2 revision cycles

### Stage 4: Venture Activation

Once hypothesis is approved (or auto-approved if human gate disabled):

1. **Finalize venture record**
   - Update venture status from `structuring` to `active`
   - Persist final hypothesis to venture record
   - Store approval timestamp and approver ID

2. **Emit billing event**
   - Publish `bruce-core.venture.created` event
   - Include venture ID, name, hypothesis metadata

3. **Activate downstream modules**
   - If other modules depend on venture activation (e.g., execution-planning), trigger their workflows
   - Update module status registry in Bruce Core

4. **Send confirmation**
   - Notify account owner of venture activation
   - Provide venture dashboard link
   - Suggest next recommended modules

## Backend Orchestration via Temporal

### Workflow Definition

```typescript
import {
  proxyActivities,
  defineSignal,
  setHandler,
  WorkflowContext,
} from '@temporalio/workflow';
import * as activities from './activities';

interface VentureStructuringWorkflowInput {
  opportunity_id: string;
  account_id: string;
  venture_id: string;
  human_gate_enabled: boolean;
}

interface HumanDecision {
  decision: 'approved' | 'rejected' | 'conditional';
  feedback?: string;
  modifications?: Partial<VentureHypothesis>;
}

const { ingestOpportunityContext, callAgent, checkHumanGate } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '5m',
  retryPolicy: {
    initialInterval: '10s',
    maximumAttempts: 3,
  },
});

export const ventureStructuringWorkflow = async (
  input: VentureStructuringWorkflowInput
): Promise<{ venture_id: string; hypothesis: VentureHypothesis }> => {
  // Signal channel for human decision
  let humanDecision: HumanDecision | null = null;
  defineSignal<[HumanDecision]>('humanDecisionSignal', (decision) => {
    humanDecision = decision;
  });

  // Stage 1: Ingest context
  const opportunityContext = await ingestOpportunityContext({
    opportunityId: input.opportunity_id,
    accountId: input.account_id,
  });

  // Stage 2: Multi-agent structuring
  const draftHypothesis = await callAgent({
    agentType: 'hypothesis-builder',
    input: opportunityContext,
    ventureId: input.venture_id,
  });

  const critique = await callAgent({
    agentType: 'critique-agent',
    input: draftHypothesis,
    ventureId: input.venture_id,
  });

  const finalHypothesis = await callAgent({
    agentType: 'structuring-agent',
    input: {
      hypothesis: draftHypothesis,
      critique: critique,
    },
    ventureId: input.venture_id,
  });

  // Stage 3: Human gate (if enabled)
  if (input.human_gate_enabled) {
    await checkHumanGate({
      ventureId: input.venture_id,
      hypothesis: finalHypothesis,
      accountId: input.account_id,
      timeout: '7d',
    });

    // Wait for human decision signal
    let revisionCount = 0;
    const maxRevisions = 2;

    while (revisionCount < maxRevisions) {
      // This blocks until humanDecisionSignal is received
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (humanDecision !== null) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });

      if (humanDecision.decision === 'approved') {
        break;
      } else if (humanDecision.decision === 'rejected') {
        throw new Error('Venture rejected by human reviewer');
      } else if (humanDecision.decision === 'conditional' && revisionCount < maxRevisions) {
        // Apply modifications and re-run structuring agent
        const modifiedHypothesis = {
          ...finalHypothesis,
          ...humanDecision.modifications,
        };

        const revisedHypothesis = await callAgent({
          agentType: 'structuring-agent',
          input: {
            hypothesis: modifiedHypothesis,
            critique: null, // Skip critique on revision
          },
          ventureId: input.venture_id,
        });

        // Update for next iteration
        Object.assign(finalHypothesis, revisedHypothesis);
        humanDecision = null; // Reset for next decision
        revisionCount++;
      }
    }

    if (revisionCount === maxRevisions && humanDecision?.decision === 'conditional') {
      throw new Error('Maximum revisions reached; venture structure not finalized');
    }
  }

  // Stage 4: Activate venture
  const activatedVenture = await finalizeVenture({
    ventureId: input.venture_id,
    hypothesis: finalHypothesis,
    accountId: input.account_id,
  });

  return {
    venture_id: input.venture_id,
    hypothesis: finalHypothesis,
  };
};
```

### Activity Definitions

```typescript
import * as bruceCore from '../services/bruce-core-client';
import * as agentService from '../services/agent-orchestrator';
import { VentureHypothesis, OpportunityContext } from '../types';

export const ingestOpportunityContext = async (input: {
  opportunityId: string;
  accountId: string;
}): Promise<OpportunityContext> => {
  // Fetch from opportunity module / bruce-core
  const opportunity = await bruceCore.getOpportunity(input.opportunityId);
  const account = await bruceCore.getAccount(input.accountId);

  return {
    opportunity_id: input.opportunityId,
    name: opportunity.name,
    description: opportunity.description,
    target_market: opportunity.targetMarket,
    market_potential: opportunity.marketPotential,
    preliminary_team_size: opportunity.estimatedTeamSize,
    key_risks: opportunity.initialRisks,
    timeline_estimate: opportunity.timeline,
    metadata: opportunity.metadata,
  };
};

export const callAgent = async (input: {
  agentType: 'hypothesis-builder' | 'critique-agent' | 'structuring-agent';
  input: any;
  ventureId: string;
}): Promise<VentureHypothesis> => {
  // Route to appropriate agent service
  const result = await agentService.invokeAgent({
    agentType: input.agentType,
    payload: input.input,
    context: {
      ventureId: input.ventureId,
    },
  });

  return result.hypothesis;
};

export const checkHumanGate = async (input: {
  ventureId: string;
  hypothesis: VentureHypothesis;
  accountId: string;
  timeout: string;
}): Promise<void> => {
  // Send notification to approvers
  await bruceCore.notifyApprovers({
    ventureId: input.ventureId,
    hypothesis: input.hypothesis,
    accountId: input.accountId,
    deadline: new Date(Date.now() + parseTimeoutToMs(input.timeout)),
  });
};

export const finalizeVenture = async (input: {
  ventureId: string;
  hypothesis: VentureHypothesis;
  accountId: string;
}): Promise<any> => {
  // Update venture status and persist hypothesis
  const venture = await bruceCore.updateVenture(input.ventureId, {
    status: 'active',
    hypothesis: input.hypothesis,
    activated_at: new Date().toISOString(),
  });

  // Emit billing event
  await bruceCore.emitBillingEvent({
    event_type: 'bruce-core.venture.created',
    account_id: input.accountId,
    data: {
      venture_id: input.ventureId,
      venture_name: input.hypothesis.executive_summary.split('\n')[0],
    },
  });

  return venture;
};
```

### Starting the Workflow

```typescript
import { Connection, Client } from '@temporalio/client';

export const initiateVentureStructuring = async (input: {
  opportunity_id: string;
  account_id: string;
  venture_id: string;
  human_gate_enabled: boolean;
}) => {
  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection });

  const handle = await client.workflow.start('ventureStructuringWorkflow', {
    args: [input],
    taskQueue: 'add-venture',
    workflowId: `venture-${input.venture_id}`,
  });

  return handle;
};

// Sending human decision signal
export const submitHumanDecision = async (
  ventureId: string,
  decision: 'approved' | 'rejected' | 'conditional',
  feedback?: string,
  modifications?: any
) => {
  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection });

  const handle = client.workflow.getHandle(`venture-${ventureId}`);
  await handle.signal('humanDecisionSignal', {
    decision,
    feedback,
    modifications,
  });
};
```

## Configuration

### Account Settings

The following account-level settings control add-venture behavior:

```json
{
  "add_venture": {
    "human_gate_notifications": true,
    "gate_timeout_days": 7,
    "auto_approve_on_timeout": false,
    "max_revision_cycles": 2,
    "approver_emails": ["founder@company.com", "investor@company.com"],
    "hypothesis_review_template": "default"
  }
}
```

### Module Configuration

```json
{
  "module_id": "add-venture",
  "enabled": true,
  "config": {
    "agent_service_url": "https://agents.bruce.local",
    "temporal_task_queue": "add-venture",
    "hypothesis_version": "v1.0",
    "risk_assessment_depth": "detailed"
  }
}
```

## Error Handling

| Error | Handling |
|-------|----------|
| Missing opportunity data | Reject venture; notify account owner |
| Venture limit exceeded | Emit `bruce-core.venture.limit.exceeded`; stop workflow |
| Agent failure (max retries) | Escalate to support; mark venture as `error` |
| Human gate timeout | Auto-approve or auto-reject per settings |
| Hypothesis validation fails | Return to Structuring Agent for correction |

## Monitoring & Logging

All workflow steps are logged with structured metadata:

```typescript
const logWorkflowStep = (step: string, data: any) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    workflow: 'ventureStructuring',
    step,
    data,
  }));
};
```

Key events to monitor:
- `venture_structuring_started`
- `agent_hypothesis_generated`
- `human_gate_decision_pending`
- `human_decision_received`
- `venture_activation_completed`
- `venture_activation_failed`

## Example Workflow Execution

1. Opportunity marked "advanced" in opportunity module
2. `opportunity.advanced` event published
3. Add-venture module receives event; initiates Temporal workflow
4. Workflow Stage 1: Ingests opportunity context from Bruce Core
5. Workflow Stage 2:
   - Hypothesis Builder generates initial structure
   - Critique Agent reviews and provides feedback
   - Structuring Agent synthesizes final hypothesis
6. Workflow Stage 3: If human gate enabled, notifies approvers with 7-day deadline
7. Account owner reviews hypothesis in dashboard, approves via UI
8. Approval signal received by workflow; triggers human decision
9. Workflow Stage 4: Venture marked active, billing event emitted
10. Module returns venture ID and hypothesis to caller
11. Downstream modules (execution-planning, etc.) can now operate on the venture

