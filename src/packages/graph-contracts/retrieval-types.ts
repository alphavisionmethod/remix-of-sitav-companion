// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Retrieval Types
// Evidence pack builder, trust-scoped retrieval, semantic orchestration.
// ═══════════════════════════════════════════════════════════════

export interface EvidencePackRequest {
  query_id: string;
  subject_type: string;
  subject_id: string;
  evidence_types: string[];
  trust_scope: TrustScopeFilter;
  freshness_max_ms?: number;
  max_sources: number;
  include_lineage: boolean;
}

export interface EvidencePack {
  pack_id: string;
  query_id: string;
  sources: EvidenceSource[];
  lineage_chains: string[];
  confidence: number;
  freshness_grade: "fresh" | "aging" | "stale";
  completeness: number;
  assembled_at: string;
}

export interface EvidenceSource {
  source_id: string;
  source_type: string;
  content: unknown;
  confidence: number;
  freshness_ms: number;
  node_id: string;
  lineage_chain_id?: string;
}

export interface TrustScopeFilter {
  min_confidence: number;
  allowed_source_types: string[];
  exclude_stale: boolean;
  require_verification: boolean;
  privacy_ceiling: "public" | "workspace" | "private" | "sensitive";
}

export interface SemanticRetrievalRequest {
  query: string;
  domains: string[];
  node_types?: string[];
  max_results: number;
  similarity_threshold: number;
  trust_scope: TrustScopeFilter;
  rerank: boolean;
}

export interface SemanticRetrievalResult {
  results: SemanticMatch[];
  total_candidates: number;
  query_latency_ms: number;
  reranked: boolean;
}

export interface SemanticMatch {
  node_id: string;
  node_type: string;
  label: string;
  similarity_score: number;
  rerank_score?: number;
  snippet: string;
  source: string;
  freshness_ms: number;
}

export interface GraphTraversalQuery {
  start_node_id: string;
  edge_types?: string[];
  max_depth: number;
  direction: "outbound" | "inbound" | "both";
  filter_node_types?: string[];
  include_attributes: boolean;
  limit: number;
}

export interface GraphTraversalResult {
  nodes: Array<{ node_id: string; node_type: string; label: string; depth: number }>;
  edges: Array<{ edge_id: string; edge_type: string; source: string; target: string }>;
  truncated: boolean;
}
