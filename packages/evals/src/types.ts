export interface EvaluationScenario {
  scenario_id: string;
  title: string;
  description?: string;
  input: Record<string, unknown>;
  expected_output: Record<string, unknown>;
  scoring: Record<string, ScoringMetric>;
}

export interface ScoringMetric {
  type: 'numeric_range' | 'semantic_similarity' | 'exact_match';
  /** Dot path into expected_output (e.g. tam_estimate.value) */
  expectedPath?: string;
  /** Dot path into actual output */
  actualPath?: string;
  tolerance_percent?: number;
  threshold?: number;
  weight?: number;
}

export interface EvaluationResult {
  scenario_id: string;
  passed: boolean;
  scores: Record<string, number>;
  actual_output: unknown;
  expected_output: unknown;
  error?: string;
}
