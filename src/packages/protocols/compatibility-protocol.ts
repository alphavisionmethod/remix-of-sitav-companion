// ═══════════════════════════════════════════════════════════════
// SITA OS — Compatibility Protocol
// Version compatibility, capability fallback, graceful degradation,
// rollout compatibility gates.
// ═══════════════════════════════════════════════════════════════

export type CompatibilityStatus = "fully_compatible" | "degraded" | "incompatible" | "unknown";

export type DegradationLevel = "none" | "minor" | "major" | "critical";

export interface VersionCompatibility {
  component_a: string;
  version_a: string;
  component_b: string;
  version_b: string;
  status: CompatibilityStatus;
  degraded_features: string[];
  breaking_changes: string[];
  migration_required: boolean;
  migration_path?: string;
  verified_at: string;
}

export interface CapabilityFallback {
  capability_id: string;
  primary_version: string;
  fallback_version: string;
  fallback_behavior: "graceful" | "reduced" | "disabled" | "error";
  affected_features: string[];
  user_visible_impact: string;
  auto_recovery: boolean;
  recovery_conditions?: string[];
}

export interface GracefulDegradation {
  degradation_id: string;
  trigger: string;
  level: DegradationLevel;
  affected_services: string[];
  disabled_features: string[];
  fallback_behaviors: Record<string, string>;
  user_notification: string;
  estimated_recovery?: string;
  activated_at: string;
}

export interface RolloutCompatibilityGate {
  gate_id: string;
  gate_name: string;
  rollout_id: string;
  gate_type: "version_check" | "feature_flag" | "health_check" | "capacity" | "dependency" | "manual";
  required: boolean;
  status: "pending" | "passed" | "failed" | "skipped";
  checks: CompatibilityCheck[];
  evaluated_at?: string;
  override_by?: string;
  override_reason?: string;
}

export interface CompatibilityCheck {
  check_id: string;
  check_name: string;
  expected: string;
  actual: string;
  passed: boolean;
  severity: "blocker" | "warning" | "info";
  detail?: string;
}

export interface CompatibilityMatrix {
  matrix_id: string;
  components: string[];
  entries: VersionCompatibility[];
  generated_at: string;
  valid_until: string;
}

export interface ProtocolVersionNegotiation {
  client_protocols: Record<string, string>;
  server_protocols: Record<string, string>;
  negotiated: Record<string, string>;
  unsupported: string[];
  upgrade_available: Record<string, string>;
}
