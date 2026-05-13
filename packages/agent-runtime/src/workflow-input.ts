/**
 * Standard fields carried through Temporal workflows and activities for observability.
 */
export interface WorkflowInput {
  correlation_id: string;
  account_id: string;
  venture_id: string;
}
