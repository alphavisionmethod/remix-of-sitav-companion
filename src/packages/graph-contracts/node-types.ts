// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Node Types
// 12 canonical node types for the semantic knowledge graph.
// ═══════════════════════════════════════════════════════════════

export type GraphNodeType =
  | "user"
  | "device"
  | "workspace"
  | "file"
  | "command"
  | "approval"
  | "app"
  | "incident"
  | "policy"
  | "release"
  | "timeline"
  | "automation";

export type NodeConfidenceClass = "verified" | "inferred" | "provisional" | "stale" | "disputed";

export type NodePrivacyClass = "public" | "workspace" | "private" | "sensitive" | "restricted";

export interface GraphNode<TAttributes = Record<string, unknown>> {
  node_id: string;
  node_type: GraphNodeType;
  label: string;
  attributes: TAttributes;
  confidence: NodeConfidenceClass;
  privacy: NodePrivacyClass;
  source: string;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  version: number;
}

export interface UserNodeAttributes {
  display_name: string;
  email?: string;
  role: string;
  trust_grade?: string;
  last_active_at?: string;
}

export interface DeviceNodeAttributes {
  device_name: string;
  platform: string;
  os_version: string;
  trust_status: string;
  last_seen_at?: string;
  attestation_valid: boolean;
}

export interface WorkspaceNodeAttributes {
  workspace_name: string;
  owner_id: string;
  member_count: number;
  storage_used_bytes: number;
}

export interface FileNodeAttributes {
  filename: string;
  mime_type: string;
  size_bytes: number;
  workspace_id: string;
  content_hash: string;
}

export interface CommandNodeAttributes {
  command_type: string;
  phase: string;
  actor_id: string;
  target_service: string;
  correlation_id: string;
}

export interface AppNodeAttributes {
  app_id: string;
  app_name: string;
  version: string;
  status: string;
  permissions: string[];
}

export interface IncidentNodeAttributes {
  severity: string;
  status: string;
  affected_services: string[];
  root_cause?: string;
  resolution?: string;
}

export interface PolicyNodeAttributes {
  policy_type: string;
  domain: string;
  enforcement_level: string;
  active: boolean;
}

export interface ReleaseNodeAttributes {
  version: string;
  channel: string;
  phase: string;
  health_score: number;
}

export interface AutomationNodeAttributes {
  automation_name: string;
  trigger_type: string;
  last_run_at?: string;
  success_rate: number;
  enabled: boolean;
}
