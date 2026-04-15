// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Retrieval Types (Fully Advanced)
// Evidence pack builder, trust-scoped retrieval, semantic
// orchestration, multi-hop reasoning, reranking, caching.
// ═══════════════════════════════════════════════════════════════

export type RetrievalStrategy = "exact" | "semantic" | "graph_traversal" | "hybrid" | "multi_hop";

export type FreshnessGrade = "realtime" | "fresh" | "aging" | "stale" | "expired";

export interface EvidencePackRequest {
  query_id: string;
  subject_type: string;
  subject_id: string;
  query_text?: string;
  evidence_types: string[];
  trust_scope: TrustScopeFilter;
  freshness_max_ms?: number;
  max_sources: number;
  min_confidence: number;
  include_lineage: boolean;
  include_contradictions: boolean;
  retrieval_strategy: RetrievalStrategy;
  rerank: boolean;
  context_window_tokens?: number;
  requested_by: string;
  purpose: string;
}

export interface EvidencePack {
  pack_id: string;
  query_id: string;
  sources: EvidenceSource[];
  lineage_chains: string[];
  contradictions: EvidenceContradiction[];
  confidence: number;
  freshness_grade: FreshnessGrade;
  completeness: number;
  coverage_gaps: string[];
  token_count: number;
  retrieval_strategy_used: RetrievalStrategy;
  cache_hit: boolean;
  assembled_at: string;
  assembly_duration_ms: number;
}

export interface EvidenceSource {
  source_id: string;
  source_type: string;
  source_name: string;
  content: unknown;
  content_summary?: string;
  confidence: number;
  freshness_ms: number;
  freshness_grade: FreshnessGrade;
  node_id: string;
  node_type: string;
  lineage_chain_id?: string;
  relevance_score: number;
  rerank_score?: number;
  trust_verified: boolean;
  token_count?: number;
  citation_key: string;
}

export interface EvidenceContradiction {
  contradiction_id: string;
  field: string;
  source_a: EvidenceSource;
  value_a: unknown;
  source_b: EvidenceSource;
  value_b: unknown;
  severity: "material" | "minor" | "stylistic";
  recommended_resolution: "source_a" | "source_b" | "neither" | "merge";
  resolution_confidence: number;
}

export interface TrustScopeFilter {
  min_confidence: number;
  allowed_source_types: string[];
  excluded_source_types?: string[];
  exclude_stale: boolean;
  max_staleness_ms?: number;
  require_verification: boolean;
  require_lineage: boolean;
  privacy_ceiling: "public" | "workspace" | "private" | "sensitive";
  allowed_domains?: string[];
  excluded_actors?: string[];
}

// ── Semantic Retrieval ──

export interface SemanticRetrievalRequest {
  query: string;
  query_embedding?: number[];
  domains: string[];
  node_types?: string[];
  max_results: number;
  similarity_threshold: number;
  trust_scope: TrustScopeFilter;
  rerank: boolean;
  rerank_model?: string;
  diversify: boolean;
  diversity_threshold?: number;
  boost_recent: boolean;
  boost_accessed: boolean;
  context_nodes?: string[];
  exclude_nodes?: string[];
}

export interface SemanticRetrievalResult {
  results: SemanticMatch[];
  total_candidates: number;
  filtered_candidates: number;
  query_latency_ms: number;
  embedding_latency_ms: number;
  rerank_latency_ms?: number;
  reranked: boolean;
  diversified: boolean;
  cache_hit: boolean;
}

export interface SemanticMatch {
  node_id: string;
  node_type: string;
  label: string;
  similarity_score: number;
  rerank_score?: number;
  final_score: number;
  snippet: string;
  highlighted_snippet?: string;
  source: string;
  freshness_ms: number;
  freshness_grade: FreshnessGrade;
  confidence: number;
  token_count: number;
  metadata: Record<string, unknown>;
}

// ── Graph Traversal ──

export interface GraphTraversalQuery {
  start_node_id: string;
  edge_types?: string[];
  max_depth: number;
  direction: "outbound" | "inbound" | "both";
  filter_node_types?: string[];
  filter_edge_confidence?: string[];
  filter_temporality?: string[];
  include_attributes: boolean;
  include_edge_metadata: boolean;
  weight_threshold?: number;
  limit: number;
  sort_by?: "depth" | "weight" | "confidence" | "created_at";
  sort_order?: "asc" | "desc";
  privacy_ceiling?: string;
}

export interface GraphTraversalResult {
  nodes: TraversalNode[];
  edges: TraversalEdge[];
  paths: TraversalPath[];
  truncated: boolean;
  max_depth_reached: number;
  traversal_duration_ms: number;
}

export interface TraversalNode {
  node_id: string;
  node_type: string;
  label: string;
  depth: number;
  attributes?: Record<string, unknown>;
  incoming_edge_count: number;
  outgoing_edge_count: number;
}

export interface TraversalEdge {
  edge_id: string;
  edge_type: string;
  source: string;
  target: string;
  weight: number;
  confidence: string;
  metadata?: Record<string, unknown>;
}

export interface TraversalPath {
  path_id: string;
  nodes: string[];
  edges: string[];
  total_weight: number;
  avg_confidence: number;
  path_length: number;
}

// ── Multi-Hop Reasoning ──

export interface MultiHopQuery {
  question: string;
  start_nodes: string[];
  max_hops: number;
  reasoning_strategy: "breadth_first" | "depth_first" | "beam_search" | "guided";
  beam_width?: number;
  guide_model?: string;
  evidence_threshold: number;
  max_evidence_sources: number;
}

export interface MultiHopResult {
  answer: string;
  confidence: number;
  reasoning_path: MultiHopStep[];
  evidence_pack_id: string;
  hops_used: number;
  nodes_explored: number;
  duration_ms: number;
}

export interface MultiHopStep {
  hop: number;
  from_node: string;
  to_node: string;
  edge_type: string;
  reasoning: string;
  evidence_found: string;
  confidence_at_step: number;
}

// ── Retrieval Cache ──

export interface RetrievalCacheEntry {
  cache_key: string;
  query_hash: string;
  result: EvidencePack | SemanticRetrievalResult;
  created_at: string;
  expires_at: string;
  hit_count: number;
  freshness_valid: boolean;
}
