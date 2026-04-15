// ═══════════════════════════════════════════════════════════════
// SITA OS — Update Protocol
// Update manifest, install state, rollback, post-update verification,
// compatibility negotiation.
// ═══════════════════════════════════════════════════════════════

export type UpdatePhase =
  | "available"
  | "downloading"
  | "downloaded"
  | "preparing"
  | "installing"
  | "verifying"
  | "applied"
  | "rolling_back"
  | "rolled_back"
  | "failed";

export type UpdateChannel = "stable" | "beta" | "canary" | "internal";

export interface UpdateManifest {
  manifest_id: string;
  version: string;
  previous_version?: string;
  channel: UpdateChannel;
  release_date: string;
  changelog: ChangelogEntry[];
  components: UpdateComponent[];
  size_bytes: number;
  hash: string;
  signature: string;
  min_compatible_version?: string;
  max_compatible_version?: string;
  requires_restart: boolean;
  breaking_changes: string[];
  rollback_supported: boolean;
}

export interface ChangelogEntry {
  category: "feature" | "fix" | "security" | "performance" | "breaking";
  title: string;
  description: string;
  references?: string[];
}

export interface UpdateComponent {
  component_id: string;
  name: string;
  from_version: string;
  to_version: string;
  size_bytes: number;
  delta_available: boolean;
  critical: boolean;
}

export interface UpdateInstallState {
  update_id: string;
  manifest_id: string;
  device_id: string;
  phase: UpdatePhase;
  progress_percent: number;
  current_component?: string;
  components_completed: number;
  components_total: number;
  started_at: string;
  estimated_completion_at?: string;
  error_code?: string;
  error_message?: string;
}

export interface PostUpdateVerification {
  verification_id: string;
  update_id: string;
  checks: UpdateVerificationCheck[];
  overall_passed: boolean;
  rollback_recommended: boolean;
  verified_at: string;
}

export interface UpdateVerificationCheck {
  check_name: string;
  category: "integrity" | "functionality" | "performance" | "compatibility";
  passed: boolean;
  expected_value?: string;
  actual_value?: string;
  severity: "critical" | "warning" | "info";
}

export interface CompatibilityNegotiation {
  client_version: string;
  server_version: string;
  protocol_version: string;
  compatible: boolean;
  degraded_features: string[];
  required_update?: string;
  negotiated_capabilities: string[];
}

export interface UpdateReceipt {
  receipt_id: string;
  update_id: string;
  manifest_id: string;
  device_id: string;
  from_version: string;
  to_version: string;
  phase: UpdatePhase;
  duration_ms: number;
  verification_passed: boolean;
  rollback_occurred: boolean;
  completed_at: string;
}
