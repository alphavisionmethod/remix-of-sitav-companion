// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Node Types (Fully Advanced)
// 12+ canonical node types with rich attribute models,
// lifecycle tracking, search indexing, and validation schemas.
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
  | "automation"
  | "advisor"
  | "receipt"
  | "integration"
  | "memory";

export type NodeConfidenceClass = "verified" | "inferred" | "provisional" | "stale" | "disputed" | "revoked";

export type NodePrivacyClass = "public" | "workspace" | "private" | "sensitive" | "restricted" | "system_only";

export type NodeLifecycleState = "draft" | "active" | "archived" | "deleted" | "merged" | "superseded";

export interface GraphNode<TAttributes = Record<string, unknown>> {
  node_id: string;
  node_type: GraphNodeType;
  label: string;
  description?: string;
  attributes: TAttributes;
  confidence: NodeConfidenceClass;
  privacy: NodePrivacyClass;
  lifecycle: NodeLifecycleState;
  source: string;
  source_event_id?: string;
  tenant_id?: string;
  workspace_id?: string;
  tags: string[];
  search_text?: string;
  embedding_vector?: number[];
  created_at: string;
  updated_at: string;
  expires_at?: string;
  last_accessed_at?: string;
  access_count: number;
  version: number;
  previous_version_id?: string;
  merged_into_id?: string;
}

// ── Per-Type Attribute Interfaces ──

export interface UserNodeAttributes {
  display_name: string;
  email?: string;
  role: string;
  roles: string[];
  trust_grade?: string;
  trust_score?: number;
  last_active_at?: string;
  onboarding_completed: boolean;
  preferences: Record<string, unknown>;
  organization_id?: string;
  plan_tier?: string;
}

export interface DeviceNodeAttributes {
  device_name: string;
  device_id: string;
  platform: "ios" | "android" | "web" | "desktop" | "cli";
  os_version: string;
  app_version: string;
  trust_status: "trusted" | "conditional" | "untrusted" | "revoked";
  last_seen_at?: string;
  attestation_valid: boolean;
  attestation_expires_at?: string;
  capabilities: string[];
  push_token?: string;
  biometric_enrolled: boolean;
  ip_address?: string;
  geo_location?: { lat: number; lon: number; country: string };
}

export interface WorkspaceNodeAttributes {
  workspace_name: string;
  description?: string;
  owner_id: string;
  member_count: number;
  member_ids: string[];
  storage_used_bytes: number;
  storage_limit_bytes: number;
  isolation_level: "strict" | "shared_read" | "open";
  default_privacy: NodePrivacyClass;
  created_by: string;
}

export interface FileNodeAttributes {
  filename: string;
  display_name?: string;
  mime_type: string;
  size_bytes: number;
  workspace_id: string;
  folder_path: string;
  content_hash: string;
  encryption_method?: string;
  classification: "public" | "internal" | "confidential" | "restricted";
  ai_summary?: string;
  ai_tags?: string[];
  version_count: number;
  last_modified_by: string;
}

export interface CommandNodeAttributes {
  command_type: string;
  command_category: string;
  phase: string;
  actor_id: string;
  target_service: string;
  correlation_id: string;
  idempotency_key: string;
  risk_level: string;
  requires_approval: boolean;
  side_effects_count: number;
  receipt_id?: string;
  duration_ms?: number;
  outcome?: "success" | "failure" | "partial" | "timeout";
}

export interface ApprovalNodeAttributes {
  approval_id: string;
  approval_type: "single" | "dual" | "committee" | "auto";
  status: string;
  requester_id: string;
  approver_ids: string[];
  risk_level: string;
  domain: string;
  justification: string;
  decided_at?: string;
  expires_at: string;
}

export interface AppNodeAttributes {
  app_id: string;
  app_name: string;
  version: string;
  status: "installing" | "running" | "suspended" | "terminated" | "crashed";
  permissions: string[];
  permission_violations: number;
  memory_usage_bytes: number;
  cpu_usage_percent: number;
  last_crash_at?: string;
  install_source: "store" | "sideload" | "system";
}

export interface IncidentNodeAttributes {
  incident_id: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "detected" | "investigating" | "mitigating" | "resolved" | "post_mortem";
  affected_services: string[];
  affected_users_estimate: number;
  root_cause?: string;
  root_cause_category?: string;
  resolution?: string;
  resolution_time_ms?: number;
  related_release?: string;
  post_mortem_url?: string;
  sla_breached: boolean;
}

export interface PolicyNodeAttributes {
  policy_id: string;
  policy_type: string;
  policy_name: string;
  domain: string;
  enforcement_level: "strict" | "advisory" | "audit_only" | "disabled";
  active: boolean;
  version: number;
  conditions: Record<string, unknown>;
  actions: string[];
  violations_count: number;
  last_evaluated_at?: string;
  owner_id: string;
}

export interface ReleaseNodeAttributes {
  version: string;
  channel: "stable" | "beta" | "canary" | "internal";
  phase: string;
  health_score: number;
  rollout_id?: string;
  rollback_count: number;
  regression_count: number;
  changelog_summary?: string;
  deployed_at?: string;
  fully_deployed_at?: string;
}

export interface TimelineNodeAttributes {
  timeline_type: "narrative" | "event" | "milestone" | "digest";
  category: string;
  significance: number;
  outcome?: "positive" | "negative" | "neutral" | "pending";
  related_entity_type?: string;
  related_entity_id?: string;
}

export interface AutomationNodeAttributes {
  automation_name: string;
  automation_type: "workflow" | "rule" | "schedule" | "trigger" | "agent";
  trigger_type: string;
  trigger_condition?: string;
  last_run_at?: string;
  next_run_at?: string;
  run_count: number;
  success_rate: number;
  avg_duration_ms: number;
  enabled: boolean;
  owner_id: string;
  error_count: number;
  last_error?: string;
}

export interface AdvisorNodeAttributes {
  advisor_id: string;
  advisor_name: string;
  domain: string;
  personality_profile: string;
  confidence_avg: number;
  recommendations_count: number;
  approval_rate: number;
  maturity: "experimental" | "beta" | "stable" | "hardened";
  last_active_at?: string;
}

export interface ReceiptNodeAttributes {
  receipt_type: string;
  correlation_id: string;
  outcome: string;
  hash: string;
  chain_position: number;
  verified: boolean;
}

export interface IntegrationNodeAttributes {
  integration_id: string;
  provider: string;
  status: "connected" | "disconnected" | "error" | "pending";
  capabilities: string[];
  last_sync_at?: string;
  error_count: number;
  data_flow_direction: "inbound" | "outbound" | "bidirectional";
}

export interface MemoryNodeAttributes {
  memory_layer: "working" | "episodic" | "semantic" | "procedural" | "preference";
  importance: number;
  access_count: number;
  owner_type: "user" | "agent" | "system";
  owner_id: string;
  confidence: number;
  expires_at?: string;
}

// ── Node Type Registry ──

export interface NodeTypeRegistry {
  node_types: NodeTypeDefinition[];
  version: string;
  updated_at: string;
}

export interface NodeTypeDefinition {
  type: GraphNodeType;
  display_name: string;
  description: string;
  icon: string;
  color: string;
  default_privacy: NodePrivacyClass;
  searchable_fields: string[];
  required_attributes: string[];
  supports_versioning: boolean;
  supports_embedding: boolean;
  max_instances_per_tenant?: number;
}
