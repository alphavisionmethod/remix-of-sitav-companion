// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Edge Types
// 12 canonical edge types for semantic relationships.
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
  | "resolved_by";

export type EdgeConfidence = "certain" | "high" | "medium" | "low" | "inferred";

export type EdgeTemporality = "permanent" | "active" | "historical" | "projected";

export interface GraphEdge<TMetadata = Record<string, unknown>> {
  edge_id: string;
  edge_type: GraphEdgeType;
  source_node_id: string;
  target_node_id: string;
  label?: string;
  weight: number;
  confidence: EdgeConfidence;
  temporality: EdgeTemporality;
  metadata: TMetadata;
  source_event_id?: string;
  valid_from: string;
  valid_until?: string;
  created_at: string;
}

export interface OwnsEdgeMetadata { ownership_type: "creator" | "admin" | "delegated"; }
export interface AffectsEdgeMetadata { impact_type: "direct" | "indirect"; severity: string; }
export interface DependsOnEdgeMetadata { dependency_type: "hard" | "soft" | "optional"; version_constraint?: string; }
export interface ApprovedByEdgeMetadata { approval_id: string; decision: string; }
export interface ExecutedOnEdgeMetadata { execution_id: string; duration_ms: number; }
export interface CausedByEdgeMetadata { causality_type: "root" | "contributing" | "correlating"; }
export interface BelongsToEdgeMetadata { membership_role: string; }
export interface GeneratedFromEdgeMetadata { generation_method: string; }
export interface BlockedByEdgeMetadata { blocker_type: string; resolution_path?: string; }
export interface EscalatedToEdgeMetadata { escalation_reason: string; urgency: string; }
export interface TriggeredEdgeMetadata { trigger_type: "event" | "schedule" | "manual"; }
export interface ResolvedByEdgeMetadata { resolution_type: "fix" | "workaround" | "dismiss"; }
