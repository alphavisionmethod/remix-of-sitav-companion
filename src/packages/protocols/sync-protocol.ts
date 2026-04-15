// ═══════════════════════════════════════════════════════════════
// SITA OS — Sync Protocol
// Sync state, conflict payload, repair request, checkpoint,
// device capability contract.
// ═══════════════════════════════════════════════════════════════

export type SyncState = "idle" | "syncing" | "conflict" | "repairing" | "checkpoint" | "error" | "paused";

export type ConflictResolution = "server_wins" | "client_wins" | "merge" | "manual" | "newest_wins";

export type SyncDirection = "push" | "pull" | "bidirectional";

export interface SyncStateEnvelope {
  sync_id: string;
  device_id: string;
  user_id: string;
  state: SyncState;
  direction: SyncDirection;
  last_checkpoint_id?: string;
  last_synced_at?: string;
  pending_changes: number;
  conflict_count: number;
  bytes_transferred: number;
  error_message?: string;
  started_at: string;
  updated_at: string;
}

export interface SyncConflict {
  conflict_id: string;
  sync_id: string;
  resource_type: string;
  resource_id: string;
  field: string;
  local_value: unknown;
  remote_value: unknown;
  local_timestamp: string;
  remote_timestamp: string;
  resolution?: ConflictResolution;
  resolved_value?: unknown;
  resolved_at?: string;
  resolved_by?: string;
}

export interface SyncRepairRequest {
  repair_id: string;
  sync_id: string;
  device_id: string;
  repair_type: "full_resync" | "partial_resync" | "conflict_resolution" | "integrity_check";
  scope: string[];
  priority: "critical" | "high" | "normal";
  requested_at: string;
  reason: string;
}

export interface SyncCheckpoint {
  checkpoint_id: string;
  device_id: string;
  user_id: string;
  sequence_number: number;
  resource_versions: Record<string, number>;
  hash: string;
  created_at: string;
  validated: boolean;
}

export interface DeviceSyncCapability {
  device_id: string;
  supported_directions: SyncDirection[];
  max_payload_bytes: number;
  supports_delta_sync: boolean;
  supports_compression: boolean;
  supported_conflict_resolutions: ConflictResolution[];
  offline_buffer_capacity: number;
  sync_protocol_version: string;
  last_capability_report_at: string;
}

export interface SyncReconciliation {
  reconciliation_id: string;
  device_ids: string[];
  discrepancies_found: number;
  discrepancies_resolved: number;
  canonical_source: string;
  corrections_applied: SyncCorrection[];
  started_at: string;
  completed_at?: string;
}

export interface SyncCorrection {
  resource_type: string;
  resource_id: string;
  device_id: string;
  correction_type: "update" | "delete" | "create";
  previous_value?: unknown;
  corrected_value: unknown;
}
