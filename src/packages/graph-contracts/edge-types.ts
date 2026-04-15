// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Edge Types (Fully Advanced)
// 12+ canonical edge types with rich metadata, cardinality,
// temporal semantics, and validation rules.
// ═══════════════════════════════════════════════════════════════

export type GraphEdgeType =
  | "owns"
  | "affects"
  | "depends_on"
  | "approved_by"
  | "executed_on"
  | "caused_by"
  | "belongs_to"
  | "generated_from"
  | "blocked_by"
  | "escalated_to"
  | "triggered"
  | "resolved_by"
  | "references"
  | "supersedes"
  | "collaborates_with"
  | "monitors"
  | "derived_from"
  | "consumes";

export type EdgeConfidence = "certain" | "high" | "medium" | "low" | "inferred" | "disputed";

export type EdgeTemporality = "permanent" | "active" | "historical" | "projected" | "conditional";

export type EdgeCardinality = "one_to_one" | "one_to_many" | "many_to_one" | "many_to_many";

export interface GraphEdge<TMetadata = Record<string, unknown>> {
  edge_id: string;
  edge_type: GraphEdgeType;
  source_node_id: string;
  source_node_type: string;
  target_node_id: string;
  target_node_type: string;
  label?: string;
  description?: string;
  weight: number;
  confidence: EdgeConfidence;
  temporality: EdgeTemporality;
  metadata: TMetadata;
  source_event_id?: string;
  correlation_id?: string;
  created_by?: string;
  valid_from: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
  version: number;
  bidirectional: boolean;
  transitive: boolean;
}

// ── Per-Type Metadata Interfaces ──

export interface OwnsEdgeMetadata {
  ownership_type: "creator" | "admin" | "delegated" | "inherited" | "transferred";
  transferred_from?: string;
  transferred_at?: string;
  delegation_expires_at?: string;
  permissions_granted: string[];
}

export interface AffectsEdgeMetadata {
  impact_type: "direct" | "indirect" | "cascading" | "potential";
  severity: "critical" | "high" | "medium" | "low";
  impact_domain: string;
  impact_description: string;
  probability?: number;
  mitigated: boolean;
}

export interface DependsOnEdgeMetadata {
  dependency_type: "hard" | "soft" | "optional" | "build_time" | "runtime";
  version_constraint?: string;
  health_check_url?: string;
  fallback_available: boolean;
  circuit_breaker_enabled: boolean;
  timeout_ms?: number;
}

export interface ApprovedByEdgeMetadata {
  approval_id: string;
  decision: "approved" | "rejected" | "conditional";
  conditions?: string[];
  risk_level: string;
  approval_type: string;
  evidence_refs: string[];
}

export interface ExecutedOnEdgeMetadata {
  execution_id: string;
  duration_ms: number;
  outcome: "success" | "failure" | "partial" | "timeout";
  receipt_id?: string;
  side_effects: string[];
  resource_consumption: Record<string, number>;
}

export interface CausedByEdgeMetadata {
  causality_type: "root" | "contributing" | "correlating" | "enabling";
  causality_confidence: number;
  evidence: string[];
  analysis_method: "automated" | "manual" | "ai_assisted";
}

export interface BelongsToEdgeMetadata {
  membership_role: string;
  membership_type: "owner" | "admin" | "member" | "viewer" | "guest";
  joined_at: string;
  invited_by?: string;
  permissions: string[];
}

export interface GeneratedFromEdgeMetadata {
  generation_method: "ai" | "manual" | "automated" | "imported" | "derived";
  model_id?: string;
  prompt_family?: string;
  confidence: number;
  verified: boolean;
}

export interface BlockedByEdgeMetadata {
  blocker_type: "dependency" | "policy" | "approval" | "resource" | "technical" | "business";
  resolution_path?: string;
  estimated_resolution_time_hours?: number;
  auto_resolvable: boolean;
  escalated: boolean;
}

export interface EscalatedToEdgeMetadata {
  escalation_reason: string;
  urgency: "critical" | "high" | "normal" | "low";
  escalation_chain_position: number;
  original_handler?: string;
  sla_deadline?: string;
  auto_escalated: boolean;
}

export interface TriggeredEdgeMetadata {
  trigger_type: "event" | "schedule" | "manual" | "threshold" | "api" | "webhook";
  trigger_condition?: string;
  trigger_payload_hash?: string;
  execution_delay_ms?: number;
  retry_count?: number;
}

export interface ResolvedByEdgeMetadata {
  resolution_type: "fix" | "workaround" | "dismiss" | "auto_heal" | "rollback";
  resolution_time_ms: number;
  fix_description: string;
  permanent: boolean;
  follow_up_required: boolean;
  follow_up_deadline?: string;
}

export interface ReferencesEdgeMetadata {
  reference_type: "citation" | "see_also" | "duplicate" | "follow_up" | "parent_child";
  bidirectional: boolean;
}

export interface SupersedesEdgeMetadata {
  reason: "update" | "correction" | "merge" | "migration";
  superseded_fields: string[];
  migration_id?: string;
}

export interface DerivedFromEdgeMetadata {
  derivation_method: "calculation" | "aggregation" | "transformation" | "inference";
  formula?: string;
  confidence: number;
  stale_after_ms?: number;
}

// ── Edge Type Registry ──

export interface EdgeTypeRegistry {
  edge_types: EdgeTypeDefinition[];
  version: string;
  updated_at: string;
}

export interface EdgeTypeDefinition {
  type: GraphEdgeType;
  display_name: string;
  description: string;
  allowed_source_types: string[];
  allowed_target_types: string[];
  cardinality: EdgeCardinality;
  default_weight: number;
  default_confidence: EdgeConfidence;
  supports_versioning: boolean;
  max_per_source?: number;
  inverse_type?: GraphEdgeType;
  transitive_closure: boolean;
}

// ── Edge Query Helpers ──

export interface EdgeFilter {
  edge_types?: GraphEdgeType[];
  confidence_min?: EdgeConfidence;
  temporality?: EdgeTemporality[];
  weight_min?: number;
  created_after?: string;
  created_before?: string;
  source_node_types?: string[];
  target_node_types?: string[];
}
