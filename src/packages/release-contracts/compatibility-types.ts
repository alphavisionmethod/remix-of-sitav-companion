// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Compatibility Types
// App/backend/OS compatibility matrix, migration, release gates.
// ═══════════════════════════════════════════════════════════════

export interface ReleaseCompatibilityEntry {
  component: string;
  version: string;
  min_compatible: Record<string, string>;
  max_compatible: Record<string, string>;
  breaking_at?: Record<string, string>;
  migration_path?: string;
}

export interface ReleaseCompatibilityMatrix {
  matrix_id: string;
  entries: ReleaseCompatibilityEntry[];
  generated_at: string;
  valid_until: string;
}

export interface MigrationCompatibility {
  migration_id: string;
  from_version: string;
  to_version: string;
  schema_changes: SchemaChange[];
  data_transformations: DataTransformation[];
  reversible: boolean;
  estimated_duration_ms: number;
  downtime_required: boolean;
}

export interface SchemaChange {
  table: string;
  change_type: "add_column" | "drop_column" | "alter_column" | "add_index" | "create_table" | "drop_table";
  detail: string;
  reversible: boolean;
}

export interface DataTransformation {
  name: string;
  affected_rows_estimate: number;
  idempotent: boolean;
  batch_size: number;
}

export interface ReleaseGate {
  gate_id: string;
  gate_name: string;
  gate_type: "automated" | "manual" | "conditional";
  required: boolean;
  status: "pending" | "passed" | "failed" | "overridden";
  evaluated_at?: string;
  evidence?: string;
}

export interface ReleaseGateSet {
  release_version: string;
  gates: ReleaseGate[];
  all_required_passed: boolean;
  overall_score: number;
}
