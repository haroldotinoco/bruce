export interface EvaluationScenario {
  scenario_id: string;
  module?: string;
  agent_id?: string;
  title: string;
  description?: string;
  tags?: string[];
  input: Record<string, unknown>;
  expected_output: Record<string, unknown>;
  scoring: Record<string, ScoringMetric>;
}

export interface ScoringMetric {
  type: 'numeric_range' | 'semantic_similarity' | 'exact_match' | 'required_fields';
  /** Dot path into expected_output (e.g. tam_estimate.value) */
  expectedPath?: string;
  /** Dot path into actual output */
  actualPath?: string;
  /** Dot paths required to be present in actual output. */
  requiredPaths?: string[];
  tolerance_percent?: number;
  threshold?: number;
  weight?: number;
}

export interface EvaluationResult {
  module_name: string;
  scenario_id: string;
  scenario_file?: string;
  execution_mode: 'stub_framework' | 'live_agent';
  passed: boolean;
  scores: Record<string, number>;
  actual_output: unknown;
  expected_output: unknown;
  error?: string;
}
