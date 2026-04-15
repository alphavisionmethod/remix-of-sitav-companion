// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Compatibility Types (Fully Advanced)
// App/backend/OS compatibility matrix, migration compatibility,
// release gates, feature flag compatibility, native bridge compat.
// ═══════════════════════════════════════════════════════════════

export type CompatibilityLevel = "full" | "degraded" | "breaking" | "unknown";

export interface ReleaseCompatibilityEntry {
  component: string;
  version: string;
  min_compatible: Record<string, string>;
  max_compatible: Record<string, string>;
  breaking_at?: Record<string, string>;
  deprecation_notices: DeprecationNotice[];
  migration_path?: string;
  tested_combinations: TestedCombination[];
}

export interface DeprecationNotice {
  feature: string;
  deprecated_in: string;
  removed_in?: string;
  replacement?: string;
  migration_guide_url?: string;
}

export interface TestedCombination {
  components: Record<string, string>;
  result: CompatibilityLevel;
  tested_at: string;
  test_suite: string;
  pass_rate: number;
}

export interface ReleaseCompatibilityMatrix {
  matrix_id: string;
  entries: ReleaseCompatibilityEntry[];
  cross_component_rules: CrossComponentRule[];
  generated_at: string;
  valid_until: string;
  generation_method: "automated" | "manual" | "hybrid";
}

export interface CrossComponentRule {
  rule_id: string;
  description: string;
  components: string[];
  condition: string;
  result: CompatibilityLevel;
  auto_enforced: boolean;
}

export interface MigrationCompatibility {
  migration_id: string;
  from_version: string;
  to_version: string;
  schema_changes: SchemaChange[];
  data_transformations: DataTransformation[];
  api_changes: APIChange[];
  reversible: boolean;
  estimated_duration_ms: number;
  downtime_required: boolean;
  downtime_estimate_ms?: number;
  risk_score: number;
  rollback_migration_id?: string;
  tested: boolean;
  test_results?: MigrationTestResult;
}

export interface SchemaChange {
  table: string;
  change_type: "add_column" | "drop_column" | "alter_column" | "add_index" | "drop_index" | "create_table" | "drop_table" | "rename_column" | "add_constraint" | "drop_constraint";
  detail: string;
  reversible: boolean;
  data_loss_risk: boolean;
  requires_backfill: boolean;
  estimated_rows_affected?: number;
}

export interface DataTransformation {
  name: string;
  description: string;
  affected_rows_estimate: number;
  idempotent: boolean;
  batch_size: number;
  estimated_duration_ms: number;
  validation_query?: string;
  rollback_transformation?: string;
}

export interface APIChange {
  endpoint: string;
  change_type: "added" | "removed" | "modified" | "deprecated";
  breaking: boolean;
  affected_clients: string[];
  migration_guide?: string;
}

export interface MigrationTestResult {
  test_id: string;
  environment: string;
  success: boolean;
  duration_ms: number;
  issues: string[];
  data_integrity_verified: boolean;
  performance_impact_percent: number;
  tested_at: string;
}

export interface ReleaseGate {
  gate_id: string;
  gate_name: string;
  gate_type: "automated" | "manual" | "conditional" | "time_based" | "metric_based";
  category: "quality" | "security" | "performance" | "compliance" | "operational" | "business";
  required: boolean;
  status: "pending" | "passed" | "failed" | "overridden" | "skipped" | "expired";
  evaluated_at?: string;
  evidence?: string;
  evidence_url?: string;
  override_by?: string;
  override_reason?: string;
  expiry_at?: string;
  dependencies: string[];
  auto_evaluate: boolean;
}

export interface ReleaseGateSet {
  release_version: string;
  gates: ReleaseGate[];
  all_required_passed: boolean;
  overall_score: number;
  blocking_gates: string[];
  evaluation_order: string[];
  evaluated_at: string;
  expires_at: string;
}

// ── Feature Flag Compatibility ──

export interface FeatureFlagCompatibility {
  flag_key: string;
  introduced_in: string;
  removed_in?: string;
  requires_backend_version?: string;
  requires_mobile_version?: string;
  incompatible_flags: string[];
  dependent_flags: string[];
}

// ── Native Bridge Compatibility ──

export interface NativeBridgeCompatibility {
  bridge_version: string;
  min_native_version: Record<string, string>;
  max_native_version: Record<string, string>;
  capabilities: string[];
  deprecated_apis: string[];
  breaking_changes: string[];
}
