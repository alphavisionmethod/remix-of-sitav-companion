

# SITA OS — Core Backend Truth Layer: 11 Missing Tables

## Current State

The project already has **160 migrations** and **~180 tables**. Of the 40 canonical tables requested, **29 are already fully covered** by existing equivalents:

| Requested Concept | Existing Table(s) |
|---|---|
| users/profiles | `profiles`, `os_user_accounts` |
| devices | `cloud_devices`, `cloud_device_sessions`, `device_mesh_peers`, `device_ownership` |
| commands | `os_commands`, `os_command_events`, `ecosystem_commands` |
| approval_requests | `ai_workforce_approval_queue`, `dual_authority_challenges` |
| receipts | `boardroom_decision_receipts`, `ai_inference_receipts`, `notification_delivery_receipts` |
| notifications | `notifications`, `platform_notifications` |
| notification_deliveries | `notification_delivery_receipts` |
| workspaces | `cloud_shared_workspaces` |
| installed_apps | `managed_apps` |
| app_permissions | `os_capabilities`, `os_role_capabilities`, `client_capability_matrix` |
| files | `cloud_files`, `cloud_folders` |
| file_versions | `cloud_file_versions` |
| sync_objects | `cloud_sync_objects`, `cloud_sync_changes`, `cloud_sync_checkpoints` |
| sync_conflicts | `cloud_conflicts` |
| updates | `update_catalog`, `update_history`, `update_channels`, `update_staging` |
| release_rings | `update_channels` |
| release_artifacts | `release_compatibility_matrix` |
| rollbacks | `rollback_events` |
| policies | `os_policies`, `cloud_policies`, `cloud_tenant_policies` |
| feature_flags | `cloud_feature_flags` |
| ai_invocations | `ai_workforce_invocations`, `ai_inference_receipts` |
| ai_action_receipts | `ai_workforce_outputs`, `ai_workforce_recommendations` |
| graph_nodes | `context_graph_snapshots` |
| observability_metrics | `cloud_metrics_snapshots`, `health_validation_results`, `layer_health_snapshots` |
| audit_logs | `os_audit_events`, `cloud_audit_events`, `admin_action_audit` |
| connector_accounts | `connector_oauth_flows` |
| connector_sync_runs | `connector_sync_runs` |
| recovery_snapshots | `cloud_backup_snapshots` |
| support_cases | `support_cases`, `support_case_events` |

## 11 Missing Tables to Create

These are the genuinely missing concepts with no existing equivalent:

### 1. `command_steps` — Multi-step execution tracking for commands
- References `os_commands(id)`
- Columns: id, command_id, step_index, action, target, status (pending/running/completed/failed/skipped), started_at, completed_at, result, error_message, retry_count, user_id, created_at

### 2. `device_attestations` — Attestation evidence per device
- References `cloud_devices(id)`
- Columns: id, device_id, attestation_type (boot-integrity/app-integrity/biometric/remote-challenge), status (passed/failed/expired/pending), evidence, key_fingerprint, verified_by, verified_at, expires_at, user_id, created_at

### 3. `approval_decisions` — Durable approve/deny/defer/escalate records
- References `ai_workforce_approval_queue(id)` or generic request_id
- Columns: id, request_id, request_type, decision (approved/denied/deferred/escalated), actor_user_id, rationale, conditions, decided_at, user_id, created_at

### 4. `timeline_events` — Normalized activity/history across all domains
- Columns: id, user_id, event_type, actor_type (user/system/ai/connector), actor_id, subject_type, subject_id, action, description, metadata, receipt_id, domain, created_at

### 5. `graph_edges` — Semantic graph relationships
- References `context_graph_snapshots` concept
- Columns: id, source_node_type, source_node_id, target_node_type, target_node_id, edge_type, weight, metadata, user_id, created_at, updated_at

### 6. `simulations` — Durable simulation jobs
- Columns: id, user_id, scenario_type, title, input_payload, status (pending/running/completed/failed), result_artifacts, model_used, duration_ms, created_at, completed_at

### 7. `incidents` — Incident tracking and remediation
- Columns: id, user_id, severity (critical/high/medium/low), title, description, affected_services, status (open/investigating/mitigating/resolved/closed), owner_user_id, remediation_notes, resolved_at, created_at, updated_at

### 8. `connector_tokens` — Encrypted token lifecycle per connector
- Columns: id, user_id, connector_id, provider, token_type (access/refresh), encrypted_token_ref, scopes, issued_at, expires_at, last_refreshed_at, rotation_count, status (active/expired/revoked), created_at

### 9. `vapid_keys` — Push key rotation state
- Columns: id, public_key, private_key_ref, status (active/rotated/revoked), activated_at, rotated_at, created_at

### 10. `biometric_credentials` — WebAuthn/biometric enrollment
- Columns: id, user_id, credential_id, credential_type (webauthn/fido2/platform), public_key, device_id, display_name, sign_count, last_used_at, status (active/revoked), created_at

### 11. `runtime_agents` — OS agent registration and heartbeat
- Columns: id, user_id, agent_type (desktop/mobile/server/appliance), hostname, version, capabilities, status (online/offline/degraded), last_heartbeat_at, registered_at, created_at, updated_at

## Migration Details

One single migration file creating all 11 tables with:
- RLS enabled on all tables
- RLS policies: `TO authenticated USING (auth.uid() = user_id)` (except `vapid_keys` which is admin-only)
- Proper foreign key references where applicable
- Sensible defaults and NOT NULL constraints
- `updated_at` trigger on tables with update patterns
- Indexes on `user_id` and frequently queried columns

## No Code Changes Required

These are pure infrastructure/truth tables. The existing TypeScript registries in `src/lib/devices/`, `src/lib/surfaces/`, and `src/lib/deployment/` already define the architecture — these tables provide the database backing. The auto-generated `types.ts` will pick up the new tables automatically after migration.

## Summary

| Action | Count |
|--------|-------|
| Tables already exist | 29 concepts covered |
| Tables to create | 11 |
| Migrations to run | 1 |
| Code files to modify | 0 |

