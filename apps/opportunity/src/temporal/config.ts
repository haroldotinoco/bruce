export const OPPORTUNITY_TASK_QUEUE = 'bruce-opportunity';

export const WORKFLOW_TIMEOUTS = {
  opportunityScreening: {
    executionTimeout: 3600,
    decisionTaskTimeout: 60,
  },
  quickScan: {
    executionTimeout: 600,
    decisionTaskTimeout: 30,
  },
} as const;
