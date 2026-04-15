// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Privacy Types (Fully Advanced)
// Visibility scopes, workspace isolation, sensitive masking,
// consent management, GDPR compliance, access control.
// ═══════════════════════════════════════════════════════════════

export type VisibilityScope = "global" | "organization" | "workspace" | "personal" | "system_only" | "admin_only";

export type MaskingStrategy = "none" | "redact" | "hash" | "truncate" | "generalize" | "pseudonymize" | "encrypt" | "tokenize";

export interface PrivacyPolicy {
  policy_id: string;
  policy_name: string;
  node_type: string;
  default_visibility: VisibilityScope;
  field_policies: FieldPrivacyPolicy[];
  retention_days?: number;
  retention_action: "delete" | "anonymize" | "archive";
  audit_access: boolean;
  audit_retention_days: number;
  consent_required: boolean;
  consent_types: string[];
  gdpr_relevant: boolean;
  data_processing_purpose: string;
  legal_basis: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface FieldPrivacyPolicy {
  field_name: string;
  visibility: VisibilityScope;
  masking_strategy: MaskingStrategy;
  masking_config?: MaskingConfig;
  pii: boolean;
  pii_category?: "name" | "email" | "phone" | "address" | "financial" | "health" | "biometric" | "other";
  sensitive: boolean;
  export_allowed: boolean;
  searchable: boolean;
  indexable: boolean;
  log_safe: boolean;
  encryption_required: boolean;
  encryption_method?: string;
}

export interface MaskingConfig {
  preserve_format: boolean;
  preserve_length: boolean;
  preserve_prefix_chars?: number;
  preserve_suffix_chars?: number;
  replacement_char?: string;
  hash_salt?: string;
  generalization_level?: number;
}

export interface WorkspaceIsolation {
  workspace_id: string;
  workspace_name: string;
  isolation_level: "strict" | "shared_read" | "open" | "federated";
  shared_node_types: string[];
  shared_edge_types: string[];
  cross_workspace_queries_allowed: boolean;
  cross_workspace_writes_allowed: boolean;
  federated_workspaces: string[];
  data_residency?: string;
  encryption_at_rest: boolean;
  encryption_key_id?: string;
}

export interface SensitiveRelationshipMask {
  mask_id: string;
  edge_type: string;
  source_node_type: string;
  target_node_type: string;
  mask_to_roles: string[];
  mask_strategy: "hide" | "anonymize" | "aggregate" | "generalize";
  reason: string;
  context_dependent: boolean;
  context_rules?: ContextMaskRule[];
}

export interface ContextMaskRule {
  condition: string;
  override_strategy: MaskingStrategy;
  reason: string;
}

export interface PrivacyAuditEntry {
  audit_id: string;
  accessor_id: string;
  accessor_role: string;
  accessor_ip?: string;
  node_id: string;
  node_type: string;
  access_type: "read" | "traverse" | "export" | "search" | "bulk_read" | "api";
  fields_accessed: string[];
  fields_masked: string[];
  privacy_checks_passed: boolean;
  privacy_violations: PrivacyViolation[];
  masking_applied: string[];
  consent_verified: boolean;
  purpose: string;
  timestamp: string;
  session_id?: string;
  correlation_id?: string;
}

export interface PrivacyViolation {
  violation_id: string;
  violation_type: "unauthorized_access" | "missing_consent" | "excessive_collection" | "retention_exceeded" | "cross_boundary";
  field: string;
  severity: "critical" | "high" | "medium" | "low";
  detail: string;
  auto_remediated: boolean;
  remediation_action?: string;
}

export interface DataRetentionPolicy {
  node_type: string;
  retention_days: number;
  retention_basis: "created_at" | "updated_at" | "last_accessed_at" | "expires_at";
  archive_strategy: "delete" | "anonymize" | "archive" | "aggregate";
  archive_destination?: string;
  legal_hold_exempt: boolean;
  legal_holds: LegalHold[];
  last_purge_at?: string;
  next_purge_at?: string;
  purge_batch_size: number;
  notification_before_purge_days: number;
}

export interface LegalHold {
  hold_id: string;
  reason: string;
  node_ids: string[];
  held_by: string;
  held_at: string;
  expires_at?: string;
}

// ── Consent Management ──

export interface ConsentRecord {
  consent_id: string;
  user_id: string;
  consent_type: string;
  purpose: string;
  granted: boolean;
  granted_at?: string;
  revoked_at?: string;
  expires_at?: string;
  scope: string[];
  method: "explicit" | "implicit" | "opt_out";
  evidence_url?: string;
}

// ── Data Subject Rights ──

export interface DataSubjectRequest {
  request_id: string;
  user_id: string;
  request_type: "access" | "rectification" | "erasure" | "portability" | "restriction" | "objection";
  status: "received" | "processing" | "completed" | "rejected";
  submitted_at: string;
  deadline_at: string;
  completed_at?: string;
  affected_node_count: number;
  response_summary?: string;
}
