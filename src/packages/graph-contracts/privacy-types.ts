// ═══════════════════════════════════════════════════════════════
// SITA OS — Graph Privacy Types
// Visibility scopes, workspace isolation, sensitive masking.
// ═══════════════════════════════════════════════════════════════

export type VisibilityScope = "global" | "organization" | "workspace" | "personal" | "system_only";

export interface PrivacyPolicy {
  policy_id: string;
  node_type: string;
  default_visibility: VisibilityScope;
  field_policies: FieldPrivacyPolicy[];
  retention_days?: number;
  audit_access: boolean;
}

export interface FieldPrivacyPolicy {
  field_name: string;
  visibility: VisibilityScope;
  masking_strategy: "none" | "redact" | "hash" | "truncate" | "generalize";
  pii: boolean;
  export_allowed: boolean;
}

export interface WorkspaceIsolation {
  workspace_id: string;
  isolation_level: "strict" | "shared_read" | "open";
  shared_node_types: string[];
  shared_edge_types: string[];
  cross_workspace_queries_allowed: boolean;
}

export interface SensitiveRelationshipMask {
  edge_type: string;
  source_node_type: string;
  target_node_type: string;
  mask_to_roles: string[];
  mask_strategy: "hide" | "anonymize" | "aggregate";
  reason: string;
}

export interface PrivacyAuditEntry {
  audit_id: string;
  accessor_id: string;
  node_id: string;
  access_type: "read" | "traverse" | "export" | "search";
  fields_accessed: string[];
  privacy_checks_passed: boolean;
  masking_applied: string[];
  timestamp: string;
}

export interface DataRetentionPolicy {
  node_type: string;
  retention_days: number;
  archive_strategy: "delete" | "anonymize" | "archive";
  legal_hold_exempt: boolean;
  last_purge_at?: string;
}
