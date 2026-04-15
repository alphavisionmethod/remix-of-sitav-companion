// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Lineage Types
// Data, decision, AI, command, release lineage tracking.
// ═══════════════════════════════════════════════════════════════

export type LineageType = "data" | "decision" | "ai" | "command" | "release";

export interface LineageChain {
  chain_id: string;
  lineage_type: LineageType;
  root_node_id: string;
  current_node_id: string;
  depth: number;
  links: LineageLink[];
  created_at: string;
  last_extended_at: string;
}

export interface LineageLink {
  link_id: string;
  from_node_id: string;
  to_node_id: string;
  transformation: string;
  actor_id?: string;
  confidence: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface DataLineage {
  data_id: string;
  original_source: string;
  transformations: DataTransformationStep[];
  current_location: string;
  freshness_ms: number;
  integrity_verified: boolean;
}

export interface DataTransformationStep {
  step_id: string;
  operation: string;
  input_schema?: string;
  output_schema?: string;
  performed_by: string;
  timestamp: string;
}

export interface DecisionLineage {
  decision_id: string;
  inputs: string[];
  reasoning_chain: ReasoningStep[];
  outcome: string;
  confidence: number;
  approval_chain: string[];
}

export interface ReasoningStep {
  step_id: string;
  reasoning_type: "evidence" | "inference" | "policy" | "heuristic" | "ai_generated";
  input: string;
  output: string;
  confidence: number;
}

export interface AILineage {
  inference_id: string;
  model: string;
  prompt_family: string;
  input_sources: string[];
  output_node_ids: string[];
  confidence: number;
  grounding_report_id?: string;
  cost_cents: number;
  latency_ms: number;
}

export interface CommandLineage {
  command_id: string;
  initiated_by: string;
  approval_chain: string[];
  execution_path: string[];
  receipt_chain: string[];
  side_effects: string[];
}

export interface ReleaseLineage {
  release_version: string;
  commits: string[];
  build_artifacts: string[];
  test_results: string[];
  rollout_id: string;
  approval_receipt_id?: string;
}
