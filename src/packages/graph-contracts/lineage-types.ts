// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Lineage Types (Fully Advanced)
// Data, decision, AI, command, release lineage with full
// provenance tracking, integrity verification, and visualization.
// ═══════════════════════════════════════════════════════════════

export type LineageType = "data" | "decision" | "ai" | "command" | "release" | "trust" | "financial";

export type LineageIntegrity = "verified" | "partial" | "broken" | "unverified";

export interface LineageChain {
  chain_id: string;
  lineage_type: LineageType;
  root_node_id: string;
  current_node_id: string;
  depth: number;
  max_depth: number;
  links: LineageLink[];
  integrity: LineageIntegrity;
  integrity_hash: string;
  branches: string[];
  created_at: string;
  last_extended_at: string;
  last_verified_at?: string;
  owner_id?: string;
  tags: string[];
}

export interface LineageLink {
  link_id: string;
  from_node_id: string;
  from_node_type: string;
  to_node_id: string;
  to_node_type: string;
  transformation: string;
  transformation_type: "direct" | "derived" | "aggregated" | "filtered" | "enriched" | "ai_generated";
  actor_id?: string;
  actor_type?: "user" | "system" | "agent";
  confidence: number;
  metadata?: Record<string, unknown>;
  input_hash?: string;
  output_hash?: string;
  reversible: boolean;
  timestamp: string;
  duration_ms?: number;
}

export interface LineageVisualization {
  chain_id: string;
  layout: "tree" | "dag" | "timeline";
  nodes: LineageVisNode[];
  edges: LineageVisEdge[];
  depth_levels: number;
  total_nodes: number;
}

export interface LineageVisNode {
  id: string;
  label: string;
  type: string;
  level: number;
  x?: number;
  y?: number;
  metadata: Record<string, unknown>;
}

export interface LineageVisEdge {
  source: string;
  target: string;
  label: string;
  transformation_type: string;
  confidence: number;
}

// ── Domain-Specific Lineage ──

export interface DataLineage {
  data_id: string;
  original_source: string;
  source_type: "database" | "api" | "file" | "user_input" | "ai_generated" | "external";
  transformations: DataTransformationStep[];
  current_location: string;
  freshness_ms: number;
  integrity_verified: boolean;
  integrity_method: "hash" | "checksum" | "signature" | "none";
  pii_present: boolean;
  classification: "public" | "internal" | "confidential" | "restricted";
  retention_policy?: string;
}

export interface DataTransformationStep {
  step_id: string;
  step_order: number;
  operation: string;
  operation_type: "filter" | "map" | "aggregate" | "join" | "enrich" | "redact" | "normalize";
  input_schema?: string;
  output_schema?: string;
  input_row_count?: number;
  output_row_count?: number;
  performed_by: string;
  tool_used?: string;
  idempotent: boolean;
  reversible: boolean;
  timestamp: string;
  duration_ms?: number;
}

export interface DecisionLineage {
  decision_id: string;
  decision_type: "approval" | "recommendation" | "escalation" | "policy_evaluation" | "resource_allocation";
  inputs: DecisionInput[];
  reasoning_chain: ReasoningStep[];
  outcome: string;
  confidence: number;
  approval_chain: string[];
  alternative_outcomes: AlternativeOutcome[];
  constraints_applied: string[];
  biases_checked: string[];
  timestamp: string;
}

export interface DecisionInput {
  input_id: string;
  source: string;
  value: unknown;
  confidence: number;
  freshness_ms: number;
  weight: number;
}

export interface ReasoningStep {
  step_id: string;
  step_order: number;
  reasoning_type: "evidence" | "inference" | "policy" | "heuristic" | "ai_generated" | "statistical" | "expert";
  input: string;
  output: string;
  confidence: number;
  model_id?: string;
  evidence_refs: string[];
  assumptions: string[];
  caveats: string[];
}

export interface AlternativeOutcome {
  outcome: string;
  probability: number;
  risk_score: number;
  reason_not_chosen: string;
}

export interface AILineage {
  inference_id: string;
  model: string;
  model_version: string;
  provider: string;
  prompt_family: string;
  prompt_version: number;
  input_sources: AILineageInput[];
  output_node_ids: string[];
  output_type: "text" | "structured" | "embedding" | "classification" | "recommendation";
  confidence: number;
  grounding_report_id?: string;
  grounding_score?: number;
  hallucination_check_passed?: boolean;
  cost_cents: number;
  latency_ms: number;
  input_tokens: number;
  output_tokens: number;
  cached: boolean;
  temperature: number;
  safety_gate_result: string;
  timestamp: string;
}

export interface AILineageInput {
  source_id: string;
  source_type: string;
  content_hash: string;
  token_count: number;
  redacted_fields: string[];
}

export interface CommandLineage {
  command_id: string;
  command_type: string;
  initiated_by: string;
  initiated_from: string;
  approval_chain: ApprovalLink[];
  execution_path: ExecutionLink[];
  receipt_chain: string[];
  side_effects: SideEffectLink[];
  rollback_available: boolean;
  total_duration_ms: number;
  outcome: "success" | "failure" | "partial" | "rolled_back";
}

export interface ApprovalLink {
  approval_id: string;
  approver_id: string;
  decision: string;
  timestamp: string;
}

export interface ExecutionLink {
  step_id: string;
  service: string;
  operation: string;
  duration_ms: number;
  outcome: string;
}

export interface SideEffectLink {
  effect_id: string;
  effect_type: string;
  target: string;
  reversible: boolean;
  reversed: boolean;
}

export interface ReleaseLineage {
  release_version: string;
  commits: CommitRef[];
  build_artifacts: string[];
  test_results: TestResultRef[];
  rollout_id: string;
  approval_receipt_id?: string;
  changelog_generated: boolean;
  sbom_generated: boolean;
  signing_verified: boolean;
  deployment_receipt_id?: string;
}

export interface CommitRef {
  sha: string;
  message: string;
  author: string;
  files_changed: number;
  timestamp: string;
}

export interface TestResultRef {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  coverage_percent: number;
  duration_ms: number;
}

// ── Lineage Query ──

export interface LineageQuery {
  start_node_id: string;
  direction: "ancestors" | "descendants" | "both";
  lineage_types?: LineageType[];
  max_depth?: number;
  include_metadata: boolean;
  include_visualization: boolean;
  filter_actors?: string[];
  since?: string;
  until?: string;
}

export interface LineageQueryResult {
  query: LineageQuery;
  chains: LineageChain[];
  total_links: number;
  visualization?: LineageVisualization;
  query_duration_ms: number;
}
